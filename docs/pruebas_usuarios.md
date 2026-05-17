# Guía de Pruebas de Usuarios y Roles

Esta guía detalla los usuarios de prueba generados automáticamente por el sistema para validar el acceso a los diferentes paneles del **Proyecto Restaurante Vegetariano**.

## 1. Usuarios Preconfigurados (Semilla)

El backend cuenta con una función de autosembrado que crea los siguientes usuarios la primera vez que se ejecuta el servidor. Estos usuarios permiten probar las funcionalidades de cada rol sin necesidad de registrarse manualmente.

| Rol | Correo Electrónico | Contraseña | Panel de Acceso |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@restveg.com` | `admin123` | `/paneladmin` |
| **Cocina** | `kitchen@restveg.com` | `kitchen123` | `/panelkitchen` |
| **Cliente** | `client@restveg.com` | `client123` | `/panel` |

## 2. Instrucciones para la Prueba

1.  **Levantar el Backend**:
    ```bash
    cd apps/backend
    pnpm run dev
    ```
    *Nota: Al iniciar, verás en la consola mensajes confirmando la creación o verificación de estos usuarios.*

2.  **Levantar el Frontend**:
    ```bash
    cd apps/frontend
    pnpm run dev
    ```

3.  **Proceso de Login**:
    - Dirígete a `http://localhost:3000/login`.
    - Ingresa las credenciales de la tabla anterior.
    - El sistema te redireccionará automáticamente al panel correspondiente según tu rol.

## 3. Consideraciones de Seguridad

- Estos usuarios son solo para **entornos de desarrollo**.
- Las contraseñas se almacenan de forma segura utilizando `bcryptjs` con 10 rondas de salting.
- Si deseas cambiar las credenciales o agregar más usuarios, puedes modificar el archivo `apps/backend/src/infrastructure/persistence/db-seed.ts`.

---
*Última actualización: Mayo 2026*
