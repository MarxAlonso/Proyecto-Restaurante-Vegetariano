# Entregable 4: Validación Precisa en Plataforma Cloud (Seguridad y Base de Datos)
**Curso: Proyectos Universitarios**  
**Proyecto: Restaurante Vegetariano (RESTVEG_BD)**  
**Estudiante: Marx Alonso**  
**Rúbrica Evaluada: Validación Precisa en Plataforma Cloud (2 Puntos)**

---

## 1. Validación de la Integración de Base de Datos en la Nube
El funcionamiento y la consistencia de la base de datos **PostgreSQL** desplegada en **Railway** han sido validados rigurosamente siguiendo el Plan de Pruebas.

### 1.1. Integridad Referencial y Reglas de Negocio
Se ha comprobado que las restricciones de clave foránea y comportamiento referencial configuradas en [database.sql](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/docs/v2/database.sql) se apliquen de forma óptima en el entorno en la nube:
1.  **Casos de Pedidos y Detalles (`Order` y `OrderItem`)**: Al realizar un pedido desde la interfaz del cliente desplegada en Vercel, se validó que se genere un registro en la tabla `Order` y las líneas asociadas en `OrderItem`. 
2.  **Borrado en Cascada (`ON DELETE CASCADE`)**: Se eliminó un usuario de prueba en producción directamente desde Prisma Studio. Se constató que todas sus órdenes asociadas en la tabla `Order` y los detalles correspondientes en `OrderItem` fueron eliminados de forma inmediata y automática por el motor PostgreSQL de Railway, previniendo registros huérfanos y garantizando la consistencia física absoluta de los datos.
3.  **Restricción de Integridad en Menú (`ON DELETE RESTRICT`)**: Se intentó forzar la eliminación de un plato del menú (`MenuItem`) que ya había sido ordenado por un cliente. El motor de base de datos bloqueó la transacción correctamente, devolviendo una excepción de integridad referencial, asegurando que los registros históricos de pedidos y contabilidad no sean corrompidos.

### 1.2. Automatización y Triggers
Se editó el estado de un pedido (de `PENDING` a `PREPARING`) desde el panel de cocina. Se extrajo el registro mediante una consulta SQL en Railway y se comprobó que la columna `updatedAt` cambió automáticamente su valor al timestamp actual del servidor, confirmando que el **Trigger físico** implementado en la base de datos funciona con total precisión en el entorno productivo.

---

## 2. Validación de Aspectos de Seguridad en Producción
La seguridad del sistema en la nube ha sido evaluada exhaustivamente mediante herramientas de desarrollo y auditoría web, certificando la protección integral del proyecto.

### 2.1. Cifrado de Extremo a Extremo (HTTPS)
Al ingresar al dominio de Vercel (`https://restaurant-veg.vercel.app`), se auditó el canal de comunicación:
*   Se constató que la conexión está encriptada mediante el protocolo **TLS 1.3** firmado por una entidad certificadora de confianza global.
*   Cualquier intento de acceder a través de HTTP plano (`http://...`) es redirigido automáticamente a HTTPS por la capa de ruteo de Vercel.
*   En el backend de Railway, se validó que las peticiones se sirvan exclusivamente a través de canales seguros SSL/TLS de la plataforma, impidiendo ataques de interceptación o escucha de red.

### 2.2. Seguridad Cross-Origin (CORS) y Headers
Se realizaron peticiones desde dominios no autorizados (como consolas locales de desarrollo no configuradas o herramientas externas no autorizadas) hacia la API del backend.
*   **Resultados de la validación**: El backend Express bloqueó de inmediato la conexión de orígenes externos no declarados en el archivo [index.ts](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/apps/backend/src/index.ts) del servidor.
*   Solo el origen específico del frontend en Vercel (`FRONTEND_URL`) es admitido para interactuar con la API, enviar cookies de sesión y realizar transacciones de pedidos en vivo.

### 2.3. Resistencia ante Ataques de Sesión y Roles en Nube
*   **Aislamiento de Sesión**: Los tokens JWT viajan encriptados y protegidos. Al desactivar JavaScript en el navegador, la aplicación puede renderizarse de manera segura gracias al ruteo nativo de Next.js, y los tokens no son vulnerables a accesos desde consola, garantizando inmunidad ante secuestro de sesiones por XSS.
*   **Validación del Middleware**: Se simuló un ataque de penetración modificando el payload de la cabecera `Authorization` para inyectar un rol ficticio de administrador (`ADMIN`). El servidor de Railway detectó de inmediato que la firma criptográfica del JWT quedó invalidada al ser alterada localmente, denegando el acceso y retornando un error `401 Unauthorized`.
