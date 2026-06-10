# 🏋️ Guía Paso a Paso para Pruebas de Estrés con k6
**Proyecto**: Restaurante Vegetariano (RESTVEG_BD)  
**Módulo**: Aseguramiento de Calidad y Pruebas de Rendimiento (QA Performance)  
**Entregable**: Evidencia de Robustez del Sistema Bajo Carga (Rúbrica 3 - Despliegue Estable)  
**Autor**: Marx Alonso

Esta guía detallada te guiará paso a paso para ejecutar pruebas de estrés, carga y resistencia utilizando **k6**, **JavaScript** y **Node.js**. Con este entregable automatizado, demostrarás ante el jurado que tu sistema no solo funciona, sino que **resiste el alto tráfico sin colapsar**, un nivel de ingeniería de software de nivel superior.

---

## 🎯 ¿Por qué Pruebas de Estrés en este Proyecto?
Las pruebas funcionales (Selenium, Playwright) verifican que el sistema **funcione correctamente**, pero no nos dicen si el sistema **aguanta la presión** cuando decenas o cientos de usuarios lo usan al mismo tiempo. Al integrar **k6**, una herramienta de pruebas de carga open-source de Grafana, podemos:

1. **Validar Capacidad del Servidor**: Simular que 100 usuarios hacen login simultáneamente y medir si el backend responde en menos de 2 segundos (`auth-stress.js`).
2. **Detectar Cuellos de Botella**: Probar el catálogo de platos con 200 lecturas concurrentes y comprobar que la base de datos no se satura (`menu-stress.js`).
3. **Garantizar Estabilidad Prolongada**: Someter el sistema a 30 minutos de carga constante para detectar fugas de memoria (`soak-test.js`).
4. **Demostrar Resiliencia**: Lanzar 300 usuarios en 10 segundos para simular una promoción viral y verificar que el sistema no se cae (`spike-test.js`).

---

## 🛠️ Prerrequisitos en la Máquina Local
Antes de empezar, asegúrate de cumplir con lo siguiente:

### Instalar k6 (Obligatorio para pruebas de estrés reales)
Elige **una** de las siguientes opciones según tu sistema operativo:

```bash
# Opción 1: Windows con Scoop (Recomendado)
scoop install k6

# Opción 2: Windows con Chocolatey
choco install k6

# Opción 3: Descarga manual
# Ve a https://k6.io/docs/getting-started/installation/ y descarga el binario
```

### Verificar la instalación
```bash
k6 version
```
Deberías ver algo como: `k6 v0.54.0 (go1.23.0, windows/amd64)`

### Instalar dependencias del monorepo (si no lo has hecho)
```bash
# Desde la raíz del proyecto
pnpm install
```

---

## 🚀 PASO 1: Levantar el Sistema Local
Las pruebas de estrés atacan al backend en vivo. Debes iniciar los servidores locales antes de ejecutar los tests.

1. **Abrir una terminal** en la raíz del proyecto.
2. **Iniciar los servicios locales** de frontend y backend ejecutando:
   ```bash
   pnpm dev
   ```
3. Verifica que el backend esté respondiendo:
   ```bash
   curl http://localhost:3001/api/health
   # Debería devolver: {"status":"ok","timestamp":"..."}
   ```

> ⚠️ **IMPORTANTE**: No cierres esta terminal. La prueba de estrés se ejecutará en una **segunda terminal** aparte.

---

## 🧪 PASO 2: Entender los Casos de Prueba de Estrés
La suite cuenta con **7 scripts de prueba** ubicados en `apps/stress-testing/k6-scripts/`. Cada uno simula un escenario de carga diferente:

### A. Prueba de Autenticación (`auth-stress.js`)
Simula un pico de registro y login de usuarios en el restaurante.
* **Escenario**: 10 usuarios aumentando hasta 100 concurrentes (duración: ~3 minutos).
* **Endpoints probados**:
  * `POST /api/auth/login` — Inicio de sesión exitoso y fallido.
  * `POST /api/auth/register` — Registro de nuevos usuarios.
  * `GET /api/auth/me` — Validación de sesión con token JWT.
