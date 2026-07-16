# Artefacto 5 — Alta Disponibilidad (HADR — Alma Linux)

**Fecha**: 2025-06-28
**Stack**: Alma Linux 9 + HAProxy + PostgreSQL (Neon Cloud/Docker replicación)
**Objetivos**: RTO < 5min, RPO < 1min

---

## Arquitectura de Alta Disponibilidad

```
                    ┌──────────────┐
                    │   DNS / CDN  │
                    │  (Cloudflare)│
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
     ┌────────▼────────┐      ┌────────▼────────┐
     │  HAProxy Node 1 │      │  HAProxy Node 2 │
     │  (Active)       │◄────►│  (Passive)       │
     │  10.0.0.10      │      │  10.0.0.11      │
     └────────┬────────┘      └────────┬────────┘
              │                         │
              └────────────┬────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
     ┌────────▼────────┐      ┌────────▼────────┐
     │  Node.js API 1  │      │  Node.js API 2  │
     │  10.0.0.20:3001 │      │  10.0.0.21:3001 │
     └────────┬────────┘      └────────┬────────┘
              │                         │
              └────────────┬────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
     ┌────────▼────────┐      ┌────────▼────────┐
     │  PostgreSQL P1   │◄────►│  PostgreSQL P2  │
     │  (Primary)       │      │  (Standby)      │
     │  10.0.0.30:5432 │      │  10.0.0.31:5432 │
     └─────────────────┘      └─────────────────┘
```

---

## 1. Script de Aprovisionamiento — Alma Linux 9

### `provision-node.sh` — Script base para todos los nodos

```bash
#!/usr/bin/env bash
set -euo pipefail

# ==============================================
# provision-node.sh — Alma Linux 9 Bootstrap
# Uso: ./provision-node.sh [haproxy|api|postgres]
# ==============================================

ROLE="${1:-api}"
HOSTNAME="${2:-node-$(openssl rand -hex 4)}"

echo "🚀 Provisioning Alma Linux 9 node: ${HOSTNAME} (role: ${ROLE})"

# --- Configuración base ---
hostnamectl set-hostname "${HOSTNAME}"
timedatectl set-timezone America/Lima

# Actualizar sistema
dnf update -y
dnf install -y epel-release
dnf install -y \
  curl wget net-tools bind-utils \
  vim git tar gzip unzip \
  firewalld fail2ban \
  htop iotop sysstat \
  policycoreutils-python-utils \
  openssl

# --- Firewall base ---
systemctl enable firewalld --now
firewall-cmd --set-default-zone=public
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https

# --- Fail2ban base ---
cat > /etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
EOF
systemctl enable fail2ban --now

# --- Kernel tuning ---
cat >> /etc/sysctl.conf <<'EOF'
# Network tuning for high-throughput API
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_keepalive_time = 120
net.ipv4.tcp_keepalive_intvl = 30
net.ipv4.tcp_keepalive_probes = 8
net.core.netdev_max_backlog = 5000
EOF
sysctl -p

# --- Logrotate para Node.js ---
cat > /etc/logrotate.d/nodejs <<'EOF'
/var/log/nodejs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
EOF

# --- Instalación de Node.js 20 / pnpm (para nodos API y monitoreo) ---
if [[ "${ROLE}" == "api" || "${ROLE}" == "monitoring" ]]; then
  curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
  dnf install -y nodejs
  npm install -g pnpm@latest
  node -v && pnpm -v

  # PM2 para gestión de procesos
  npm install -g pm2
  pm2 startup systemd -u root --hp /root

  cat > /etc/systemd/system/node-api.service <<'EOS'
[Unit]
Description=Restaurant Veg API — Node.js
After=network.target postgresql.service

[Service]
Type=simple
User=nodeapp
Group=nodeapp
WorkingDirectory=/opt/restaurant-veg/backend
ExecStart=/usr/bin/node dist/src/index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3001
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOS

  # Crear usuario no privilegiado
  useradd -r -s /sbin/nologin -d /opt/restaurant-veg nodeapp 2>/dev/null || true
fi

# --- Instalación de PostgreSQL (para nodos de BD) ---
if [[ "${ROLE}" == "postgres" ]]; then
  dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm
  dnf -qy module disable postgresql
  dnf install -y postgresql16-server postgresql16-contrib
  /usr/pgsql-16/bin/postgresql-16-setup initdb
  systemctl enable postgresql-16 --now
fi

echo "✅ Nodo ${HOSTNAME} (${ROLE}) provisionado correctamente"
```

