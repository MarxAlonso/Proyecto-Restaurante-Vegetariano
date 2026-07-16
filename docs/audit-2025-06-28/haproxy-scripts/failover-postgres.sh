#!/usr/bin/env bash
set -euo pipefail

# ============================================
# failover-postgres.sh — Promover Standby a Primary
# ============================================

LOG_FILE="/var/log/postgresql/failover-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "${LOG_FILE}") 2>&1

echo "[FAILOVER] Iniciando failover de PostgreSQL — $(date)"

PRIMARY_IP="10.0.0.30"
if pg_isready -h "${PRIMARY_IP}" -q 2>/dev/null; then
  echo "[FAILOVER] ❌ El primario (${PRIMARY_IP}) sigue respondiendo. Abortando."
  exit 1
fi
echo "[FAILOVER] ✅ Confirmado: primario ${PRIMARY_IP} no responde"

PROMOTED=$(sudo -u postgres psql -t -c "SELECT pg_is_in_recovery();" 2>/dev/null | tr -d ' ')
if [[ "${PROMOTED}" == "t" ]]; then
  sudo -u postgres pg_ctl promote -D /var/lib/pgsql/16/data/
  echo "[FAILOVER] ✅ Standby promovido a primario"
else
  echo "[FAILOVER] ❌ Este nodo ya es primario o no está en recovery"
fi

if command -v haproxy &>/dev/null; then
  echo "set server api_servers/pg-primary addr $(hostname -I | awk '{print $1}') port 5432" | \
    socat stdio /run/haproxy/admin.sock 2>/dev/null || true
fi

cat >> /var/log/postgresql/failover-history.log <<EOF
[$(date +%Y-%m-%dT%H:%M:%S%z)] FAILOVER: Primario ${PRIMARY_IP} → $(hostname)
EOF

SLACK_WEBHOOK="${SLACK_WEBHOOK_URL:-}"
if [[ -n "${SLACK_WEBHOOK}" ]]; then
  curl -s -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"🚨 *PostgreSQL Failover* — Primario caído. Nuevo primario: \`$(hostname)\`\"}" \
    "${SLACK_WEBHOOK}" &
fi

echo "[FAILOVER] ✅ Completado en $(date)"
echo "[FAILOVER] 📝 Log: ${LOG_FILE}"
