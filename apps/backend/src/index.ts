import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import path from 'path';

import authRoutes from './modules/auth/infrastructure/http/routes/auth.route.js';
import menuRoutes from './modules/menu/infrastructure/http/routes/menu.route.js';
import orderRoutes from './modules/order/infrastructure/http/routes/order.route.js';
import usersRoutes from './modules/users/infrastructure/http/routes/users.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Modular Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;