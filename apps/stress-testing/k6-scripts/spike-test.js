/**
 * k6 Spike Test (Prueba de Pico Repentino) - RESTVEG
 *
 * Simula un evento viral o promoción que dispara el tráfico de forma abrupta.
 * Objetivo: Validar que el sistema se recupera sin crash after un pico extremo.
 *
 * Perfil:
 *   - Base: 5 usuarios
 *   - Pico repentino: 300 usuarios en 10 segundos
 *   - Mantener pico: 30 segundos
 *   - Caída repentina y recuperación
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('error_rate');
const crashRate = new Rate('crash_rate');

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3001/api';

export const options = {
  stages: [
    { duration: '2m', target: 5 },       // Estado base: 5 usuarios (2 min)
    { duration: '10s', target: 300 },    // SPIKE: 300 usuarios en 10 segundos
    { duration: '30s', target: 300 },    // Mantener pico máximo (30s)
    { duration: '10s', target: 0 },      // Caída libre
    { duration: '1m', target: 5 },       // Recuperación: ¿el sistema sigue respondiendo?
  ],
  thresholds: {
    http_req_duration: ['p(95)<10000'],   // Toleramos más lentitud en pico
    http_req_failed: ['rate<0.10'],       // Hasta 10% de errores tolerables en pico
    'http_req_duration{group:recuperacion}': ['p(95)<2000'],  // Post-pico debe recuperarse
  },
};

export default function () {
  // Detectar en qué fase estamos por la duración de la prueba
  const isRecovery = __ITER > 100; // Aproximación

  group(isRecovery ? 'Recuperación Post-Spike' : 'Operación Normal', () => {
    // Health check (debe responder incluso bajo pico)
    const healthRes = http.get(`${BASE_URL}/health`, {
      tags: { name: 'health_spike' },
    });

    const healthOk = check(healthRes, {
      'health check responde': (r) => r.status === 200,
    });

    if (!healthOk) {
      crashRate.add(1);
      errorRate.add(1);
      return; // Si health check falla, el sistema está caído
    }

    // Menu query
    const menuRes = http.get(`${BASE_URL}/menu`, {
      tags: { name: 'menu_spike' },
    });

    check(menuRes, {
      'menú responde bajo pico': (r) => r.status === 200,
    });

    // Login (operación más pesada)
    const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
      email: 'client@restveg.com',
      password: 'client123',
    }), {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'login_spike' },
    });

    check(loginRes, {
      'login responde bajo pico': (r) => [200, 401, 429].includes(r.status),
    });

    // Si estamos en recovery, hacer operaciones más pesadas para verificar estabilidad
    if (isRecovery) {
      const ordersRes = http.get(`${BASE_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${JSON.parse(loginRes.body || '{}').token || ''}`,
        },
        tags: { name: 'orders_recovery' },
      });

      check(ordersRes, {
        'órdenes disponibles post-pico': (r) => [200, 401].includes(r.status),
      });
    }
  });

  sleep(1);
}