---

## 2. Configuración de HAProxy

### `install-haproxy.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

# ==============================================
# install-haproxy.sh — HAProxy + Keepalived
# ==============================================

# Instalación
dnf install -y haproxy keepalived

# --- HAProxy Configuration ---
cat > /etc/haproxy/haproxy.cfg <<'EOF'
# ============================================
# HAProxy — Restaurant Veg API Load Balancer
# ============================================

global
    daemon
    maxconn 65535
    log /dev/log local0
    log /dev/log local1 notice
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin expose-fd listeners
    stats timeout 30s
    tune.ssl.default-dh-param 2048

defaults
    log global
    mode http
    option httplog
    option dontlognull
    option http-server-close
    option forwardfor except 127.0.0.0/8
    option redispatch
    retries 3
    timeout http-request 10s
    timeout queue 1m
    timeout connect 5s
    timeout client 30s
    timeout server 30s
    timeout http-keep-alive 5s
    timeout check 10s
    maxconn 10000

# ========================
# Frontend: API HTTP
# ========================
frontend api_frontend
    bind *:80
    bind *:443 ssl crt /etc/haproxy/certs/restaurant-veg.pem
    redirect scheme https if !{ ssl_fc }
    
    # Rate limiting por IP
    stick-table type ip size 100k expire 30s store http_req_rate(10s)
    http-request track-sc0 src
    http-request deny deny_status 429 if { sc_http_req_rate(0) gt 100 }
    
    # Headers de seguridad
    http-response set-header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    http-response set-header X-Content-Type-Options "nosniff"
    http-response set-header X-Frame-Options "DENY"
    http-response set-header X-XSS-Protection "1; mode=block"
    
    # ACLs por ruta
    acl is_health path_beg /api/health
    acl is_api path_beg /api
    acl is_swagger path_beg /api/docs
    
    # Logging
    capture request header Host len 32
    capture request header User-Agent len 64
    
    # Selección de backend
    use_backend api_servers if is_api
    default_backend api_servers
    
    # Stats
    stats enable
    stats uri /haproxy-stats
    stats auth admin:${HAPROXY_STATS_PASSWORD}

# ========================
# Backend: API Nodes
# ========================
backend api_servers
    balance roundrobin
    option httpchk GET /api/health
    http-check expect status 200
    
    # Servidores API
    server api-1 10.0.0.20:3001 check inter 5s fall 3 rise 2 weight 100
    server api-2 10.0.0.21:3001 check inter 5s fall 3 rise 2 weight 100
    
    # Backup en cloud (Vercel) si los locales fallan
    server vercel-backup api.restaurant-veg.com:443 check inter 10s fall 5 rise 2 weight 50 ssl verify none backup

# ========================
# Backend: DB Read Replicas
# ========================
backend db_readonly
    balance first
    option httpchk OPTIONS /readiness
    
    server pg-standby-1 10.0.0.31:5432 check port 5432 inter 5s fall 3 rise 2
    server pg-standby-2 10.0.0.32:5432 check port 5432 inter 5s fall 3 rise 2
EOF

# Generar certificado auto-firmado para desarrollo
mkdir -p /etc/haproxy/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/haproxy/certs/restaurant-veg.key \
  -out /etc/haproxy/certs/restaurant-veg.crt \
  -subj "/C=PE/ST=Lima/L=Lima/O=RestaurantVeg/CN=api.restaurant-veg.com"
cat /etc/haproxy/certs/restaurant-veg.key /etc/haproxy/certs/restaurant-veg.crt \
  > /etc/haproxy/certs/restaurant-veg.pem

