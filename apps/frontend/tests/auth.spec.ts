import { test, expect } from '@playwright/test';

test.describe('Pruebas de Autenticación y Autorización (Playwright) - RESTVEG', () => {
  test.beforeEach(async ({ page }) => {
    // Asegurarse de limpiar almacenamiento antes de cada test para evitar colisiones
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => sessionStorage.clear());
  });

  test('Debería denegar el acceso y mostrar un mensaje de error con credenciales inválidas (Login Fallido)', async ({ page }) => {
    await page.goto('/login');

    // 1. Rellenar campos erróneos
    await page.fill('#email', 'invalido@restveg.com');
    await page.fill('#password', 'claveincorrecta');
    await page.click('button[type="submit"]');

    // 2. Esperar y verificar la alerta de error
    const errorTextElement = page.locator('p.text-red-600');
    await expect(errorTextElement).toBeVisible();
    
    const errorText = await errorTextElement.innerText();
    expect(errorText.toLowerCase()).toMatch(/error|invalid|credenciales/);
  });

  test('Debería iniciar sesión correctamente como CLIENTE y redirigir al panel correspondiente', async ({ page }) => {
    await page.goto('/login');

    // 1. Ingresar credenciales del cliente semilla
    await page.fill('#email', 'client@restveg.com');
    await page.fill('#password', 'client123');
    await page.click('button[type="submit"]');

    // 2. Esperar redirección y verificar la URL
    await expect(page).toHaveURL(/\/panel$/);

    // 3. Verificar elementos en la interfaz del cliente
    const greeting = page.locator('h1:has-text("¡Hola, Client!")');
    await expect(greeting).toBeVisible();

    const totalGastado = page.locator('p:has-text("Total Gastado")');
    await expect(totalGastado).toBeVisible();
  });

  test('Debería iniciar sesión correctamente como ADMINISTRADOR y redirigir al panel de administración', async ({ page }) => {
    await page.goto('/login');

    // 1. Ingresar credenciales del administrador semilla
    await page.fill('#email', 'admin@restveg.com');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');

    // 2. Esperar redirección y verificar la URL
    await expect(page).toHaveURL(/\/paneladmin$/);

    // 3. Verificar elementos del dashboard administrativo
    const headerTitle = page.locator('h1:has-text("Dashboard Administrativo")');
    await expect(headerTitle).toBeVisible();

    const clientsCard = page.locator('p:has-text("Clientes Registrados")');
    await expect(clientsCard).toBeVisible();
  });
});
