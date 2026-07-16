#!/usr/bin/env bash
# check-hadr.sh — Verificar estado del cluster HA

VIP="10.0.0.100"

echo "============================================"
echo "  HADR Health Check — $(date)"
echo "============================================"
echo ""

# VIP
if ping -c 1 -W 1 "${VIP}" &>/dev/null; then
  echo "[OK]    VIP ${VIP} responde"
else
  echo "[FAIL]  VIP ${VIP} NO responde"
fi

# HAProxy
if systemctl is-active --quiet haproxy; then
  echo "[OK]    HAProxy activo"
  if command -v socat &>/dev/null; then
    echo "show stat" | socat stdio /run/haproxy/admin.sock 2>/dev/null | \
      awk -F, '{if(NR>1) printf "        → %s: %s\n", $2, $18}'
  fi
else
  echo "[FAIL]  HAProxy INACTIVO"
fi

# PostgreSQL
if pg_isready -q 2>/dev/null; then
  IN_RECOVERY=$(sudo -u postgres psql -t -c "SELECT pg_is_in_recovery();" 2>/dev/null | tr -d ' ')
  if [[ "${IN_RECOVERY}" == "f" ]]; then
    echo "[OK]    PostgreSQL activo (PRIMARIO)"
  else
    echo "[OK]    PostgreSQL activo (STANDBY)"
    sudo -u postgres psql -c "SELECT pid, state, sync_state, pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) as lag_bytes FROM pg_stat_replication;" 2>/dev/null || true
  fi
else
  echo "[FAIL]  PostgreSQL INACTIVO"
fi

# API
for PORT in 3001; do
  if curl -sf "http://localhost:${PORT}/api/health" &>/dev/null; then
    echo "[OK]    API puerto ${PORT} responde"
  else
    echo "[FAIL]  API puerto ${PORT} NO responde"
  fi
done
