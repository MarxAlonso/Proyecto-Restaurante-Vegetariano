# Guía Completa: PostgreSQL, pgAdmin 4, Prisma y Backend

Esta guía documenta cómo iniciar los servicios de base de datos, ejecutar migraciones de Prisma y levantar el servidor Backend usando `pnpm`, junto con un resumen de las integraciones realizadas.

## 1. Ejecutar PostgreSQL y pgAdmin 4 localmente

### Iniciar PostgreSQL (Servicio de Windows)
En Windows, el motor de base de datos de PostgreSQL funciona como un servicio "invisible" de fondo. Usualmente se inicia solo al prender la computadora. Si necesitas iniciarlo o reiniciarlo desde PowerShell (debes abrir PowerShell como Administrador), usa:

```powershell
# El nombre del servicio depende de tu versión, comúnmente es postgresql-x64-15 o postgresql-x64-16
Restart-Service postgresql-x64-15
# O para iniciarlo:
Start-Service postgresql-x64-15
```

### Ejecutar pgAdmin 4
`pgAdmin 4` **no** es un programa que se maneje por comandos de PowerShell. Es un programa visual.
Para abrirlo:
1. Abre el **Menú Inicio** de Windows (presiona la tecla Windows).
2. Escribe **pgAdmin 4** y ábrelo.
3. Se abrirá una ventana en tu navegador o una ventana de escritorio.
4. Ingresa tu contraseña maestra.
5. En el menú de la izquierda, despliega **Servers > PostgreSQL** para ver y gestionar visualmente tus bases de datos (ahí verás la base `RESTVEG_BD` una vez que la migración sea exitosa).

---

## 2. Ejecutar Prisma y Sincronizar Base de Datos

Debido a que tu entorno local de Windows tiene una variable global `DATABASE_URL` que causa conflictos (apunta a un archivo `.dev.db` antiguo), **siempre** debes ejecutar el comando de migración usando esta línea de PowerShell para forzar el uso correcto de tu base local:

```powershell
# Ejecutar desde la carpeta apps/backend
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/RESTVEG_BD"; pnpm exec prisma db push
```

> **Aviso Importante**: Usamos `pnpm exec prisma` en lugar de `pnpm dlx prisma` porque este último descarga la versión v7 de Prisma (que ya no soporta URLs en el archivo schema.prisma). `exec` garantiza que uses la versión v6 instalada en tu proyecto.

### Ver tus datos en la web (Prisma Studio)
Si no quieres usar pgAdmin4, Prisma tiene su propio administrador visual muy amigable:
```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/RESTVEG_BD"; pnpm exec prisma studio
```

---

## 3. Levantar el Servidor Backend

Para encender tu API (Express + TypeScript):

```powershell
# Asegúrate de estar en la carpeta apps/backend
pnpm run dev
```
Tu servidor arrancará en `http://localhost:3001`.

---

## 4. Resumen de Todo lo Integrado en el Backend

1. **Gestión de Archivos (Imágenes)**: 
   - Se configuró la librería `multer` (`upload.middleware.ts`).
   - Las rutas de menú (`/api/menu`) ahora pueden recibir subidas de archivos en los `POST` y `PUT`. Las imágenes se guardan físicamente en la carpeta `uploads/` y Express la sirve como carpeta estática.
2. **Seguridad en la Autenticación**:
   - En `auth.service.ts`, el registro público (`/register`) ahora borra cualquier rol fraudulento y fuerza a que el usuario se guarde como `CLIENT`.
3. **Módulo de Usuarios para el Administrador**:
   - Se creó `/api/users/worker` que **sólo** el `ADMIN` puede usar.
   - Permite crear cuentas de empleados (Cocineros o Administradores adicionales) y encripta sus contraseñas automáticamente con `bcryptjs`.
4. **Base de Datos Limpia**:
   - Se limpió el archivo `.env` garantizando que no hubiera caracteres corruptos y apuntando a tu nueva base `RESTVEG_BD`.
