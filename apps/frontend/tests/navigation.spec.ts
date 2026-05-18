import { test, expect } from '@playwright/test';

test.describe('Pruebas de Navegación y Diseño (Playwright) - RESTVEG', () => {
  test('Debería cargar la página de inicio y mostrar el título principal', async ({ page }) => {
    // 1. Navegar a la landing page
    await page.goto('/');

    // 2. Verificar que se muestre el título principal
    const title = page.locator('.title-main');
    await expect(title).toBeVisible();
    await expect(title).toContainText('Sabor Natural & Parrilla Premium');
  });

  test('Debería validar la presencia de botones de llamada a la acción (CTA)', async ({ page }) => {
    await page.goto('/');

    // 1. Verificar el botón "Ver Menú"
    const menuBtn = page.locator('a:has-text("Ver Menú")');
    await expect(menuBtn).toBeVisible();
    await expect(menuBtn).toHaveAttribute('href', '/menu');

    // 2. Verificar el botón "Reservar Mesa"
    const reserveBtn = page.locator('a:has-text("Reservar Mesa")');
    await expect(reserveBtn).toBeVisible();
    await expect(reserveBtn).toHaveAttribute('href', '/#reserva');
  });

  test('Debería alternar correctamente entre el modo Claro y modo Oscuro', async ({ page }) => {
    await page.goto('/login');

    const html = page.locator('html');
    const toggleBtn = page.getByRole('button', { name: 'Toggle theme' });
    await expect(toggleBtn).toBeVisible();

    // 1. Capturar el estado inicial del tema (leyendo la clase de la etiqueta html)
    const initialClass = await html.getAttribute('class');
    const isInitiallyDark = initialClass ? initialClass.includes('dark') : false;

    // 2. Hacer clic en el toggle para cambiar
    await toggleBtn.click();
    await page.waitForTimeout(300); // pequeña espera para que se asiente el tema

    // 3. Verificar que se haya invertido el estado de la clase 'dark'
    const middleClass = await html.getAttribute('class');
    const isMiddleDark = middleClass ? middleClass.includes('dark') : false;
    expect(isMiddleDark).toBe(!isInitiallyDark);

    // 4. Hacer clic de nuevo para retornar al estado original
    await toggleBtn.click();
    await page.waitForTimeout(300);

    const finalClass = await html.getAttribute('class');
    const isFinalDark = finalClass ? finalClass.includes('dark') : false;
    expect(isFinalDark).toBe(isInitiallyDark);
  });
});
