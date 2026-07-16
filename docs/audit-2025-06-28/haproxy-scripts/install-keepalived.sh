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

cat > /etc/keepalived/keepalived.conf <<KEEPALIVED_EOF
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
KEEPALIVED_EOF

cat > /etc/keepalived/notify-master.sh <<'SCRIPT_EOF'
#!/usr/bin/env bash
logger -t keepalived "INFO: Este nodo es ahora el MASTER HAProxy"
curl -s -X POST -H 'Content-type: application/json' \
  --data '{"text":"⚠️ *HAProxy Failover* — Nodo `'"$(hostname)"'` es ahora el MASTER"}' \
  "${SLACK_WEBHOOK_URL:-}" 2>/dev/null &
SCRIPT_EOF
chmod +x /etc/keepalived/notify-master.sh

cat > /etc/keepalived/notify-backup.sh <<'SCRIPT_EOF'
#!/usr/bin/env bash
logger -t keepalived "INFO: Este nodo es ahora el BACKUP HAProxy"
SCRIPT_EOF
chmod +x /etc/keepalived/notify-backup.sh

cat > /etc/keepalived/notify-fault.sh <<'SCRIPT_EOF'
#!/usr/bin/env bash
logger -t keepalived "ALERTA: ESTE NODO ESTÁ EN FALLA"
SCRIPT_EOF
chmod +x /etc/keepalived/notify-fault.sh

systemctl enable keepalived --now
echo "[KEEPALIVED] ✅ Keepalived configurado como ${ROLE} en ${INTERFACE} con VIP ${VIP}"
