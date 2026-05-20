import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../index';

describe('Pruebas de Integración de API HTTP (Supertest) - RESTVEG BACKEND', () => {
  
  it('Debería responder exitosamente al control de salud (Health Check) [GET /api/health]', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('Debería retornar un error 401/400 al intentar login con credenciales incorrectas [POST /api/auth/login]', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'error_usuario@restveg.com',
        password: 'incorrectpassword'
      });

    // Express o tu controlador devuelve un 401 Unauthorized o 400 Bad Request
    expect([400, 401]).toContain(res.status);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.toLowerCase()).toMatch(/error|invalid|credenciales/);
  });

  it('Debería iniciar sesión correctamente como Administrador con credenciales válidas [POST /api/auth/login]', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@restveg.com',
        password: 'admin123'
      })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', 'admin@restveg.com');
    expect(res.body.user).toHaveProperty('role', 'ADMIN');
  });

  it('Debería retornar la lista de platos del catálogo vegetariano [GET /api/menu]', async () => {
    const res = await request(app)
      .get('/api/menu')
      .expect('Content-Type', /json/)
      .expect(200);

    // Debe ser un arreglo con platos del menú
    expect(Array.isArray(res.body)).toBe(true);
  });
});
