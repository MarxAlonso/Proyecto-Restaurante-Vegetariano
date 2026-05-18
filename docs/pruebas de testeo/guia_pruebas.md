# 🥗 Guía Paso a Paso para Pruebas de Software con Selenium
**Proyecto**: Restaurante Vegetariano (RESTVEG_BD)  
**Módulo**: Aseguramiento de Calidad y Pruebas Automatizadas (QA Automation)  
**Entregable**: Evidencia de Pruebas y Validación Cloud (Rúbricas 2, 3 y 4)  
**Autor**: Marx Alonso

Esta guía detallada te guiará paso a paso para ejecutar las pruebas automatizadas de caja negra (E2E) utilizando **Selenium Webdriver 4**, **TypeScript** y **Vitest**. Con este entregable automatizado, demostrarás ante el jurado un nivel de desarrollo industrial de software de nivel superior.

---

## 🎯 ¿Por qué Selenium en este Proyecto?
Las pruebas de software tradicionales se hacen de forma manual (haciendo clic campo por campo). Al integrar **Selenium Webdriver**, automatizamos la interacción humana en el navegador real. Esto nos permite garantizar:
1. **Confidencialidad y Seguridad**: Que las inyecciones SQL y XSS sean neutralizadas en el navegador (`security.spec.ts`).
2. **Consistencia de Roles**: Que cada usuario (Cliente, Administrador, Cocina) sea redirigido a su panel correspondiente de forma veloz e infalible (`auth.spec.ts`).
3. **Accesibilidad**: Que el cambio de tema (Claro/Oscuro) sea modificado correctamente a nivel DOM en el navegador (`navigation.spec.ts`).

---

## 🛠️ Prerrequisitos en la Máquina Local
Antes de empezar, asegúrate de cumplir con lo siguiente en la computadora donde harás la prueba:
* **Google Chrome**: Debes tener instalado el navegador Google Chrome.
* **Instalación de Dependencias**: Si no lo has hecho ya, ejecuta en tu consola en la raíz del proyecto:
  ```bash
  pnpm install
  ```
  *(Nota: Gracias a **Selenium Manager** de Selenium 4, no necesitas descargar ningún driver como `chromedriver.exe` de forma manual. El sistema se encarga de todo).*

---

## 🚀 PASO 1: Levantar el Sistema Local
Las pruebas automatizadas de Selenium interactúan con la aplicación en vivo. Por ende, debes iniciar los servidores locales antes de ejecutar los tests.

1. **Abrir una terminal** en la raíz del proyecto.
2. **Iniciar los servicios locales** de frontend y backend ejecutando:
   ```bash
   pnpm dev
   ```
3. Verifica que puedas abrir tu navegador y entrar a:
   * **Frontend**: `http://localhost:3000` (Debería cargar la landing page del restaurante).
   * **Backend**: `http://localhost:3001` (Servidor de la API con base de datos conectada).

---

## 🧪 PASO 2: Entender los Casos de Prueba Automatizados
La suite cuenta con 3 archivos de prueba principales ubicados en `apps/selenium-test-nutribrain/src/specs/`:

### A. Pruebas de Navegación (`navigation.spec.ts`)
* **Caso 1**: Carga la landing page, busca el elemento con clase `.title-main` y verifica que contenga `"Sabor Natural & Parrilla Premium"`.
* **Caso 2**: Busca los botones de Llamada a la Acción (CTA) `"Ver Menú"` y `"Reservar Mesa"` y aserta que sus enlaces contengan `/menu` y `/reservar`.
* **Caso 3**: Localiza el botón `ThemeToggle` (`button[aria-label="Toggle theme"]`), le hace clic de manera autónoma y verifica que el tag `<html>` adquiera o elimine la clase `dark`, validando la funcionalidad de accesibilidad.

### B. Pruebas de Autenticación (`auth.spec.ts`)
* **Caso 1 (Login Fallido)**: Completa el correo con `invalido@restaurant.com`, la contraseña con `claveincorrecta` y hace clic en ingresar. Valida que el sistema muestre la alerta roja con el mensaje de error del backend.
* **Caso 2 (Login CLIENTE)**: Limpia los campos, ingresa el usuario semilla `cliente@restaurant.com` con la contraseña `password123`. Selenium hace clic en "Iniciar Sesión" y espera a que la URL del navegador cambie a `http://localhost:3000/panel`.
* **Caso 3 (Login ADMINISTRADOR)**: Limpia los campos, ingresa el usuario semilla `admin@restaurant.com` con `password123`. Hace clic y aserta la redirección protegida a la URL `/paneladmin`.