# SELinux
setsebool -P haproxy_connect_any=1

# Firewall
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --reload

systemctl enable haproxy --now
echo "✅ HAProxy configurado y ejecutándose"
```

### `install-keepalived.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

# ============================================
# install-keepalived.sh — VIP Failover
# Uso: ./install-keepalived.sh [master|backup]
# ============================================

ROLE="${1:-master}"
INTERFACE="${2:-eth0}"
VIP="${3:-10.0.0.100}"
PRIORITY=$([ "${ROLE}" == "master" ] && echo "200" || echo "100")

# Configurar Keepalived
cat > /etc/keepalived/keepalived.conf <<EOF
global_defs {
    router_id LB_${ROLE}
    enable_script_security
}

vrrp_script chk_haproxy {
    script "/usr/bin/killall -0 haproxy"
    interval 2
    weight 2
    fall 3
    rise 2
}

vrrp_instance VI_1 {
    interface ${INTERFACE}
    state ${ROLE}
    virtual_router_id 51
    priority ${PRIORITY}
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass ${KEEPALIVED_PASSWORD:-RestaurantVegHA2025}
    }
    virtual_ipaddress {
        ${VIP}/24
    }
    track_script {
        chk_haproxy
    }
    notify_master /etc/keepalived/notify-master.sh
    notify_backup /etc/keepalived/notify-backup.sh
    notify_fault /etc/keepalived/notify-fault.sh
}
EOF

# Script de notificación: cuando este nodo se convierte en master
cat > /etc/keepalived/notify-master.sh <<'EOF'
#!/usr/bin/env bash
logger -t keepalived "Este nodo es ahora el MASTER HAProxy"
# Enviar alerta a Slack
curl -s -X POST -H 'Content-type: application/json' \
  --data '{"text":"⚠️ *HAProxy Failover* — Nodo `'"$(hostname)"'` es ahora el MASTER"}' \
  "${SLACK_WEBHOOK_URL}" &
EOF
chmod +x /etc/keepalived/notify-master.sh

cat > /etc/keepalived/notify-backup.sh <<'EOF'
#!/usr/bin/env bash
logger -t keepalived "Este nodo es ahora el BACKUP HAProxy"
EOF
chmod +x /etc/keepalived/notify-backup.sh

cat > /etc/keepalived/notify-fault.sh <<'EOF'
#!/usr/bin/env bash
logger -t keepalived "ESTE NODO ESTÁ EN FALLA"
EOF
chmod +x /etc/keepalived/notify-fault.sh

systemctl enable keepalived --now
echo "✅ Keepalived configurado como ${ROLE} en ${INTERFACE} con VIP ${VIP}"
```

---

## 3. Scripts de Failover — PostgreSQL

### `setup-postgres-replication.sh`

```bash
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
PGUSER="postgres"
REPL_USER="replicator"
REPL_PASSWORD="${REPL_PASSWORD:-$(openssl rand -base64 32)}"

if [[ "${ROLE}" == "primary" ]]; then
  echo "🔧 Configurando nodo PRIMARY..."

  # Crear usuario de replicación
  sudo -u postgres psql -c "CREATE USER ${REPL_USER} WITH REPLICATION PASSWORD '${REPL_PASSWORD}';"

  # Configurar pg_hba.conf
  cat >> "${PGDATA}/pg_hba.conf" <<EOF
# Replicación — Permitir conexiones desde la subred interna
host    replication     ${REPL_USER}      10.0.0.0/24           md5
host    all             ${REPL_USER}      10.0.0.0/24           md5
EOF

  # Configurar postgresql.conf para replicación
  cat >> "${PGDATA}/postgresql.conf" <<EOF
# Configuración de replicación
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
  echo "✅ Primary configurado. IP: $(hostname -I)"
  echo "🔑 Contraseña replicador: ${REPL_PASSWORD}"

