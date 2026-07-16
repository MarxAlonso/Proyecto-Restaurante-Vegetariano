# Artefacto 2 — Monitoreo APM (Application Performance Monitoring)

**Fecha**: 2025-06-28
**Stack**: Node.js/Express + PostgreSQL (Neon) + Vercel Edge Functions
**Herramientas**: OpenTelemetry + Clinic.js (equivalente a JProfiler/YourKit en V8) + Prometheus

---

## Justificación de Herramientas V8 vs. JVM

| Dimensión | JProfiler / YourKit (JVM) | Clinic.js / 0x (V8) |
|-----------|--------------------------|---------------------|
| **Target** | Aplicaciones Java/JVM | Aplicaciones Node.js |
| **Métrica equivalente** | CPU Sampling, Heap Walker | **CPU Profile**, **Flame Graph** |
| **Event Loop** | No aplica | **Event Loop Lag** — métrica crítica en Node.js |
| **Garbage Collection** | GC Graph | **GC Stats** vía `--trace-gc` + Clinic |
| **Heap Snapshots** | Heap Walker | **Clinic Heap** — snapshots de memoria V8 |
| **Async Tracing** | Thread analysis | **Clinic Bubbleprof** — tracing de operaciones async |

**Conclusión**: Clinic.js es el equivalente funcional directo de JProfiler para Node.js, con la ventaja adicional de que mide el Event Loop Lag, métrica inexistente en JVM pero crítica en el modelo de concurrencia de V8.

---

## Snippet de Integración — OpenTelemetry + Prometheus

### 1. Instalación de dependencias

```bash
pnpm --filter restaurant-veg-backend add @opentelemetry/api @opentelemetry/sdk-node \
  @opentelemetry/instrumentation-http @opentelemetry/instrumentation-express \
  @opentelemetry/instrumentation-pg @opentelemetry/exporter-prometheus \
  @opentelemetry/sdk-metrics
```

### 2. Instrumentación (crear `src/infrastructure/telemetry/tracing.ts`)

```typescript
// apps/backend/src/infrastructure/telemetry/tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const isProd = process.env.NODE_ENV === 'production';

const prometheusExporter = new PrometheusExporter({
  endpoint: '/api/metrics',
  port: isProd ? undefined : 9464, // 9464 = puerto por defecto Prometheus
  prefix: 'restaurant_veg_',
});

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'restaurant-veg-backend',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: prometheusExporter,
    exportIntervalMillis: 15_000, // Exportar cada 15s
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('🛑 OpenTelemetry SDK shut down'))
    .catch(err => console.error('Error shutting down OTel SDK:', err))
    .finally(() => process.exit(0));
});

export default sdk;
```

### 3. Exportación de métricas custom (crear `src/infrastructure/telemetry/metrics.ts`)

```typescript
// apps/backend/src/infrastructure/telemetry/metrics.ts
import { metrics } from '@opentelemetry/api';
import { Histogram, Counter, UpDownCounter } from '@opentelemetry/api';

const meter = metrics.getMeter('restaurant-veg-backend');

// Métricas de Event Loop
export const eventLoopLag: Histogram = meter.createHistogram('event_loop_lag_ms', {
  description: 'Event Loop lag in milliseconds',
  unit: 'ms',
  boundaries: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
});

// Métricas de BD
export const dbQueryDuration: Histogram = meter.createHistogram('db_query_duration_ms', {
  description: 'Database query duration in milliseconds',
  unit: 'ms',
  boundaries: [5, 10, 25, 50, 100, 250, 500, 1000, 5000],
});

export const dbConnectionsActive: UpDownCounter = meter.createUpDownCounter('db_connections_active', {
  description: 'Number of active database connections',
});

// Métricas de HTTP
export const httpRequestDuration: Histogram = meter.createHistogram('http_request_duration_ms', {
  description: 'HTTP request duration in milliseconds',
  unit: 'ms',
  boundaries: [10, 25, 50, 100, 250, 500, 1000, 3000, 10000],
});

export const httpRequestsTotal: Counter = meter.createCounter('http_requests_total', {
  description: 'Total number of HTTP requests',
});

export const httpRequestsInFlight: UpDownCounter = meter.createUpDownCounter('http_requests_in_flight', {
  description: 'Number of HTTP requests currently in flight',
});
```

### 4. Wrapper middleware para métricas (crear `src/middleware/metrics.middleware.ts`)

```typescript
// apps/backend/src/middleware/metrics.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { httpRequestDuration, httpRequestsTotal, httpRequestsInFlight } from '../infrastructure/telemetry/metrics';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  httpRequestsInFlight.add(1);
  httpRequestsTotal.add(1, { method: req.method, route: req.path });

  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDuration.record(duration, {
      method: req.method,
      route: req.path,
      status_code: String(res.statusCode),
    });
    httpRequestsInFlight.add(-1);
  });

  next();
}
```

