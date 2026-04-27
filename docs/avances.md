# Documentación de Avances - Proyecto Restaurante Vegetariano

## 2026-04-21: Inicio de Refactorización a Arquitectura Hexagonal

### Objetivos del día:
1.  **Refactorización del Backend**: Implementar una arquitectura modular basada en capas (Dominio, Aplicación, Infraestructura).
2.  **Integración de PostgreSQL**: Migrar de almacenamiento en memoria a uso persistente con Prisma + PostgreSQL local.
3.  **Estandarización de Nombres**: Aplicar sufijos `.entity.ts`, `.service.ts`, `.controller.ts`, `.route.ts`.

### Avances Detallados:

#### Backend
- [x] Creación de la estructura de carpetas para Arquitectura Hexagonal.
- [x] Configuración de Singleton para Prisma Client en `infrastructure/persistence`.
- [x] Implementación de Módulo de Autenticación (Auth) con sufijos `.entity.ts`, `.service.ts`, `.controller.ts`, `.route.ts`.
- [x] Implementación de Módulo de Menú (Menu) con sufijos `.entity.ts`, `.service.ts`, `.controller.ts`, `.route.ts`.
- [x] Implementación de Módulo de Pedidos (Orders) con sufijos `.entity.ts`, `.service.ts`, `.controller.ts`, `.route.ts`.

#### Frontend
- [x] Creación de cliente de API (`lib/api.ts`) para integración con el backend.
- [x] Implementación de `AuthProvider` para manejo de estado de autenticación.

#### Documentación
- [x] Creación de estructura de documentación y registro de avances.
## 2026-04-27: Reestructuración Monorepo e Integración de Cocina

### Objetivos del día:
1.  **Migración a Monorepo**: Configurar `pnpm` workspaces y organizar paquetes en `packages/`.
2.  **Finalización de Módulo de Cocina**: Migrar la lógica de "Kitchen" al módulo de pedidos y conectar el frontend.
3.  **Limpieza de Arquitectura**: Eliminar archivos y carpetas obsoletos de la estructura anterior.

### Avances Detallados:

#### Infraestructura (Monorepo)
- [x] Configuración de `pnpm-workspace.yaml` y root `package.json`.
- [x] Reubicación de `backend` y `frontend` a la carpeta `apps/`.
- [x] Creación de carpeta `packages/` para configuraciones compartidas (eslint, tsconfig).

#### Backend
- [x] Extensión de `OrderRepository` para incluir estadísticas por estado.
- [x] Implementación de `countByStatus` en Prisma.
- [x] Creación de endpoint `GET /api/orders/stats` para el panel de cocina.
- [x] Limpieza de carpetas obsoletas (`routes/`, `controllers/`, etc. antiguos).

#### Frontend
- [x] Conversión del Panel de Cocina a Client Component.
- [x] Conexión en tiempo real (polling) con la API de pedidos.
- [x] Implementación de transiciones de estado de pedido (Preparar -> Listo -> Entregar).
