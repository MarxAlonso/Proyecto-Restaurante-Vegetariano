#!/usr/bin/env bash
# pg-init-primary.sh — Inicialización del nodo Primary de PostgreSQL
set -e

# Crear usuario de replicación
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER replicator WITH REPLICATION PASSWORD 'replicator_pass';
EOSQL

# Configurar pg_hba.conf
cat >> "$PGDATA/pg_hba.conf" <<EOF
host    replication     replicator      10.0.0.0/24           md5
host    all             replicator      10.0.0.0/24           md5
EOF

# Configurar postgresql.conf para replicación
cat >> "$PGDATA/postgresql.conf" <<EOF
wal_level = replica
max_wal_senders = 5
wal_keep_size = 1024
hot_standby = on
max_connections = 200
shared_buffers = 256MB
EOF
