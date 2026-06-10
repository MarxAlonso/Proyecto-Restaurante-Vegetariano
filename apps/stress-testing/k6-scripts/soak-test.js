/**
 * k6 Soak Test (Prueba de Resistencia) - RESTVEG
 *
 * Simula carga constante durante un período prolongado para detectar:
 *   - Fugas de memoria (memory leaks)
 *   - Degradación del rendimiento con el tiempo
 *   - Agotamiento de conexiones a base de datos
 *   - Timeouts acumulativos
 *
 * Perfil: 30 usuarios constantes durante 30 minutos.
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('error_rate');
const responseTimeTrend = new Trend('response_time');

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3001/api';

// Pool de credenciales para rotar
const USERS = [
  { email: 'admin@restveg.com', password: 'admin123', role: 'ADMIN' },
  { email: 'client@restveg.com', password: 'client123', role: 'CLIENT' },
  { email: 'kitchen@restveg.com', password: 'kitchen123', role: 'KITCHEN' },
];

export const options = {
  // Soak test: carga constante durante 30 minutos
  stages: [
    { duration: '5m', target: 30 },    // Rampa de ascenso (5 min)
    { duration: '20m', target: 30 },    // Mantener carga (20 min) - fase crítica
    { duration: '5m', target: 0 },      // Rampa de descenso (5 min)
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000', 'avg<2000'],
    http_req_failed: ['rate<0.05'],
    http_reqs: ['rate>5'],  // Mínimo 5 requests/segundo sostenidos
  },
};

function getRandomUser() {
  return USERS[Math.floor(Math.random() * USERS.length)];
}

function performHealthCheck() {
  const res = http.get(`${BASE_URL}/health`);
  check(res, {
    'health check → status ok': (r) => {
      if (!r.body) return false;
      try { return JSON.parse(r.body).status === 'ok'; }
      catch { return false; }
    },
  });
  return res;
}

function performLogin(user) {
  return http.post(`${BASE_URL}/auth/login`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  });
}

function performMenuQuery() {
  return http.get(`${BASE_URL}/menu`);
}

export default function () {
  // Cada iteración: mezcla de operaciones típicas de un usuario real
  const user = getRandomUser();
  const start = Date.now();

  // 1. Health check (rápido)
  performHealthCheck();

  // 2. Ver menú (lectura)
  const menuRes = performMenuQuery();
  responseTimeTrend.add(Date.now() - start);

  check(menuRes, {
    'menú cargado correctamente': (r) => r.status === 200,
  });

  // 3. Ocasionalmente hacer login (20% de probabilidad)
  if (Math.random() < 0.2) {
    const loginRes = performLogin(user);
    check(loginRes, {
      'login exitoso durante soak': (r) => r.status === 200,
    });
    if (loginRes.status !== 200) {
      errorRate.add(1);
    }
  }

  // 4. Consultar categorías
  const catRes = http.get(`${BASE_URL}/categories`);
  check(catRes, {
    'categorías cargadas': (r) => r.status === 200,
  });

  // Pausa para simular tiempo de思考和 navegación
  sleep(3 + Math.random() * 5); // Entre 3 y 8 segundos
}
