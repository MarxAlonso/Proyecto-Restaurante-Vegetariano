/**
 * k6 Stress Test - Módulo de Pedidos (RESTVEG)
 *
 * Simula el flujo completo de pedidos (E2E):
 *   CLIENT → Crear pedido → KITCHEN → Preparar → Completar
 *
 * Endpoints:
 *   - POST /api/orders       (crear pedido - CLIENT)
 *   - GET  /api/orders/kitchen (ver pedidos - KITCHEN)
 *   - PATCH /api/orders/:id/status (actualizar estado)
 *   - GET  /api/orders        (listar pedidos - ADMIN)
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter } from 'k6/metrics';

const createOrderDuration = new Trend('create_order_duration');
const kitchenViewDuration = new Trend('kitchen_view_duration');
const updateStatusDuration = new Trend('update_status_duration');
const totalOrders = new Counter('total_orders');
const totalErrors = new Counter('total_errors');

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3001/api';

const CLIENT_CREDENTIALS = { email: 'client@restveg.com', password: 'client123' };
const KITCHEN_CREDENTIALS = { email: 'kitchen@restveg.com', password: 'kitchen123' };
const ADMIN_CREDENTIALS = { email: 'admin@restveg.com', password: 'admin123' };

export const options = {
  stages: [
    { duration: '10s', target: 5 },     // Calentamiento
    { duration: '30s', target: 20 },    // Carga moderada
    { duration: '30s', target: 50 },    // Alta carga
    { duration: '20s', target: 30 },    // Mantenimiento
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    'http_req_duration{type:order_create}': ['p(95)<2500'],
    http_req_failed: ['rate<0.02'],
  },
};

function login(credentials) {
  const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify(credentials), {
    headers: { 'Content-Type': 'application/json' },
  });
  if (res.status === 200) return JSON.parse(res.body).token;
  return null;
}

function getRandomMenuItems() {
  // Simula items del menú; en un escenario real se obtendrían de GET /menu
  const items = [
    { id: 'menu-item-1', price: 150, quantity: 1 },
    { id: 'menu-item-2', price: 200, quantity: 2 },
    { id: 'menu-item-3', price: 120, quantity: 1 },
  ];
  return [items[Math.floor(Math.random() * items.length)]];
}

export default function () {
  const scenario = Math.random();

  // 50% Clientes creando pedidos
  if (scenario < 0.5) {
    group('Pedidos - Crear Pedido (Cliente)', () => {
      const token = login(CLIENT_CREDENTIALS);
      if (!token) return;

      const items = getRandomMenuItems();

      const start = Date.now();
      const res = http.post(`${BASE_URL}/orders`, JSON.stringify({
        items,
        notes: `Pedido generado por stress test - ${Date.now()}`,
        orderType: Math.random() > 0.5 ? 'DINE_IN' : 'TAKEAWAY',
        customerName: 'Stress Test Client',
        customerEmail: 'stress@restveg.com',
        tableId: Math.floor(Math.random() * 10) + 1,
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        tags: { name: 'create_order', type: 'order_create' },
      });
      createOrderDuration.add(Date.now() - start);
      totalOrders.add(1);

      check(res, {
        'POST /orders → status 201': (r) => r.status === 201,
        'POST /orders → pedido creado con status PENDING': (r) => {
          if (!r.body) return false;
          try { return JSON.parse(r.body).status === 'PENDING'; }
          catch { return false; }
        },
      });
    });
  }
  // 30% Kitchen actualizando estados
  else if (scenario < 0.8) {
    group('Pedidos - Cocina (Ver y Actualizar)', () => {
      const token = login(KITCHEN_CREDENTIALS);
      if (!token) return;

      // Ver pedidos en cocina
      const viewStart = Date.now();
      const viewRes = http.get(`${BASE_URL}/orders/kitchen`, {
        headers: { 'Authorization': `Bearer ${token}` },
        tags: { name: 'kitchen_orders', type: 'kitchen_view' },
      });
      kitchenViewDuration.add(Date.now() - viewStart);

      check(viewRes, {
        'GET /orders/kitchen → status 200': (r) => r.status === 200,
      });

      // Si hay pedidos pendientes, actualizar uno a PREPARING
      if (viewRes.status === 200 && viewRes.body) {
        try {
          const orders = JSON.parse(viewRes.body);
          if (orders.length > 0 && orders[0].id) {
            const orderId = orders[0].id;
            const statusStart = Date.now();
            const statusRes = http.patch(`${BASE_URL}/orders/${orderId}/status`, JSON.stringify({
              status: 'PREPARING',
            }), {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              tags: { name: 'update_order_status', type: 'status_update' },
            });
            updateStatusDuration.add(Date.now() - statusStart);

            check(statusRes, {
              'PATCH /orders/:id/status → 200': (r) => r.status === 200,
              'PATCH → estado cambió a PREPARING': (r) => {
                if (!r.body) return false;
                try { return JSON.parse(r.body).status === 'PREPARING'; }
                catch { return false; }
              },
            });
          }
        } catch (e) {
          console.error('Error parsing kitchen orders:', e);
        }
      }
    });
  }
  // 20% Admin viendo todas las órdenes
  else {
    group('Pedidos - Admin (Dashboard)', () => {
      const token = login(ADMIN_CREDENTIALS);
      if (!token) return;

      const res = http.get(`${BASE_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` },
        tags: { name: 'admin_orders', type: 'admin_view' },
      });

      check(res, {
        'GET /orders (Admin) → status 200': (r) => r.status === 200,
        'GET /orders → respuesta es arreglo': (r) => {
          if (!r.body) return false;
          try { return Array.isArray(JSON.parse(r.body)); }
          catch { return false; }
        },
      });
    });
  }

  sleep(1);
}
