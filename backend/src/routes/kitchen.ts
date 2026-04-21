import { Router } from 'express';
import { Order } from '../types/index.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

const orders: Order[] = [];

router.get('/', authenticate, requireRole('kitchen', 'admin'), (_req, res) => {
  const activeOrders = orders.filter(
    o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready'
  );
  res.json(activeOrders);
});

router.patch('/:id/status', authenticate, requireRole('kitchen', 'admin'), (req, res) => {
  const { status } = req.body;
  const order = orders.find(o => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  order.status = status;
  order.updatedAt = new Date();
  res.json(order);
});

router.get('/stats', authenticate, requireRole('kitchen', 'admin'), (_req, res) => {
  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
    total: orders.length,
  };
  res.json(stats);
});

export default router;