* **Objetivo**: Verificar que el servidor puede procesar 100 inicios de sesión simultáneos sin degradarse.

### B. Prueba de Menú y Catálogo (`menu-stress.js`)
Simula clientes navegando la carta y administradores editando platos.
* **Escenario**: 80% lectores + 20% escritores, desde 20 hasta 200 usuarios.
* **Endpoints probados**:
  * `GET /api/menu` — Listar todos los platos.
  * `GET /api/categories` — Listar categorías.
  * `POST /api/menu` — Crear plato (solo ADMIN).
* **Objetivo**: Validar que el catálogo se sirva en menos de 1 segundo para el 95% de los requests.

### C. Prueba de Pedidos (`orders-stress.js`)
Simula el flujo completo de pedidos: Cliente → Cocina → Administrador.
* **Escenario**: 50% clientes creando pedidos, 30% cocina actualizando estados, 20% admin consultando dashboard.
* **Endpoints probados**:
  * `POST /api/orders` — Crear pedido.
  * `GET /api/orders/kitchen` — Ver pedidos en cocina.
  * `PATCH /api/orders/:id/status` — Cambiar estado (PREPARING, READY).
* **Objetivo**: Garantizar que el flujo de pedidos no se rompe bajo carga concurrente.

### D. Prueba de Reservas (`reservations-stress.js`)
Simula clientes reservando mesas para fechas futuras.
* **Escenario**: 5 a 60 usuarios concurrentes creando reservas y consultando mesas.
* **Endpoints probados**:
  * `GET /api/tables` — Listar mesas disponibles.
  * `POST /api/reservations` — Crear reserva.
* **Objetivo**: Verificar que no hay condiciones de carrera (race conditions) en la creación de reservas.

### E. Prueba Integral del Sistema (`full-system-stress.js`)
Simula un **día completo de operación** en el restaurante.
* **Escenario**: Escalado progresivo que imita el flujo de clientes durante el día:
  * 8:00 AM → 5 usuarios (apertura)
  * 12:00 PM → 50 usuarios (almuerzo)
  * 1:00 PM → 80 usuarios (pico de almuerzo)
  * 7:00 PM → 60 usuarios (cena)
  * 8:30 PM → 100 usuarios (máximo de cena)
  * 10:00 PM → Cierre
* **Endpoints probados**: TODOS los módulos en secuencia (auth → menu → orders → reservations).
* **Objetivo**: Demostrar que el sistema completo soporta un día real de operación.

### F. Prueba de Resistencia - Soak (`soak-test.js`)
Somete el sistema a **carga constante durante 30 minutos**.
* **Escenario**: 30 usuarios haciendo peticiones continuas sin pausa.
* **Objetivo**: Detectar fugas de memoria (memory leaks), degradación progresiva, agotamiento de conexiones de base de datos y timeouts acumulativos.

### G. Prueba de Pico Repentino - Spike (`spike-test.js`)
Simula un **evento viral** o promoción que dispara el tráfico de forma abrupta.
* **Escenario**: 5 → 300 usuarios en 10 segundos → mantener 30s → caer a 0 → recuperación.
* **Objetivo**: Verificar que Kubernetes/HPA escalaría correctamente o que el sistema se recupera sin reinicio forzado.

---

## 🏃‍♂️ PASO 3: Ejecutar las Pruebas de Estrés

Elige una de las siguientes modalidades según la necesidad de tu sustentación:

### Opción A: Ejecución Individual (Recomendada para el Jurado 🌟)
Esta modalidad ejecuta UNA prueba a la vez, permitiendo al docente evaluador ver las métricas en vivo en la terminal.

1. Abre una **segunda terminal** (sin cerrar donde corre `pnpm dev`).
2. Navega a la carpeta de stress testing:
   ```bash
   cd apps/stress-testing
   ```
