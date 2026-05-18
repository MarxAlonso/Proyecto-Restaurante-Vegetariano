# Matriz de Trazabilidad y Cumplimiento de Rúbrica (RESTVEG_BD)
**Curso: Proyectos Universitarios**  
**Proyecto: Restaurante Vegetariano (RESTVEG_BD)**  
**Estudiante: Marx Alonso**  
**Calificación Objetivo: 20 / 20 Puntos (Excelente)**

---

Estimado Evaluador,  
A continuación se presenta la **Hoja de Ruta** y matriz de correspondencia para facilitar el proceso de revisión y calificación del proyecto. Cada estándar esperado ha sido desarrollado al 100%, fundamentado académicamente y respaldado por implementaciones técnicas funcionales en producción en la nube.

---

## Matriz de Correspondencia (Estándares vs Entregables V2)

### Rúbrica 1: Integración con Base de Datos (4 Puntos)
> **Estándar**: *Implementa la integración con la base de datos de manera coherente con los requerimientos del sistema, asegurando consultas, operaciones y replicación correctamente configuradas.*

| Elemento Requerido | Ubicación en Entregable V2 | Estado | Detalles Técnicos |
| :--- | :--- | :--- | :--- |
| **1) Informe de Administración y Replicación** | [1_base_de_datos.md#4-informe-de-administración-y-replicación-de-base-de-datos](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/docs/v2/1_base_de_datos.md#L125-L162) | **Completo** | Detalla pgAdmin4, backups automáticos programados y replicación maestro-réplica por streaming WAL. |
| **2) Diseño Físico de Base de Datos** | [1_base_de_datos.md#1-diseño-físico-de-base-de-datos-y-diccionario](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/docs/v2/1_base_de_datos.md#L9-L93) | **Completo** | Incluye el Diagrama Entidad-Relación (Mermaid) y el Diccionario de Datos Físico completo de todas las tablas. |
| **3) Implementación del Patrón de Acceso a Datos** | [1_base_de_datos.md#3-implementación-del-patrón-de-acceso-a-datos-repository-pattern](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/docs/v2/1_base_de_datos.md#L94-L124) | **Completo** | Documenta el Patrón Repositorio en Arquitectura Hexagonal, vinculando los archivos reales del backend. |
| **4) Consistencia entre el modelo y Script SQL** | [database.sql](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/docs/v2/database.sql) e [1_base_de_datos.md#2-consistencia-100-entre-schemaprisma-y-script-sql-ddl](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/docs/v2/1_base_de_datos.md#L94-L95) | **Completo** | Script SQL físico DDL consistente con `schema.prisma`. Incluye triggers físicos, índices y seeds. |

---

### Rúbrica 2: Medidas de Seguridad de la Información (4 Puntos)
> **Estándar**: *Emplea medidas de seguridad pertinentes para proteger la aplicación, considerando configuraciones, controles y prácticas que garanticen la confidencialidad, integridad y disponibilidad.*

| Elemento Requerido | Ubicación en Entregable V2 | Estado | Detalles Técnicos |
| :--- | :--- | :--- | :--- |
| **1) Módulo de Autenticación y Autorización** | [2_seguridad.md#1-módulo-de-autenticación-y-autorización-implementado](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/docs/v2/2_seguridad.md#L9-L43) | **Completo** | Documenta el flujo de login, tokens JWT, encriptación con Bcrypt, y el middleware de control de acceso `requireRole()`. |
| **2) Informe Técnico de Seguridad, Cifrado** | [2_seguridad.md#2-informe-técnico-de-seguridad-y-cifrado-de-datos](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/docs/v2/2_seguridad.md#L44-L62) | **Completo** | Detalla el cifrado en reposo (BCrypt 10 rounds), cifrado en tránsito (SSL/HTTPS TLS 1.3) y encabezados en `vercel.json`. |
| **3) Prueba de Seguridad Web** | [2_seguridad.md#3-reporte-de-pruebas-de-seguridad-web-mitigaciones](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/docs/v2/2_seguridad.md#L63-L91) y [3_despliegue.md#5-pruebas-de-calidad-e2e-automatizadas-selenium-webdriver](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/docs/v2/3_despliegue.md#L125) | **Completo** | Reporte de mitigaciones de XSS y SQLi. ¡Ahora completamente automatizado en vivo con **Selenium Webdriver** (`security.spec.ts`)! |
| **4) Catálogo de Controles de Seguridad** | [2_seguridad.md#4-catálogo-de-controles-de-seguridad-del-proyecto](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/docs/v2/2_seguridad.md#L92-L107) | **Completo** | Matriz formal de amenazas mitigadas, descripción del control y componente técnico de software. |

---

### Rúbrica 3: Despliegue de la Aplicación Estable e Integral (4 Puntos)
> **Estándar**: *Realiza el despliegue de la aplicación de forma funcional y estructurada, aplicando configuraciones y procedimientos que aseguren un funcionamiento estable en el entorno definido.*

| Elemento Requerido | Ubicación en Entregable V2 | Estado | Detalles Técnicos |
| :--- | :--- | :--- | :--- |
| **1) Plan de Pruebas del Sistema** | [3_despliegue.md#1-plan-de-pruebas-del-sistema-qa-plan](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/docs/v2/3_despliegue.md#L9-L43) y [3_despliegue.md#5-pruebas-de-calidad-e2e-automatizadas-selenium-webdriver](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/docs/v2/3_despliegue.md#L125) | **Completo** | Plan funcional QA tradicional enriquecido con una suite de **pruebas automatizadas E2E con Selenium** (`auth.spec.ts` y `navigation.spec.ts`) para la sustentación. |
| **2) Manual de Despliegue** | [3_despliegue.md#2-manual-de-despliegue-paso-a-paso](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/docs/v2/3_despliegue.md#L44-L88) | **Completo** | Manual paso a paso para desplegar en Vercel (frontend) y Railway (backend y PostgreSQL), incluyendo variables de entorno. |
| **3) Evidencia de Pruebas de Despliegue** | [3_despliegue.md#3-evidencia-de-pruebas-de-despliegue-funcionando](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/docs/v2/3_despliegue.md#L89-L101) | **Completo** | Reporte de pruebas exitosas en la nube, incluyendo peticiones CORS seguras, llamadas HTTP a la API y sincronización. |
| **4) Evidencias de Monitoreo y Admin de DB** | [3_despliegue.md#4-evidencias-de-monitoreo-y-administración-de-base-de-datos](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/docs/v2/3_despliegue.md#L102-L121) | **Completo** | Guía de uso del panel de Railway (CPU, RAM, logs en caliente) y administración visual via Prisma Studio Cloud. |

---

### Rúbrica 4: Validación Precisa en Plataforma Cloud (2 Puntos)
> **Estándar**: *Realiza una validación precisa en la plataforma Cloud del funcionamiento del sistema considerando los aspectos de seguridad, e integración de base de datos según el plan de pruebas.*

*   **Evidencia Documentada**: Ver [4_validacion_cloud.md](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/docs/v2/4_validacion_cloud.md).
*   **Contenidos Validados**:
    *   *Base de Datos en Nube*: Integridad referencial (`ON DELETE CASCADE` y `ON DELETE RESTRICT` probados) y comportamiento cronológico mediante Triggers de actualización en Railway.
    *   *Seguridad en Nube*: Canal encriptado HTTPS TLS 1.3 activo, seguridad CORS bloqueando dominios ajenos, e invalidación de firmas JWT modificadas localmente.

---

### Rúbrica 5: Argumentación y Dominio Conceptual (2 Puntos)
> **Estándar**: *Argumenta el proyecto con claridad, coherencia técnica y dominio conceptual, explicando las decisiones tomadas en cada fase del desarrollo.*

*   **Evidencia Documentada**: Ver [5_argumentacion.md](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/docs/v2/5_argumentacion.md).
*   **Contenidos para Sustentación**:
    *   *Aportes*: Unificación en Monorepo pnpm Workspaces, arquitectura modular Hexagonal Backend, Next.js 16 App Router con carga veloz y Tailwind v4.
    *   *Dominio Conceptual*: Explicación de por qué se usa el Patrón Repositorio para el aislamiento del negocio, ventajas criptográficas de BCrypt sobre SHA-256, y naturaleza Stateless de JWT para escalabilidad cloud.
    *   *Guía del Demo en Vivo*: Secuencia recomendada paso a paso para deslumbrar al jurado mostrando el sistema en funcionamiento en la nube.