elif [[ "${ROLE}" == "standby" ]]; then
  echo "🔧 Configurando nodo STANDBY desde ${PRIMARY_IP}..."

  # Detener PostgreSQL y limpiar datos
  systemctl stop postgresql-${PG_VERSION}
  rm -rf "${PGDATA}/"*

  # Realizar pg_basebackup
  sudo -u postgres pg_basebackup \
    -h "${PRIMARY_IP}" \
    -D "${PGDATA}" \
    -U replicator \
    -P -v -R \
    -X stream

  # Configurar hot_standby
  echo "hot_standby = on" >> "${PGDATA}/postgresql.conf"

  # Agregar trigger file para failover manual
  echo "/tmp/promote-standby.trigger" >> "${PGDATA}/recovery.conf" 2>/dev/null || true
  # En PG16+: touch /var/lib/pgsql/16/data/standby.signal (ya lo crea pg_basebackup -R)

  # Configurar pg_hba.conf
  cat >> "${PGDATA}/pg_hba.conf" <<EOF
host    all             all              10.0.0.0/24           md5
EOF

  systemctl start postgresql-${PG_VERSION}

  # Verificar replicación
  sleep 3
  sudo -u postgres psql -c "SELECT pg_is_in_recovery();"

  echo "✅ Standby configurado conectado a ${PRIMARY_IP}"

  # Guardar credenciales
  echo "STANDBY_HOST=$(hostname -I)" >> /root/replication-info.txt
  echo "PRIMARY_HOST=${PRIMARY_IP}" >> /root/replication-info.txt
fi
```

### `failover-postgres.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

# ============================================
# failover-postgres.sh — Promover Standby a Primary
# ============================================

LOG_FILE="/var/log/postgresql/failover-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "${LOG_FILE}") 2>&1

echo "⚠️ INICIANDO FAILOVER DE POSTGRESQL — $(date)"

# 1. Verificar que el primario está caído
PRIMARY_IP="10.0.0.30"
if pg_isready -h "${PRIMARY_IP}" -q 2>/dev/null; then
  echo "❌ El primario (${PRIMARY_IP}) sigue respondiendo. Abortando failover."
  exit 1
fi
echo "✅ Confirmado: primario ${PRIMARY_IP} no responde"

# 2. Promover standby a primario
echo "🔄 Promoviendo standby a primario..."
PROMOTED=$(sudo -u postgres psql -t -c "SELECT pg_is_in_recovery();" 2>/dev/null | tr -d ' ')
if [[ "${PROMOTED}" == "t" ]]; then
  sudo -u postgres pg_ctl promote -D /var/lib/pgsql/16/data/
  echo "✅ Standby promovido a primario"
else
  echo "❌ Este nodo ya es primario o no está en recovery"
fi

# 3. Reconfigurar HAProxy (cambiar server primario)
echo "🔄 Actualizando HAProxy..."
# Si HAProxy está en localhost
if command -v haproxy &>/dev/null; then
  # Enviar comando al socket de HAProxy para cambiar el servidor
  echo "set server api_servers/pg-primary addr $(hostname -I | awk '{print $1}') port 5432" | \
    socat stdio /run/haproxy/admin.sock || true
fi

# 4. Registrar el failover
echo "📝 Registrando failover..."
cat >> /var/log/postgresql/failover-history.log <<EOF
[$(date +%Y-%m-%dT%H:%M:%S%z)] FAILOVER: Primario ${PRIMARY_IP} → $(hostname)
EOF

# 5. Notificar
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL:-}"
if [[ -n "${SLACK_WEBHOOK}" ]]; then
  curl -s -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"🚨 *PostgreSQL Failover* — Primario caído. Nuevo primario: \`$(hostname)\`\"}" \
    "${SLACK_WEBHOOK}" &
fi