### 5. Integración en `src/index.ts`

```typescript
// Al inicio de src/index.ts, antes de todo
import './infrastructure/telemetry/tracing';
// ...
import { metricsMiddleware } from './middleware/metrics.middleware';

// Después de cookieParser()
app.use(metricsMiddleware);
```

---

## Configuración de Alertas (JSON)

```json
{
  "service": "restaurant-veg-backend",
  "alerts": [
    {
      "id": "cpu-high",
      "name": "CPU Usage > 80%",
      "metric": "process_cpu_usage",
      "condition": "> 0.80",
      "duration": "5m",
      "severity": "critical",
      "channels": ["slack", "pagerduty"],
      "query": "rate(process_cpu_seconds_total[1m]) > 0.8"
    },
    {
      "id": "event-loop-high",
      "name": "Event Loop Lag > 100ms",
      "metric": "event_loop_lag_ms",
      "condition": "p99 > 100",
      "duration": "1m",
      "severity": "critical",
      "channels": ["slack"],
      "query": "histogram_quantile(0.99, rate(event_loop_lag_ms_bucket[1m])) > 100"
    },
    {
      "id": "db-connections",
      "name": "Database Connections Pool Exhaustion",
      "metric": "db_connections_active",
      "condition": "> 80",
      "duration": "2m",
      "severity": "warning",
      "channels": ["slack"],
      "query": "db_connections_active > 80"
    },
    {
      "id": "http-error-rate",
      "name": "HTTP 5xx Error Rate > 5%",
      "metric": "http_requests_total",
      "condition": "error_rate > 0.05",
      "duration": "5m",
      "severity": "critical",
      "channels": ["slack", "pagerduty"],
      "query": "sum(rate(http_requests_total{status_code=~'5..'}[5m])) / sum(rate(http_requests_total[5m])) > 0.05"
    },
    {
      "id": "latency-high",
      "name": "API p95 Latency > 1s",
      "metric": "http_request_duration_ms",
      "condition": "p95 > 1000",
      "duration": "5m",
      "severity": "warning",
      "channels": ["slack"],
      "query": "histogram_quantile(0.95, rate(http_request_duration_ms_bucket[5m])) > 1000"
    },
    {
      "id": "memory-high",
      "name": "Memory Usage > 80%",
      "metric": "process_resident_memory_bytes",
      "condition": "> 209715200",
      "duration": "10m",
      "severity": "warning",
      "channels": ["slack"],
      "query": "process_resident_memory_bytes / 256000000 > 0.8"
    }
  ],
  "notification_channels": {
    "slack": {
      "webhook_url": "${SLACK_WEBHOOK_URL}",
      "channel": "#ops-restaurant-veg"
    },
    "pagerduty": {
      "routing_key": "${PAGERDUTY_ROUTING_KEY}",
      "severity_map": {
        "critical": "critical",
        "warning": "warning"
      }
    }
  }
}
```

---

## Uso de Clinic.js para Profiling

```bash
# Profiling de CPU (flame graph)
npx clinic doctor -- node dist/src/index.js

# Profiling de memoria (heap snapshots)
npx clinic heapprofiler -- node dist/src/index.js

# Profiling asincrónico (bubbleprof)
npx clinic bubbleprof -- node dist/src/index.js

# Equivalencia con JProfiler:
# JProfiler CPU Sampler → clinic doctor (Flame Graph)
# JProfiler Heap Walker → clinic heapprofiler (Heap Timeline)
# JProfiler Thread Profiler → clinic bubbleprof (Async Tracing)
```

---

## Dashboard Prometheus / Grafana Sugerido

Métricas clave a incluir en el dashboard:

| Panel | Métrica | Tipo |
|-------|---------|------|
| CPU Usage | `process_cpu_usage` | Gauge |
| Memory Usage | `process_resident_memory_bytes` | Gauge |
| Event Loop Lag | `event_loop_lag_ms` (p50, p95, p99) | Histogram |
| HTTP Requests/sec | `rate(http_requests_total[1m])` | Counter rate |
| HTTP Latency | `http_request_duration_ms` (p50, p95, p99) | Histogram |
| Error Rate | `rate(http_requests_total{status=~"5.."}[5m])` | Counter rate |
| Active Connections | `db_connections_active` | UpDownCounter |
| DB Query Duration | `db_query_duration_ms` (p50, p95) | Histogram |
| Edge Function Cold Starts | `function_cold_starts_total` | Counter |
| Pool Utilization % | `db_connections_active / db_connections_max` | Gauge |
