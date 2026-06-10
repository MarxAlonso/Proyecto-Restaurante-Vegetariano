/**
 * k6 Stress Test - Módulo de Menú y Catálogo (RESTVEG)
 *
 * Endpoints:
 *   - GET  /api/menu       (listar platos)
 *   - GET  /api/menu/:id   (detalle de plato)
 *   - GET  /api/categories (listar categorías)
 *   - POST /api/menu       (crear plato - ADMIN)
 *   - PUT  /api/menu/:id   (actualizar plato - ADMIN)
 *
 * Simula: Clientes navegando el menú + Administradores gestionando el catálogo
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter } from 'k6/metrics';

const menuListDuration = new Trend('menu_list_duration');
const categoryDuration = new Trend('category_duration');
const menuCreateDuration = new Trend('menu_create_duration');
const totalErrors = new Counter('total_errors');

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3001/api';
const AUTH_USER = { email: 'admin@restveg.com', password: 'admin123' };
const CATEGORY_IDS = [];

export const options = {
  stages: [
    { duration: '20s', target: 20 },   // Lectura ligera
    { duration: '1m', target: 100 },    // Alta concurrencia de lectura
    { duration: '30s', target: 200 },   // Pico de lectura
    { duration: '30s', target: 50 },    // Lectura + escritura
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // Menú debe ser rápido (lectura)
    'http_req_duration{type:read}': ['p(95)<800'],
    'http_req_duration{type:write}': ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

function getAdminToken() {
  const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify(AUTH_USER), {
    headers: { 'Content-Type': 'application/json' },
  });
  if (res.status === 200) {
    return JSON.parse(res.body).token;
  }
  return null;
}

export default function () {
  // 80% de los VUs son lectores (clientes), 20% son escritores (admin)
  const isReader = Math.random() < 0.8;

  group('Menú - Operaciones de Lectura', () => {
    // Listar menú completo
    const menuStart = Date.now();
    const menuRes = http.get(`${BASE_URL}/menu`, {
      tags: { name: 'get_menu', type: 'read' },
    });
    menuListDuration.add(Date.now() - menuStart);

    check(menuRes, {
      'GET /menu → status 200': (r) => r.status === 200,
      'GET /menu → respuesta es un arreglo': (r) => {
        if (!r.body) return false;
        try { return Array.isArray(JSON.parse(r.body)); }
        catch { return false; }
      },
    });

    // Listar categorías
    const catStart = Date.now();
    const catRes = http.get(`${BASE_URL}/categories`, {
      tags: { name: 'get_categories', type: 'read' },
    });
    categoryDuration.add(Date.now() - catStart);

    check(catRes, {
      'GET /categories → status 200': (r) => r.status === 200,
    });
  });

  // Operaciones de escritura (solo 20% de los VUs)
  if (!isReader) {
    group('Menú - Operaciones de Escritura (Admin)', () => {
      const token = getAdminToken();
      if (!token) return;

      const itemName = `Plato Estrés ${Date.now()}`;

      // Crear plato
      const createStart = Date.now();
      const createRes = http.post(`${BASE_URL}/menu`, JSON.stringify({
        name: itemName,
        description: 'Plato generado durante prueba de estrés del sistema',
        price: Math.floor(Math.random() * 200) + 50,
        categoryId: '00000000-0000-0000-0000-000000000000',
        available: true,
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        tags: { name: 'create_menu_item', type: 'write' },
      });
      menuCreateDuration.add(Date.now() - createStart);

      check(createRes, {
        'POST /menu → status 201': (r) => r.status === 201,
      });
    });
  }

  sleep(isReader ? 0.5 : 2);
}
