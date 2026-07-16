#!/usr/bin/env bash
# =============================================================================
# Script de Backup y Restauración - Restaurante Vegetariano
# =============================================================================
set -euo pipefail

# ─── Configuración ───────────────────────────────────────────────────────────
DB_CONTAINER="restaurant-postgres"
BACKEND_CONTAINER="restaurant-backend"
BACKUP_DIR="./backups/postgres"
RETENTION_DAYS=7
DB_NAME="restaurant_db"
DB_USER="restaurant"

# ─── Colores ─────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} $*"; }
ok()  { echo -e "  ${GREEN}✓${NC} $*"; }
fail(){ echo -e "  ${RED}✗${NC} $*"; }

# ─── Verificar entorno ───────────────────────────────────────────────────────
check_env() {
    if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
        fail "Contenedor ${DB_CONTAINER} no está en ejecución"
        exit 1
    fi
    mkdir -p "${BACKUP_DIR}"
}

# ─── Crear Backup ────────────────────────────────────────────────────────────
create_backup() {
    local timestamp
    timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_file="${BACKUP_DIR}/${DB_NAME}-${timestamp}.sql.gz"
    local backup_info="${BACKUP_DIR}/${DB_NAME}-${timestamp}.info"

    log "Iniciando backup de ${DB_NAME}..."

    # Backup completo
    local start=$(date +%s%N)
    docker exec "${DB_CONTAINER}" pg_dump \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges \
        --verbose 2>"${backup_info}" | gzip > "${backup_file}"

    local end=$(date +%s%N)
    local elapsed_ms=$(( (end - start) / 1000000 ))
    local file_size=$(du -h "${backup_file}" | cut -f1)

    ok "Backup completado: ${backup_file} (${file_size}) en ${elapsed_ms}ms"

    # Verificar integridad
    log "Verificando integridad del backup..."
    gunzip -t "${backup_file}" && ok "Integridad verificada" || fail "Backup corrupto"

    # Métricas
    cat > "${backup_info}" <<-EOF
Backup del: $(date '+%Y-%m-%d %H:%M:%S')
Base de datos: ${DB_NAME}
Tamaño: ${file_size}
Duración: ${elapsed_ms}ms
Archivo: $(basename "${backup_file}")
EOF

    # Limpiar backups antiguos
    cleanup_old_backups
}

