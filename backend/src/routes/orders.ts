import { Router } from 'express';
import { Order } from '../types/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const orders: Order[] = [];

router.get('/', authenticate, (req, res) => {
  const userRole = (req as any).user?.role;
  const userId = (req as any).user?.id;

  if (userRole === 'admin') {
    return res.json(orders);
  }

  if (userRole === 'kitchen') {
    return res.json(orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled'));
  }

  const userOrders = orders.filter(o => o.userId === userId);
  res.json(userOrders);
});

router.post('/', authenticate, (req, res) => {
  const { items, notes } = req.body;
  const userId = (req as any).user?.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items provided' });
  }

  const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

  const newOrder: Order = {
    id: crypto.randomUUID(),
    userId,
    items,
    status: 'pending',
    total,
    notes,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

router.patch('/:id', authenticate, (req, res) => {
  const { status } = req.body;
  const order = orders.find(o => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const userRole = (req as any).user?.role;

  if (userRole === 'client' && !['cancelled'].includes(status)) {
    return res.status(403).json({ error: 'Cannot change order status' });
  }

  if (userRole === 'kitchen' && !['preparing', 'ready'].includes(status)) {
    return res.status(403).json({ error: 'Invalid status for kitchen' });
  }

  if (userRole === 'admin' && !['completed', 'cancelled'].includes(status)) {
    order.status = status;
  } else {
    order.status = status;
  }

  order.updatedAt = new Date();
  res.json(order);
});

router.get('/:id', authenticate, (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const userId = (req as any).user?.id;
  const userRole = (req as any).user?.role;

  if (order.userId !== userId && userRole !== 'admin' && userRole !== 'kitchen') {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(order);
});

export default router;