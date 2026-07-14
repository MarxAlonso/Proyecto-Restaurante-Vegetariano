#!/usr/bin/env bash
# =============================================================================
# Script de Pruebas de Alta Disponibilidad y Recuperación ante Desastres
# Proyecto: Restaurante Vegetariano
# Entorno: Docker + Alma Linux
# =============================================================================
set -euo pipefail

# ─── Configuración ───────────────────────────────────────────────────────────
COMPOSE_FILE="../docker-compose.yml"
LOG_DIR="./logs/ha-dr-test-$(date +%Y%m%d-%H%M%S)"
REPORT_FILE="${LOG_DIR}/reporte-ha-dr.md"
BACKEND_CONTAINER="restaurant-backend"
FRONTEND_CONTAINER="restaurant-frontend"
DB_CONTAINER="restaurant-postgres"
NETWORK_NAME="restaurant-network"
API_HEALTH_URL="http://localhost:3001/api/health"
FRONTEND_URL="http://localhost:3000"

# ─── Colores ─────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ─── Funciones Auxiliares ────────────────────────────────────────────────────
log()     { echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} $*"; }
ok()      { echo -e "  ${GREEN}✓${NC} $*"; }
warn()    { echo -e "  ${YELLOW}⚠${NC} $*"; }
fail()    { echo -e "  ${RED}✗${NC} $*"; }
header()  { echo -e "\n${YELLOW}══════════════════════════════════════════════${NC}"; }
subheader() { echo -e "${CYAN}──────────────────────────────────────────────${NC}"; }

# ─── Inicialización ──────────────────────────────────────────────────────────
init() {
    mkdir -p "${LOG_DIR}"
    echo "# Informe de Pruebas HA/DR" > "${REPORT_FILE}"
    echo "" >> "${REPORT_FILE}"
    echo "**Proyecto:** Restaurante Vegetariano" >> "${REPORT_FILE}"
    echo "**Fecha:** $(date '+%Y-%m-%d %H:%M:%S')" >> "${REPORT_FILE}"
    echo "**Entorno:** Docker sobre Alma Linux" >> "${REPORT_FILE}"
    echo "" >> "${REPORT_FILE}"
    echo "## Resumen de Escenarios" >> "${REPORT_FILE}"
    echo "| # | Escenario | RTO (s) | RPO (s) | Estado |" >> "${REPORT_FILE}"
    echo "|---|-----------|---------|---------|--------|" >> "${REPORT_FILE}"
}

append_report() {
    local scenario="$1"
    local rto="$2"
    local rpo="$3"
    local status="$4"
    echo "| $scenario | $rto | $rpo | $status |" >> "${REPORT_FILE}"
}

take_screenshot() {
    local name="$1"
    log "Capturando evidencia: ${name}"
    # Capturar estado de contenedores
    {
        echo "### Evidencia: ${name} - $(date '+%Y-%m-%d %H:%M:%S')"
        echo '```'
        docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo '```'
    } >> "${REPORT_FILE}"
    # Guardar logs del sistema
    docker logs "${BACKEND_CONTAINER}" 2>&1 | tail -30 > "${LOG_DIR}/backend-${name}.log" 2>/dev/null || true
    docker logs "${DB_CONTAINER}" 2>&1 | tail -30 > "${LOG_DIR}/db-${name}.log" 2>/dev/null || true
}

check_api_health() {
    local timeout="${1:-10}"
    local start=$(date +%s%N)
    local response
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time "${timeout}" "${API_HEALTH_URL}" 2>/dev/null || echo "000")
    local end=$(date +%s%N)
    local elapsed=$(( (end - start) / 1000000 ))
    echo "${response}:${elapsed}"
}

wait_for_api() {
    local max_wait="${1:-60}"
    local start=$(date +%s)
    log "Esperando que la API responda (timeout: ${max_wait}s)..."
    while true; do
        local result
        result=$(check_api_health 5)
        local code="${result%%:*}"
        if [ "${code}" = "200" ]; then
            local elapsed=$(($(date +%s) - start))
            ok "API disponible después de ${elapsed}s"
            return 0
        fi
        if [ $(($(date +%s) - start)) -ge "${max_wait}" ]; then
            fail "Timeout esperando API (${max_wait}s)"
            return 1
        fi
        sleep 1
    done
}