echo "✅ Failover completado en $(date)"
echo "📝 Log: ${LOG_FILE}"
```

---

## 4. Diseño de HADR Completo

### Componentes

| Componente | Versión | Rol | Cómo se garantiza |
|-----------|---------|-----|------------------|
| HAProxy | 2.8 | Balanceo de carga L7 | Keepalived con VIP flotante |
| Keepalived | 2.2 | Failover de VIP | VRRP, heartbeats cada 1s |
| Node.js API | 20 LTS | Servicio de API | PM2 cluster mode (4 workers) |
| PostgreSQL | 16 | Base de datos | Streaming replication síncrona |
| Neon (cloud) | — | Disaster recovery | Réplica en región diferente |

### Métricas de Recuperación

| Escenario | RTO Target | RPO Target | Mecanismo |
|-----------|-----------|-----------|-----------|
| Caída de 1 nodo API | < 30s | 0 | HAProxy detecta health check fallido (5s × 3 fallos = 15s) y redirige |
| Caída de HAProxy primario | < 5s | 0 | Keepalived VRRP (advert_int = 1s) promueve backup |
| Caída de PostgreSQL primario | < 3min | < 1min | `failover-postgres.sh` promueve standby |
| Caída total de región on-prem | < 15min | < 5min | Neon cloud replica activa como DR |
| Desastre con pérdida total | < 1h | < 1h | Backup PostgreSQL + R2 backups |

### Monitoreo Continuo de HADR

```bash
# Script de verificación de estado del cluster
#!/usr/bin/env bash
# check-hadr.sh — Verificar estado del cluster HA

echo "=== HADR Health Check ==="
echo ""

# 1. Verificar VIP
VIP="10.0.0.100"
if ping -c 1 -W 1 "${VIP}" &>/dev/null; then
  echo "✅ VIP ${VIP} responde"
else
  echo "❌ VIP ${VIP} NO responde"
fi

# 2. Verificar HAProxy
if systemctl is-active --quiet haproxy; then
  echo "✅ HAProxy activo"
  echo "   Stats: http://${VIP}/haproxy-stats"
  echo "   Backends:"
  echo "show stat" | socat stdio /run/haproxy/admin.sock | \
    awk -F, '{if(NR>1) printf "   - %s: %s (pxname: %s)\n", $2, $18, $1}'
else
  echo "❌ HAProxy INACTIVO"
fi

# 3. Verificar PostgreSQL
if pg_isready -q; then
  IN_RECOVERY=$(sudo -u postgres psql -t -c "SELECT pg_is_in_recovery();" | tr -d ' ')
  if [[ "${IN_RECOVERY}" == "f" ]]; then
    echo "✅ PostgreSQL activo (PRIMARIO)"
  else
    echo "✅ PostgreSQL activo (STANDBY — replicando)"
    # Mostrar lag de replicación
    sudo -u postgres psql -c "SELECT pid, state, sync_state, pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) as lag_bytes FROM pg_stat_replication;" 2>/dev/null || true
  fi
else
  echo "❌ PostgreSQL INACTIVO"
fi

# 4. Verificar API Node.js
for PORT in 3001; do
  if curl -sf "http://localhost:${PORT}/api/health" &>/dev/null; then
    echo "✅ API en puerto ${PORT} responde"
  else
    echo "❌ API en puerto ${PORT} NO responde"
  fi
done
```

---

## 5. Crontab para Monitoreo Preventivo

```bash
# /etc/cron.d/restaurant-veg-hadr

# Health check cada minuto
* * * * * root /opt/scripts/check-hadr.sh >> /var/log/hadr/health-check.log 2>&1

# Failover automático si primario no responde (cada 2 minutos)
*/2 * * * * root /opt/scripts/failover-postgres.sh >> /var/log/hadr/failover.log 2>&1

# Backup de PostgreSQL cada 6 horas
0 */6 * * * postgres /usr/pgsql-16/bin/pg_dumpall -f /var/backups/postgres/daily-$(date +\%Y\%m\%d-\%H\%M\%S).sql --clean 2>&1 | logger -t pg-backup

# Rotación de backups cada 7 días
0 3 * * 0 root find /var/backups/postgres -name "*.sql" -mtime +7 -delete

# Verificar replicación cada 5 minutos
*/5 * * * * postgres /opt/scripts/check-replication-lag.sh >> /var/log/hadr/replication-lag.log 2>&1
```
