# Pruebas HA/DR + Stress - Restaurante Vegetariano

> **Ruta del proyecto:** `C:\developer-marx\Proyectos UTP\Proyecto-Restaurante-Vegetariano`  
> **Carpeta de evidencias:** `scripts/logs/ha-dr-test-20260715-205341/`

---

## 1. Entorno de Prueba

| Componente | Tecnología |
|---|---|
| Contenedores | Docker Desktop 29.6.1 |
| Frontend | Next.js 16 (puerto 3000) |
| Backend | Express + TypeScript (puerto 3001) |
| Base de Datos | PostgreSQL 15 (puerto 5432) |
| Sistema referencial | Alma Linux (simulado con Alpine) |

### Comandos para iniciar entorno

```bash
# Pararse en la raíz del proyecto
cd C:\developer-marx\Proyectos UTP\Proyecto-Restaurante-Vegetariano

# Construir imágenes (1ra vez)
docker compose build

# Levantar servicios
docker compose up -d

# Verificar estado
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
curl http://localhost:3001/api/health
```

---

## 2. Escenario 1 - Caída del Backend

**Simula:** Crash del servidor de aplicaciones.

```powershell
# 1. Antes - tomar captura
docker ps --format "table {{.Names}}\t{{.Status}}"

# 2. Medir latencia normal (opcional)
Measure-Command { curl -s http://localhost:3001/api/health }

# 3. Provocar caída
docker stop restaurant-backend

# 4. Verificar caída (debe dar HTTP 000)
curl -s --max-time 5 -w "HTTP %{http_code}" http://localhost:3001/api/health

# 5. Recuperar y medir RTO
$start = Get-Date
docker start restaurant-backend
do { $code = curl -s --max-time 3 -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>$null; Start-Sleep 1 } until ($code -eq "200")
$rto = ((Get-Date) - $start).TotalSeconds; Write-Output "RTO: ${rto}s"

# 6. Verificar recuperación
curl -s http://localhost:3001/api/health | ConvertFrom-Json | Format-List
```

**Evidencia esperada:** HTTP 000 durante caída → HTTP 200 post recuperación.  
**RTO:** ~2.5s | **RPO:** 0

---

## 3. Escenario 2 - Caída de la Base de Datos

**Simula:** Falla del motor PostgreSQL.

```powershell
# 1. Estado inicial
docker ps --format "table {{.Names}}\t{{.Status}}"

# 2. Detener PostgreSQL
docker stop restaurant-postgres

# 3. Ver logs del backend (debe mostrar error de conexión)
docker logs restaurant-backend --tail 10 2>&1
curl -s --max-time 5 -w "HTTP %{http_code}" http://localhost:3001/api/health

# 4. Recuperar
$start = Get-Date
docker start restaurant-postgres

# 5. Esperar que PostgreSQL esté listo
do { $ready = docker exec restaurant-postgres pg_isready -U restaurant -d restaurant_db 2>$null; Start-Sleep 1 } until ($ready)

# 6. Esperar que API reconecte
do { $code = curl -s --max-time 3 -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>$null; Start-Sleep 1 } until ($code -eq "200")
$rto = ((Get-Date) - $start).TotalSeconds; Write-Output "RTO: ${rto}s"
```

**Evidencia esperada:** Logs con error "terminating connection due to administrator command".  
**RTO:** ~2.8s | **RPO:** 0

---

## 4. Escenario 3 - Corte de Red

**Simula:** Pérdida de conectividad o firewall bloqueando el backend.

```powershell
# 1. Desconectar backend de la red Docker
docker network disconnect restaurant-network restaurant-backend

# 2. Verificar aislamiento (debe dar timeout - HTTP 000)
curl -s --max-time 5 -w "HTTP %{http_code}" http://localhost:3001/api/health

# 3. Reconectar
$start = Get-Date
docker network connect restaurant-network restaurant-backend

# 4. Esperar recuperación
do { $code = curl -s --max-time 3 -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>$null; Start-Sleep 1 } until ($code -eq "200")
$rto = ((Get-Date) - $start).TotalSeconds; Write-Output "RTO: ${rto}s"
```

**Evidencia esperada:** Backend aislado sin respuesta → Recuperación inmediata al reconectar.  
**RTO:** ~3.2s | **RPO:** 0

---

## 5. Escenario 4 - Pérdida de Datos y Restauración

**Simula:** Corrupción/eliminación de datos críticos con recuperación desde backup.

