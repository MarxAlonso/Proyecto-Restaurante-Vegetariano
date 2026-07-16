#!/usr/bin/env bash
set -euo pipefail

# ============================================
# setup-postgres-replication.sh
# Uso:
#   Primary: ./setup-postgres-replication.sh primary
#   Standby: ./setup-postgres-replication.sh standby 10.0.0.30
# ============================================

ROLE="${1:-primary}"
PRIMARY_IP="${2:-10.0.0.30}"
PG_VERSION="16"
PGDATA="/var/lib/pgsql/${PG_VERSION}/data"
REPL_USER="replicator"
REPL_PASSWORD="${REPL_PASSWORD:-$(openssl rand -base64 32)}"

if [[ "${ROLE}" == "primary" ]]; then
  echo "[PG] Configurando nodo PRIMARY..."

  sudo -u postgres psql -c "CREATE USER ${REPL_USER} WITH REPLICATION PASSWORD '${REPL_PASSWORD}';"

  cat >> "${PGDATA}/pg_hba.conf" <<EOF
host    replication     ${REPL_USER}      10.0.0.0/24           md5
host    all             ${REPL_USER}      10.0.0.0/24           md5
EOF

  cat >> "${PGDATA}/postgresql.conf" <<EOF
listen_addresses = '*'
wal_level = replica
max_wal_senders = 5
wal_keep_size = 1024
hot_standby = on
max_connections = 200
shared_buffers = 512MB
effective_cache_size = 1536MB
work_mem = 16MB
maintenance_work_mem = 128MB
random_page_cost = 1.1
effective_io_concurrency = 200
EOF

  systemctl restart postgresql-${PG_VERSION}
  echo "[PG] ✅ Primary configurado. IP: $(hostname -I)"
  echo "[PG] 🔑 Contraseña replicador: ${REPL_PASSWORD}"

elif [[ "${ROLE}" == "standby" ]]; then
  echo "[PG] Configurando nodo STANDBY desde ${PRIMARY_IP}..."

  systemctl stop postgresql-${PG_VERSION}
  rm -rf "${PGDATA}/"*

  sudo -u postgres pg_basebackup \
    -h "${PRIMARY_IP}" \
    -D "${PGDATA}" \
    -U "${REPL_USER}" \
    -P -v -R \
    -X stream

  echo "hot_standby = on" >> "${PGDATA}/postgresql.conf"

  cat >> "${PGDATA}/pg_hba.conf" <<EOF
host    all             all              10.0.0.0/24           md5
EOF

  systemctl start postgresql-${PG_VERSION}

  sleep 3
  sudo -u postgres psql -c "SELECT pg_is_in_recovery();"

  echo "[PG] ✅ Standby configurado conectado a ${PRIMARY_IP}"
fi
