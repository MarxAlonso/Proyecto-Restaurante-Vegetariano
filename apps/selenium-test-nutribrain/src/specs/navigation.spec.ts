import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { WebDriver, By } from 'selenium-webdriver';
import { createDriver, BASE_URL } from '../utils/webdriver.js';

describe('Pruebas de Navegación y Diseño - RESTVEG', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await createDriver();
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it('Debería cargar la página de inicio y mostrar el título principal', async () => {
    // 1. Navegar a la landing page
    await driver.get(BASE_URL);

    // 2. Localizar el título H1 principal de Hero
    const heroTitle = await driver.findElement(By.className('title-main'));
    const titleText = await heroTitle.getText();

    // 3. Validar el contenido del título
    expect(titleText).toContain('Sabor Natural');
    expect(titleText).toContain('Parrilla Premium');
  });

  it('Debería validar la presencia de botones de llamada a la acción (CTA)', async () => {
    await driver.get(BASE_URL);

    // Buscar botón "Ver Menú"
    const menuButton = await driver.findElement(By.xpath("//a[contains(text(), 'Ver Menú')]"));
    const menuHref = await menuButton.getAttribute('href');
    expect(menuHref).toContain('/menu');

    // Buscar botón "Reservar Mesa"
    const reserveButton = await driver.findElement(By.xpath("//a[contains(text(), 'Reservar Mesa')]"));
    const reserveHref = await reserveButton.getAttribute('href');
    expect(reserveHref).toContain('/reservar');
  });

  it('Debería alternar correctamente entre el modo Claro y modo Oscuro', async () => {
    await driver.get(BASE_URL);

    // 1. Obtener la etiqueta HTML raíz
    const htmlTag = await driver.findElement(By.tagName('html'));

    // 2. Buscar el botón de alternancia de tema (ThemeToggle)
    const toggleBtn = await driver.findElement(By.css('button[aria-label="Toggle theme"]'));

    // 3. Capturar el estado actual del tema (leyendo la clase de la etiqueta html)
    const initialClasses = await htmlTag.getAttribute('class');
    const isInitiallyDark = initialClasses ? initialClasses.includes('dark') : false;

    // 4. Hacer clic en el toggle para alternar
    await toggleBtn.click();

    // Pequeña espera para permitir la transición de next-themes
    await driver.sleep(500);

    // 5. Verificar que la clase 'dark' se haya invertido
    const middleClasses = await htmlTag.getAttribute('class');
    const isMiddleDark = middleClasses ? middleClasses.includes('dark') : false;
    expect(isMiddleDark).toBe(!isInitiallyDark);

    // 6. Hacer clic de nuevo para retornar al estado original
    await toggleBtn.click();
    await driver.sleep(500);

    const finalClasses = await htmlTag.getAttribute('class');
    const isFinalDark = finalClasses ? finalClasses.includes('dark') : false;
    expect(isFinalDark).toBe(isInitiallyDark);
  });
});
