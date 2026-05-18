import { Builder, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

/**
 * Obtiene la URL base objetivo para las pruebas.
 * Por defecto apunta al servidor local en puerto 3000,
 * pero permite redefinirse mediante la variable de entorno TARGET_URL.
 */
export const BASE_URL = process.env.TARGET_URL || 'http://localhost:3000';

/**
 * Inicializa y configura una instancia limpia de Selenium WebDriver para Google Chrome.
 * Utiliza Selenium Manager automáticamente para descargar el driver adecuado.
 */
export async function createDriver(): Promise<WebDriver> {
  const options = new chrome.Options();

  // Habilitar modo headless si se especifica en las variables de entorno
  if (process.env.HEADLESS === 'true') {
    options.addArguments('--headless=new');
  }

  // Argumentos optimizados para evitar bloqueos y logs innecesarios
  options.addArguments('--disable-logging');
  options.addArguments('--log-level=3');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--window-size=1280,800');

  // Construir el driver de Chrome
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  // Esperas implícitas globales (hasta 10 segundos para encontrar un elemento)
  await driver.manage().setTimeouts({ implicit: 10000 });

  return driver;
}
