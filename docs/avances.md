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
- [x] Documentación detallada de la elección y estructura de la Arquitectura Hexagonal.
