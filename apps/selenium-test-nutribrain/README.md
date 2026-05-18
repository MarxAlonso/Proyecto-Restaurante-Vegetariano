# 🧪 Suite de Pruebas Automatizadas (Selenium Webdriver + Vitest)
**Proyecto**: Restaurante Vegetariano (RESTVEG_BD)  
**Módulo**: Aseguramiento de Calidad Académica (QA Automation)  
**Autor**: Marx Alonso

Este paquete contiene una suite completa de **pruebas de caja negra automatizadas (End-to-End - E2E)** utilizando **Selenium Webdriver 4** y el motor de pruebas **Vitest** en entornos tipados con **TypeScript**. 

La suite ha sido diseñada para verificar la experiencia de usuario, las transiciones visuales de accesibilidad (claro/oscuro), la seguridad web de los inputs y los flujos críticos de autenticación por roles definidos en la rúbrica.

---

## 🏗️ Arquitectura del Módulo de Pruebas

```text
apps/selenium-test-nutribrain/
├── src/
│   ├── specs/
│   │   ├── auth.spec.ts         # Pruebas de Login, control de roles (CLIENT/ADMIN) y redirecciones.
│   │   ├── navigation.spec.ts   # Pruebas de la Landing Page, CTAs y Toggle de Tema (Claro/Oscuro).
│   │   └── security.spec.ts     # Pruebas de robustez frente a XSS y evasión SQL Injection en formularios.
│   └── utils/
│       └── webdriver.ts         # Configuración unificada de Selenium Webdriver y soporte para variable TARGET_URL.
├── package.json                 # Dependencias y scripts npm para correr pruebas.
├── tsconfig.json                # Configuración del transpilador TypeScript.
├── vitest.config.ts             # Configuración del motor de ejecución Vitest (timeouts optimizados).
└── README.md                    # Este manual de uso académico.
```

---

## 🚀 Prerrequisitos y Configuración

1. **Google Chrome**: Debes tener instalado el navegador Google Chrome en tu máquina local.
2. **Node.js y pnpm**: El monorepo utiliza `pnpm` como gestor de dependencias.
3. **Servidor Local Activo**: Para correr los tests en local, asegúrate de levantar tu frontend en el puerto 3000 (`pnpm dev`).

> [!NOTE]
> **Selenium Manager**: Selenium Webdriver 4 incluye la herramienta nativa *Selenium Manager*. No necesitas descargar manualmente archivos como `chromedriver.exe` ni agregarlos al PATH. El sistema detectará la versión instalada de tu navegador Chrome y descargará el driver correcto en segundo plano de forma 100% automatizada.

---

## 💻 Instrucciones de Ejecución

### 1. Instalar Dependencias (desde la raíz)
Ejecuta el siguiente comando en la raíz del proyecto para descargar e instalar todas las dependencias nuevas del workspace:
```bash
pnpm install
```

### 2. Ejecutar Pruebas en Modo Visible (Predeterminado)
Levanta tu servidor de desarrollo (`pnpm dev`) en una terminal y en otra terminal ejecuta:
```bash
# Ejecuta todas las pruebas automatizadas abriendo ventanas de Chrome reales
pnpm test:selenium
```

### 3. Ejecutar Pruebas en Segundo Plano (Modo Headless)
Si deseas ejecutar las pruebas de manera silenciosa en segundo plano (útil para integración continua o ejecuciones rápidas sin interferir en tu pantalla):
```bash
# En Windows (PowerShell)
$env:HEADLESS="true"; pnpm test:selenium

# En Linux o macOS
HEADLESS=true pnpm test:selenium
```

### 4. Probar contra el Servidor de Producción Cloud (Vercel)
Una de las mayores ventajas de esta suite es que puede validar tu despliegue real en la nube. Simplemente pasa la variable `TARGET_URL` apuntando a tu dominio de Vercel:
```bash
# En Windows (PowerShell)
$env:TARGET_URL="https://tu-proyecto-frontend.vercel.app"; pnpm test:selenium

# En Linux o macOS
TARGET_URL=https://tu-proyecto-frontend.vercel.app pnpm test:selenium
```

---

## 📊 Coherencia y Correspondencia con la Rúbrica Evaluadora

Estas pruebas automatizadas validan directamente los entregables requeridos por tu profesor para calificar con nota máxima:

| Archivo de Prueba | Objetivo Técnico | Correspondencia en Rúbrica | Caso de Prueba QA |
| :--- | :--- | :--- | :--- |
| **[navigation.spec.ts](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/apps/selenium-test-nutribrain/src/specs/navigation.spec.ts)** | Comprobar que la landing page cargue sin errores y que el **Toggle de Modo Claro/Oscuro** funcione a nivel DOM (modificando la clase de `<html>`). | **Rúbrica 3 (Despliegue Estable)** e **Informe de Modo Claro/Oscuro global**. | Verificación Visual & Accesibilidad global |
| **[auth.spec.ts](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/apps/selenium-test-nutribrain/src/specs/auth.spec.ts)** | Autenticar usuarios con contraseñas encriptadas y verificar que los usuarios del seed se redirijan dinámicamente según su rol: Administrador a `/paneladmin` y Clientes a `/panel`. | **Rúbrica 2 (Módulo de Autenticación)** y **Rúbrica 3 (Plan de Pruebas QA)**. | `CP-02: Autenticación de Usuario (Módulo Auth)` |
| **[security.spec.ts](file:///c:/developer-marx/Proyectos%20Universitarios/Proyecto%20Restaurante%20Vegetariano/apps/selenium-test-nutribrain/src/specs/security.spec.ts)** | Inyectar cargas maliciosas de SQL y de Scripts Activos (XSS) para validar que la interfaz sanitice y repela ataques, previniendo accesos indebidos. | **Rúbrica 2 (Prueba de Seguridad Web)** y **Rúbrica 4 (Validación Cloud de Seguridad)**. | `CP-05: Mitigación de Vulnerabilidades E2E` |
