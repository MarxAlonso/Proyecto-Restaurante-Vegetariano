#!/usr/bin/env bash
set -euo pipefail

# ==============================================
# provision-node.sh — Alma Linux 9 Bootstrap
# Uso: ./provision-node.sh [haproxy|api|postgres|monitoring]
# ==============================================

ROLE="${1:-api}"
HOSTNAME="${2:-node-$(openssl rand -hex 4)}"

echo "[PROVISION] ➜ Hostname: ${HOSTNAME}, Role: ${ROLE}"

hostnamectl set-hostname "${HOSTNAME}"
timedatectl set-timezone America/Lima

dnf update -y
dnf install -y epel-release
dnf install -y \
  curl wget net-tools bind-utils \
  vim git tar gzip unzip \
  firewalld fail2ban \
  htop iotop sysstat \
  policycoreutils-python-utils \
  openssl

systemctl enable firewalld --now
firewall-cmd --set-default-zone=public
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https

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

cat >> /etc/sysctl.conf <<'EOF'
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

if [[ "${ROLE}" == "api" || "${ROLE}" == "monitoring" ]]; then
  curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
  dnf install -y nodejs
  npm install -g pnpm@latest
  npm install -g pm2
  pm2 startup systemd -u root --hp /root

  useradd -r -s /sbin/nologin -d /opt/restaurant-veg nodeapp 2>/dev/null || true

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
fi

if [[ "${ROLE}" == "postgres" ]]; then
  dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm
  dnf -qy module disable postgresql
  dnf install -y postgresql16-server postgresql16-contrib
  /usr/pgsql-16/bin/postgresql-16-setup initdb
  systemctl enable postgresql-16 --now
fi

echo "[PROVISION] ✅ Nodo ${HOSTNAME} (${ROLE}) listo"