# ─── Restaurar Backup ────────────────────────────────────────────────────────
restore_backup() {
    local backup_file="${1:-}"
    
    if [ -z "${backup_file}" ]; then
        # Usar el backup más reciente
        backup_file=$(ls -t "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | head -1)
        if [ -z "${backup_file}" ]; then
            fail "No se encontraron backups en ${BACKUP_DIR}"
            exit 1
        fi
        log "Usando backup más reciente: ${backup_file}"
    fi

    if [ ! -f "${backup_file}" ]; then
        fail "Archivo de backup no encontrado: ${backup_file}"
        exit 1
    fi

    # Confirmar restauración
    echo -n "¿Restaurar ${backup_file}? Se perderán datos actuales. (s/N): "
    read -r confirm
    if [ "${confirm}" != "s" ] && [ "${confirm}" != "S" ]; then
        log "Restauración cancelada"
        exit 0
    fi

    log "Iniciando restauración desde: ${backup_file}..."

    # Detener backend mientras se restaura
    log "Deteniendo backend para evitar escrituras concurrentes..."
    docker stop "${BACKEND_CONTAINER}" 2>/dev/null || true
    sleep 2

    # Restaurar
    local start=$(date +%s%N)
    gunzip -c "${backup_file}" | docker exec -i "${DB_CONTAINER}" psql \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        --quiet 2>&1 || {
        fail "Error durante la restauración"
        docker start "${BACKEND_CONTAINER}" 2>/dev/null || true
        exit 1
    }
    local end=$(date +%s%N)
    local elapsed_ms=$(( (end - start) / 1000000 ))

    ok "Restauración completada en ${elapsed_ms}ms"

    # Verificar restauración
    log "Verificando restauración..."
    local table_count
    table_count=$(docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c \
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    ok "${table_count} tablas restauradas"

    # Reiniciar backend
    log "Reiniciando backend..."
    docker start "${BACKEND_CONTAINER}" 2>/dev/null || true

    # Verificar que la API responde
    log "Verificando API..."
    for i in $(seq 1 30); do
        if curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
            ok "API operativa después de la restauración"
            break
        fi
        if [ "$i" -eq 30 ]; then
            fail "API no responde después de la restauración"
        fi
        sleep 2
    done
}

# ─── Listar Backups ──────────────────────────────────────────────────────────
list_backups() {
    if [ ! -d "${BACKUP_DIR}" ] || [ -z "$(ls -A "${BACKUP_DIR}" 2>/dev/null)" ]; then
        log "No hay backups disponibles"
        return
    fi

    log "Backups disponibles:"
    echo ""
    printf "%-30s %-10s %-20s\n" "ARCHIVO" "TAMAÑO" "FECHA"
    printf "%-30s %-10s %-20s\n" "------" "------" "-----"
    for f in "${BACKUP_DIR}"/*.sql.gz; do
        if [ -f "${f}" ]; then
            local name
            name=$(basename "${f}")
            local size
            size=$(du -h "${f}" | cut -f1)
            local date
            date=$(date -r "${f}" '+%Y-%m-%d %H:%M' 2>/dev/null || echo "N/A")
            printf "%-30s %-10s %-20s\n" "${name}" "${size}" "${date}"
        fi
    done
    echo ""
    ok "$(ls -1 "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | wc -l) backups encontrados"
}

# ─── Limpiar Backups Antiguos ────────────────────────────────────────────────
cleanup_old_backups() {
    local deleted=0
    while IFS= read -r -d '' f; do
        rm -f "${f}"
        rm -f "${f%.gz}.info" 2>/dev/null || true
        deleted=$((deleted + 1))
    done < <(find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -print0)

    if [ "${deleted}" -gt 0 ]; then
        log "Backups antiguos eliminados: ${deleted}"
    fi
}

# ─── Backup Automático (para cron) ───────────────────────────────────────────
auto_backup() {
    check_env
    create_backup
    # Rotar: mantener solo los últimos 7
    ls -t "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | tail -n +$((RETENTION_DAYS + 1)) | while read -r f; do
        rm -f "${f}"
        rm -f "${f%.gz}.info" 2>/dev/null || true
    done
    ok "Backup automático completado. Rotación: mantener últimos ${RETENTION_DAYS}"
}

# ─── Menú ────────────────────────────────────────────────────────────────────
menu() {
    echo ""
    echo "╔══════════════════════════════════════╗"
    echo "║   BACKUP & RESTORE - RESTAURANT VEG  ║"
    echo "╚══════════════════════════════════════╝"
    echo ""
    echo "1) Crear backup manual"
    echo "2) Restaurar desde backup"
    echo "3) Listar backups"
    echo "4) Backup automático (para cron)"
    echo "5) Salir"
    echo ""
    echo -n "Seleccione una opción [1-5]: "
}

# ─── Main ────────────────────────────────────────────────────────────────────
main() {
    check_env

    case "${1:-menu}" in
        backup|create|1)
            create_backup
            ;;
        restore|2)
            restore_backup "${2:-}"
            ;;
        list|ls|3)
            list_backups
            ;;
        auto|cron|4)
            auto_backup
            ;;
        *)
            while true; do
                menu
                read -r opt
                case "${opt}" in
                    1) create_backup ;;
                    2) restore_backup ;;
                    3) list_backups ;;
                    4) auto_backup ;;
                    5) log "Saliendo..."; exit 0 ;;
                    *) echo "Opción inválida" ;;
                esac
            done
            ;;
    esac
}

main "$@"
