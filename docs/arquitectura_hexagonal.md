# Arquitectura Hexagonal - Backend Restaurante Vegetariano

Este documento explica la elección de la **Arquitectura Hexagonal (Puertos y Adaptadores)** para el backend del proyecto y describe la función de cada carpeta dentro de esta estructura.

## ¿Por qué Arquitectura Hexagonal?

La Arquitectura Hexagonal fue elegida para garantizar que el núcleo de la aplicación (la lógica de negocio) esté completamente desacoplado de las tecnologías externas (base de datos, frameworks web, APIs de terceros).

### Beneficios Clave:
1.  **Independencia de la Tecnología**: Podemos cambiar la base de datos (ej. de PostgreSQL a MongoDB) o el framework web (ej. de Express a Fastify) sin tocar la lógica de negocio.
2.  **Mantenibilidad**: Al tener una separación clara de responsabilidades, el código es más fácil de navegar y mantener.
3.  **Testeabilidad**: Permite probar la lógica de negocio de forma aislada utilizando "mocks" o "stubs" para las dependencias externas.
4.  **Escalabilidad**: Facilita el crecimiento del proyecto al permitir añadir nuevos "adaptadores" (ej. una interfaz de línea de comandos o una tarea programada) sin modificar el núcleo.

---

## Estructura de Carpetas

La arquitectura se organiza en **módulos** (ej. `auth`, `menu`, `order`). Dentro de cada módulo, encontramos las siguientes capas:

### 1. Capa de Dominio (`/domain`)
Es el corazón de la aplicación. No depende de ninguna otra capa ni de ninguna librería externa (excepto utilidades básicas).

-   **`entities/` (`.entity.ts`)**: Define los modelos de datos del negocio. Son objetos que representan conceptos clave (como `User` o `Order`) y contienen las reglas esenciales del negocio.
-   **`repositories/` (`.repository.ts`)**: Define las **Interfaces (Puertos)**. Aquí se declara *qué* acciones se pueden realizar con los datos (ej. `saveUser`, `findMenuById`), pero no *cómo* se hacen.

### 2. Capa de Aplicación (`/application`)
Actúa como mediadora entre el mundo exterior y el dominio. Implementa los **Casos de Uso**.

-   **`services/` (`.service.ts`)**: Contiene la lógica necesaria para cumplir una funcionalidad específica (ej. `AuthService`). Coordina las entidades y utiliza las interfaces de los repositorios para realizar operaciones, manteniendo la lógica de negocio organizada.

### 3. Capa de Infraestructura (`/infrastructure`)
Contiene los detalles técnicos y las implementaciones concretas de las interfaces definidas en el dominio. Es la capa que "se comunica" con el exterior.

-   **`http/routes/` (`.route.ts`)**: Define los puntos de entrada de la API (Endpoints). Mapea las URLs de Express a los controladores. **(Adaptador de entrada)**.
-   **`http/controllers/` (`.controller.ts`)**: Gestiona la petición HTTP, valida los datos de entrada y llama al servicio de aplicación correspondiente. Luego, devuelve la respuesta al cliente.
-   **`persistence/` (`.prisma.repository.ts`)**: Implementa las interfaces de repositorio utilizando una tecnología específica (en este caso, **Prisma + PostgreSQL**). **(Adaptador de salida)**.

---

## Flujo de Datos Típico

1.  Una petición llega a una **Ruta**.
2.  La ruta entrega la petición al **Controlador**.
3.  El controlador extrae los datos y llama a un **Servicio de Aplicación**.
4.  El servicio realiza la lógica de negocio usando las **Entidades** y pide persistir o consultar datos a través de la **Interfaz del Repositorio**.
5.  La implementación en **Infraestructura** ejecuta la consulta real en la base de datos usando **Prisma**.
6.  La respuesta viaja de vuelta por el mismo camino hasta el cliente.
