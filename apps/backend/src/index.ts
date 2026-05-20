import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import path from 'path';

import authRoutes from './modules/auth/infrastructure/http/routes/auth.route';
import menuRoutes from './modules/menu/infrastructure/http/routes/menu.route';
import orderRoutes from './modules/order/infrastructure/http/routes/order.route';
import usersRoutes from './modules/users/infrastructure/http/routes/users.route';

import { seedDatabase } from './infrastructure/persistence/db-seed';

dotenv.config();

const isVercelServerless = process.env.VERCEL === '1';

if (!isVercelServerless) {
  // Seed the database only when running a dedicated server instance locally or in a non-serverless environment.
  seedDatabase().catch(err => {
    console.error('❌ Error during seeding:', err);
  });
}

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middlewares de Seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Permite cargar imágenes desde otro origen (Frontend)
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP cada 15 minutos
  message: { error: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar rate limiting solo a rutas de API
app.use('/api', limiter);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Ruta raíz
app.get('/', (_req, res) => {
  res.json({
    name: 'Restaurant Veg Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      menu: '/api/menu',
      orders: '/api/orders',
      users: '/api/users'
    }
  });
});

// Modular Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (!isVercelServerless) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;