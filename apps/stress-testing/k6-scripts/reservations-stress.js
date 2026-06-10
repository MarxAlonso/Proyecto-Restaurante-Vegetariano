/**
 * k6 Stress Test - Módulo de Reservas (RESTVEG)
 *
 * Endpoints:
 *   - GET  /api/tables       (listar mesas disponibles)
 *   - POST /api/reservations (crear reserva)
 *   - POST /api/reservations/:id/cancel (cancelar reserva)
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter } from 'k6/metrics';

const createReservationDuration = new Trend('create_reservation_duration');
const tablesListDuration = new Trend('tables_list_duration');
const totalErrors = new Counter('total_errors');

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3001/api';

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '30s', target: 30 },
    { duration: '20s', target: 60 },
    { duration: '20s', target: 30 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.02'],
  },
};

function getRandomGuestCount() {
  return Math.floor(Math.random() * 6) + 1; // 1-6 personas
}

function getRandomTime() {
  const hours = ['12:00', '13:00', '14:00', '19:00', '20:00', '21:00'];
  return hours[Math.floor(Math.random() * hours.length)];
}

function getRandomDate() {
  const today = new Date();
  const futureDay = new Date(today);
  futureDay.setDate(today.getDate() + Math.floor(Math.random() * 14) + 1); // Próximos 14 días
  return futureDay.toISOString().split('T')[0];
}

export default function () {
  // Primero, listar mesas disponibles
  group('Reservas - Consultar Mesas', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/tables`, {
      tags: { name: 'get_tables', type: 'read' },
    });
    tablesListDuration.add(Date.now() - start);

    check(res, {
      'GET /tables → status 200': (r) => r.status === 200,
    });
  });

  // Crear reserva
  group('Reservas - Crear Reserva', () => {
    const reservationData = {
      name: `Stress Guest ${Math.floor(Math.random() * 1000)}`,
      email: `guest${Date.now()}@restveg.com`,
      phone: `555-${Math.floor(Math.random() * 9000000) + 1000000}`,
      date: getRandomDate(),
      time: getRandomTime(),
      guests: getRandomGuestCount(),
      tableId: Math.floor(Math.random() * 10) + 1,
      specialRequests: 'Mesa cerca de la ventana, por favor - Prueba de estrés',
    };

    const start = Date.now();
    const res = http.post(`${BASE_URL}/reservations`, JSON.stringify(reservationData), {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'create_reservation', type: 'write' },
    });
    createReservationDuration.add(Date.now() - start);

    check(res, {
      'POST /reservations → status 201': (r) => r.status === 201,
      'POST /reservations → reserva confirmada': (r) => {
        if (!r.body) return false;
        try {
          const body = JSON.parse(r.body);
          return body.status === 'CONFIRMED';
        } catch { return false; }
      },
    });
  });

  sleep(0.5);
}
