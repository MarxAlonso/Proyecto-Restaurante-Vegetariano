# Auditoría Técnica — Restaurant Veg

**Fecha**: 2025-06-28
**Auditor**: Arquitecto de Software Senior
**Estándar**: ISO/IEC 25010 — SQuaRE (Software Product Quality Requirements and Evaluation)

---

## Estructura de Artefactos

| # | Artefacto | Archivo | ISO 25010 |
|---|-----------|---------|-----------|
| 1 | Diagnóstico de Errores | [`01-diagnostico-errores.md`](./01-diagnostico-errores.md) | All subcharacteristics |
| 2 | Rendimiento (Time Behaviour) | [`02-rendimiento-ISO25010-time-behaviour.md`](./02-rendimiento-ISO25010-time-behaviour.md) | Time Behaviour, Resource Utilization |
| 3 | Monitoreo APM | [`03-monitoreo-APM.md`](./03-monitoreo-APM.md) | Maintainability (Analyzability) |
| 4 | Pruebas de Carga (JMeter) | [`04-pruebas-carga-JMeter.md`](./04-pruebas-carga-JMeter.md) | Reliability, Time Behaviour |
| 4b | Script JMeter ejecutable | [`restaurant-veg-load-test.jmx`](./restaurant-veg-load-test.jmx) | — |
| 5 | Mantenibilidad (SOLID) | [`05-mantenibilidad-SOLID-refactor.md`](./05-mantenibilidad-SOLID-refactor.md) | Maintainability (Modularity) |
| 6 | Alta Disponibilidad (HADR) | [`06-alta-disponibilidad-HA.md`](./06-alta-disponibilidad-HA.md) | Reliability (Fault Tolerance) |

---

## Mapeo de Hallazgos a ISO 25010

| Subcaracterística | Hallazgo(s) | Componente | Severidad |
|------------------|-------------|-----------|-----------|
| Functional Correctness | F05 — Sin input validation | Todos los endpoints | 🔴 Crítico |
| Time Behaviour | F01 — Pool de conexiones | Prisma Client | 🔴 Crítico |
| Time Behaviour | F02 — Agregaciones in-memory | OrderService | 🔴 Crítico |
| Resource Utilization | F02, F08 — N+1 y carga total | OrderRepository | 🟠 Alto |
| Reliability (Fault Tolerance) | F01, F09 — Sin graceful shutdown | Prisma Client | 🔴 Crítico |
| Reliability (Maturity) | F04 — Webhook sin firma | MercadoPagoService | 🔴 Crítico |
| Security (Confidentiality) | F03 — JWT en localStorage | AuthProvider | 🔴 Crítico |
| Security (Integrity) | F04, F05 — Webhook + input validation | MercadoPago, Controllers | 🔴 Crítico |
| Maintainability (Modularity) | F06 — `as any` masivo | Todos los repositorios | 🟠 Alto |
| Maintainability (Analyzability) | F10 — Sin telemetría | Toda la app | 🟠 Alto |

---

## Correcciones Priorizadas

1. **P0 — Inmediato**: Pool de Prisma con globalThis + límite de conexiones
2. **P0 — Inmediato**: Agregaciones SQL nativas en `getAdminStats`
3. **P0 — Inmediato**: Migrar JWT de localStorage a cookie httpOnly + refresco
4. **P1 — Urgente**: Validación de firma de webhook de Mercado Pago
5. **P1 — Urgente**: Implementar Zod schemas en todos los endpoints
6. **P2 — Planificado**: Instrumentación OpenTelemetry
7. **P2 — Planificado**: Refactorización SOLID del módulo de pagos
8. **P3 — Roadmap**: Infraestructura HADR con Alma Linux + HAProxy

---

## Stack Tecnológico

```
Frontend:     Next.js 16 (App Router) + Tailwind CSS v4 + Framer Motion + Recharts
Backend:      Node.js 20 + Express 4 + Prisma ORM + PostgreSQL (Neon)
Pagos:        Mercado Pago SDK v3
Storage:      Cloudflare R2 (AWS S3-compatible)
Auth:         JWT + Google OAuth 2.0
Testing:      Vitest + Supertest + Playwright + Selenium + k6 + JMeter
Infra:        Vercel (serverless) + Alma Linux 9 (on-prem HA)
```

---

*Documentación generada como parte del pipeline de auditoría arquitectónica ISO/IEC 25010.*
