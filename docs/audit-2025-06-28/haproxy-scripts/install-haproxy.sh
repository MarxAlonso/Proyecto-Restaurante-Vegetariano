#!/usr/bin/env bash
set -euo pipefail

# ============================================
# install-haproxy.sh — HAProxy + Keepalived
# Uso: ./install-haproxy.sh
# ============================================

dnf install -y haproxy keepalived

cat > /etc/haproxy/haproxy.cfg <<'HAPROXY_EOF'
global
    daemon
    maxconn 65535
    log /dev/log local0
    log /dev/log local1 notice
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin
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
    timeout connect 5s
    timeout client 30s
    timeout server 30s
    timeout http-keep-alive 5s
    timeout check 10s
    maxconn 10000

frontend api_frontend
    bind *:80
    bind *:443 ssl crt /etc/haproxy/certs/restaurant-veg.pem
    redirect scheme https if !{ ssl_fc }

    stick-table type ip size 100k expire 30s store http_req_rate(10s)
    http-request track-sc0 src
    http-request deny deny_status 429 if { sc_http_req_rate(0) gt 100 }

    http-response set-header X-Content-Type-Options "nosniff"
    http-response set-header X-Frame-Options "DENY"
    http-response set-header X-XSS-Protection "1; mode=block"

    acl is_api path_beg /api

    capture request header Host len 32
    capture request header User-Agent len 64

    use_backend api_servers if is_api
    default_backend api_servers

    stats enable
    stats uri /haproxy-stats
    stats auth admin:${HAPROXY_STATS_PASSWORD:-admin}

backend api_servers
    balance roundrobin
    option httpchk GET /api/health
    http-check expect status 200

    server api-1 10.0.0.20:3001 check inter 5s fall 3 rise 2 weight 100
    server api-2 10.0.0.21:3001 check inter 5s fall 3 rise 2 weight 100
    server vercel-backup api.restaurant-veg.com:443 check inter 10s fall 5 rise 2 weight 50 ssl verify none backup
HAPROXY_EOF

mkdir -p /etc/haproxy/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/haproxy/certs/restaurant-veg.key \
  -out /etc/haproxy/certs/restaurant-veg.crt \
  -subj "/C=PE/ST=Lima/O=RestaurantVeg/CN=api.restaurant-veg.com"
cat /etc/haproxy/certs/restaurant-veg.key /etc/haproxy/certs/restaurant-veg.crt \
  > /etc/haproxy/certs/restaurant-veg.pem

setsebool -P haproxy_connect_any=1
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --reload

systemctl enable haproxy --now
echo "[HAPROXY] ✅ HAProxy configurado y ejecutándose"