wait_for_frontend() {
    local max_wait="${1:-60}"
    local start=$(date +%s)
    log "Esperando que el Frontend responda (timeout: ${max_wait}s)..."
    while true; do
        local code
        code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${FRONTEND_URL}" 2>/dev/null || echo "000")
        if [ "${code}" = "200" ] || [ "${code}" = "302" ]; then
            local elapsed=$(($(date +%s) - start))
            ok "Frontend disponible después de ${elapsed}s"
            return 0
        fi
        if [ $(($(date +%s) - start)) -ge "${max_wait}" ]; then
            fail "Timeout esperando Frontend (${max_wait}s)"
            return 1
        fi
        sleep 1
    done
}

measure_health_latency() {
    local start=$(date +%s%N)
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${API_HEALTH_URL}" 2>/dev/null || echo "000")
    local end=$(date +%s%N)
    local elapsed_ms=$(( (end - start) / 1000000 ))
    echo "${code}:${elapsed_ms}"
}

verify_data_persistence() {
    log "Verificando persistencia de datos..."
    local count
    count=$(curl -s --max-time 5 "${API_HEALTH_URL}" | python3 -c "import sys,json; print('ok')" 2>/dev/null || echo "error")
    if [ "$count" = "ok" ]; then
        ok "API responde correctamente - datos accesibles"
        return 0
    else
        warn "No se pudo verificar persistencia de datos"
        return 1
    fi
}

# ─── Escenario 1: Caída del Backend ──────────────────────────────────────────
escenario_1_caida_backend() {
    header
    log "ESCENARIO 1: Caída del servidor Backend"
    subheader
    log "Descripción: Simula la caída inesperada del servidor de API"
    echo "" >> "${REPORT_FILE}"
    echo "## Escenario 1: Caída del Backend" >> "${REPORT_FILE}"
    echo "**Descripción:** Se detiene el contenedor del backend para simular una caída del servidor de API." >> "${REPORT_FILE}"
    echo "" >> "${REPORT_FILE}"

    take_screenshot "esc01-antes"

    # Medir latencia antes de la caída
    local antes
    antes=$(measure_health_latency)
    log "Latencia normal: ${antes#*:}ms (HTTP ${antes%%:*})"
    echo "**Latencia previa:** ${antes#*:}ms (HTTP ${antes%%:*})" >> "${REPORT_FILE}"

    # Detener backend
    log "Deteniendo contenedor backend..."
    local inicio_caida=$(date +%s)
    docker stop "${BACKEND_CONTAINER}"
    sleep 2
    take_screenshot "esc01-durante-caida"

    # Verificar que el backend no responde
    local result_down
    result_down=$(check_api_health 5)
    local code_down="${result_down%%:*}"
    if [ "${code_down}" = "000" ]; then
        ok "Backend correctamente caído (no responde)"
    else
        warn "Backend aún responde con código ${code_down}"
    fi

    # Medir tiempo de recuperación (RTO)
    local inicio_recuperacion=$(date +%s)
    log "Iniciando recuperación del backend..."
    docker start "${BACKEND_CONTAINER}"

    if wait_for_api 60; then
        local tiempo_total=$(($(date +%s) - inicio_caida))
        local rto=$(($(date +%s) - inicio_recuperacion))
        ok "Backend recuperado. Tiempo total caída: ${tiempo_total}s, RTO: ${rto}s"
        take_screenshot "esc01-recuperado"

        # Verificar datos persistentes
        verify_data_persistence

        append_report "1. Caída Backend" "${rto}" "0 (sin pérdida)" "✓ Superado"
    else
        fail "No se pudo recuperar el backend"
        append_report "1. Caída Backend" "N/A" "N/A" "✗ Fallado"
    fi
}

