# Arquitectura, Seguridad y Actualización de UI (Dashboards)

Este documento detalla las configuraciones técnicas implementadas recientemente en el backend y frontend del Proyecto Restaurante Vegetariano. El objetivo de estos cambios es asegurar la infraestructura contra ataques comunes, estandarizar la gestión de sesiones y mejorar la experiencia de usuario con datos en tiempo real mediante Shadcn UI.

---

## 1. Configuraciones de Seguridad (Backend)

Para proteger nuestra API (`apps/backend`) de abusos y vulnerabilidades comunes, hemos integrado dos paquetes fundamentales: `express-rate-limit` y `helmet`.

### a) Helmet (Protección de Cabeceras HTTP)
Helmet actúa como una colección de middlewares que establecen cabeceras de seguridad HTTP automáticamente.

```typescript
// En apps/backend/src/index.ts
import helmet from 'helmet';

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
```
**Importancia**:
- **Prevención XSS**: Ayuda a mitigar ataques de Cross-Site Scripting.
- **Clickjacking**: Evita que nuestro sitio sea incrustado en iframes maliciosos mediante la cabecera `X-Frame-Options`.
- **Configuración de CORS**: Hemos ajustado la política `cross-origin` para asegurar que el frontend (que corre en un puerto diferente durante desarrollo) pueda seguir renderizando recursos o consumiendo la API sin ser bloqueado por políticas de origen estricto predeterminadas de Helmet.

### b) Express Rate Limit (Mitigación de Fuerza Bruta y DDoS)
El *Rate Limiting* restringe el número de peticiones que un cliente (basado en su IP) puede hacer en un periodo de tiempo.

```typescript
// En apps/backend/src/index.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: 100, // Máximo 100 peticiones por IP
  message: { error: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);
```
**Importancia**:
- Protege los endpoints críticos (como `/api/auth/login`) contra ataques de fuerza bruta donde un bot intenta adivinar contraseñas rápidamente.
- Evita la saturación del servidor (DDoS) bloqueando IPs que envían tráfico masivo.
- Se ha aplicado *exclusivamente* a las rutas bajo `/api`, dejando libres archivos estáticos si los hubiera.

---

## 2. Gestión de Sesión y Logout (Full Stack)

### Limpieza Estricta de Cookies (Backend)
Anteriormente, el método `logout` simplemente llamaba a `res.clearCookie('token')`. Para que un navegador elimine una cookie restrictiva, las banderas de seguridad deben coincidir exactamente con las de su creación.

```typescript
// En apps/backend/src/modules/auth/infrastructure/http/controllers/auth.controller.ts
async logout(_req: Request, res: Response) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ message: 'Logged out successfully' });
}
```

### Hook Centralizado `useAuth` (Frontend)
Para evitar código duplicado en los distintos paneles, la lógica de cierre de sesión se encapsuló en un custom hook.

```typescript
// En apps/frontend/src/hooks/useAuth.ts
export function useAuth() {
  const router = useRouter();

  const logout = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };
  return { logout };
}
```
**Importancia**:
- Asegura que tanto el almacenamiento en el cliente (`localStorage`) como la cookie `HTTP-Only` gestionada por el backend sean destruidos sincronizadamente, cerrando completamente la brecha de sesión.

---

## 3. Refactorización de Dashboards a Tiempo Real (Shadcn UI)

Los dashboards de **Admin** (`/paneladmin`) y **Cocina** (`/panelkitchen`) se actualizaron para dejar de depender de datos "mockeados" y ahora muestran la información real proveniente de la base de datos PostgreSQL.

### Implementación de Componentes Base UI
Dado que el proyecto utiliza **Tailwind CSS v4** (el cual presenta incompatibilidades con algunas herramientas de CLI de versiones anteriores), construimos los componentes esenciales de Shadcn UI (`Card`, `Table`, `Badge`) nativamente en `src/components/ui/` utilizando `clsx` y `tailwind-merge` (`cn`). Esto mantiene la consistencia visual premium sin comprometer el entorno de construcción moderno.

### Panel de Administración (`paneladmin/page.tsx`)
- **Métricas Vivas**: Ahora realiza peticiones asíncronas con `fetchApi("/users")` y `fetchApi("/orders")`.
- **Cálculo de Ingresos**: Mapea los pedidos con estado `COMPLETED` para mostrar las ganancias reales.
- **Tabla Shadcn**: Los últimos 5 pedidos se muestran en un componente `<Table>` profesional, y el estado de la orden usa el `<Badge>` semántico (Rojo para cancelado, Verde para listo, etc.).
- **Polling Automático**: El dashboard implementa `setInterval` para refrescar sus datos automáticamente cada 30 segundos, manteniendo al administrador al día sin F5.

### Panel de Cocina (`panelkitchen/page.tsx`)
- Envuelto en las nuevas `Card` para mantener consistencia con el Admin Panel.
- **Flujo de Trabajo Dinámico**: Se optimizó la mutación PATCH (`/orders/{id}`) permitiendo transiciones de estado secuenciales: `PENDING -> PREPARING -> READY -> COMPLETED` directamente desde la interfaz, actualizando la vista inmediatamente tras cada clic.