### C. Pruebas de Seguridad Web (`security.spec.ts`)
* **Caso 1 (Ataque XSS)**: Ingresa la carga maliciosa `<script>alert('xss_attack_test')</script>` en el campo de contraseña. Envía el formulario y verifica que el sistema sanitice la entrada de forma segura y **no dispare ningún diálogo emergente (alert)** en el cliente.
* **Caso 2 (Inyección SQL)**: Ingresa la carga útil `' OR '1'='1` en la contraseña para probar la evasión de autenticación. Verifica que el sistema mantenga la seguridad e impida el acceso, denegando el login de forma segura.

---

## 🏃‍♂️ PASO 3: Ejecutar las Pruebas

Elige una de las siguientes tres modalidades de ejecución según las necesidades de tu sustentación:

### Opción A: Ejecución Interactiva en Vivo (Recomendada para el Jurado 🌟)
Esta modalidad abrirá una ventana de Google Chrome automatizada en tu pantalla. El docente evaluador podrá ver cómo un robot toma el control, escribe las credenciales y navega solo a gran velocidad.
1. Abre una **nueva terminal** (sin cerrar la terminal donde está corriendo `pnpm dev`).
2. En la raíz de tu proyecto, ejecuta:
   ```bash
   pnpm test:selenium
   ```
3. **Observa tu pantalla**: Se levantará Chrome solo, ejecutará las secuencias en menos de 5 segundos y se cerrará entregando un reporte en color verde en la terminal.

---

### Opción B: Ejecución en Segundo Plano (Modo Headless 🤫)
Útil para ejecutar los tests de manera veloz sin abrir ventanas que interrumpan tu trabajo en pantalla.
1. En tu terminal de PowerShell en la raíz del proyecto, ejecuta:
   ```powershell
   $env:HEADLESS="true"; pnpm test:selenium
   ```
   *(Si estás en una terminal de comandos tradicional CMD de Windows usa: `set HEADLESS=true && pnpm test:selenium`)*
2. Las pruebas se completarán de forma invisible en segundo plano, mostrándote únicamente la tabla de resultados finales de Vitest en verde.

---

### Opción C: Validar tu Despliegue en la Nube (Cloud Testing 🚀)
Puedes probar que el despliegue final que hiciste en la nube en **Vercel** sea robusto y seguro apuntando Selenium directamente contra tu URL pública.
1. Obtén la dirección web de tu frontend en Vercel (ejemplo: `https://restaurant-veg.vercel.app`).
2. Ejecuta en PowerShell:
   ```powershell
   $env:TARGET_URL="https://tu-proyecto-frontend.vercel.app"; pnpm test:selenium
   ```
3. Selenium abrirá Chrome y probará directamente el servidor de Vercel y tu base de datos cloud de Railway en vivo, evidenciando un plan de pruebas en caliente impecable.

---

## 📈 PASO 4: Interpretar y Capturar Evidencias
Al completarse los tests, la terminal mostrará un reporte de Vitest similar a este:

```text
 ✓ src/specs/navigation.spec.ts (3 tests)
 ✓ src/specs/auth.spec.ts (3 tests)
 ✓ src/specs/security.spec.ts (2 tests)

 Test Files  3 passed (3)
      Tests  8 passed (8)
   Duration  6.12s (transform 85ms, setup 1.2s)
```

### 📸 Cómo Capturar Evidencias para tu Informe Universitario:
1. Toma una captura de pantalla completa de tu terminal con los resultados en verde (`8 passed`).
2. *(Opcional)* Si ejecutas en modo interactivo, puedes grabar un video de 5 segundos con tu celular o un capturador de pantalla mostrando el momento exacto en que la ventana de Chrome se abre y completa los campos de login por sí sola. Esto se considera un **entregable de nivel excepcional** que te garantizará la nota máxima.

---

## 🎓 PASO 5: Consejos Clave para tu Sustentación
Cuando el jurado universitario te pregunte sobre la metodología de pruebas de software y validación, puedes argumentar de la siguiente manera:

* **Pregunta del Jurado**: *¿Cómo garantizó que su sistema es robusto y que las validaciones y autenticación funcionan correctamente?*
* **Tu Respuesta**: *"Para garantizar el máximo nivel de aseguramiento de la calidad (QA), implementamos un Plan de Pruebas Automatizado (E2E) de caja negra utilizando **Selenium Webdriver** con **TypeScript** y **Vitest**. No nos limitamos a hacer clic manuales; en su lugar, programamos scripts que simulan flujos reales de usuarios y ataques automatizados en el navegador. Validamos que el modo claro/oscuro responda a nivel de árbol DOM, que las redirecciones de roles (Cliente y Administrador) sean infalibles y que el sistema sea inmune a cargas maliciosas de XSS e inyecciones SQL en los formularios."*