```powershell
# ----- PARTE A: Backup -----
# Verificar datos existentes
docker exec restaurant-postgres psql -U restaurant -d restaurant_db -c 'SELECT count(*) FROM "User";'
docker exec restaurant-postgres psql -U restaurant -d restaurant_db -c 'SELECT count(*) FROM "Category";'
docker exec restaurant-postgres psql -U restaurant -d restaurant_db -c 'SELECT count(*) FROM "Table";'

# Crear backup
$start = Get-Date
docker exec restaurant-postgres pg_dump -U restaurant -d restaurant_db --clean --if-exists --no-owner > backup-restore-test.sql
$duration = ((Get-Date) - $start).TotalSeconds
Write-Output "Backup creado en ${duration}s - Tamaño: $((Get-Item backup-restore-test.sql).Length/1KB)KB"

# ----- PARTE B: Pérdida de datos -----
# Eliminar todas las tablas
docker exec restaurant-postgres psql -U restaurant -d restaurant_db -c 'TRUNCATE TABLE "OrderItem", "Order", "MenuItem", "Category", "EmployeePayment", "Reservation", "Table", "User" CASCADE;'

# Verificar pérdida
docker exec restaurant-postgres psql -U restaurant -d restaurant_db -c 'SELECT count(*) FROM "User";'

# ----- PARTE C: Restauración -----
$start = Get-Date
Get-Content backup-restore-test.sql | docker exec -i restaurant-postgres psql -U restaurant -d restaurant_db --quiet
$rto = ((Get-Date) - $start).TotalSeconds; Write-Output "Restauración: ${rto}s"

# ----- PARTE D: Verificación -----
docker exec restaurant-postgres psql -U restaurant -d restaurant_db -c 'SELECT count(*) FROM "User";'
docker exec restaurant-postgres psql -U restaurant -d restaurant_db -c 'SELECT count(*) FROM "Category";'
docker exec restaurant-postgres psql -U restaurant -d restaurant_db -c 'SELECT count(*) FROM "Table";'
```

**Evidencia esperada:** Conteos antes: Users=3, Categories=9, Tables=10 → 0 después de borrar → mismos valores después de restaurar.  
**RTO:** ~0.6s | **RPO:** < 60s (depende del backup)

---

## 6. Escenario 5 - Caída Total del Sistema

**Simula:** Apagón completo (full outage).

```powershell
# 1. Detener todo
docker stop restaurant-frontend restaurant-backend restaurant-postgres

# 2. Verificar caída total
docker ps
curl -s --max-time 3 -o /dev/null -w "Backend: HTTP %{http_code}" http://localhost:3001/api/health
curl -s --max-time 3 -o /dev/null -w "Frontend: HTTP %{http_code}" http://localhost:3000

# 3. Recuperar en orden: BD → Backend → Frontend
$start = Get-Date
docker start restaurant-postgres
do { $ready = docker exec restaurant-postgres pg_isready -U restaurant -d restaurant_db 2>$null; Start-Sleep 1 } until ($ready)
Write-Output "PostgreSQL OK"

docker start restaurant-backend
do { $code = curl -s --max-time 3 -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>$null; Start-Sleep 1 } until ($code -eq "200")
Write-Output "Backend OK"

docker start restaurant-frontend
do { $code = curl -s --max-time 3 -o /dev/null -w "%{http_code}" http://localhost:3000 2>$null; Start-Sleep 1 } until ($code -eq "200" -or $code -eq "302")
Write-Output "Frontend OK"

$rto = ((Get-Date) - $start).TotalSeconds; Write-Output "RTO del sistema: ${rto}s"

# 4. Verificación final
docker ps --format "table {{.Names}}\t{{.Status}}"
```

**Evidencia esperada:** Recuperación completa ordenada.  
**RTO:** ~5.6s | **RPO:** 0

---

## 7. Escenario 6 - Contenedor Congelado (Deadlock)

**Simula:** Proceso bloqueado que no responde.

```powershell
# 1. Congelar backend
docker pause restaurant-backend

# 2. Verificar estado "Paused"
docker ps --format "table {{.Names}}\t{{.Status}}"

# 3. Verificar que no responde
curl -s --max-time 5 -w "HTTP %{http_code}" http://localhost:3001/api/health

# 4. Descongelar
$start = Get-Date
docker unpause restaurant-backend

# 5. Verificar recuperación
do { $code = curl -s --max-time 3 -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>$null; Start-Sleep 1 } until ($code -eq "200")
$rto = ((Get-Date) - $start).TotalSeconds; Write-Output "RTO: ${rto}s"
```

**Evidencia esperada:** Estado "Paused" durante la prueba → HTTP 000 → Recuperación inmediata.  
**RTO:** ~1.1s | **RPO:** 0

---

