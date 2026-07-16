import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './infrastructure/swagger.config';
import logger from './infrastructure/logger';
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
  seedDatabase().catch(err => {
    logger.error({ err }, '❌ Error during seeding');
  });
}

const app: Application = express();
const PORT = process.env.PORT || (process.env.NODE_ENV === 'test' ? 3002 : 3001);

// ============================================================
// Security: Hardening de Express
// ISO 25010 - Security, EXPRESS-FINGERPRINT-001, EXPRESS-BODY-001
// ============================================================

// Deshabilitar header X-Powered-By para reducir fingerprinting
app.disable('x-powered-by');

// Security headers con Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Rate limiting general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP cada 15 minutos
  message: { error: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting específico para auth — más restrictivo
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // 20 intentos por minuto (antes era 100/segundo, demasiado permisivo)
  message: { error: 'Demasiados intentos de autenticación. Espere un minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

app.use('/api', generalLimiter);

// CORS — allowlist explícita
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://restaurante-vegetariano-frontend.vercel.app',
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

// Body parsers con límites explícitos
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Request logging con Pino
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info({ req }, `${req.method} ${req.path}`);
  next();
});

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
      reservations: '/api/reservations',
    },
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

// ============================================================
// Error handling — Security: No exponer stack traces en producción
// ISO 25010 - Reliability, EXPRESS-ERROR-001
// ============================================================

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: 'Verifica la URL e intenta de nuevo',
  });
});

// Error handler global
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, 'Unhandled error');

  const statusCode = (err as any).statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor'
    : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

if (!isVercelServerless && !isTestEnvironment) {
  app.listen(PORT, () => {
    logger.info({ port: PORT }, `🚀 Server running on port ${PORT}`);
  });
}

export default app;