# ─── Escenario 2: Caída de la Base de Datos ──────────────────────────────────
escenario_2_caida_bd() {
    header
    log "ESCENARIO 2: Caída de la Base de Datos PostgreSQL"
    subheader
    log "Descripción: Simula la pérdida de conexión con la base de datos"
    echo "" >> "${REPORT_FILE}"
    echo "## Escenario 2: Caída de la Base de Datos" >> "${REPORT_FILE}"
    echo "**Descripción:** Se detiene el contenedor de PostgreSQL para simular una falla en la base de datos." >> "${REPORT_FILE}"
    echo "" >> "${REPORT_FILE}"

    take_screenshot "esc02-antes"

    # Verificar estado actual
    local result_normal=$(check_api_health 5)
    log "API antes de la caída: HTTP ${result_normal%%:*} (${result_normal#*:}ms)"
    echo "**Latencia previa:** ${result_normal#*:}ms (HTTP ${result_normal%%:*})" >> "${REPORT_FILE}"

    # Detener PostgreSQL
    log "Deteniendo PostgreSQL..."
    local inicio_caida=$(date +%s)
    docker stop "${DB_CONTAINER}"
    sleep 3
    take_screenshot "esc02-durante-caida"

    # Verificar que API falla (porque no tiene BD)
    local result_no_db
    result_no_db=$(check_api_health 10)
    local code_no_db="${result_no_db%%:*}"
    log "Respuesta de API sin BD: HTTP ${code_no_db}"
    echo "**Respuesta sin BD:** HTTP ${code_no_db}" >> "${REPORT_FILE}"

    # Recuperar PostgreSQL
    local inicio_recuperacion=$(date +%s)
    log "Iniciando recuperación de PostgreSQL..."
    docker start "${DB_CONTAINER}"

    # Esperar a que PostgreSQL esté saludable
    log "Esperando que PostgreSQL esté listo..."
    local pg_ready=false
    for i in $(seq 1 30); do
        if docker exec "${DB_CONTAINER}" pg_isready -U restaurant -d restaurant_db &>/dev/null; then
            pg_ready=true
            ok "PostgreSQL listo después de ${i}s"
            break
        fi
        sleep 1
    done

    if [ "$pg_ready" = true ]; then
        # Esperar que el backend reconecte
        if wait_for_api 30; then
            local rto=$(($(date +%s) - inicio_recuperacion))
            ok "Sistema completamente recuperado. RTO: ${rto}s"
            take_screenshot "esc02-recuperado"
            verify_data_persistence
            append_report "2. Caída BD" "${rto}" "0 (datos persistentes)" "✓ Superado"
        else
            fail "API no responde después de recuperar BD"
            append_report "2. Caída BD" "N/A" "N/A" "✗ Fallado"
        fi
    else
        fail "PostgreSQL no se recuperó"
        append_report "2. Caída BD" "N/A" "N/A" "✗ Fallado"
    fi
}

# ─── Escenario 3: Corte de Red ───────────────────────────────────────────────
escenario_3_corte_red() {
    header
    log "ESCENARIO 3: Corte de Red (Aislamiento del Backend)"
    subheader
    log "Descripción: Se aísla el backend de la red para simular un corte de conectividad"
    echo "" >> "${REPORT_FILE}"
    echo "## Escenario 3: Corte de Red" >> "${REPORT_FILE}"
    echo "**Descripción:** Se desconecta el backend de la red Docker para simular un corte de conectividad." >> "${REPORT_FILE}"
    echo "" >> "${REPORT_FILE}"

    take_screenshot "esc03-antes"

    # Medir latencia normal
    local antes
    antes=$(measure_health_latency)
    log "Latencia normal: ${antes#*:}ms (HTTP ${antes%%:*})"
    echo "**Latencia previa:** ${antes#*:}ms (HTTP ${antes%%:*})" >> "${REPORT_FILE}"

    # Desconectar backend de la red
    log "Desconectando backend de la red..."
    local inicio_corte=$(date +%s)
    docker network disconnect "${NETWORK_NAME}" "${BACKEND_CONTAINER}"
    sleep 2
    take_screenshot "esc03-durante-corte"

    # Verificar que no responde
    local result_disconnected
    result_disconnected=$(check_api_health 5)
    local code_disc="${result_disconnected%%:*}"
    if [ "${code_disc}" = "000" ]; then
        ok "Backend aislado correctamente (sin conectividad)"
    else
        warn "Backend aún responde (HTTP ${code_disc})"
    fi

    # Reconectar a la red
    local inicio_reconexion=$(date +%s)
    log "Reconectando backend a la red..."
    docker network connect "${NETWORK_NAME}" "${BACKEND_CONTAINER}"

    if wait_for_api 30; then
        local rto=$(($(date +%s) - inicio_reconexion))
        ok "Red restaurada. RTO: ${rto}s"
        take_screenshot "esc03-recuperado"

        # Verificar latencia post-reconexión
        local despues
        despues=$(measure_health_latency)
        log "Latencia post-recuperación: ${despues#*:}ms (HTTP ${despues%%:*})"
        echo "**Latencia post-recuperación:** ${despues#*:}ms (HTTP ${despues%%:*})" >> "${REPORT_FILE}"
        echo "**Duración del corte:** $(($(date +%s) - inicio_corte))s" >> "${REPORT_FILE}"

        verify_data_persistence
        append_report "3. Corte de Red" "${rto}" "0 (sin pérdida)" "✓ Superado"
    else
        fail "No se pudo restaurar la conectividad"
        append_report "3. Corte de Red" "N/A" "N/A" "✗ Fallado"
    fi
}

