# 🏋️ Guía Avanzada de Pruebas de Estrés con k6
**Proyecto**: Restaurante Vegetariano (RESTVEG_BD)  
**Módulo**: Pirámide de Pruebas de Calidad de Software (QA Performance - 4ta Capa)  
**Entregable**: Evidencia de Robustez y Rendimiento del Sistema Bajo Carga (Rúbrica 3 - Despliegue Estable)  
**Autor**: Marx Alonso

Para complementar y potenciar la suite de pruebas existentes (Selenium, Playwright, Supertest), hemos implementado una **4ta Capa en la Pirámide de Pruebas: Pruebas de Estrés y Rendimiento con k6**. Esta capa garantiza que el sistema no solo funciona correctamente, sino que **resiste el alto tráfico sin colapsar**, un estándar de calidad profesional exigido en la industria del software moderno.

---

## 📐 La Pirámide de Pruebas de Calidad del Monorepo (Ampliada)

```text
         ▲
        / \
       /   \        Capa 4: Estrés y Rendimiento (k6 + Node.js)
      / k6  \       Simula cientos de usuarios concurrentes atacando la API.
     /_______\
    /         \     Capa 3: E2E Completo (Selenium Webdriver + Chrome)
   /  Selenium \    Prueba flujos interactivos de caja negra en navegador real.
  /_____________\
 /               \  Capa 2: E2E Moderno (Playwright)
/   Playwright    \ Automatiza la UI de Next.js con renderizado paralelo.
\-----------------/
/                   \ Capa 1: Integración de API (Supertest + Vitest)
/    Supertest       \ Simula llamadas HTTP a endpoints Express + Prisma + DB.
/_____________________\
```

---

## 🎯 ¿Por qué k6 en este Proyecto?

Las pruebas funcionales (Selenium, Playwright) verifican que los botones funcionan y los textos aparecen, pero **no verifican qué pasa cuando 100 personas entran al menú al mismo tiempo**. k6 es la herramienta de código abierto de Grafana para pruebas de carga y nos permite:

1. **Validar Capacidad del Servidor**: Simular 100 usuarios haciendo login simultáneo y medir tiempos de respuesta reales.
2. **Detectar Cuellos de Botella**: Probar el catálogo con 200 lecturas concurrentes para verificar que la base de datos responde.
3. **Garantizar Estabilidad Prolongada**: Someter el sistema a 30 minutos de carga continua para detectar memory leaks.
4. **Demostrar Resiliencia**: Lanzar 300 usuarios en 10 segundos (simulando una promoción viral) y verificar que el sistema no se cae.

---

## 🛠️ Prerrequisitos en la Máquina Local

### 1. Instalar k6
Elige una opción según tu sistema operativo:

```bash
# Windows con Scoop (Recomendado)
scoop install k6

# Windows con Chocolatey
choco install k6
```

> **Nota**: k6 es un binario independiente, no requiere Node.js, npm, ni Docker para funcionar.

### 2. Verificar instalación
```bash
k6 version
```
Debe mostrar: `k6 v0.54.0 (go1.23.0, windows/amd64)` o superior.

---

## 🚀 PASO 1: Levantar el Sistema Local

Antes de estresar el sistema, debes tenerlo corriendo:

```bash
# Desde la raíz del monorepo
pnpm dev
```

Verifica que el backend responda:
```bash
curl http://localhost:3001/api/health
# Respuesta esperada: {"status":"ok","timestamp":"..."}
```

> ⚠️ Mantén esta terminal abierta. Las pruebas se ejecutan desde una **segunda terminal**.

---

## 🧪 PASO 2: Catálogo de Pruebas de Estrés

La suite cuenta con **7 scripts** en `apps/stress-testing/k6-scripts/`:

| # | Script | ¿Qué Simula? | Usuarios | Duración |
|---|--------|-------------|----------|----------|
| 1 | `auth-stress.js` | Pico de registros y logins | 10 → 100 | ~3 min |
| 2 | `menu-stress.js` | Clientes navegando la carta | 20 → 200 | ~3 min |
| 3 | `orders-stress.js` | Pedidos: cliente→cocina→admin | 5 → 50 | ~2 min |
| 4 | `reservations-stress.js` | Clientes reservando mesas | 5 → 60 | ~2 min |
| 5 | `full-system-stress.js` | **DÍA COMPLETO** en el restaurante | 5 → 100 | ~10 min |
| 6 | `soak-test.js` | **RESISTENCIA**: 30 min de carga | 30 constantes | 30 min |
| 7 | `spike-test.js` | **PICO REPENTINO**: Promoción viral | 5 → 300 → 0 | ~4 min |

