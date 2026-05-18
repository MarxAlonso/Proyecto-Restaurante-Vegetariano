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
    1) <h1 class="title-main text-white mb-6">…</h1> aka getByRole('heading', { name: 'Sabor Natural & Parrilla' })
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
          - button "Toggle theme" [ref=e12]:
            - img [ref=e13]
          - link "Ingresar" [ref=e15] [cursor=pointer]:
            - /url: /login
          - link "Reservar" [ref=e16] [cursor=pointer]:
            - /url: /reservar
    - main [ref=e18]:
      - generic [ref=e22]:
        - heading "Sabor Natural & Parrilla Premium" [level=1] [ref=e23]
        - paragraph [ref=e24]: Descubre la fusión perfecta entre la frescura vegetal y el ahumado inconfundible de nuestra parrilla. Una experiencia gastronómica única en el corazón de la ciudad.
        - generic [ref=e25]:
          - link "Ver Menú" [ref=e26] [cursor=pointer]:
            - /url: /menu
          - link "Reservar Mesa" [ref=e27] [cursor=pointer]:
            - /url: /reservar
      - generic [ref=e30]:
        - generic [ref=e31] [cursor=pointer]:
          - img "Vegetariano" [ref=e32]
          - generic [ref=e34]:
            - generic [ref=e35]:
              - img [ref=e36]
              - generic [ref=e39]: Categoría
            - heading "Vegetariano" [level=3] [ref=e40]
            - paragraph [ref=e41]: Explora la frescura y vitalidad de nuestros platos 100% vegetales.
            - link "Explorar Carta" [ref=e42]:
              - /url: /menu?category=Vegetariano
              - text: Explorar Carta
              - img [ref=e43]
        - generic [ref=e45] [cursor=pointer]:
          - img "Parrilla" [ref=e46]
          - generic [ref=e48]:
            - generic [ref=e49]:
              - img [ref=e50]
              - generic [ref=e52]: Categoría
            - heading "Parrilla" [level=3] [ref=e53]
            - paragraph [ref=e54]: El sabor ahumado y la técnica perfecta en cada corte premium.
            - link "Explorar Carta" [ref=e55]:
              - /url: /menu?category=Parrilla
              - text: Explorar Carta
              - img [ref=e56]
      - generic [ref=e59]:
        - generic [ref=e60]:
          - generic [ref=e61]:
            - img [ref=e62]
            - generic [ref=e64]: Selección Especial
            - img [ref=e65]
          - heading "Platos Destacados" [level=2] [ref=e67]
          - paragraph [ref=e68]: Una selección de nuestros platos más aclamados, preparados con los ingredientes más frescos.
        - generic [ref=e69]:
          - generic [ref=e70]:
            - generic [ref=e71]:
              - img "Hamburguesa de Lentejas" [ref=e72]
              - generic [ref=e73]:
                - img [ref=e74]
                - text: Vegetariano
            - generic [ref=e77]:
              - generic [ref=e78]:
                - heading "Hamburguesa de Lentejas" [level=3] [ref=e79]
                - generic [ref=e80]: S/ 28.00
              - paragraph [ref=e81]: Con queso vegano, rúcula y cebollas caramelizadas.
              - button "Añadir al Pedido" [ref=e82]:
                - img [ref=e83]
                - text: Añadir al Pedido
          - generic [ref=e87]:
            - generic [ref=e88]:
              - img "Costillas a la Parrilla" [ref=e89]
              - generic [ref=e90]:
                - img [ref=e91]
                - text: Parrilla
            - generic [ref=e93]:
              - generic [ref=e94]:
                - heading "Costillas a la Parrilla" [level=3] [ref=e95]
                - generic [ref=e96]: S/ 45.00
              - paragraph [ref=e97]: Con salsa barbacoa de la casa y papas rústicas.
              - button "Añadir al Pedido" [ref=e98]:
                - img [ref=e99]
                - text: Añadir al Pedido
          - generic [ref=e103]:
            - generic [ref=e104]:
              - img "Ensalada Quinoa Real" [ref=e105]
              - generic [ref=e106]:
                - img [ref=e107]
                - text: Vegetariano
            - generic [ref=e110]:
              - generic [ref=e111]:
                - heading "Ensalada Quinoa Real" [level=3] [ref=e112]
                - generic [ref=e113]: S/ 24.00
              - paragraph [ref=e114]: Palta, tomates cherry y vinagreta de cítricos.
              - button "Añadir al Pedido" [ref=e115]:
                - img [ref=e116]
                - text: Añadir al Pedido
    - contentinfo [ref=e120]:
      - generic [ref=e121]:
        - generic [ref=e122]:
          - link "RESTAURANTVEG" [ref=e123] [cursor=pointer]:
            - /url: /
          - paragraph [ref=e124]: La mejor experiencia gastronómica vegetariana y a la parrilla. Productos frescos del campo a tu mesa.
        - generic [ref=e125]:
          - heading "Enlaces" [level=4] [ref=e126]
          - list [ref=e127]:
            - listitem [ref=e128]:
              - link "Menú" [ref=e129] [cursor=pointer]:
                - /url: /menu
            - listitem [ref=e130]:
              - link "Reservar" [ref=e131] [cursor=pointer]:
                - /url: /reservar
            - listitem [ref=e132]:
              - link "Nosotros" [ref=e133] [cursor=pointer]:
                - /url: /nosotros
            - listitem [ref=e134]:
              - link "Contacto" [ref=e135] [cursor=pointer]:
                - /url: /contacto
        - generic [ref=e136]:
          - heading "Contacto" [level=4] [ref=e137]
          - list [ref=e138]:
            - listitem [ref=e139]: Av. Principal 123, Lima
            - listitem [ref=e140]: +51 987 654 321
            - listitem [ref=e141]: info@restaurantveg.com
      - paragraph [ref=e143]: © 2024 Restaurant Veg. Todos los derechos reservados.
  - button "Open Next.js Dev Tools" [ref=e149] [cursor=pointer]:
    - img [ref=e150]
  - alert [ref=e153]
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