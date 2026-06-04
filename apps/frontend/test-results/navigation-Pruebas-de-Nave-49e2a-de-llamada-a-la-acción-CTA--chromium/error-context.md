# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Pruebas de Navegación y Diseño (Playwright) - RESTVEG >> Debería validar la presencia de botones de llamada a la acción (CTA)
- Location: tests\navigation.spec.ts:14:7

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('a:has-text("Reservar Mesa")')
Expected: "/#reserva"
Received: "/reservar"
Timeout:  5000ms

Call log:
  - Expect "toHaveAttribute" with timeout 5000ms
  - waiting for locator('a:has-text("Reservar Mesa")')
    13 × locator resolved to <a href="/reservar" class="btn-secondary text-center">Reservar Mesa</a>
       - unexpected value "/reservar"

```

```yaml
- link "Reservar Mesa":
  - /url: /reservar
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Pruebas de Navegación y Diseño (Playwright) - RESTVEG', () => {
  4  |   test('Debería cargar la página de inicio y mostrar el título principal', async ({ page }) => {
  5  |     // 1. Navegar a la landing page
  6  |     await page.goto('/');
  7  | 
  8  |     // 2. Verificar que se muestre el título principal
  9  |     const title = page.locator('.title-main');
  10 |     await expect(title).toBeVisible();
  11 |     await expect(title).toContainText('Sabor Natural & Parrilla Premium');
  12 |   });
  13 | 
  14 |   test('Debería validar la presencia de botones de llamada a la acción (CTA)', async ({ page }) => {
  15 |     await page.goto('/');
  16 | 
  17 |     // 1. Verificar el botón "Ver Menú"
  18 |     const menuBtn = page.locator('a:has-text("Ver Menú")');
  19 |     await expect(menuBtn).toBeVisible();
  20 |     await expect(menuBtn).toHaveAttribute('href', '/menu');
  21 | 
  22 |     // 2. Verificar el botón "Reservar Mesa"
  23 |     const reserveBtn = page.locator('a:has-text("Reservar Mesa")');
  24 |     await expect(reserveBtn).toBeVisible();
> 25 |     await expect(reserveBtn).toHaveAttribute('href', '/#reserva');
     |                              ^ Error: expect(locator).toHaveAttribute(expected) failed
  26 |   });
  27 | 
  28 |   test('Debería alternar correctamente entre el modo Claro y modo Oscuro', async ({ page }) => {
  29 |     await page.goto('/login');
  30 | 
  31 |     const html = page.locator('html');
  32 |     const toggleBtn = page.getByRole('button', { name: 'Toggle theme' });
  33 |     await expect(toggleBtn).toBeVisible();
  34 | 
  35 |     // 1. Capturar el estado inicial del tema (leyendo la clase de la etiqueta html)
  36 |     const initialClass = await html.getAttribute('class');
  37 |     const isInitiallyDark = initialClass ? initialClass.includes('dark') : false;
  38 | 
  39 |     // 2. Hacer clic en el toggle para cambiar
  40 |     await toggleBtn.click();
  41 |     await page.waitForTimeout(300); // pequeña espera para que se asiente el tema
  42 | 
  43 |     // 3. Verificar que se haya invertido el estado de la clase 'dark'
  44 |     const middleClass = await html.getAttribute('class');
  45 |     const isMiddleDark = middleClass ? middleClass.includes('dark') : false;
  46 |     expect(isMiddleDark).toBe(!isInitiallyDark);
  47 | 
  48 |     // 4. Hacer clic de nuevo para retornar al estado original
  49 |     await toggleBtn.click();
  50 |     await page.waitForTimeout(300);
  51 | 
  52 |     const finalClass = await html.getAttribute('class');
  53 |     const isFinalDark = finalClass ? finalClass.includes('dark') : false;
  54 |     expect(isFinalDark).toBe(isInitiallyDark);
  55 |   });
  56 | });
  57 | 
```