# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Pruebas de Autenticación y Autorización (Playwright) - RESTVEG >> Debería iniciar sesión correctamente como ADMINISTRADOR y redirigir al panel de administración
- Location: tests\auth.spec.ts:46:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/paneladmin$/
Received string:  "http://localhost:3000/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × unexpected value "http://localhost:3000/login"

```

```yaml
- button "Toggle theme"
- link "RESTAURANTVEG":
  - /url: /
- heading "¡Bienvenido de nuevo!" [level=2]
- paragraph: Ingresa a tu cuenta para continuar.
- text: Correo Electrónico
- textbox "Correo Electrónico":
  - /placeholder: nombre@ejemplo.com
  - text: admin@restveg.com
- text: Contraseña
- link "¿Olvidaste tu contraseña?":
  - /url: "#"
- textbox "Contraseña":
  - /placeholder: ••••••••
  - text: admin123
- button "Iniciar Sesión"
- text: O continuar con
- button "Continuar con Google":
  - img
  - text: Continuar con Google
- paragraph:
  - text: ¿No tienes una cuenta?
  - link "Regístrate aquí":
    - /url: /register
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Pruebas de Autenticación y Autorización (Playwright) - RESTVEG', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Asegurarse de limpiar almacenamiento antes de cada test para evitar colisiones
  6  |     await page.goto('/login');
  7  |     await page.evaluate(() => localStorage.clear());
  8  |     await page.evaluate(() => sessionStorage.clear());
  9  |   });
  10 | 
  11 |   test('Debería denegar el acceso y mostrar un mensaje de error con credenciales inválidas (Login Fallido)', async ({ page }) => {
  12 |     await page.goto('/login');
  13 | 
  14 |     // 1. Rellenar campos erróneos
  15 |     await page.fill('#email', 'invalido@restveg.com');
  16 |     await page.fill('#password', 'claveincorrecta');
  17 |     await page.click('button[type="submit"]');
  18 | 
  19 |     // 2. Esperar y verificar la alerta de error
  20 |     const errorTextElement = page.locator('p.text-red-600');
  21 |     await expect(errorTextElement).toBeVisible();
  22 |     
  23 |     const errorText = await errorTextElement.innerText();
  24 |     expect(errorText.toLowerCase()).toMatch(/error|invalid|credenciales/);
  25 |   });
  26 | 
  27 |   test('Debería iniciar sesión correctamente como CLIENTE y redirigir al panel correspondiente', async ({ page }) => {
  28 |     await page.goto('/login');
  29 | 
  30 |     // 1. Ingresar credenciales del cliente semilla
  31 |     await page.fill('#email', 'client@restveg.com');
  32 |     await page.fill('#password', 'client123');
  33 |     await page.click('button[type="submit"]');
  34 | 
  35 |     // 2. Esperar redirección y verificar la URL
  36 |     await expect(page).toHaveURL(/\/panel$/);
  37 | 
  38 |     // 3. Verificar elementos en la interfaz del cliente
  39 |     const greeting = page.locator('h1:has-text("¡Hola, Marx!")');
  40 |     await expect(greeting).toBeVisible();
  41 | 
  42 |     const pointsCard = page.locator('p:has-text("Puntos Veg")');
  43 |     await expect(pointsCard).toBeVisible();
  44 |   });
  45 | 
  46 |   test('Debería iniciar sesión correctamente como ADMINISTRADOR y redirigir al panel de administración', async ({ page }) => {
  47 |     await page.goto('/login');
  48 | 
  49 |     // 1. Ingresar credenciales del administrador semilla
  50 |     await page.fill('#email', 'admin@restveg.com');
  51 |     await page.fill('#password', 'admin123');
  52 |     await page.click('button[type="submit"]');
  53 | 
  54 |     // 2. Esperar redirección y verificar la URL
> 55 |     await expect(page).toHaveURL(/\/paneladmin$/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  56 | 
  57 |     // 3. Verificar elementos del dashboard administrativo
  58 |     const headerTitle = page.locator('h1:has-text("Dashboard Administrativo")');
  59 |     await expect(headerTitle).toBeVisible();
  60 | 
  61 |     const clientsCard = page.locator('p:has-text("Clientes Registrados")');
  62 |     await expect(clientsCard).toBeVisible();
  63 |   });
  64 | });
  65 | 
```