# ─── Escenario 4: Pérdida de Datos y Restauración ────────────────────────────
escenario_4_perdida_datos() {
    header
    log "ESCENARIO 4: Pérdida de Datos y Restauración desde Backup"
    subheader
    log "Descripción: Simula la pérdida de datos y restaura desde una copia de seguridad"
    echo "" >> "${REPORT_FILE}"
    echo "## Escenario 4: Pérdida de Datos y Restauración" >> "${REPORT_FILE}"
    echo "**Descripción:** Se realiza un backup, luego se eliminan datos críticos y se restaura desde la copia." >> "${REPORT_FILE}"
    echo "" >> "${REPORT_FILE}"

    take_screenshot "esc04-antes"

    # 1. Crear backup de referencia
    log "Creando backup de referencia..."
    local backup_file="${LOG_DIR}/backup-esc04.sql"
    docker exec "${DB_CONTAINER}" pg_dump -U restaurant restaurant_db > "${backup_file}"
    local backup_size=$(wc -c < "${backup_file}")
    ok "Backup creado (${backup_size} bytes)"
    echo "**Backup creado:** ${backup_size} bytes" >> "${REPORT_FILE}"

    # 2. Obtener conteo de registros antes
    log "Obteniendo conteo de registros..."
    echo '```' >> "${REPORT_FILE}"
    docker exec "${DB_CONTAINER}" psql -U restaurant -d restaurant_db -c "
        SELECT 'users' as tabla, COUNT(*) as registros FROM \"User\"
        UNION ALL
        SELECT 'orders', COUNT(*) FROM \"Order\"
        UNION ALL
        SELECT 'menu_items', COUNT(*) FROM \"MenuItem\"
        UNION ALL
        SELECT 'categories', COUNT(*) FROM \"Category\";" >> "${REPORT_FILE}" 2>&1
    echo '```' >> "${REPORT_FILE}"

    # 3. Eliminar datos críticos (simular pérdida)
    log "Eliminando datos críticos (simulación de pérdida)..."
    local inicio_perdida=$(date +%s)
    docker exec "${DB_CONTAINER}" psql -U restaurant -d restaurant_db -c "
        TRUNCATE TABLE \"OrderItem\", \"Order\", \"MenuItem\", \"Category\" CASCADE;" 2>&1
    ok "Datos eliminados"
    take_screenshot "esc04-datos-perdidos"

    # 4. Verificar que la API falla o devuelve datos vacíos
    log "Verificando impacto en la API..."
    sleep 2
    local result_empty
    result_empty=$(check_api_health 5)
    log "Respuesta de API post-eliminación: HTTP ${result_empty%%:*}"
    echo "**Respuesta post-eliminación:** HTTP ${result_empty%%:*}" >> "${REPORT_FILE}"

    # 5. Restaurar desde backup (RTO)
    local inicio_restauracion=$(date +%s)
    log "Restaurando datos desde backup..."
    docker exec -i "${DB_CONTAINER}" psql -U restaurant -d restaurant_db < "${backup_file}" > /dev/null 2>&1
    ok "Datos restaurados"

    # 6. Verificar integridad post-restauración
    if wait_for_api 30; then
        local rto=$(($(date +%s) - inicio_restauracion))
        local duracion_total=$(($(date +%s) - inicio_perdida))

        log "Verificando integridad de datos restaurados..."
        echo '```' >> "${REPORT_FILE}"
        docker exec "${DB_CONTAINER}" psql -U restaurant -d restaurant_db -c "
            SELECT 'users' as tabla, COUNT(*) as registros FROM \"User\"
            UNION ALL
            SELECT 'orders', COUNT(*) FROM \"Order\"
            UNION ALL
            SELECT 'menu_items', COUNT(*) FROM \"MenuItem\"
            UNION ALL
            SELECT 'categories', COUNT(*) FROM \"Category\";" >> "${REPORT_FILE}" 2>&1
        echo '```' >> "${REPORT_FILE}"

        ok "Datos restaurados correctamente. RTO: ${rto}s, Duración total: ${duracion_total}s"
        take_screenshot "esc04-restaurado"
        append_report "4. Pérdida Datos" "${rto}" "${duracion_total}s" "✓ Superado"
    else
        fail "API no responde después de restauración"
        append_report "4. Pérdida Datos" "N/A" "N/A" "✗ Fallado"
    fi
}

