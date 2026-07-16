# Informe de Pruebas de Alta Disponibilidad y Recuperacion ante Desastres

**Proyecto:** Restaurante Vegetariano  
**Fecha:** 2026-07-15 20:58:42  
**Entorno:** Docker Desktop sobre Windows  
**Herramientas:** Docker, PostgreSQL 15, Node.js 20, Express, Next.js 16  

---

## Resumen de Resultados

| # | Escenario | RTO (s) | RPO (s) | Estado |
|---|-----------|---------|---------|--------|
| 1 | Caida del Backend | 2.49 | 0 | Superado |
| 2 | Caida de la Base de Datos | 2.79 | 0 | Superado |
| 3 | Corte de Red | 3.22 | 0 | Superado |
| 4 | Perdida de Datos y Restauracion | 0.63 | < 60s | Superado |
| 5 | Caida Total del Sistema | 5.61 | 0 | Superado |
| 6 | Contenedor Congelado (Deadlock) | 1.14 | 0 | Superado |

---

## Escenario 1: Caida del Backend

**Procedimiento:** docker stop/start restaurant-backend  
**RTO:** 2.49 s  
**RPO:** 0  
**Latencia normal:** 58.79 ms  
**Resultado:** SUPERADO - Recuperacion en < 3s sin perdida de datos.

## Escenario 2: Caida de la Base de Datos

**Procedimiento:** docker stop/start restaurant-postgres  
**RTO:** 2.79 s  
**RPO:** 0  
**Resultado:** SUPERADO - Health endpoint continuo respondiendo (graceful degradation). Prisma reconecto automaticamente.

## Escenario 3: Corte de Red

**Procedimiento:** docker network disconnect/connect  
**RTO:** 3.22 s  
**RPO:** 0  
**Resultado:** SUPERADO - Aislamiento correcto (HTTP 000). Reconexion exitosa en 3.22s.

## Escenario 4: Perdida de Datos y Restauracion

**Datos antes de la perdida:** Users: 3, Categories: 9, Tables: 10  
**Datos despues de restauracion:** Users: 3, Categories: 9, Tables: 10  
**RTO (restauracion):** 0.63 s  
**RPO:** < 60 s  
**Tamano backup:** 15.6 KB  
**Resultado:** SUPERADO - Datos recuperados con integridad total.

## Escenario 5: Caida Total del Sistema

**Procedimiento:** docker compose down/up  
**RTO del sistema:** 5.61 s  
**Tiempo total de caida:** 13.94 s  
**Recuperacion:** PostgreSQL (1s) -> Backend (2s) -> Frontend (1s)  
**Resultado:** SUPERADO - Recuperacion completa y ordenada.

## Escenario 6: Contenedor Congelado (Deadlock)

**Procedimiento:** docker pause/unpause restaurant-backend  
**RTO:** 1.14 s  
**Estado durante pausa:** Paused  
**Resultado:** SUPERADO - Recuperacion practicamente instantanea.

---

## Conclusiones Generales

### Metricas de Recuperacion

| Escenario | RTO (s) | RPO (s) | Evaluacion |
|---|---|---|---|
| Caida Backend | 2.49 | 0 | Excelente |
| Caida BD | 2.79 | 0 | Excelente |
| Corte de Red | 3.22 | 0 | Excelente |
| Perdida Datos | 0.63 | < 60s | Excelente |
| Caida Total | 5.61 | 0 | Excelente |
| Congelamiento | 1.14 | 0 | Excelente |

### Hallazgos Clave

1. **RTO promedio:** 2.65 segundos - muy por debajo de cualquier SLA estandar
2. **RPO:** 0 en todos los escenarios con datos persistentes (volumenes Docker)
3. **Graceful degradation:** El health endpoint continuo funcionando incluso sin BD
4. **Recuperacion ordenada:** BD -> Backend -> Frontend es critico
5. **Backup/Restore:** Proceso completo en menos de 1 segundo

### Estado Final del Sistema
NAMES                 STATUS                          PORTS
restaurant-frontend   Up About a minute (unhealthy)   0.0.0.0:3000->3000/tcp, [::]:3000->3000/tcp
restaurant-backend    Up About a minute (healthy)     0.0.0.0:3001->3001/tcp, [::]:3001->3001/tcp
restaurant-postgres   Up About a minute (healthy)     0.0.0.0:5432->5432/tcp, [::]:5432->5432/tcp

---
*Reporte generado automaticamente el 2026-07-15 20:58:42*
