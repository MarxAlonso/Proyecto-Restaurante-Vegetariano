import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import path from 'path';

import { swaggerSpec } from './infrastructure/swagger.config';
import authRoutes from './modules/auth/infrastructure/http/routes/auth.route';
import menuRoutes from './modules/menu/infrastructure/http/routes/menu.route';
import categoryRoutes from './modules/categories/infrastructure/http/routes/category.route';
import orderRoutes from './modules/order/infrastructure/http/routes/order.route';
import usersRoutes from './modules/users/infrastructure/http/routes/users.route';
import paymentsRoutes from './modules/payments/infrastructure/http/routes/payments.route';
import mercadopagoRoutes from './modules/mercadopago/infrastructure/http/routes/mercado-pago.route';
import tableRoutes from './modules/tables/infrastructure/http/routes/table.route';
import reservationRoutes from './modules/reservations/infrastructure/http/routes/reservation.route';

import { seedDatabase } from './infrastructure/persistence/db-seed';

dotenv.config();

const isVercelServerless = process.env.VERCEL === '1';
const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';

if (!isVercelServerless && !isTestEnvironment) {
  // Seed the database only when running a dedicated server instance locally or in a non-serverless environment.
  seedDatabase().catch(err => {
    console.error('❌ Error during seeding:', err);
  });
}

const app: Application = express();
const PORT = process.env.PORT || (process.env.NODE_ENV === 'test' ? 3002 : 3001);

// Middlewares de Seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Permite cargar imágenes desde otro origen (Frontend)
}));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP cada 15 minutos
  message: { error: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 1000, // 1 segundo
  max: 100, // Límite de 100 peticiones por IP por segundo para rutas de autenticación (login, register, google)
  message: { error: 'Demasiados intentos de autenticación desde esta IP, por favor intente de nuevo más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
  skip: () => process.env.NODE_ENV === 'test',
});

// Aplicar rate limiting general a todas las rutas de API
app.use('/api', generalLimiter);

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://restaurante-vegetariano-frontend.vercel.app'
    ];
    const cleanedOrigin = origin?.replace(/\/$/, '') || '';
    if (allowedOrigins.includes(cleanedOrigin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: false,
  },
  customCss: `.swagger-ui .topbar { display: none }`,
  customSiteTitle: 'Restaurant Veg API Documentation',
}));

// OpenAPI JSON endpoint
app.get('/api/openapi.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Ruta raíz
app.get('/', (_req, res) => {
  res.json({
    name: 'Restaurant Veg Backend API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/docs',
    openapi: '/api/openapi.json',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      menu: '/api/menu',
      categories: '/api/categories',
      orders: '/api/orders',
      users: '/api/users',
      payments: '/api/payments',
      mercadopago: '/api/mercadopago',
      tables: '/api/tables',
      reservations: '/api/reservations'
    }
  });
});

// Modular Routes con rate limit específico para auth
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/mercadopago', mercadopagoRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reservations', reservationRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (!isVercelServerless && !isTestEnvironment) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;