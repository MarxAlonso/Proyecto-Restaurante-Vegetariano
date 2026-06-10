/**
 * k6 Stress Test - Módulo de Autenticación (RESTVEG)
 *
 * Objetivo: Medir la capacidad del endpoint /api/auth bajo carga concurrente.
 * Endpoints evaluados:
 *   - POST /api/auth/login (login exitoso y fallido)
 *   - POST /api/auth/register (registro de nuevo usuario)
 *   - GET  /api/auth/me (sesión activa con token)
 *
 * Métricas clave:
 *   - Tiempo de respuesta promedio (p95, p99)
 *   - Tasa de errores HTTP (> 1% es crítico)
 *   - Throughput (requests/segundo)
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Métricas personalizadas
const failedLoginRate = new Rate('failed_login_rate');
const loginDuration = new Trend('login_duration');
const registerDuration = new Trend('register_duration');
const meDuration = new Trend('me_duration');
const totalErrors = new Counter('total_errors');

// Configuración
const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3001/api';
const AUTH_USER = { email: 'admin@restveg.com', password: 'admin123' };
const INVALID_USER = { email: 'invalido@restveg.com', password: 'wrongpass' };

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Fase 1: Calentamiento - 10 usuarios concurrentes
    { duration: '1m', target: 50 },     // Fase 2: Carga media - 50 usuarios
    { duration: '30s', target: 100 },   // Fase 3: Pico - 100 usuarios
    { duration: '30s', target: 50 },    // Fase 4: Descenso
    { duration: '30s', target: 0 },     // Fase 5: Recuperación
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],  // 95% de requests < 2s, 99% < 5s
    http_req_failed: ['rate<0.01'],                    // Máximo 1% de errores
    failed_login_rate: ['rate<0.1'],                   // Máximo 10% de fallos esperados
    'http_req_duration{expected_response:true}': ['p(95)<1500'],
  },
};

function getRandomEmail() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `stress_${result}@restveg.com`;
}

export default function () {
  group('Autenticación - Flujo Completo', () => {
    // 1. Login fallido (esperamos 401)
    group('Login Fallido', () => {
      const start = Date.now();
      const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify(INVALID_USER), {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'login_failed' },
      });
      loginDuration.add(Date.now() - start);

      const passed = check(res, {
        'login fallido → código esperado 401/400': (r) => [400, 401].includes(r.status),
        'login fallido → contiene mensaje de error': (r) => r.body && r.body.includes('error'),
      });
      failedLoginRate.add(!passed);
      if (!passed) totalErrors.add(1);
    });

    // 2. Login exitoso (admin)
    group('Login Exitoso (Admin)', () => {
      const start = Date.now();
      const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify(AUTH_USER), {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'login_success' },
      });
      loginDuration.add(Date.now() - start);

      check(res, {
        'login exitoso → status 200': (r) => r.status === 200,
        'login exitoso → contiene token JWT': (r) => r.body && r.body.includes('token'),
        'login exitoso → contiene datos de usuario': (r) => r.body && r.body.includes('user'),
      });
    });

    // 3. Registro de nuevo usuario
    group('Registro', () => {
      const newUser = {
        email: getRandomEmail(),
        password: 'test123456',
        name: 'Stress Test User',
      };

      const start = Date.now();
      const res = http.post(`${BASE_URL}/auth/register`, JSON.stringify(newUser), {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'register' },
      });
      registerDuration.add(Date.now() - start);

      check(res, {
        'registro → status 201': (r) => r.status === 201,
        'registro → usuario creado con rol CLIENT': (r) => {
          if (!r.body) return false;
          const body = JSON.parse(r.body);
          return body.user && body.user.role === 'CLIENT';
        },
        'registro → contiene token': (r) => r.body && r.body.includes('token'),
      });
    });

    // 4. Validar sesión (GET /me) con token
    group('Validación de Sesión (Me)', () => {
      const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify(AUTH_USER), {
        headers: { 'Content-Type': 'application/json' },
      });

      if (loginRes.status === 200) {
        const token = JSON.parse(loginRes.body).token;

        const start = Date.now();
        const res = http.get(`${BASE_URL}/auth/me`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          tags: { name: 'me' },
        });
        meDuration.add(Date.now() - start);

        check(res, {
          'GET /me → status 200': (r) => r.status === 200,
          'GET /me → datos del usuario admin': (r) => {
            if (!r.body) return false;
            const body = JSON.parse(r.body);
            return body.email === 'admin@restveg.com' && body.role === 'ADMIN';
          },
        });
      }
    });
  });

  sleep(1);
}
