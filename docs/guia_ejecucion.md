# Guía de Ejecución y Uso de pnpm

Bienvenido al monorepo del **Proyecto Restaurante Vegetariano**. Hemos migrado a una estructura de monorepo gestionada por **pnpm** para mejorar la eficiencia y organización del proyecto.

## ¿Qué es pnpm y por qué lo usamos?

**pnpm** (Performant npm) es un gestor de paquetes que destaca por:
1.  **Eficiencia en espacio**: Los paquetes se guardan en un almacén global, por lo que si varios proyectos usan la misma versión de una librería, solo se guarda una vez en disco.
2.  **Velocidad**: Es significativamente más rápido que npm o yarn al instalar dependencias.
3.  **Workspaces Nativo**: Facilita la gestión de múltiples proyectos (apps y paquetes) en un solo repositorio.
4.  **Seguridad**: Evita que un proyecto acceda a dependencias que no ha declarado explícitamente (strict mode).

## Requisitos Previos

Debes tener instalado **Node.js** y **pnpm**. Si no tienes pnpm, instálalo globalmente con:

```bash
npm install -g pnpm
```

## Estructura del Monorepo

El proyecto se divide en dos directorios principales:

-   `apps/`: Contiene las aplicaciones ejecutables (Backend y Frontend).
-   `packages/`: Contiene configuraciones compartidas o librerías internas (ej. configuraciones de ESLint, TypeScript).

## Comandos Principales

### 1. Instalación de dependencias
Ejecuta esto en la raíz del proyecto para instalar todo:

```bash
pnpm install
```

> [!IMPORTANT]
> Si ves un mensaje sobre **"Ignored build scripts"** (ej. para Prisma), es una medida de seguridad de pnpm 10. Para permitir que Prisma y otras herramientas funcionen correctamente, ejecuta:
> ```bash
> pnpm approve-builds
> ```

### 2. Ejecución en desarrollo
Para ejecutar todas las aplicaciones simultáneamente:

```bash
pnpm dev
```

Para ejecutar una aplicación específica:

```bash
# Solo el Backend
pnpm --filter restaurant-veg-backend dev

# Solo el Frontend
pnpm --filter restaurant-veg dev
```

### 3. Base de Datos (Prisma)
Los comandos de base de datos se ejecutan dentro de la carpeta del backend:

```bash
cd apps/backend
pnpm db:generate  # Generar cliente Prisma
pnpm db:push      # Sincronizar esquema con la DB
```

## Flujo de Trabajo Recomendado

1.  Clona el repositorio.
2.  Instala con `pnpm install`.
3.  Aprueba los scripts de construcción con `pnpm approve-builds`.
4.  Configura las variables de entorno en `apps/backend/.env`.
5.  Inicia el entorno con `pnpm dev`.

---
*Nota para colaboradores: Si añades una nueva dependencia a una app, hazlo desde la raíz usando `--filter` o dentro de la carpeta correspondiente.*
