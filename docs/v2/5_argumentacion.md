# Entregable 5: Argumentación Científica, Aportes y Sustentación Académica
**Curso: Proyectos Universitarios**  
**Proyecto: Restaurante Vegetariano (RESTVEG_BD)**  
**Estudiante: Marx Alonso**  
**Rúbrica Evaluada: Argumentación y Dominio Conceptual (2 Puntos)**

---

## 1. Principales Aportes del Estudiante al Proyecto
El desarrollo de esta plataforma de Restaurante Vegetariano representa una solución de ingeniería de software moderna e integral, aportando valor en diversas dimensiones de arquitectura, seguridad y persistencia:

### 1.1. Transición Eficiente a Monorepo con pnpm Workspaces
Se unificaron aplicaciones independientes en una arquitectura de **Monorepo gestionada por pnpm**. Esto permite:
*   Compartir configuraciones linter y tipados TS sin duplicar código.
*   Reducción drástica del espacio en disco y aceleración del proceso de construcción en la nube (Vercel/Railway) gracias al almacenamiento en caché global de `pnpm`.

### 1.2. Implementación Rigurosa de Arquitectura Hexagonal (Backend)
Se diseñó el backend bajo el patrón de **Arquitectura Hexagonal (Puertos y Adaptadores)**. Al separar la lógica de negocio central (Dominio y Casos de Uso) de las herramientas e infraestructuras externas (Framework Express, Prisma ORM, Base de Datos PostgreSQL, Multer):
*   El software es 100% testeable mediante mocks.
*   Se garantiza la mantenibilidad a largo plazo; por ejemplo, si en el futuro se decide migrar a Fastify o usar MongoDB, el código del negocio en `domain/` y `application/` permanecerá intacto.

### 1.3. Modernización del Frontend con Next.js 16 (App Router) y Tailwind CSS v4
El frontend se construyó utilizando el estándar vanguardista de **Next.js 16**, aprovechando:
*   **React Server Components (RSC)** para una carga veloz del menú inicial con renderizado en servidor (SSR), optimizando el SEO.
*   **Client Components** con estados dinámicos y transiciones enriquecidas con **Framer Motion** para el Panel de Cocina y autenticación de usuarios.
*   **Tailwind CSS v4** y **Next-Themes** para proveer una interfaz visual armoniosa, estética premium con modo claro/oscuro adaptativo de excelente experiencia de usuario (UX).

---

## 2. Coherencia Técnica y Dominio del Tema (Sustentación de Decisiones)

### 2.1. Defensa del Patrón Repositorio y Prisma
*   *¿Por qué no usar consultas SQL en los controladores directos?*  
    Hacer eso acopla el código a una base de datos específica y hace imposible realizar pruebas unitarias aisladas. Al implementar el **Patrón Repositorio**, el caso de uso solo conoce una interfaz abstracta (ej. `UserRepository`). La implementación real con Prisma y PostgreSQL queda delegada a la capa de infraestructura.
*   *¿Por qué Prisma ORM?*  
    Prisma provee un sistema fuertemente tipado en TypeScript generado a partir del esquema. Evita errores en tiempo de ejecución al interactuar con las columnas y protege nativamente al sistema de inyecciones SQL a través de consultas parametrizadas.

### 2.2. Sustentación del Esquema de Seguridad (Bcrypt + JWT)
*   *¿Por qué BCrypt y no SHA-256 para contraseñas?*  
    SHA-256 es un algoritmo criptográfico sumamente rápido, lo que facilita ataques de fuerza bruta masivos mediante tarjetas gráficas modernas (GPU). BCrypt incorpora un factor de coste y salado automático por cada registro, siendo computacionalmente costoso de vulnerar, brindando la máxima seguridad para las cuentas de los usuarios y trabajadores.
*   *¿Por qué JWT en lugar de sesiones tradicionales en memoria?*  
    Las sesiones en memoria exigen que el servidor backend mantenga un estado activo de cada cliente conectado, limitando la escalabilidad. **JWT es sin estado (Stateless)**, lo que permite al backend validar peticiones de manera distribuida y ágil en la nube sin consumir recursos de memoria local, lo cual es ideal para integraciones con plataformas cloud modernas.

---

## 3. Demostración del Funcionamiento en Plataforma Cloud (Guía para el Jurado)
Para demostrar el éxito y la estabilidad de la aplicación ante el docente evaluador, se estructurará la sustentación práctica en vivo siguiendo este orden lógico:

### Fase 1: Presentación de la Carta Web (Vercel)
1.  Ingresar al enlace del frontend en Vercel.
2.  Mostrar el diseño responsive adaptativo, los efectos hover en los platos de la carta vegetariana y la fluidez del cambio de tema (Claro/Oscuro).
3.  Explicar cómo Next.js consume los platos del menú desde el servidor cloud de forma veloz.

### Fase 2: Registro e Inicio de Sesión de Clientes
1.  Crear una cuenta de cliente nueva (`CP-01`).
2.  Iniciar sesión con la cuenta creada. Explicar el flujo del JWT y cómo se restringen las vistas de administración para este usuario común (Demostrando la solidez del middleware de autorización).

### Fase 3: Gestión de Platos en Tiempo Real (Administración)
1.  Cerrar sesión e ingresar con la cuenta de administrador: `admin@restaurant.com` / `password123`.
2.  Entrar a la sección de administración del menú.
3.  Crear un nuevo plato vegetariano subiendo una imagen ilustrativa.
4.  Explicar que la imagen se almacena en el servidor y el registro se guarda en **PostgreSQL en Railway**.

### Fase 4: Flujo de Pedido y Cocina Activa
1.  Entrar con la cuenta de cliente y agregar a la orden el plato creado por el administrador.
2.  Enviar el pedido (se crea en estado `PENDING` en PostgreSQL).
3.  Abrir otra ventana del navegador e iniciar sesión como cocinero: `cocina@restaurant.com` / `password123`.
4.  Acceder al panel de cocina (`/panelkitchen`). Mostrar cómo aparece el pedido del cliente de forma instantánea.
5.  Actualizar el pedido a "Preparar" y luego a "Listo". Mostrar cómo el estado en base de datos PostgreSQL se sincroniza en tiempo real y el trigger del sistema actualiza las columnas de control cronológico.

Con esta secuencia de demostración práctica en la nube, se valida un **flujo end-to-end robusto, funcional, seguro y de alta calidad técnica**, asegurando una calificación excelente en la sustentación del proyecto.
