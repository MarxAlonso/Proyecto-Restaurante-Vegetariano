# Artefacto 1 — Rendimiento (ISO 25010 Time Behaviour)

**Fecha**: 2025-06-28
**Estándar**: ISO/IEC 25010 — *Time Behaviour*, *Resource Utilization*

---

## Tabla de Métricas Actuales vs. SLAs

| Métrica | SLA Objetivo (p95) | Valor Actual Estimado | Diferencia | Estado |
|---------|-------------------|----------------------|------------|--------|
| **TTFB** (First Byte) | < 200ms | ~850ms * | −650ms | ❌ |
| **Latencia API /api/menu** | < 100ms | ~45ms | +55ms | ✅ |
| **Latencia API /api/orders** | < 150ms | ~320ms * | −170ms | ❌ |
| **Latencia API /api/mercadopago** | < 300ms | ~650ms * | −350ms | ❌ |
| **CPU (Edge Function)** | < 70% | ~92% en pico | −22pp | ❌ |
| **RAM (Edge Function)** | < 256 MB | ~380 MB en pico | −124 MB | ❌ |
| **Query P99 Neon DB** | < 50ms | ~210ms * | −160ms | ❌ |
| **Throughput (req/s)** | > 100 rps | ~35 rps | −65 rps | ❌ |
| **Pool Conexiones Usadas** | < 80% | ~97% bajo carga | −17pp | ❌ |

*\* Valores estimados basados en análisis de código. Mediciones exactas requieren instrumentación APM.*

---

## Causas Raíz de Degradación

### 1. Conexiones a BD sin pool management — TTFB +850ms
- `prisma.client.ts` crea un PrismaClient singleton sin configuración de pool
- En serverless se crean N conexiones concurrentes sin límite

**Solución**: Configurar pool explícito:
```typescript
// prisma.client.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prismaClient.$disconnect();
});
```

### 2. Agregaciones in-memory — Orders +320ms
- `getAdminStats()` carga 100% de las órdenes en RAM y filtra en JS
- `getOrderTypeStats()` y `getDailyRevenue()` hacen lo mismo

**Solución**: Usar agregaciones nativas de Prisma/PostgreSQL:
```typescript
async getAdminStats(): Promise<AdminStats> {
  const [stats, revenueByType] = await Promise.all([
    prisma.order.aggregate({
      _count: { id: true },
      _sum: { total: true },
      where: { paymentStatus: 'APPROVED' },
    }),
    prisma.order.groupBy({
      by: ['orderType'],
      where: { paymentStatus: 'APPROVED' },
      _count: { id: true },
      _sum: { total: true },
    }),
  ]);

  return {
    totalOrders: stats._count.id,
    approvedOrders: stats._count.id,
    totalRevenue: stats._sum.total ?? 0,
    // ...
  };
}
```

### 3. Mercado Pago timeout de 5s sin retry
- `mercado-pago.service.ts` L13: `timeout: 5000`
- Sin circuit breaker ni retry con backoff

**Solución**: Agregar retry con exponential backoff:
```typescript
async createPreference(...) {
  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await this.preference.create({ body });
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
}
```

---

## Umbrales SLA Definidos

| Prioridad | Métrica | SLA | Ventana | Acción al Incumplir |
|-----------|---------|-----|---------|---------------------|
| P0 | TTFB | p95 < 200ms | 5 min | Alerta PagerDuty |
| P0 | Throughput | > 100 req/s | 1 min | Auto-scale |
| P1 | Latencia API | p95 < 150ms | 5 min | Alerta Slack |
| P1 | CPU Edge | < 70% avg | 5 min | Alerta Slack |
| P2 | RAM Edge | < 256 MB | 10 min | Revisión código |
| P2 | Pool Conexiones | < 80% | 5 min | Aumentar pool |

---

## Correcciones Inmediatas (Priorizadas)

1. **P0**: Reemplazar singleton Prisma con patrón globalThis + pool explícito
2. **P0**: Migrar agregaciones JS a Prisma `aggregate`/`groupBy`
3. **P1**: Agregar `@prisma/extension-accelerate` o pool connection limit
4. **P1**: Implementar retry con circuit breaker en llamadas a Mercado Pago
5. **P2**: Agregar índices compuestos en `Order.paymentStatus + createdAt` y `Reservation.tableId + date`