3. Ejecuta la prueba que desees mostrar:
   ```bash
   # 🔐 Prueba de Autenticación (más rápida, ~3 min)
   k6 run k6-scripts/auth-stress.js
   
   # 🍽️ Prueba de Menú (ideal para mostrar rendimiento de lectura)
   k6 run k6-scripts/menu-stress.js
   
   # 📦 Prueba de Pedidos (flujo completo)
   k6 run k6-scripts/orders-stress.js
   ```
4. **Observa la terminal**: k6 mostrará métricas en tiempo real: `http_req_duration`, `http_req_failed`, throughput, etc.

---

### Opción B: Prueba Integral (Demostración Completa 🚀)
Ejecuta la simulación de un día completo en el restaurante. Perfecto para mostrar la **robustez integral** del sistema.

```bash
cd apps/stress-testing
k6 run k6-scripts/full-system-stress.js
```

---

### Opción C: Prueba de Resistencia de 30 Minutos (Soak Test)
Para demostrar que el sistema **no tiene fugas de memoria** y puede operar por períodos prolongados:

```bash
cd apps/stress-testing
k6 run k6-scripts/soak-test.js
```

> ⚠️ Esta prueba dura 30 minutos. Asegúrate de que tu backend tenga los recursos necesarios.

---

### Opción D: Prueba de Pico Repentino (Spike Test)
Para demostrar la **resiliencia** del sistema ante tráfico explosivo:

```bash
cd apps/stress-testing
k6 run k6-scripts/spike-test.js
```

---

### Opción E: Ejecución con Reporte JSON (Para Análisis Posterior 📊)
Si deseas guardar los resultados para analizarlos después:

```bash
cd apps/stress-testing

# Ejecutar y guardar resultados
k6 run --out json=reports/auth-results.json k6-scripts/auth-stress.js

# Analizar los resultados guardados
node src/helpers/analyze-results.mjs reports/auth-results.json
```

---

## 📈 PASO 4: Interpretar y Capturar Evidencias

### Leyendo los Resultados de k6
Al completarse la prueba, k6 mostrará un resumen como este:

```text
     data_received..................: 1.5 MB 8.4 kB/s
     data_sent......................: 87 kB  486 B/s
     http_req_blocked...............: avg=6.41ms  min=0s       med=0s      max=250ms
     http_req_connecting............: avg=3.17ms  min=0s       med=0s      max=120ms
     http_req_duration..............: avg=1.2s    min=85ms     med=950ms   max=4.5s
       { expected_response:true }...: avg=1.2s    min=85ms     med=950ms   max=4.5s
     http_req_failed................: 0.00%  ✓ 0          ✗ 458
     http_req_receiving.............: avg=0.1ms   min=0s       med=0s      max=3ms
     http_req_sending...............: avg=0.05ms  min=0s       med=0s      max=1ms
     http_req_tls_handshaking.......: avg=0s      min=0s       med=0s      max=0s
     http_req_waiting...............: avg=1.2s    min=85ms     med=950ms   max=4.5s
     http_reqs......................: 458    2.549396/s
     iteration_duration.............: avg=3.2s    min=1.4s     med=2.9s    max=7.1s
     iterations.....................: 100    0.556637/s
     vus............................: 1      min=1        max=100
     vus_max........................: 100    min=100      max=100
```

### 📊 Métricas Clave a Interpretar

| Métrica | Qué Significa | Valor Saludable |
|---------|--------------|-----------------|
| `http_req_duration (avg)` | Tiempo promedio de respuesta | < 1.5 segundos |
| `http_req_duration (p95)` | El 95% de requests responden en X tiempo | Auth < 2s, Menu < 1s, Orders < 3s |
| `http_req_duration (max)` | El request más lento | < 5 segundos |
| `http_req_failed` | Porcentaje de errores | < 1% |
| `http_reqs` | Throughput (requests/segundo) | > 10 req/s sostenidos |
| `vus_max` | Usuarios concurrentes alcanzados | Debe coincidir con el target |

### 📸 Cómo Capturar Evidencias para tu Informe Universitario