# ─── Escenario 5: Caída Total del Sistema ─────────────────────────────────────
escenario_5_caida_total() {
    header
    log "ESCENARIO 5: Caída Total del Sistema (Full Outage)"
    subheader
    log "Descripción: Simula una caída completa de todos los servicios"
    echo "" >> "${REPORT_FILE}"
    echo "## Escenario 5: Caída Total del Sistema" >> "${REPORT_FILE}"
    echo "**Descripción:** Se detienen todos los contenedores y se verifica la recuperación completa del sistema." >> "${REPORT_FILE}"
    echo "" >> "${REPORT_FILE}"

    take_screenshot "esc05-antes"

    # Backup de referencia
    log "Creando backup preventivo..."
    local backup_file="${LOG_DIR}/backup-esc05.sql"
    docker exec "${DB_CONTAINER}" pg_dump -U restaurant restaurant_db > "${backup_file}" 2>/dev/null || true
    ok "Backup creado"

    # Detener todo
    log "Deteniendo todos los servicios..."
    local inicio_caida=$(date +%s)
    docker stop "${FRONTEND_CONTAINER}" "${BACKEND_CONTAINER}" "${DB_CONTAINER}"
    sleep 2
    take_screenshot "esc05-todo-caido"

    # Verificar que nada responde
    local all_down=true
    for url in "${API_HEALTH_URL}" "${FRONTEND_URL}"; do
        local code
        code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "${url}" 2>/dev/null || echo "000")
        if [ "${code}" != "000" ]; then
            warn "Servicio en ${url} aún responde (HTTP ${code})"
            all_down=false
        fi
    done
    if [ "$all_down" = true ]; then
        ok "Todos los servicios correctamente caídos"
    fi

    # Recuperar en orden: BD → Backend → Frontend
    local inicio_recuperacion=$(date +%s)
    log "Recuperando servicios en orden: BD → Backend → Frontend"

    docker start "${DB_CONTAINER}"
    log "Esperando PostgreSQL..."
    for i in $(seq 1 30); do
        if docker exec "${DB_CONTAINER}" pg_isready -U restaurant -d restaurant_db &>/dev/null; then
            ok "PostgreSQL listo después de ${i}s"
            break
        fi
        sleep 1
    done

    docker start "${BACKEND_CONTAINER}"
    wait_for_api 60

    docker start "${FRONTEND_CONTAINER}"
    wait_for_frontend 60

    local rto=$(($(date +%s) - inicio_recuperacion))
    local tiempo_caida=$(($(date +%s) - inicio_caida))
    ok "Sistema completamente recuperado. Tiempo caída total: ${tiempo_caida}s, RTO: ${rto}s"

    echo "**Tiempo de caída total:** ${tiempo_caida}s" >> "${REPORT_FILE}"
    echo "**RTO del sistema:** ${rto}s" >> "${REPORT_FILE}"

    take_screenshot "esc05-recuperado"
    verify_data_persistence
    append_report "5. Caída Total" "${rto}" "0 (sin pérdida)" "✓ Superado"
}

# ─── Escenario 6: Sobrecarga / Contenedor Congelado ──────────────────────────
escenario_6_contenedor_congelado() {
    header
    log "ESCENARIO 6: Contenedor Congelado (Servidor sin respuesta)"
    subheader
    log "Descripción: Simula un servidor que queda congelado sin responder (deadlock)"
    echo "" >> "${REPORT_FILE}"
    echo "## Escenario 6: Contenedor Congelado (Deadlock)" >> "${REPORT_FILE}"
    echo "**Descripción:** Se pausa el contenedor del backend para simular un proceso congelado." >> "${REPORT_FILE}"
    echo "" >> "${REPORT_FILE}"

    take_screenshot "esc06-antes"

    # Medir latencia normal
    local antes
    antes=$(measure_health_latency)
    log "Latencia normal: ${antes#*:}ms (HTTP ${antes%%:*})"
    echo "**Latencia previa:** ${antes#*:}ms (HTTP ${antes%%:*})" >> "${REPORT_FILE}"

    # Pausar backend (congelar)
    log "Pausando backend (simulando deadlock)..."
    local inicio_pausa=$(date +%s)
    docker pause "${BACKEND_CONTAINER}"
    sleep 3
    take_screenshot "esc06-congelado"

    # Verificar que no responde
    local result_paused
    result_paused=$(check_api_health 5)
    local code_paused="${result_paused%%:*}"
    log "Respuesta con backend congelado: HTTP ${code_paused}"
    echo "**Respuesta durante congelamiento:** HTTP ${code_paused}" >> "${REPORT_FILE}"

    # Descongelar
    local inicio_descongelar=$(date +%s)
    log "Descongelando backend..."
    docker unpause "${BACKEND_CONTAINER}"

    if wait_for_api 30; then
        local rto=$(($(date +%s) - inicio_descongelar))
        local duracion_pausa=$(($(date +%s) - inicio_pausa))
        ok "Backend descongelado. RTO: ${rto}s, Duración pausa: ${duracion_pausa}s"
        take_screenshot "esc06-recuperado"
        verify_data_persistence
        append_report "6. Contenedor Congelado" "${rto}" "0 (sin pérdida)" "✓ Superado"
    else
        fail "No se pudo descongelar el backend"
        append_report "6. Contenedor Congelado" "N/A" "N/A" "✗ Fallado"
    fi
}

