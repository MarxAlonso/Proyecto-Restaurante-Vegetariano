# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Pruebas de Navegación y Diseño (Playwright) - RESTVEG >> Debería cargar la página de inicio y mostrar el título principal
- Location: tests\navigation.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.title-main')
Expected: visible
Error: strict mode violation: locator('.title-main') resolved to 2 elements:
    1) <a href="/" class="title-main text-white mb-6 text-6xl">…</a> aka getByRole('link', { name: 'Sabor Natural & Parrilla' })
    2) <h2 class="title-main mb-4 text-zinc-900 dark:text-white">Platos Destacados</h2> aka getByRole('heading', { name: 'Platos Destacados' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.title-main')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - generic [ref=e4]:
        - link "RESTAURANTVEG" [ref=e5] [cursor=pointer]:
          - /url: /
        - generic [ref=e6]:
          - link "Inicio" [ref=e7] [cursor=pointer]:
            - /url: /
          - link "Menú" [ref=e8] [cursor=pointer]:
            - /url: /menu
          - link "Nosotros" [ref=e9] [cursor=pointer]:
            - /url: /nosotros
          - link "Contacto" [ref=e10] [cursor=pointer]:
            - /url: /contacto
        - generic [ref=e11]:
          - button [ref=e12]:
            - img [ref=e13]
          - button "Toggle theme" [ref=e17]:
            - img [ref=e18]
          - link "Ingresar" [ref=e20] [cursor=pointer]:
            - /url: /login
          - link "Reservar" [ref=e21] [cursor=pointer]:
            - /url: /reservar
    - main [ref=e23]:
      - generic [ref=e27]:
        - link "Sabor Natural & Parrilla Premium" [ref=e28] [cursor=pointer]:
          - /url: /
        - paragraph [ref=e29]: Descubre la fusión perfecta entre la frescura vegetal y el ahumado inconfundible de nuestra parrilla. Una experiencia gastronómica única en el corazón de la ciudad.
        - generic [ref=e30]:
          - link "Ver Menú" [ref=e31] [cursor=pointer]:
            - /url: /menu
          - link "Reservar Mesa" [ref=e32] [cursor=pointer]:
            - /url: /reservar
      - generic [ref=e35]:
        - generic [ref=e36] [cursor=pointer]:
          - img "Vegetariano" [ref=e37]
          - generic [ref=e39]:
            - generic [ref=e40]:
              - img [ref=e41]
              - generic [ref=e44]: Categoría
            - heading "Vegetariano" [level=3] [ref=e45]
            - paragraph [ref=e46]: Explora la frescura y vitalidad de nuestros platos 100% vegetales.
            - link "Explorar Carta" [ref=e47]:
              - /url: /menu?category=Vegetariano
              - text: Explorar Carta
              - img [ref=e48]
        - generic [ref=e50] [cursor=pointer]:
          - img "Parrilla" [ref=e51]
          - generic [ref=e53]:
            - generic [ref=e54]:
              - img [ref=e55]
              - generic [ref=e57]: Categoría
            - heading "Parrilla" [level=3] [ref=e58]
            - paragraph [ref=e59]: El sabor ahumado y la técnica perfecta en cada corte premium.
            - link "Explorar Carta" [ref=e60]:
              - /url: /menu?category=Parrilla
              - text: Explorar Carta
              - img [ref=e61]
      - generic [ref=e64]:
        - generic [ref=e65]:
          - generic [ref=e66]:
            - img [ref=e67]
            - generic [ref=e69]: Selección Especial
            - img [ref=e70]
          - heading "Platos Destacados" [level=2] [ref=e72]
          - paragraph [ref=e73]: Una selección de nuestros platos más aclamados, preparados con los ingredientes más frescos.
        - generic [ref=e74]:
          - generic [ref=e75]:
            - generic [ref=e76]:
              - img "Hamburguesa de Lentejas" [ref=e77]
              - generic [ref=e78]:
                - img [ref=e79]
                - text: Vegetariano
            - generic [ref=e82]:
              - generic [ref=e83]:
                - heading "Hamburguesa de Lentejas" [level=3] [ref=e84]
                - generic [ref=e85]: S/ 28.00
              - paragraph [ref=e86]: Con queso vegano, rúcula y cebollas caramelizadas.
              - button "Añadir al Pedido" [ref=e87]:
                - img [ref=e88]
                - text: Añadir al Pedido
          - generic [ref=e92]:
            - generic [ref=e93]:
              - img "Costillas a la Parrilla" [ref=e94]
              - generic [ref=e95]:
                - img [ref=e96]
                - text: Parrilla
            - generic [ref=e98]:
              - generic [ref=e99]:
                - heading "Costillas a la Parrilla" [level=3] [ref=e100]
                - generic [ref=e101]: S/ 45.00
              - paragraph [ref=e102]: Con salsa barbacoa de la casa y papas rústicas.
              - button "Añadir al Pedido" [ref=e103]:
                - img [ref=e104]
                - text: Añadir al Pedido
          - generic [ref=e108]:
            - generic [ref=e109]:
              - img "Ensalada Quinoa Real" [ref=e110]
              - generic [ref=e111]:
                - img [ref=e112]
                - text: Vegetariano
            - generic [ref=e115]:
              - generic [ref=e116]:
                - heading "Ensalada Quinoa Real" [level=3] [ref=e117]
                - generic [ref=e118]: S/ 24.00
              - paragraph [ref=e119]: Palta, tomates cherry y vinagreta de cítricos.
              - button "Añadir al Pedido" [ref=e120]:
                - img [ref=e121]
                - text: Añadir al Pedido
    - contentinfo [ref=e125]:
      - generic [ref=e126]:
        - generic [ref=e127]:
          - link "RESTAURANTVEG" [ref=e128] [cursor=pointer]:
            - /url: /
          - paragraph [ref=e129]: La mejor experiencia gastronómica vegetariana y a la parrilla. Productos frescos del campo a tu mesa.
        - generic [ref=e130]:
          - heading "Enlaces" [level=4] [ref=e131]
          - list [ref=e132]:
            - listitem [ref=e133]:
              - link "Menú" [ref=e134] [cursor=pointer]:
                - /url: /menu
            - listitem [ref=e135]:
              - link "Reservar" [ref=e136] [cursor=pointer]:
                - /url: /reservar
            - listitem [ref=e137]:
              - link "Nosotros" [ref=e138] [cursor=pointer]:
                - /url: /nosotros
            - listitem [ref=e139]:
              - link "Contacto" [ref=e140] [cursor=pointer]:
                - /url: /contacto
        - generic [ref=e141]:
          - heading "Contacto" [level=4] [ref=e142]
          - list [ref=e143]:
            - listitem [ref=e144]: Av. Principal 123, Lima
            - listitem [ref=e145]: +51 987 654 321
            - listitem [ref=e146]: info@restaurantveg.com
      - paragraph [ref=e148]: © 2024 Restaurant Veg. Todos los derechos reservados.
  - button "Open Next.js Dev Tools" [ref=e154] [cursor=pointer]:
    - img [ref=e155]
  - alert [ref=e158]
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
> 10 |     await expect(title).toBeVisible();
     |                         ^ Error: expect(locator).toBeVisible() failed
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
  25 |     await expect(reserveBtn).toHaveAttribute('href', '/#reserva');
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