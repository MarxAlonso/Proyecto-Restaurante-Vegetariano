# Guía de Pruebas de Alta Disponibilidad y Recuperación ante Desastres

**Proyecto:** Restaurante Vegetariano  
**Entorno:** Docker sobre Alma Linux  
**Versión:** 1.0

---

## Índice

1. [Descripción del Proyecto](#1-descripción-del-proyecto)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Requisitos del Entorno de Pruebas](#3-requisitos-del-entorno-de-pruebas)
4. [Preparación del Entorno](#4-preparación-del-entorno)
5. [Escenarios de Prueba](#5-escenarios-de-prueba)
6. [Métricas de Recuperación](#6-métricas-de-recuperación)
7. [Ejecución de Pruebas](#7-ejecución-de-pruebas)
8. [Recolección de Evidencias](#8-recolección-de-evidencias)
9. [Interpretación de Resultados](#9-interpretación-de-resultados)
10. [Anexos](#10-anexos)

---

## 1. Descripción del Proyecto

Sistema web para restaurante vegetariano compuesto por:

| Componente | Tecnología | Puerto |
|---|---|---|
| Frontend | Next.js 16 (React 19) | 3000 |
| Backend API | Express.js + TypeScript | 3001 |
| Base de Datos | PostgreSQL 15 | 5432 |
| Almacenamiento | R2 (Cloudflare) | — |
| Pagos | Mercado Pago | — |
| Autenticación | Google OAuth + JWT | — |

### Stack Dockerizado

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Frontend │────▶│  Backend │────▶│PostgreSQL│
│ :3000    │     │ :3001    │     │ :5432    │
└──────────┘     └──────────┘     └──────────┘
                       │
                       ▼
               ┌──────────────┐
               │ R2 / MP /    │
               │ Google Auth  │
               └──────────────┘
```

---

## 2. Arquitectura del Sistema

### 2.1 Componentes Docker

| Servicio | Imagen Base | Propósito |
|---|---|---|
| `postgres` | postgres:15-alpine | Base de datos relacional |
| `backend` | node:20-alpine | API REST con Express + Prisma |
| `frontend` | node:20-alpine | Aplicación Next.js |

### 2.2 Volúmenes Persistentes

- `restaurant_postgres_data`: datos de PostgreSQL
- Backups almacenados en `./backups/postgres/` (host)

### 2.3 Red

- Red bridge: `restaurant-network`
- Contenedores se comunican por nombre de servicio

---

## 3. Requisitos del Entorno de Pruebas

### 3.1 Hardware Mínimo (por VM Alma Linux)

| Recurso | Mínimo | Recomendado |
|---|---|---|
| CPU | 2 vCPUs | 4 vCPUs |
| RAM | 4 GB | 8 GB |
| Disco | 20 GB | 40 GB |

### 3.2 Software Requerido

```bash
# Sistema Operativo
Alma Linux 9.x

# Docker Engine
sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl enable --now docker

# Docker Compose (plugin incluido con docker-compose-plugin)
docker compose version

# Herramientas adicionales
sudo dnf install -y curl jq git
```

### 3.3 Verificar Instalación

```bash
docker --version
docker compose version
curl --version
```

---

## 4. Preparación del Entorno

### 4.1 Clonar el Repositorio

```bash
git clone <repo-url> restaurante-veg
cd restaurante-veg
```

### 4.2 Configurar Variables de Entorno

```bash
cp .env.example .env
# Editar .env con valores reales (JWT_SECRET, etc.)
nano .env
```

### 4.3 Construir y Levantar los Servicios

```bash
# Construir imágenes
docker compose build --no-cache

# Iniciar servicios en segundo plano
docker compose up -d

# Verificar que todo esté corriendo
docker compose ps

# Ver logs
docker compose logs -f
```

### 4.4 Verificar Estado Inicial

```bash
# Health check del backend
curl -s http://localhost:3001/api/health | jq .

# Health check del frontend
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000

# Estado de contenedores
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Logs iniciales
docker logs restaurant-backend --tail 20
docker logs restaurant-postgres --tail 20
```

**Resultado esperado:**

```json
// GET /api/health
{
  "status": "ok",
  "timestamp": "2026-07-13T...Z"
}
```

### 4.5 Configurar Backups Automáticos (Opcional)

```bash
# Agregar a crontab para backup diario a las 2 AM
crontab -e
0 2 * * * cd /ruta/proyecto && bash scripts/backup-restore.sh auto >> /var/log/backup-restaurant.log 2>&1
```

---

## 5. Escenarios de Prueba

### 5.1 Escenario 1: Caída del Servidor Backend

**Objetivo:** Validar que el sistema tolera la caída del backend y se recupera automáticamente.

**Descripción:** Se detiene el contenedor del backend (Express), simulando un crash del servidor de aplicaciones.

**Procedimiento:**

1. Verificar estado normal del sistema
2. `docker stop restaurant-backend`
3. Verificar que la API no responde (`curl http://localhost:3001/api/health` debe fallar)
4. Verificar que el frontend muestra error o carga parcial
5. `docker start restaurant-backend`
6. Medir tiempo hasta que `api/health` responde 200

**Criterio de éxito:**

- RTO < 30 segundos
- Sin pérdida de datos transaccionales
- Frontend debe recuperarse automáticamente

**Evidencias a capturar:**

- `docker ps -a` antes/durante/después
- Logs del backend (`docker logs restaurant-backend`)
- Timestamps de `docker events`
- Tiempo de respuesta de `curl -w "%{http_code}:%{time_total}"`

---

### 5.2 Escenario 2: Caída de la Base de Datos

**Objetivo:** Validar el comportamiento del sistema cuando la base de datos no está disponible.

**Descripción:** Se detiene PostgreSQL, simulando una falla del motor de base de datos.

**Procedimiento:**

1. Verificar estado normal
2. `docker stop restaurant-postgres`
3. Verificar que el backend responde con error 500 en endpoints que requieren BD
4. Verificar que el health endpoint puede o no responder (depende de la implementación)
5. `docker start restaurant-postgres`
6. Verificar que el backend reconecta automáticamente (Prisma retry)

**Criterio de éxito:**

- Backend debe manejar gracefulmente la falta de BD (errores 500, no crash)
- Tras recuperar BD, el backend debe reconectar sin intervención manual
- RTO < 60 segundos (depende del tiempo de inicio de PostgreSQL)

**Evidencias a capturar:**

- Logs del backend mostrando errores de conexión
- Logs de PostgreSQL durante el inicio
- Tiempo de reconexión

---

### 5.3 Escenario 3: Corte de Red

**Objetivo:** Validar que el sistema maneja la pérdida de conectividad entre servicios.

**Descripción:** Se desconecta el backend de la red Docker, simulando un corte de red o firewall.

**Procedimiento:**

1. Verificar estado normal
2. `docker network disconnect restaurant-network restaurant-backend`
3. Verificar que la API no responde (aislamiento total)
4. Verificar que el frontend no puede consumir la API
5. `docker network connect restaurant-network restaurant-backend`
6. Medir tiempo de recuperación

**Criterio de éxito:**

- Backend aislado correctamente (sin respuesta)
- Reconexión exitosa sin pérdida de datos
- RTO < 15 segundos

---

### 5.4 Escenario 4: Pérdida de Datos y Restauración desde Backup

**Objetivo:** Validar el proceso de backup y restauración ante una pérdida de datos.

**Descripción:** Se eliminan datos críticos de la BD y se restauran desde un backup.

**Procedimiento:**

1. Crear backup de referencia: `bash scripts/backup-restore.sh backup`
2. Obtener conteo de registros actual
3. Eliminar datos: `TRUNCATE TABLE "OrderItem", "Order", "MenuItem", "Category" CASCADE;`
4. Verificar impacto en la API (datos vacíos)
5. Restaurar desde backup: `bash scripts/backup-restore.sh restore`
6. Verificar integridad de datos post-restauración

**Criterio de éxito:**

- Backup completo y verificable
- Restauración exitosa con todos los datos recuperados
- RPO: 0 (pérdida cero si el backup es reciente)
- RTO < 120 segundos (para restauración completa)

**Métrica clave:**

```sql
-- Comparar conteos antes y después
SELECT 'users', COUNT(*) FROM "User"
UNION ALL
SELECT 'orders', COUNT(*) FROM "Order"
UNION ALL
SELECT 'menu_items', COUNT(*) FROM "MenuItem"
UNION ALL
SELECT 'categories', COUNT(*) FROM "Category";
```

---

### 5.5 Escenario 5: Caída Total del Sistema

**Objetivo:** Validar la recuperación completa del sistema desde cero.

**Descripción:** Se detienen todos los contenedores (frontend + backend + BD) simulando un apagón total.

**Procedimiento:**

1. Verificar estado normal
2. `docker stop restaurant-frontend restaurant-backend restaurant-postgres`
3. Verificar que nada responde
4. Iniciar en orden: BD → Backend → Frontend
5. Medir RTO del sistema completo

**Orden de arranque correcto:**

```bash
docker start restaurant-postgres
# Esperar healthcheck de PostgreSQL
docker start restaurant-backend
# Esperar healthcheck del backend
docker start restaurant-frontend
```

**Criterio de éxito:**

- Recuperación completa del sistema
- RTO < 120 segundos
- Todos los datos persistentes intactos

---

### 5.6 Escenario 6: Contenedor Congelado (Deadlock)

**Objetivo:** Validar la detección y recuperación de un proceso congelado.

**Descripción:** Se pausa el backend (SIGSTOP) simulando un deadlock o proceso bloqueado.

**Procedimiento:**

1. Verificar latencia normal de la API
2. `docker pause restaurant-backend` (congela el proceso)
3. Verificar que la API no responde (timeout)
4. `docker unpause restaurant-backend`
5. Verificar que el backend reanuda su operación normal

**Criterio de éxito:**

- Docker detecta el estado "Paused"
- API no responde durante la pausa
- Recuperación inmediata al despausar (< 5 segundos)

---

## 6. Métricas de Recuperación

### 6.1 RTO (Recovery Time Objective)

Tiempo máximo tolerable para recuperar el servicio.

| Escenario | RTO Objetivo | RTO Medido |
|---|---|---|
| Caída Backend | < 30s | |
| Caída BD | < 60s | |
| Corte de Red | < 15s | |
| Pérdida Datos | < 120s | |
| Caída Total | < 120s | |
| Congelamiento | < 10s | |

### 6.2 RPO (Recovery Point Objective)

Pérdida máxima de datos tolerable.

| Escenario | RPO Objetivo | RPO Medido |
|---|---|---|
| Caída Backend | 0 (sin pérdida) | |
| Caída BD | 0 (datos persistentes) | |
| Corte de Red | 0 (sin pérdida) | |
| Pérdida Datos | Depende del backup | |
| Caída Total | 0 (datos persistentes) | |
| Congelamiento | 0 (sin pérdida) | |

### 6.3 Fórmulas de Cálculo

```bash
# RTO: tiempo desde que inicia la falla hasta que el servicio se restaura
RTO = T_recuperacion - T_falla

# RPO: tiempo entre el último backup exitoso y el momento de la falla
RPO = T_falla - T_ultimo_backup

# Latencia de recuperación
LATENCIA = T_respuesta_ok - T_inicio_recuperacion
```

---

## 7. Ejecución de Pruebas

### 7.1 Método Automatizado

El script `scripts/ha-dr-test.sh` ejecuta los 6 escenarios secuencialmente y genera un reporte Markdown automatizado.

```bash
# 1. Asegurar que los servicios están arriba
docker compose up -d
sleep 10

# 2. Ejecutar todas las pruebas
cd scripts
bash ha-dr-test.sh

# 3. El reporte se genera en scripts/logs/ha-dr-test-*/reporte-ha-dr.md
```

### 7.2 Método Manual (Escenario por Escenario)

```bash
# Escenario 1: Caída Backend
docker stop restaurant-backend
# ...observar, tomar capturas...
docker start restaurant-backend

# Escenario 2: Caída BD
docker stop restaurant-postgres
# ...observar, tomar capturas...
docker start restaurant-postgres

# Escenario 3: Corte de Red
docker network disconnect restaurant-network restaurant-backend
# ...observar...
docker network connect restaurant-network restaurant-backend

# Escenario 4: Pérdida de Datos
# Ver sección 5.4

# Escenario 5: Caída Total
docker compose down
docker compose up -d

# Escenario 6: Congelamiento
docker pause restaurant-backend
# ...observar...
docker unpause restaurant-backend
```

### 7.3 Comandos de Monitoreo Durante Pruebas

```bash
# Monitorear logs en tiempo real
docker logs -f restaurant-backend
docker logs -f restaurant-postgres

# Eventos de Docker
docker events --filter 'container=restaurant-backend'

# Estadísticas de recursos
docker stats restaurant-backend restaurant-postgres

# Health checks
watch -n 1 'curl -s http://localhost:3001/api/health'

# Estado de contenedores
watch -n 1 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
```

---

## 8. Recolección de Evidencias

### 8.1 Evidencias Requeridas

Para cada escenario, capturar:

| Evidencia | Método de Captura |
|---|---|
| Estado inicial | `docker ps -a`, `curl /api/health` |
| Durante la falla | `docker ps -a`, logs, captura de pantalla |
| Métricas de tiempo | `date +%s` antes/después, `curl -w "%{time_total}"` |
| Logs del sistema | `docker logs <container> --tail 50` |
| Recuperación | `docker ps -a`, health check OK |
| Conteo de datos | Consultas SQL (para escenario 4) |

### 8.2 Plantilla de Captura por Escenario

```markdown
## Escenario X: [Nombre]

### Estado Inicial
```
[timestamp] Sistema operativo normal
```

### Evidencia Durante la Falla
```
[logs, capturas, etc.]
```

### Métricas de Recuperación
| Métrica | Valor |
|---|---|
| Tiempo de falla | [HH:MM:SS] |
| Tiempo de recuperación | [HH:MM:SS] |
| RTO | [segundos] |
| RPO | [segundos] |
| Latencia post-recuperación | [ms] |

### Estado Final
```
[docker ps -a, health check OK]
```

### Conclusiones
- [Observaciones relevantes]
```

### 8.3 Script de Recolección Rápida

```bash
#!/bin/bash
# quick-snapshot.sh - Captura estado completo del sistema
SNAPSHOT_DIR="evidencias-$(date +%Y%m%d-%H%M%S)"
mkdir -p "${SNAPSHOT_DIR}"

{
    echo "=== SNAPSHOT $(date) ==="
    echo "--- docker ps ---"
    docker ps -a
    echo "--- docker stats (1 shot) ---"
    docker stats --no-stream
    echo "--- Backend Health ---"
    curl -s http://localhost:3001/api/health 2>&1
    echo "--- Backend Logs (últimas 20) ---"
    docker logs restaurant-backend --tail 20 2>&1
    echo "--- PostgreSQL Logs ---"
    docker logs restaurant-postgres --tail 20 2>&1
    echo "--- DB Connections ---"
    docker exec restaurant-postgres psql -U restaurant -d restaurant_db -c "SELECT count(*) FROM pg_stat_activity;"
} > "${SNAPSHOT_DIR}/snapshot.txt"

echo "Snapshot guardado en ${SNAPSHOT_DIR}/snapshot.txt"
```

---

## 9. Interpretación de Resultados

### 9.1 Evaluación de Resultados

| Resultado | Significado | Acción |
|---|---|---|
| RTO < objetivo | Sistema dentro del SLA esperado | Documentar como exitoso |
| RTO > objetivo | Recuperación lenta | Revisar healthchecks, tiempos de inicio, dependencias |
| Pérdida de datos | RPO > 0 no planificado | Revisar política de backups, fsync, volúmenes |
| Caída del frontend | Frontend no degrada gracefulmente | Implementar fallback UI, offline mode |
| Error no manejado | Backend crash en lugar de error graceful | Revisar try/catch, middlewares de error |

### 9.2 Tabla Resumen de Resultados

Una vez ejecutadas las pruebas, completar:

| # | Escenario | RTO (s) | RPO (s) | Estado | Observaciones |
|---|---|---|---|---|---|
| 1 | Caída Backend | | 0 | ✅ / ❌ | |
| 2 | Caída BD | | 0 | ✅ / ❌ | |
| 3 | Corte de Red | | 0 | ✅ / ❌ | |
| 4 | Pérdida Datos | | | ✅ / ❌ | |
| 5 | Caída Total | | 0 | ✅ / ❌ | |
| 6 | Congelamiento | | 0 | ✅ / ❌ | |

### 9.3 Generación de Informe Final

El script automatizado genera un reporte Markdown completo en:

```
scripts/logs/ha-dr-test-<fecha>/reporte-ha-dr.md
```

Este reporte incluye:

- Metadatos de la prueba (fecha, entorno, versiones)
- Tabla resumen de escenarios
- Evidencia de cada escenario (logs, capturas, métricas)
- Estado final del sistema
- Conclusiones y recomendaciones

Para exportar a PDF:

```bash
# Usando pandoc
sudo dnf install -y pandoc texlive
cd scripts/logs/ha-dr-test-*/
pandoc reporte-ha-dr.md -o reporte-ha-dr.pdf --from markdown --to pdf
```

---

## 10. Anexos

### A. Estructura de Archivos Generados

```
proyecto/
├── docker-compose.yml              # Orquestación Docker
├── .env.example                    # Variables de entorno ejemplo
├── apps/
│   ├── backend/Dockerfile          # Imagen del backend
│   └── frontend/Dockerfile         # Imagen del frontend
├── scripts/
│   ├── ha-dr-test.sh              # Pruebas automatizadas HA/DR
│   ├── backup-restore.sh           # Backup y restauración
│   ├── init-db.sql                 # Inicialización BD
│   └── logs/                       # Reportes generados
│       └── ha-dr-test-<fecha>/
│           ├── reporte-ha-dr.md
│           ├── backend-*.log
│           ├── db-*.log
│           └── backup-*.sql
├── docs/
│   └── guia-pruebas-ha-dr.md       # Esta guía
└── backups/
    └── postgres/                   # Backups de BD
```

### B. Comandos Útiles Rápidos

```bash
# Limpiar y reconstruir todo
docker compose down -v && docker compose build --no-cache && docker compose up -d

# Ver logs de todos los servicios
docker compose logs -f

# Ejecutar comando en BD
docker exec -it restaurant-postgres psql -U restaurant -d restaurant_db

# Backup rápido manual
docker exec restaurant-postgres pg_dump -U restaurant restaurant_db > backup_$(date +%Y%m%d).sql

# Restaurar backup rápido
cat backup.sql | docker exec -i restaurant-postgres psql -U restaurant -d restaurant_db

# Ver tamaño de volúmenes
docker system df -v | grep restaurant

# Probar latencia de API
curl -w "HTTP %{http_code}, Tiempo: %{time_total}s\n" http://localhost:3001/api/health
```

### C. Troubleshooting Común

| Problema | Causa | Solución |
|---|---|---|
| `port already allocated` | Puerto en uso | Cambiar puerto en docker-compose.yml |
| `ECONNREFUSED` de BD | PostgreSQL no listo | Aumentar `start_period` en healthcheck |
| Prisma no conecta | DATABASE_URL incorrecta | Verificar .env y docker-compose |
| Backend crash loop | Error en código | Revisar logs: `docker logs restaurant-backend` |
| Frontend build fail | Next.js error de compilación | Revisar `docker compose build frontend` |
| `pg_dump` permission denied | Usuario sin permisos | Ejecutar como `postgres` o verificar roles |

### D. Referencias

- [Docker Engine](https://docs.docker.com/engine/)
- [Docker Compose](https://docs.docker.com/compose/)
- [PostgreSQL Backup/Restore](https://www.postgresql.org/docs/15/backup.html)
- [Prisma Connection Management](https://www.prisma.io/docs/concepts/components/prisma-client/connection-management)
- [Alma Linux Documentation](https://almalinux.org/docs/)
