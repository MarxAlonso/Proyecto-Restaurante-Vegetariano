# Auditoría Estática y Dinámica — Diagnóstico de Errores Críticos

**Fecha**: 2025-06-28
**Stack**: Next.js 16 (App Router) + Node.js/Express + PostgreSQL (Neon) + Prisma ORM
**Estándar**: ISO/IEC 25010 — Subcaracterísticas: Functional Correctness, Time Behaviour, Reliability, Security

---

## Resumen Ejecutivo

Se detectaron **15 hallazgos críticos** que comprometen el despliegue en producción, la seguridad, el rendimiento y la mantenibilidad del sistema. De estos, **5 son bloqueantes** para un despliegue seguro en Vercel.

---

## ⚠️ 5 Errores Críticos que Impiden el Despliegue o Degradan el UX

### F01 — [BLOQUEANTE] Singleton de Prisma sin manejo de ciclo de vida en serverless

**Archivo**: `apps/backend/src/infrastructure/persistence/prisma.client.ts` (Línea 3)
**Código**:
```typescript
const prismaClient = new PrismaClient();
export default prismaClient;
```
**Impacto**: En el entorno serverless de Vercel, cada función Lambda crea una instancia de PrismaClient al importar el módulo. Sin `prisma.$disconnect()` ni el patrón de hot-reload (globalThis), se agotan los sockets de conexión a Neon DB. Esto causa errores `Too many connections` y timeouts.

**ISO 25010**: *Reliability - Fault Tolerance* (falla bajo concurrencia), *Time Behaviour* (latencias crecientes hasta timeout).

---

### F02 — [BLOQUEANTE] Carga total de la BD en memoria en getAdminStats

**Archivo**: `apps/backend/src/modules/order/application/order.service.ts` (Línea 54-70)
**Código**:
```typescript
const allOrders = await this.orderRepository.findAllWithFilters({});
const approvedOrders = allOrders.filter(o => o.paymentStatus === 'APPROVED');
// ...
const pendingOrders = allOrders.filter(o => o.status === 'PENDING').length;
```
**Impacto**: `findAllWithFilters({})` ejecuta `prisma.order.findMany()` **sin filtros**. Para un SaaS con 100k+ pedidos, esto carga todo el historial en memoria RAM de la Edge Function cada vez que alguien carga el dashboard. Causa OOM (Out of Memory) y facturación excesiva en Vercel.

**ISO 25010**: *Time Behaviour* (latencia O(n) en lugar de O(1) con agregaciones SQL), *Resource Utilization*.

---

### F03 — [BLOQUEANTE] Token JWT almacenado en localStorage

**Archivos**:
- `apps/frontend/src/components/providers/AuthProvider.tsx` (Líneas 32, 56, 57, 71)
- `apps/frontend/src/lib/api.ts` (Líneas 4, 14)

**Código**:
```typescript
// AuthProvider.tsx
const token = localStorage.getItem('token');
localStorage.setItem('token', token);
// api.ts
const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
headers['Authorization'] = `Bearer ${token}`;
```
**Impacto**: El JWT se envía duplicado: vía cookie `httpOnly` (desde el backend) y vía `Authorization: Bearer` desde localStorage. Cualquier XSS en el frontend exfiltra el token. La cookie httpOnly es segura contra XSS, pero localStorage no.

**ISO 25010**: *Security - Confidentiality* (exposición de credenciales).

---

### F04 — [CRÍTICO] Webhook de Mercado Pago sin validación de firma

**Archivo**: `apps/backend/src/modules/mercadopago/application/mercado-pago.service.ts`

**Impacto**: El webhook acepta notificaciones sin verificar la firma criptográfica de Mercado Pago (`X-Signature`). Un atacante que falsifique peticiones POST a `/api/mercadopago/webhook` puede actualizar estados de pago arbitrariamente, marcando pedidos como `APPROVED` sin pago real.

**ISO 25010**: *Security - Integrity* (manipulación de estado), *Reliability*.

---

### F05 — [CRÍTICO] Ausencia total de validación de entrada de datos (Input Validation)

**Archivos**: Todos los controladores y servicios de la capa de aplicación.

**Impacto**: Ningún endpoint valida los datos de entrada con Zod/Joi. Los datos llegan como `any` tipado. Esto permite:
- Inyección de tipos de datos incorrectos en Prisma
- Ataques de manipulación de campos (mass assignment)
- Fallos silenciosos por coercion de tipos

**Ejemplo concreto** — `auth.controller.ts` Línea 9:
```typescript
const result = await this.authService.register(req.body);
```
`req.body` nunca se valida. `AuthService.register` desestructura campos sin verificar existencia.

**ISO 25010**: *Functional Correctness*, *Security - Accountability*.

---

## Hallazgos Adicionales (No bloqueantes, pero graves)

| ID | Hallazgo | Archivo(s) | Severidad |
|----|----------|-----------|-----------|
| F06 | `as any` masivo en repositorios Prisma | Todos los `*-repository.ts` | HIGH — Mata el type safety |
| F07 | Sin rate limiting por usuario autenticado | `src/index.ts` L34-43 | MEDIUM |
| F08 | N+1 en `getOrderTypeStats` (carga todo y filtra en JS) | `prisma-order.repository.ts` L146 | HIGH |
| F09 | Sin desconexión de BD en cierre graceful | `prisma.client.ts` | HIGH |
| F10 | Sin manejo de errores en cadena de Promesas | Varios (seed, etc.) | MEDIUM |
| F11 | Dashboard admin `setInterval` sin pausa al ocultar | `paneladmin/page.tsx` L79 | MEDIUM |
| F12 | La cookie y el Bearer coexisten creando confusión de autenticación | `auth.ts` L10, `api.ts` L4-5 | MEDIUM |
| F13 | Sin Content Security Policy (CSP) en helmet | `src/index.ts` L29 | LOW-MEDIUM |
| F14 | `slugify` casero sin normalización Unicode | `category.service.ts` L16 | LOW |
| F15 | `R2_PUBLIC_URL` expone bucket sin firmar URLs | `r2.service.ts` L12 | MEDIUM |

---

## Mapeo ISO 25010 Completo

| Subcaracterística | Hallazgos Afectados |
|------------------|-------------------|
| **Functional Correctness** | F05, F06, F08 |
| **Time Behaviour** | F01, F02, F08 |
| **Resource Utilization** | F02, F08 |
| **Reliability (Maturity)** | F01, F04 |
| **Reliability (Fault Tolerance)** | F01, F09 |
| **Security (Confidentiality)** | F03 |
| **Security (Integrity)** | F04, F05 |
| **Security (Accountability)** | F05 |
| **Maintainability (Modularity)** | F06, F10 |
| **Maintainability (Analyzability)** | F06, F10 |
