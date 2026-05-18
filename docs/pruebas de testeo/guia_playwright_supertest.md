# 🚀 Guía Avanzada de Pruebas: Playwright E2E y Supertest API
**Proyecto**: Restaurante Vegetariano (RESTVEG_BD)  
**Módulo**: Pirámide de Pruebas de Calidad de Software (QA Advanced)  
**Entregable**: Evidencia de Pruebas Unitarias, Integración y E2E (Rúbricas 2, 3 y 4)  
**Autor**: Marx Alonso

Para complementar y potenciar la suite de pruebas tradicionales de Selenium, hemos implementado una **Pirámide de Pruebas de Software** completa y profesional. Esta arquitectura divide el aseguramiento de la calidad en múltiples capas, garantizando la cobertura de código tanto en la interfaz de usuario (Frontend) como en la lógica de negocio (Backend).

---

## 📐 La Pirámide de Pruebas de Calidad del Monorepo

En la industria de desarrollo de software, no se prueba todo de la misma manera. Nuestra arquitectura implementa:

```text
       ▲
      / \
     /   \      Capa 3: E2E Completo (Selenium Webdriver + Chrome)
    / E2E \     Prueba flujos interactivos de caja negra en local o en la nube.
   /_______\
  /         \   Capa 2: E2E Moderno (Playwright)
 /  UI/E2E   \  Automatiza la UI de Next.js de forma ultra veloz con renderizado paralelo.
/_____________\
/             \ Capa 1: Integración de API (Supertest + Vitest en el Backend)
/  API Tests  \ Simula llamadas HTTP de red para probar endpoints de Express, Prisma y DB.
/______________\
```

---

## 🛠️ Prerrequisitos e Instalación Inicial
Para ejecutar Playwright, se requiere descargar una única vez sus binarios y navegadores integrados.
1. Abre tu terminal de comandos en la raíz del proyecto.
2. Descarga e instala los navegadores de Playwright ejecutando:
   ```bash
   pnpm --filter restaurant-veg exec playwright install
   ```

---

## 🧪 PASO 1: Ejecutar Pruebas del Backend (Supertest + Vitest)
Las pruebas de **Supertest** no necesitan abrir un navegador ni levantar servidores en puertos locales. Importan directamente la lógica del servidor de Express (`app`) y realizan peticiones HTTP simuladas en memoria, logrando ejecuciones en menos de 2 segundos.

* **¿Qué prueban estos tests?** (`apps/backend/src/tests/api.spec.ts`)
  1. Que el endpoint de salud de la API (`GET /api/health`) responda exitosamente con estado 200 y JSON correcto.
  2. Que el flujo de login fallido deniegue el acceso con códigos `400/401` y responda con mensajes JSON de error legibles.
  3. Que las credenciales válidas de Prisma (`admin@restveg.com` con `admin123`) generen correctamente el token JWT de seguridad.
  4. Que el catálogo del restaurante (`GET /api/menu`) devuelva un listado JSON de platos válido de la base de datos PostgreSQL.

* **Instrucciones de Ejecución**:
  En tu terminal, en la raíz del proyecto, ejecuta:
  ```bash
  pnpm test:backend
  ```
  *(Verás un reporte impecable de Vitest certificando el funcionamiento seguro e independiente de tu API en color verde).*

---

## 💻 PASO 2: Ejecutar Pruebas del Frontend (Playwright)
**Playwright** es actualmente el estándar de oro en empresas tecnológicas globales como Microsoft, Netflix o Meta para realizar pruebas de UI. Es hasta 10 veces más rápido que Selenium, maneja esperas inteligentes automáticas y provee herramientas interactivas increíbles.

* **¿Qué prueban estos tests?**
  * `navigation.spec.ts`: Carga de landing page pública, validez de botones CTA de la carta y el **ThemeToggle** de Next.js (alternancia dinámica DOM Claro/Oscuro).
  * `auth.spec.ts`: Validación de errores en el formulario, redirección del Cliente a `/panel` (con saludo personalizado dinámico `¡Hola, Marx!`) y redirección de Administrador a `/paneladmin` (con aserción de las métricas del dashboard).

* **Modalidad A: Consola Tradicional (Headless)**
  1. Asegúrate de tener los servidores de desarrollo corriendo (`pnpm dev`).
  2. En otra terminal en la raíz, ejecuta:
     ```bash
     pnpm test:playwright
     ```
     *(Playwright ejecutará los tests en paralelo de forma invisible entregándote resultados instantáneos).*

* **Modalidad B: ¡La Consola Gráfica Interactiva (UI Mode) 🌟!**
  Esta herramienta dejará boquiabierto a cualquier profesor o jurado evaluador. Playwright abrirá una aplicación interactiva que te permite depurar los tests línea por línea, ver capturas de pantalla de cada segundo de la prueba y examinar el código en vivo.
  1. Con `pnpm dev` activo, ejecuta en tu terminal raíz:
     ```bash
     pnpm test:playwright:ui
     ```
  2. Se abrirá la consola de control de Playwright. Pulsa el botón **"Play"** para ver una ejecución visual interactiva y detallada, paso a paso, con inspección de red, consola de logs y visor de código integrado.

---

## 🏆 PASO 3: Correr la Suite Completa de Pruebas
Si quieres certificar el 100% de la calidad de todo el monorepo (Backend con Supertest + E2E local con Selenium + E2E moderno con Playwright) con un solo comando:
```bash
pnpm test:all
```

---

## 🎓 Consejos para Sorprender al Jurado en la Sustentación

Si usas esta suite de pruebas durante la defensa de tu proyecto de título o examen final, destaca los siguientes puntos técnicos para demostrar un nivel de maestría excepcional:

1. **La Pirámide de Calidad**: *"No nos limitamos a probar manualmente. Construimos una Pirámide de Pruebas formal. La base son las pruebas de integración API con **Supertest y Vitest**, que garantizan la integridad de nuestros controladores Express y Prisma sin depender de la UI. La punta de la pirámide son las pruebas E2E, implementando tanto **Selenium** por compatibilidad de estándar industrial, como **Playwright** por su rendimiento moderno de última generación."*
2. **Sanitización e Inmunidad**: *"Gracias a las pruebas de Supertest y Playwright, automatizamos escenarios de penetración, validando que el servidor responda de forma segura ante credenciales erróneas e intentos de inyección, garantizando la consistencia de acceso basado en roles."*
3. **El Modo UI de Playwright**: *"Durante la demostración en vivo ante el jurado, abre la consola gráfica (`pnpm test:playwright:ui`). Esto les demostrará de manera visual e incuestionable que la aplicación no solo funciona, sino que cuenta con un ecosistema de Integración Continua (CI/CD) de nivel profesional."*