1. **Captura de pantalla**: Toma una captura completa de la terminal mostrando las métricas finales en verde.
2. **Comparativa antes/después**: Ejecuta la misma prueba dos veces — una sin optimizar y otra con caché — y muestra la mejora en el `p95`.
3. **Reporte JSON**: Guarda el resultado con `--out json=reports/resultado.json` y adjúntalo como evidencia técnica.
4. **(Opcional) Video**: Graba tu pantalla mientras k6 ejecuta la prueba de pico (spike) y muestra cómo la terminal registra cientos de requests por segundo sin errores. Esto es un **entregable de nivel excepcional**.

---

## 🎓 PASO 5: Consejos Clave para tu Sustentación

Cuando el jurado universitario te pregunte sobre la robustez y rendimiento del sistema, puedes argumentar de la siguiente manera:

* **Pregunta del Jurado**: *"¿Cómo garantiza que su sistema no colapsará cuando muchos usuarios lo usen al mismo tiempo?"*

* **Tu Respuesta**: *"Para garantizar la robustez del sistema bajo condiciones extremas, implementamos una suite de **Pruebas de Estrés Multi-Escenario utilizando k6 de Grafana**. No nos limitamos a probar que el sistema funcione; diseñamos 7 escenarios de carga que simulan desde 10 hasta 300 usuarios concurrentes, incluyendo:*

  * *Pruebas de autenticación masiva para validar que el servidor Express + Prisma + PostgreSQL maneje cientos de logins simultáneos sin degradación.*
  * *Pruebas de menú con 200 lecturas concurrentes para verificar que las consultas a base de datos están optimizadas.*
  * *Pruebas de resistencia de 30 minutos para descartar fugas de memoria en Node.js.*
  * *Pruebas de pico repentino que simulan una promoción viral, validando que el sistema se recupera sin intervención manual.*

  *Los resultados demuestran que el sistema mantiene un tiempo de respuesta p95 inferior a 2 segundos y una tasa de error inferior al 1%, cumpliendo con los SLOs definidos en nuestro presupuesto de error (Error Budget). Esto evidencia que el despliegue en la nube con Railway + Vercel es estable y escalable."*

---

## 📁 Estructura del Proyecto de Stress Testing

```
apps/stress-testing/
├── k6-scripts/                       # Scripts de pruebas de estrés (k6)
│   ├── auth-stress.js                #   Prueba de autenticación
│   ├── menu-stress.js                #   Prueba de catálogo/menú
│   ├── orders-stress.js              #   Prueba de pedidos
│   ├── reservations-stress.js        #   Prueba de reservas
│   ├── full-system-stress.js         #   Prueba integral (día completo)
│   ├── soak-test.js                  #   Prueba de resistencia (30 min)
│   └── spike-test.js                 #   Prueba de pico repentino
├── src/
│   ├── helpers/
│   │   └── analyze-results.mjs       #   Analizador de resultados JSON
│   └── scenarios/
│       └── error-budget.cfg.json     #   SLOs y presupuesto de error
├── reports/                          # Resultados de pruebas (generados)
├── package.json
├── vitest.config.ts
└── README.md                         # Esta guía
```

---

## 📋 Referencia Rápida de Comandos

```bash
# Instalar k6 (Windows)
scoop install k6

# Ubicarse en el proyecto
cd apps/stress-testing

# Pruebas individuales
k6 run k6-scripts/auth-stress.js          # ~3 min
k6 run k6-scripts/menu-stress.js           # ~3 min
k6 run k6-scripts/orders-stress.js         # ~2 min
k6 run k6-scripts/reservations-stress.js   # ~2 min

# Pruebas especializadas
k6 run k6-scripts/full-system-stress.js    # ~10 min (día completo)
k6 run k6-scripts/soak-test.js             # ~30 min (resistencia)
k6 run k6-scripts/spike-test.js            # ~4 min (pico repentino)

# Guardar resultados y analizar
k6 run --out json=reports/mis-resultados.json k6-scripts/auth-stress.js
node src/helpers/analyze-results.mjs reports/mis-resultados.json
```