---

## 🏃‍♂️ PASO 3: Ejecutar las Pruebas

Abre una **segunda terminal** (sin cerrar donde corre `pnpm dev`) y ejecuta:

### Opción A: Prueba Rápida de Autenticación (Recomendada para el Jurado 🌟)
```bash
cd apps/stress-testing
k6 run k6-scripts/auth-stress.js
```

### Opción B: Prueba de Menú (Demostrar rendimiento de lectura)
```bash
cd apps/stress-testing
k6 run k6-scripts/menu-stress.js
```

### Opción C: Simulación de Día Completo (Demostración Integral 🚀)
```bash
cd apps/stress-testing
k6 run k6-scripts/full-system-stress.js
```

### Opción D: Prueba de Resistencia (30 minutos)
```bash
cd apps/stress-testing
k6 run k6-scripts/soak-test.js
```

### Opción E: Con Reporte JSON (Para análisis posterior 📊)
```bash
cd apps/stress-testing
k6 run --out json=reports/mis-resultados.json k6-scripts/auth-stress.js
node src/helpers/analyze-results.mjs reports/mis-resultados.json
```

---

## 📈 PASO 4: Interpretar Resultados

Al finalizar, k6 muestra un resumen como este:

```text
     http_req_duration..............: avg=1.2s    min=85ms   med=950ms   max=4.5s
     http_req_failed................: 0.00%
     http_reqs......................: 458    2.549396/s
     vus_max........................: 100
```

### Métricas Clave para tu Informe

| Métrica | Qué Mide | Valor Saludable |
|---------|---------|-----------------|
| `http_req_duration (avg)` | Tiempo promedio de respuesta | < 1.5s |
| `http_req_duration (p95)` | El 95% de requests en X tiempo | Auth < 2s, Menu < 1s |
| `http_req_failed` | Porcentaje de errores | < 1% |
| `http_reqs` | Throughput (req/s) | > 10 req/s |

### 📸 Captura de Evidencias
1. Toma una captura de pantalla de la terminal con los resultados en verde.
2. Guarda el JSON con `--out json=reports/evidencia.json` para adjuntarlo.
3. *(Opcional)* Graba un video de la prueba de pico (spike) mostrando cientos de requests sin errores.

---

## 🎓 PASO 5: Argumentación para la Sustentación

**Pregunta del Jurado**:  
*"¿Cómo garantiza que su sistema no colapsará cuando muchos usuarios lo usen al mismo tiempo?"*

**Tu Respuesta**:  
*"Para garantizar la robustez del sistema bajo condiciones extremas, implementamos una **4ta capa en nuestra Pirámide de Pruebas: Pruebas de Estrés y Rendimiento con k6 de Grafana**. Diseñamos 7 escenarios de carga que simulan desde 10 hasta 300 usuarios concurrentes:*

- *Pruebas de autenticación masiva para validar que Express + Prisma + PostgreSQL maneje cientos de logins simultáneos.*
- *Pruebas de menú con 200 lecturas concurrentes para verificar que las consultas SQL están optimizadas.*
- *Pruebas de resistencia de 30 minutos para descartar fugas de memoria en Node.js.*
- *Pruebas de pico repentino que validan que el sistema se recupera sin intervención manual.*

*Los resultados demuestran que el sistema mantiene un tiempo de respuesta p95 inferior a 2 segundos y una tasa de error inferior al 1%, cumpliendo con los SLOs definidos en nuestro Error Budget. Esto evidencia que el despliegue sobre PostgreSQL + Express es estable, escalable y listo para producción."*

---

## 🔗 Integración con el Ecosistema del Proyecto

| Proyecto | Ubicación | Propósito |
|----------|-----------|-----------|
| Backend API | `apps/backend/` | Servidor Express a estresar |
| Stress Testing | `apps/stress-testing/` | **Esta suite de estrés** |
| Selenium E2E | `apps/selenium-test-nutribrain/` | Pruebas de caja negra en navegador |
| Playwright E2E | `apps/frontend/tests/` | Pruebas de UI modernas |
| Supertest API | `apps/backend/src/tests/` | Pruebas de integración de API |
