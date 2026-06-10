/**
 * k6 Full System Stress Test - RESTVEG
 *
 * Prueba integral que combina todos los módulos del sistema:
 *   - Auth (login, registro, sesión)
 *   - Menú (lectura catálogo)
 *   - Pedidos (creación, cocina, actualización)
 *   - Reservas (creación)
 *
 * Simula un día completo de operación en el restaurante.
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3001/api';
const errorRate = new Rate('system_error_rate');
const overallTrend = new Trend('overall_response_time');

export const options = {
  stages: [
    // Simula un día en el restaurante:
    { duration: '30s', target: 5 },    // 8:00 AM - Apertura, poco tráfico
    { duration: '1m', target: 20 },    // 10:00 AM - Incremento
    { duration: '2m', target: 50 },    // 12:00 PM - Almuerzo (pico)
    { duration: '1m', target: 80 },    // 1:00 PM - Máximo almuerzo
    { duration: '1m', target: 30 },    // 3:00 PM - Descenso
    { duration: '1m', target: 10 },    // 5:00 PM - Tranquilidad
    { duration: '2m', target: 60 },    // 7:00 PM - Cena (segundo pico)
    { duration: '1m', target: 100 },   // 8:30 PM - Máxima cena
    { duration: '30s', target: 20 },   // 10:00 PM - Cierre
    { duration: '30s', target: 0 },    // 11:00 PM - Sistema en reposo
  ],
  thresholds: {
    http_req_duration: ['p(95)<4000', 'avg<1500'],
    http_req_failed: ['rate<0.03'],
  },
};

function loginUser(email, password) {
  const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({ email, password }), {
    headers: { 'Content-Type': 'application/json' },
  });
  if (res.status === 200) return JSON.parse(res.body);
  return null;
}

export default function () {
  const overallStart = Date.now();

  group('Flujo Completo del Sistema', () => {
    // 1. Health Check
    const health = http.get(`${BASE_URL}/health`);
    check(health, { 'health → 200': (r) => r.status === 200 });

    // 2. Cliente navega el menú
    const menu = http.get(`${BASE_URL}/menu`);
    check(menu, { 'menú → 200': (r) => r.status === 200 });

    // 3. Cliente se loguea
    const clientSession = loginUser('client@restveg.com', 'client123');
    if (clientSession) {
      // 4. Crear pedido como cliente
      const orderRes = http.post(`${BASE_URL}/orders`, JSON.stringify({
        items: [{ id: 'menu-item-1', price: 150, quantity: 2 }],
        notes: 'Orden de prueba de estrés integral',
        orderType: 'DINE_IN',
        tableId: Math.floor(Math.random() * 10) + 1,
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${clientSession.token}`,
        },
      });
      check(orderRes, { 'orden creada': (r) => r.status === 201 });
    }

    // 5. Kitchen ve órdenes
    const kitchenSession = loginUser('kitchen@restveg.com', 'kitchen123');
    if (kitchenSession) {
      const kitchenOrders = http.get(`${BASE_URL}/orders/kitchen`, {
        headers: { 'Authorization': `Bearer ${kitchenSession.token}` },
      });
      check(kitchenOrders, { 'cocina → 200': (r) => r.status === 200 });
    }

    // 6. Admin ve stats
    const adminSession = loginUser('admin@restveg.com', 'admin123');
    if (adminSession) {
      const stats = http.get(`${BASE_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${adminSession.token}` },
      });
      check(stats, { 'admin stats → 200': (r) => r.status === 200 });
    }

    // 7. Crear reserva (sin auth)
    const reservationRes = http.post(`${BASE_URL}/reservations`, JSON.stringify({
      name: `Guest ${Math.floor(Math.random() * 1000)}`,
      email: `guest${Date.now()}@veg.com`,
      phone: '555-0000000',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '20:00',
      guests: 4,
      tableId: Math.floor(Math.random() * 10) + 1,
      specialRequests: 'Prueba integral de estrés',
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    check(reservationRes, { 'reserva creada': (r) => r.status === 201 });
  });

  overallTrend.add(Date.now() - overallStart);

  // Sleep variable según el "momento del día"
  sleep(0.5 + Math.random());
}