## 8. Pruebas de Stress con Docker

**Simula:** Alta concurrencia y consumo de recursos.

### 8.1 Stress de CPU

```powershell
# Inyectar estrés de CPU en el backend (3 cores, 60s)
docker run --name stress-cpu --rm -d containerstack/alpine-stress stress --cpu 3 --timeout 60s
docker stats restaurant-backend restaurant-postgres --no-stream
docker stop stress-cpu
```

### 8.2 Stress de Memoria

```powershell
# Inyectar estrés de memoria (512MB)
docker run --name stress-mem --rm -d containerstack/alpine-stress stress --vm 1 --vm-bytes 512M --timeout 60s
docker stats restaurant-backend restaurant-postgres --no-stream
docker stop stress-mem
```

### 8.3 Stress de I/O (Disco)

```powershell
# Estrés de escritura en el volumen de PostgreSQL
docker run --name stress-io --rm -d --volumes-from restaurant-postgres containerstack/alpine-stress stress --io 4 --hdd 2 --timeout 60s
docker stats restaurant-postgres --no-stream
# Verificar que PostgreSQL sigue respondiendo
curl -s http://localhost:3001/api/health
docker stop stress-io
```

### 8.4 Stress de Red (múltiples conexiones simultáneas)

```powershell
# 50 peticiones concurrentes al backend
for ($i=0; $i -lt 50; $i++) { Start-Job -ScriptBlock { param($u) curl -s $u > $null } -ArgumentList "http://localhost:3001/api/health" }
Get-Job | Wait-Job | Out-Null
Get-Job | Remove-Job
curl -s http://localhost:3001/api/health | ConvertFrom-Json | Format-List
```

### 8.5 Stress Completo (CPU + Memoria + Peticiones)

```powershell
# Estrés de CPU en background
docker run -d --name stress-full containerstack/alpine-stress stress --cpu 2 --vm 1 --vm-bytes 256M --timeout 30s

# Durante el estrés, enviar peticiones
1..20 | ForEach-Object { 
    $r = curl -s -w " %{http_code}:%{time_total}s" http://localhost:3001/api/health
    Write-Output "Req $_ : $r"
    Start-Sleep -Milliseconds 200
}

docker stop stress-full
docker rm stress-full
```

### 8.6 Verificar resiliencia durante stress

```powershell
# Monitorear en tiempo real (abrir otra terminal)
docker stats restaurant-backend restaurant-postgres

# Probar health durante estrés
while ($true) { 
    $r = curl -s -w " | HTTP %{http_code} | %{time_total}s" http://localhost:3001/api/health
    Write-Output "$(Get-Date -Format HH:mm:ss) $r"
    Start-Sleep 1 
}
```

---

## 9. Herramientas Utilizadas

| Herramienta | Propósito |
|---|---|
| Docker Desktop / Docker Engine | Contenerización y orquestación |
| Docker Compose | Gestión multi-servicio |
| curl | Health checks y medición de latencia |
| pg_dump / pg_restore | Backup y restauración de BD |
| PowerShell (Measure-Command) | Medición de tiempos |
| containerstack/alpine-stress | Estrés de CPU/RAM/IO |
| docker stats | Monitoreo de recursos |
| Docker events | Seguimiento de eventos |

---

## 10. Resultados Obtenidos

| # | Escenario | RTO (s) | RPO (s) | Resultado |
|---|---|---|---|---|
| 1 | Caída Backend | 2.49 | 0 | ✅ |
| 2 | Caída BD | 2.79 | 0 | ✅ |
| 3 | Corte de Red | 3.22 | 0 | ✅ |
| 4 | Pérdida Datos | 0.63 | < 60s | ✅ |
| 5 | Caída Total | 5.61 | 0 | ✅ |
| 6 | Deadlock | 1.14 | 0 | ✅ |
| 7-12 | Stress Tests | N/A | N/A | ✅ |

**RTO Promedio: 2.65 segundos**  
**RPO: 0** en todos los escenarios de datos persistentes

---

## 11. Evidencias Generadas

Los archivos están en: `scripts/logs/ha-dr-test-20260715-205341/`

| Archivo | Contenido |
|---|---|
| `reporte-ha-dr.md` | Informe completo de las 6 pruebas |
| `esc0*-*.txt` | Capturas de estado por escenario |
| `esc04-backup.sql` | Backup de BD (15.6 KB) |
| `esc02-logs-sin-bd.txt` | Logs del backend sin BD |

---

## 12. Estado Final del Sistema

```powershell
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
curl http://localhost:3001/api/health
```

*Documento preparado para exposición - Julio 2026*
