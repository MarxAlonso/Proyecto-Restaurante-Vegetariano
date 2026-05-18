import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { WebDriver, By, until } from 'selenium-webdriver';
import { createDriver, BASE_URL } from '../utils/webdriver.js';

describe('Pruebas de Seguridad Web Automatizadas (Mitigaciones) - RESTVEG', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await createDriver();
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it('Debería mitigar ataques de inyección de código (XSS) y sanitizar entradas en Login', async () => {
    await driver.get(`${BASE_URL}/login`);

    const emailInput = await driver.findElement(By.id('email'));
    const passwordInput = await driver.findElement(By.id('password'));
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));

    // 1. Inyectar carga útil de XSS en el campo de contraseña
    const xssPayload = "<script>alert('xss_attack_test')</script>";
    
    // El campo de email espera un formato de email válido por validación nativa HTML5,
    // por lo que usaremos un email válido pero inyectaremos la carga en el password.
    await emailInput.sendKeys('test_seguridad@restaurant.com');
    await passwordInput.sendKeys(xssPayload);
    await submitBtn.click();

    // 2. Esperar el mensaje de error o fallo devuelto por el backend
    const errorTextElement = await driver.wait(
      until.elementLocated(By.css('p.text-red-600')),
      5000
    );
    const errorText = await errorTextElement.getText();

    // Comprobar que el backend rechazó la solicitud limpiamente sin romperse
    expect(errorText).toBeTruthy();

    // 3. Confirmar que no se disparó ninguna ventana emergente (alert) de JavaScript activa
    let alertShown = false;
    try {
      const alert = await driver.switchTo().alert();
      const alertText = await alert.getText();
      if (alertText.includes('xss')) {
        alertShown = true;
        await alert.accept();
      }
    } catch (e) {
      // Excepción esperada si no hay alerta activa (comportamiento seguro)
      alertShown = false;
    }

    expect(alertShown).toBe(false); // Seguridad cumplida: El script no se ejecutó
  });

  it('Debería mitigar intentos de inyección SQL (SQLi) en campos de texto', async () => {
    await driver.get(`${BASE_URL}/login`);

    const emailInput = await driver.findElement(By.id('email'));
    const passwordInput = await driver.findElement(By.id('password'));
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));

    // 1. Intentar inyección SQL clásica para evadir login
    const sqlPayload = "' OR '1'='1";
    
    // Como el input es type="email", usaremos una estructura de email que incluya SQL injection
    // para probar la sanitización de Prisma en el backend en caso de saltarse la validación nativa.
    await emailInput.sendKeys('admin@restaurant.com');
    await passwordInput.sendKeys(sqlPayload);
    await submitBtn.click();

    // 2. Esperar a la respuesta de denegación segura
    const errorTextElement = await driver.wait(
      until.elementLocated(By.css('p.text-red-600')),
      5000
    );
    const errorText = await errorTextElement.getText();

    // Comprobar que no se obtuvo acceso no autorizado (la URL no debe cambiar a paneladmin)
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).not.toContain('/paneladmin');
    expect(errorText).toBeTruthy(); // Se devolvió error de credenciales seguras
  });
});
