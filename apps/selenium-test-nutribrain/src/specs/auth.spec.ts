import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { WebDriver, By, until } from 'selenium-webdriver';
import { createDriver, BASE_URL } from '../utils/webdriver.js';

describe('Pruebas de Autenticación y Autorización - RESTVEG', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await createDriver();
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it('Debería denegar el acceso y mostrar un mensaje de error con credenciales inválidas (Login Fallido)', async () => {
    // 1. Navegar a la página de login
    await driver.get(`${BASE_URL}/login`);

    // 2. Localizar campos del formulario
    const emailInput = await driver.findElement(By.id('email'));
    const passwordInput = await driver.findElement(By.id('password'));
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));

    // 3. Completar con credenciales erróneas
    await emailInput.sendKeys('invalido@restaurant.com');
    await passwordInput.sendKeys('claveincorrecta');
    await submitBtn.click();

    // 4. Esperar y verificar que aparezca la alerta de error
    const errorTextElement = await driver.wait(
      until.elementLocated(By.css('p.text-red-600')),
      5000
    );
    const errorText = await errorTextElement.getText();

    expect(errorText).toBeTruthy();
    expect(errorText.toLowerCase()).toContain('error');
  });

  it('Debería iniciar sesión correctamente como CLIENTE y redirigir al panel correspondiente', async () => {
    await driver.get(`${BASE_URL}/login`);

    const emailInput = await driver.findElement(By.id('email'));
    const passwordInput = await driver.findElement(By.id('password'));
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));

    // Limpiar campos y llenar credenciales de cliente semilla
    await emailInput.clear();
    await emailInput.sendKeys('cliente@restaurant.com');
    await passwordInput.clear();
    await passwordInput.sendKeys('password123');
    await submitBtn.click();

    // Esperar a que la URL cambie y contenga '/panel'
    await driver.wait(until.urlContains('/panel'), 10000);

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/panel');

    // Desconectarse para la siguiente prueba (limpiando almacenamiento local)
    await driver.executeScript('localStorage.clear(); sessionStorage.clear();');
  });

  it('Debería iniciar sesión correctamente como ADMINISTRADOR y redirigir al panel de administración', async () => {
    await driver.get(`${BASE_URL}/login`);

    const emailInput = await driver.findElement(By.id('email'));
    const passwordInput = await driver.findElement(By.id('password'));
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));

    // Limpiar campos y llenar credenciales del admin semilla
    await emailInput.clear();
    await emailInput.sendKeys('admin@restaurant.com');
    await passwordInput.clear();
    await passwordInput.sendKeys('password123');
    await submitBtn.click();

    // Esperar a que la URL cambie y contenga '/paneladmin'
    await driver.wait(until.urlContains('/paneladmin'), 10000);

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/paneladmin');

    // Limpiar el estado de autenticación al finalizar
    await driver.executeScript('localStorage.clear(); sessionStorage.clear();');
  });
});
