# Guía Completa de Pruebas en Docker

**Proyecto:** Restaurante Vegetariano  
**Entorno:** Docker (Alpine Linux, compatible con Alma Linux)  
**Propósito:** Evaluar rendimiento, mantenibilidad (ISO 25010), alta disponibilidad/tolerancia a fallos y monitoreo Cloud

---

## Índice de Evaluaciones

1. [Evaluación de Rendimiento (ISO 25010 Time Behaviour)](#1-evaluación-de-rendimiento)
2. [Evaluación de Mantenibilidad (ISO 25010)](#2-evaluación-de-mantenibilidad)
3. [Evaluación de Alta Disponibilidad y Tolerancia a Fallos](#3-evaluación-de-alta-disponibilidad-y-tolerancia-a-fallos)
4. [Validación de Monitoreo Cloud](#4-validación-de-monitoreo-cloud)
5. [Apéndice: Estructura del Proyecto](#5-apéndice-estructura-del-proyecto)

---

## Requisitos del Sistema

```bash
# Sistema operativo (Alma Linux 9 / Ubuntu 22.04 / cualquier Linux con Docker)
# Docker Engine 24+ y Docker Compose v2+
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin  # Alma/RHEL
# O
sudo apt install docker.io docker-compose-v2  # Ubuntu/Debian

# k6 para pruebas de carga
# En Alma Linux:
sudo dnf config-manager --add-repo https://dl.k6.io/repo/rpm/k6.repo
sudo dnf install -y k6
# En Ubuntu:
sudo gpg -k && sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/repo/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt update && sudo apt install k6

# Verificar instalaciones
docker --version && docker compose version && k6 version
```

---

## 1. Evaluación de Rendimiento

### Estado Actual: ¿Qué ya existe?

| Elemento | Estado | Ubicación |
|----------|--------|-----------|
| Descripción del entorno de pruebas | ✅ Documentado | `docs/audit-2025-06-28/02-rendimiento-ISO25010-time-behaviour.md` |
| Métricas evaluadas (SLOs) | ✅ Definido | `apps/stress-testing/src/scenarios/error-budget.cfg.json` |
| Herramientas utilizadas | ✅ k6 + JMeter | `apps/stress-testing/` + `docs/audit-2025-06-28/restaurant-veg-load-test.jmx` |
| Resultados y comparación con umbrales/SLA | ⚠️ Pendiente de ejecutar | Los scripts están listos, faltan resultados |
| Gráficos y reportes de monitoreo | ⚠️ Documentado no implementado | `docs/audit-2025-06-28/03-monitoreo-APM.md` sugiere Prometheus/Grafana |
| Pruebas de carga y estrés | ✅ 7 scripts k6 | `apps/stress-testing/k6-scripts/` |
| Identificación de cuellos de botella | ⚠️ Documentado no verificado | Análisis teórico en audit-2025-06-28 |
| Conclusiones y acciones de mejora | ⚠️ Pendiente | Se genera al analizar resultados |

### 1.1 Levantar el Sistema en Docker

```bash
# Desde la raíz del proyecto
cd /ruta/del/proyecto

# Construir y levantar servicios
docker compose up -d --build

# Verificar que todos los servicios estén saludables
docker compose ps
docker compose logs backend --tail 10

# Verificar health check
curl -s http://localhost:3001/api/health | jq .
# Esperado: {"status":"ok","timestamp":"..."}
```

### 1.2 Ejecutar Pruebas de Carga con k6

#### A. Prueba de Autenticación (3 min)

```bash
cd apps/stress-testing

k6 run k6-scripts/auth-stress.js
# O con salida a JSON para análisis posterior:
k6 run --out json=reports/auth-results.json k6-scripts/auth-stress.js
```

**Métricas a observar:**
- `http_req_duration p(95)` debe ser < 2000ms
- `http_req_failed` debe ser < 1%
- `failed_login_rate` debe ser < 10%

#### B. Prueba de Menú/Catálogo (3 min)

```bash
k6 run k6-scripts/menu-stress.js
```

**Métricas a observar:**
- `http_req_duration p(95)` debe ser < 1000ms
- Throughput debe superar 50 req/s sostenidos

#### C. Prueba de Pedidos (2 min)

```bash
k6 run k6-scripts/orders-stress.js
```

**Métricas a observar:**
- `http_req_duration p(95)` debe ser < 3000ms
- Tasa de error en creación de pedidos < 1%

#### D. Prueba de Reservas (2 min)

```bash
k6 run k6-scripts/reservations-stress.js
```

#### E. Prueba Integral — Día Completo (10 min)

```bash
k6 run k6-scripts/full-system-stress.js
```

#### F. Prueba de Resistencia — Soak Test (30 min)

```bash
k6 run k6-scripts/soak-test.js
```

#### G. Prueba de Pico — Spike Test (4 min)

```bash
k6 run k6-scripts/spike-test.js
```

### 1.3 Analizar Resultados contra SLOs

```bash
# Guardar resultados con JSON
cd apps/stress-testing
k6 run --out json=reports/full-results.json k6-scripts/full-system-stress.js

# Analizar contra SLOs definidos
node src/helpers/analyze-results.mjs reports/full-results.json
```

### 1.4 JMeter (Apache JMeter)

Si se prefiere JMeter sobre k6:

```bash
# Instalar JMeter
sudo dnf install -y java-11-openjdk
wget https://downloads.apache.org//jmeter/binaries/apache-jmeter-5.6.3.tgz
tar -xzf apache-jmeter-5.6.3.tgz

# Ejecutar plan de pruebas existente
./apache-jmeter-5.6.3/bin/jmeter -n -t docs/audit-2025-06-28/restaurant-veg-load-test.jmx \
  -Jhost=localhost -Jport=3001 -Jusers=100 -Jduration=300 \
  -l reports/jmeter-results.jtl
```

### 1.5 Capturar Evidencias de Rendimiento

```bash
# Crear directorio de evidencias
EVIDENCIAS="evidencias-rendimiento-$(date +%Y%m%d-%H%M%S)"
mkdir -p "${EVIDENCIAS}"

# 1. Capturar resultados de k6
cp apps/stress-testing/reports/*.json "${EVIDENCIAS}/"

# 2. Estado del sistema durante pruebas
docker stats --no-stream > "${EVIDENCIAS}/docker-stats.txt"

# 3. Logs del backend durante carga máxima
docker logs restaurant-backend --tail 100 > "${EVIDENCIAS}/backend-logs.txt"

# 4. Conexiones activas en BD
docker exec restaurant-postgres psql -U restaurant -d restaurant_db \
  -c "SELECT count(*) as active_connections FROM pg_stat_activity;" \
  > "${EVIDENCIAS}/db-connections.txt"

# 5. Latencia de API
for i in $(seq 1 10); do
  curl -w "Request $i: HTTP %{http_code}, Tiempo: %{time_total}s\n" \
    -o /dev/null -s http://localhost:3001/api/health
done > "${EVIDENCIAS}/latencia-api.txt"

echo "Evidencias guardadas en: ${EVIDENCIAS}"
```

### 1.6 Matriz de Resultados vs SLA

| Métrica | SLA (p95) | Resultado | Cumple |
|---------|-----------|-----------|--------|
| TTFB | < 200ms | | |
| Latencia /api/menu | < 1000ms | | |
| Latencia /api/orders | < 3000ms | | |
| Latencia /api/auth | < 2000ms | | |
| Throughput | > 100 req/s | | |
| Error rate | < 1% | | |
| Tasa éxito login | > 99% | | |

---

## 2. Evaluación de Mantenibilidad

### Estado Actual: ¿Qué ya existe?

| Elemento | Estado | Ubicación |
|----------|--------|-----------|
| Monitoreo de recursos | ❌ No implementado | Documentado en `03-monitoreo-APM.md` pero no implementado |
| Reportes y capturas de monitoreo | ❌ No implementado | No hay dashboards activos |
| Perfilamiento de código | ⚠️ Documentado no integrado | Clinic.js documentado, no hay scripts npm |
| Observaciones y conclusiones de monitoreo | ⚠️ Pendiente | Depende de implementación |
| Escenario del cambio realizado | ✅ Documentado | `05-mantenibilidad-SOLID-refactor.md` (refactor Mercado Pago) |
| Casos de prueba ejecutados (antes y después) | ⚠️ Pendiente | Tests unitarios propuestos en el doc no implementados en código |
| Impacto del cambio en el sistema | ✅ Documentado | Tabla comparativa en el doc de refactor |
| Estado final y conclusiones | ⚠️ Pendiente | Se completa al ejecutar |

### 2.1 Monitoreo de Recursos con Prometheus + Grafana (Docker)

Crear archivo `docker-compose.monitoring.yml`:

```yaml
version: "3.8"

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: restaurant-prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - restaurant-network

  grafana:
    image: grafana/grafana:latest
    container_name: restaurant-grafana
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./grafana/datasources:/etc/grafana/provisioning/datasources:ro
    ports:
      - "3002:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_AUTH_ANONYMOUS_ENABLED=true
    depends_on:
      - prometheus
    networks:
      - restaurant-network

volumes:
  prometheus_data:
  grafana_data:

networks:
  restaurant-network:
    external: true
    name: restaurant-network
```

Crear `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'restaurant-backend'
    static_configs:
      - targets: ['restaurant-backend:3001']
    metrics_path: '/api/metrics'

  - job_name: 'docker-host'
    static_configs:
      - targets: ['host.docker.internal:9323']
```

Crear `grafana/datasources/datasource.yml`:

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
```

### 2.2 Instrumentar Backend con OpenTelemetry

Agregar OpenTelemetry al backend (pendiente de implementar en el código):

```bash
# Instalar dependencias (desde apps/backend)
pnpm add @opentelemetry/api @opentelemetry/sdk-node \
  @opentelemetry/instrumentation-http @opentelemetry/instrumentation-express \
  @opentelemetry/instrumentation-pg @opentelemetry/exporter-prometheus \
  @opentelemetry/sdk-metrics
```

Los archivos a crear están documentados en `docs/audit-2025-06-28/03-monitoreo-APM.md`:
- `src/infrastructure/telemetry/tracing.ts`
- `src/infrastructure/telemetry/metrics.ts`
- `src/middleware/metrics.middleware.ts`

### 2.3 Perfilamiento de Código con Clinic.js

```bash
# Ejecutar backend localmente con Clinic.js profiling
cd apps/backend

# Profile de CPU (genera flame graph)
npx clinic doctor -- node dist/src/index.js

# Profile de memoria (heap snapshots)
npx clinic heapprofiler -- node dist/src/index.js

# Profile asincrónico (bubbleprof para tracing de operaciones async)
npx clinic bubbleprof -- node dist/src/index.js

# Los reportes HTML se generan en .clinic/
```

### 2.4 Ejecutar Pruebas de Mantenibilidad (Antes/Después del Cambio)

#### Paso 1: Estado "Antes" — Medir baseline

```bash
# 1. Ejecutar pruebas de estrés con el código actual
cd apps/stress-testing
k6 run --out json=reports/before-refactor.json k6-scripts/orders-stress.js

# 2. Medir tiempo de respuesta base
node src/helpers/analyze-results.mjs reports/before-refactor.json

# 3. Ejecutar tests unitarios existentes
cd apps/backend
pnpm test
```

#### Paso 2: Aplicar el cambio (ej: refactor Mercado Pago)

El refactor propuesto en `05-mantenibilidad-SOLID-refactor.md` implica:
1. Crear puertos (interfaces) para gateway y repositorio
2. Separar en casos de uso (CreatePreference, ProcessWebhook)
3. Implementar notificadores

#### Paso 3: Estado "Después" — Medir impacto

```bash
# 1. Verificar que los tests unitarios del refactor pasan
cd apps/backend
pnpm test

# 2. Ejecutar nuevamente las pruebas de estrés
cd apps/stress-testing
k6 run --out json=reports/after-refactor.json k6-scripts/orders-stress.js

# 3. Comparar resultados
node src/helpers/analyze-results.mjs reports/after-refactor.json

# 4. Comparar perfiles de memoria/CPU antes y después
# (ejecutar Clinic.js en ambos escenarios y comparar flame graphs)
```

### 2.5 Reporte de Monitoreo Continuo

```bash
# Script para capturar estado de monitoreo
#!/bin/bash
REPORTE="reporte-monitoreo-$(date +%Y%m%d-%H%M%S).txt"
{
  echo "=== REPORTE DE MONITOREO CONTINUO ==="
  echo "Fecha: $(date)"
  echo ""
  
  echo "--- ESTADO DE CONTENEDORES ---"
  docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.CPU}}\t{{.Memory}}"
  echo ""
  
  echo "--- USO DE RECURSOS (DOCKER STATS) ---"
  docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"
  echo ""
  
  echo "--- HEALTH CHECK BACKEND ---"
  curl -s http://localhost:3001/api/health
  echo ""
  
  echo "--- LOGS DEL BACKEND (últimas 20 líneas) ---"
  docker logs restaurant-backend --tail 20 2>&1
  echo ""
  
  echo "--- CONEXIONES ACTIVAS EN BD ---"
  docker exec restaurant-postgres psql -U restaurant -d restaurant_db \
    -c "SELECT state, count(*) FROM pg_stat_activity GROUP BY state;"
  echo ""
  
  echo "--- TAMAÑO DE LA BD ---"
  docker exec restaurant-postgres psql -U restaurant -d restaurant_db \
    -c "SELECT pg_size_pretty(pg_database_size('restaurant_db')) as db_size;"
} > "$REPORTE"
echo "Reporte guardado: $REPORTE"
```

---

## 3. Evaluación de Alta Disponibilidad y Tolerancia a Fallos

### Estado Actual: ¿Qué ya existe?

| Elemento | Estado | Ubicación |
|----------|--------|-----------|
| Escenarios de prueba simulados | ✅ 6 escenarios | `scripts/ha-dr-test.sh` |
| Métricas de recuperación (RTO/RPO) | ✅ Definidas | `docs/audit-2025-06-28/06-alta-disponibilidad-HA.md` |
| Descripción del entorno de pruebas | ✅ Documentado | `docs/guia-pruebas-ha-dr.md` |
| Herramientas y configuraciones | ✅ HAProxy, Keepalived, PostgreSQL replication | `docs/audit-2025-06-28/haproxy-scripts/` |
| Evidencias de pruebas de Alta Disponibilidad | ⚠️ Pendiente de ejecutar | Scripts listos para generar reportes |
| Evidencias de pruebas de Recuperación | ⚠️ Pendiente de ejecutar | Scripts listos para generar reportes |
| Estado final y conclusiones | ⚠️ Pendiente | Se genera al ejecutar |

### 3.1 Ejecutar Pruebas HA/DR Automatizadas

```bash
# 1. Asegurar que los servicios Docker están arriba
docker compose up -d
sleep 10

# 2. Ejecutar suite completa de HA/DR
cd scripts
bash ha-dr-test.sh

# 3. El reporte se genera en:
ls scripts/logs/ha-dr-test-*/
cat scripts/logs/ha-dr-test-*/reporte-ha-dr.md
```

### 3.2 Ejecutar Escenarios Manualmente

#### Escenario 1: Caída del Backend

```bash
# Estado inicial
echo "=== ESTADO INICIAL ==="
date +%T
curl -s http://localhost:3001/api/health | jq .

# Inducir falla
echo "=== DETENIENDO BACKEND ==="
time_start=$(date +%s)
docker stop restaurant-backend

# Verificar caída
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3001/api/health

# Recuperar
echo "=== RECUPERANDO BACKEND ==="
docker start restaurant-backend

# Esperar health check
sleep 5
while ! curl -sf http://localhost:3001/api/health > /dev/null 2>&1; do
  sleep 1
done
time_end=$(date +%s)

# Calcular RTO
rto=$((time_end - time_start))
echo "RTO: ${rto} segundos"
```

#### Escenario 2: Caída de Base de Datos

```bash
echo "=== DETENIENDO POSTGRESQL ==="
time_start=$(date +%s)
docker stop restaurant-postgres

# Verificar que backend maneja gracefulmente el error
curl -s http://localhost:3001/api/health | jq .
curl -s http://localhost:3001/api/menu | jq '.error // "ERROR detectado"'

# Recuperar
docker start restaurant-postgres

# Esperar health check de PostgreSQL
docker wait restaurant-postgres
while ! docker exec restaurant-postgres pg_isready -U restaurant > /dev/null 2>&1; do
  sleep 1
done
time_end=$(date +%s)

echo "RTO: $((time_end - time_start)) segundos"
```

#### Escenario 3: Corte de Red

```bash
echo "=== CORTE DE RED ==="
time_start=$(date +%s)
docker network disconnect restaurant-network restaurant-backend

# Verificar aislamiento
curl -s --connect-timeout 3 http://localhost:3001/api/health || echo "API no responde (correcto)"

# Reconectar
docker network connect restaurant-network restaurant-backend

# Esperar recuperación
sleep 3
curl -s http://localhost:3001/api/health | jq .
time_end=$(date +%s)

echo "RTO: $((time_end - time_start)) segundos"
```

#### Escenario 4: Pérdida de Datos y Restauración

```bash
# 1. Hacer backup de referencia
bash scripts/backup-restore.sh backup

# 2. Contar registros antes
echo "=== REGISTROS ANTES ==="
docker exec restaurant-postgres psql -U restaurant -d restaurant_db \
  -c "SELECT 'users', COUNT(*) FROM \"User\"
      UNION ALL SELECT 'orders', COUNT(*) FROM \"Order\"
      UNION ALL SELECT 'menu_items', COUNT(*) FROM \"MenuItem\";"

# 3. Eliminar datos
docker exec restaurant-postgres psql -U restaurant -d restaurant_db \
  -c "TRUNCATE TABLE \"OrderItem\", \"Order\", \"MenuItem\", \"Category\" CASCADE;"

# 4. Verificar impacto
curl -s http://localhost:3001/api/menu

# 5. Restaurar
bash scripts/backup-restore.sh restore

# 6. Verificar integridad
echo "=== REGISTROS DESPUÉS ==="
docker exec restaurant-postgres psql -U restaurant -d restaurant_db \
  -c "SELECT 'users', COUNT(*) FROM \"User\"
      UNION ALL SELECT 'orders', COUNT(*) FROM \"Order\"
      UNION ALL SELECT 'menu_items', COUNT(*) FROM \"MenuItem\";"
```

#### Escenario 5: Caída Total del Sistema

```bash
echo "=== CAÍDA TOTAL ==="
time_start=$(date +%s)
docker compose down

# Verificar que nada responde
curl -s --connect-timeout 3 http://localhost:3001/api/health || echo "Sistema caído (correcto)"

# Recuperar en orden
docker compose up -d postgres
echo "Esperando PostgreSQL..."
while ! docker exec restaurant-postgres pg_isready -U restaurant > /dev/null 2>&1; do sleep 1; done

docker compose up -d backend
echo "Esperando Backend..."
while ! curl -sf http://localhost:3001/api/health > /dev/null 2>&1; do sleep 1; done

docker compose up -d frontend
time_end=$(date +%s)

echo "RTO Total: $((time_end - time_start)) segundos"
```

#### Escenario 6: Contenedor Congelado (Deadlock)

```bash
echo "=== CONGELAMIENTO ==="
# Medir latencia normal
curl -w "Latencia normal: %{time_total}s\n" -o /dev/null -s http://localhost:3001/api/health

# Congelar
time_start=$(date +%s)
docker pause restaurant-backend

# Verificar que no responde
curl -s --connect-timeout 5 -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3001/api/health || echo "Timeout (correcto)"

# Descongelar
docker unpause restaurant-backend

# Verificar recuperación
sleep 2
curl -w "Latencia post-recuperación: %{time_total}s\n" -o /dev/null -s http://localhost:3001/api/health
time_end=$(date +%s)

echo "RTO: $((time_end - time_start)) segundos"
```

### 3.3 Capturar Evidencias HA/DR

```bash
# Script completo de captura por escenario
EVIDENCIAS_HA="evidencias-hadr-$(date +%Y%m%d-%H%M%S)"
mkdir -p "${EVIDENCIAS_HA}"

capturar_estado() {
  local archivo="$1"
  {
    echo "=== SNAPSHOT $(date +%T) ==="
    echo "--- docker ps ---"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo "--- Backend Health ---"
    curl -s http://localhost:3001/api/health 2>&1 || echo "NO RESPONDE"
    echo "--- Backend Logs (últimas 10) ---"
    docker logs restaurant-backend --tail 10 2>&1 || echo "NO DISPONIBLE"
  } > "${EVIDENCIAS_HA}/${archivo}"
}

# Antes de cada prueba
capturar_estado "estado-inicial.txt"

# ... ejecutar escenario ...

# Después de cada prueba
capturar_estado "estado-final.txt"

echo "Evidencias en: ${EVIDENCIAS_HA}/"
```

### 3.4 Tabla de Métricas de Recuperación

| Escenario | RTO Esperado | RTO Medido | RPO | Cumple |
|-----------|-------------|------------|-----|--------|
| Caída Backend | < 30s | | 0 | |
| Caída BD | < 60s | | 0 | |
| Corte de Red | < 15s | | 0 | |
| Pérdida Datos | < 120s | | < 1h | |
| Caída Total | < 120s | | 0 | |
| Congelamiento | < 10s | | 0 | |

---

## 4. Validación de Monitoreo Cloud

### Estado Actual: ¿Qué ya existe?

| Elemento | Estado | Ubicación |
|----------|--------|-----------|
| Monitoreo de memoria | ❌ No implementado | Pendiente de instrumentar |
| Monitoreo de CPU | ❌ No implementado | Pendiente de instrumentar |
| Monitoreo de disco | ❌ No implementado | Docker stats disponible pero no persistido |
| Monitoreo de red | ❌ No implementado | Pendiente de instrumentar |
| Registro de eventos de aplicación | ✅ Pino logger | `apps/backend/src/infrastructure/logger.ts` |
| Plataforma Cloud | ⚠️ Vercel configurado | No hay monitoreo cloud implementado |

### 4.1 Monitoreo con Docker Stats

```bash
# Monitoreo en tiempo real de todos los servicios
docker stats restaurant-backend restaurant-frontend restaurant-postgres

# Salida formateada (una toma)
docker stats --no-stream --format \
  "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"

# Script de monitoreo periódico
#!/bin/bash
while true; do
  echo "=== $(date +%T) ==="
  docker stats --no-stream --format \
    "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
  sleep 10
done
```

### 4.2 Prometheus + Grafana para Métricas Cloud

Ejecutar el stack de monitoreo:

```bash
# Iniciar Prometheus y Grafana (requiere docker-compose.monitoring.yml)
docker compose -f docker-compose.monitoring.yml up -d

# Acceder a:
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3002 (admin/admin123)

# Consultas Prometheus útiles:
# - CPU Usage: rate(process_cpu_seconds_total[1m])
# - Memory: process_resident_memory_bytes
# - HTTP Rate: rate(http_requests_total[1m])
```

### 4.3 Logs y Eventos de Aplicación

```bash
# Logs estructurados con Pino (JSON)
docker logs restaurant-backend --tail 50

# Filtrar errores
docker logs restaurant-backend 2>&1 | grep -i "error\|err"

# Exportar logs a archivo
docker logs restaurant-backend > "logs-backend-$(date +%Y%m%d).json" 2>&1

# Ver eventos de Docker
docker events --filter 'type=container' --filter 'container=restaurant-backend'
```

### 4.4 Vercel Analytics (Cloud)

Para monitoreo en producción (Vercel):

```bash
# El frontend ya está configurado para Vercel (vercel.json existe)
# Para habilitar Vercel Analytics en producción:
# 1. Ir a Vercel Dashboard > Proyecto > Analytics
# 2. Habilitar Web Vitals y Audience
# 3. Agregar @vercel/analytics al frontend:
cd apps/frontend
pnpm add @vercel/analytics
```

Agregar en `apps/frontend/src/app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 4.5 Matriz de Validación de Monitoreo Cloud

| Recurso | Herramienta | Evidencia | Estado |
|---------|-------------|-----------|--------|
| Memoria | Docker stats / Prometheus | Captura de `docker stats` | Pendiente |
| CPU | Docker stats / Prometheus | Captura de `docker stats` / Grafana | Pendiente |
| Disco | Docker system df | `docker system df` | Pendiente |
| Red | Docker stats / Prometheus | `docker stats --no-stream` NetIO | Pendiente |
| Logs de eventos | Pino (archivos JSON) | Exportar logs con `docker logs` | ✅ Logger listo |
| Monitoreo Cloud | Vercel Analytics | Dashboard de Vercel | Pendiente de habilitar |

---

## 5. Apéndice: Estructura del Proyecto

```
/
├── docker-compose.yml                     # Orquestación principal (postgres + backend + frontend)
├── docker-compose.monitoring.yml          # Prometheus + Grafana (crear para monitoreo)
├── prometheus.yml                         # Config Prometheus (crear)
├── grafana/                               # Dashboards Grafana (crear)
├── apps/
│   ├── backend/
│   │   ├── Dockerfile                     # Multi-stage alpine
│   │   ├── src/
│   │   │   ├── index.ts                   # Express app con Pino, Helmet, rate-limit
│   │   │   ├── infrastructure/
│   │   │   │   ├── logger.ts              # Pino structured logger
│   │   │   │   └── telemetry/             # OpenTelemetry (pendiente de implementar)
│   │   │   └── tests/
│   │   │       └── api.spec.ts            # 4 tests de integración (Vitest + Supertest)
│   │   └── vitest.config.ts
│   ├── frontend/
│   │   ├── Dockerfile                     # Multi-stage alpine con standalone output
│   │   ├── next.config.ts
│   │   ├── playwright.config.ts
│   │   └── tests/                         # Playwright E2E (6 tests, 2 spec files)
│   └── stress-testing/
│       ├── k6-scripts/                    # 7 scripts k6
│       ├── src/
│       │   ├── helpers/analyze-results.mjs
│       │   └── scenarios/error-budget.cfg.json
│       └── package.json
├── scripts/
│   ├── ha-dr-test.sh                      # 6 escenarios HA/DR automatizados
│   ├── backup-restore.sh                  # Backup/restore BD
│   └── init-db.sql
└── docs/
    ├── audit-2025-06-28/                  # Documentación de auditoría
    │   ├── 02-rendimiento-ISO25010-time-behaviour.md
    │   ├── 03-monitoreo-APM.md
    │   ├── 05-mantenibilidad-SOLID-refactor.md
    │   └── 06-alta-disponibilidad-HA.md
    ├── guia-pruebas-ha-dr.md              # Guía HA/DR existente
    └── guia-completa-pruebas-docker.md    # Esta guía
```

### Referencias

- [k6 Documentation](https://k6.io/docs/)
- [Docker Engine](https://docs.docker.com/engine/)
- [Prometheus](https://prometheus.io/docs/)
- [Grafana](https://grafana.com/docs/)
- [OpenTelemetry Node.js](https://opentelemetry.io/docs/languages/js/)
- [Clinic.js](https://clinicjs.org/)
- [ISO/IEC 25010](https://iso25000.com/index.php/en/iso-25000-standards/iso-25010)