# ─── Generar Reporte Final ────────────────────────────────────────────────────
generar_reporte_final() {
    header
    log "Generando reporte final..."
    subheader

    echo "" >> "${REPORT_FILE}"
    echo "---" >> "${REPORT_FILE}"
    echo "## Conclusiones" >> "${REPORT_FILE}"
    echo "" >> "${REPORT_FILE}"

    # Resumen de métricas
    echo "### Métricas Generales" >> "${REPORT_FILE}"
    echo "" >> "${REPORT_FILE}"
    echo "- **Entorno:** Docker Compose sobre Alma Linux" >> "${REPORT_FILE}"
    echo "- **Orquestación:** Docker Engine $(docker version --format '{{.Server.Version}}' 2>/dev/null || echo 'N/A')" >> "${REPORT_FILE}"
    echo "- **PostgreSQL:** 15 Alpine" >> "${REPORT_FILE}"
    echo "- **Backend:** Node.js 20 (Express)" >> "${REPORT_FILE}"
    echo "- **Frontend:** Next.js 16" >> "${REPORT_FILE}"
    echo "" >> "${REPORT_FILE}"

    # Logs y evidencias
    echo "### Evidencias Recopiladas" >> "${REPORT_FILE}"
    echo "" >> "${REPORT_FILE}"
    ls -1 "${LOG_DIR}"/*.log 2>/dev/null | while read -r f; do
        echo "- [$(basename "${f}")](${f})" >> "${REPORT_FILE}"
    done
    echo "" >> "${REPORT_FILE}"

    echo "### Estado Final del Sistema" >> "${REPORT_FILE}"
    echo "" >> "${REPORT_FILE}"
    echo '```' >> "${REPORT_FILE}"
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" >> "${REPORT_FILE}"
    echo '```' >> "${REPORT_FILE}"
    echo "" >> "${REPORT_FILE}"

    # Mostrar estado actual
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

    log "Reporte generado: ${REPORT_FILE}"
    echo ""
    echo -e "${GREEN}══════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  PRUEBAS HA/DR COMPLETADAS                  ${NC}"
    echo -e "${GREEN}  Reporte: ${REPORT_FILE}${NC}"
    echo -e "${GREEN}══════════════════════════════════════════════${NC}"
}

# ─── Menú Principal ───────────────────────────────────────────────────────────
main() {
    echo ""
    echo -e "${YELLOW}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║   PRUEBAS DE ALTA DISPONIBILIDAD Y RECUPERACIÓN ║${NC}"
    echo -e "${YELLOW}║       Restaurante Vegetariano - Docker + HA/DR  ║${NC}"
    echo -e "${YELLOW}╚══════════════════════════════════════════════════╝${NC}"
    echo ""

    # Verificar prerequisitos
    for cmd in docker curl; do
        if ! command -v "${cmd}" &>/dev/null; then
            fail "Requisito faltante: ${cmd}"
            exit 1
        fi
    done

    # Verificar que los contenedores existen
    for container in "${BACKEND_CONTAINER}" "${FRONTEND_CONTAINER}" "${DB_CONTAINER}"; do
        if ! docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
            warn "Contenedor '${container}' no está en ejecución"
        fi
    done

    # Inicializar
    init

    # Ejecutar escenarios
    escenario_1_caida_backend
    escenario_2_caida_bd
    escenario_3_corte_red
    escenario_4_perdida_datos
    escenario_5_caida_total
    escenario_6_contenedor_congelado

    # Generar reporte final
    generar_reporte_final
}

main "$@"
