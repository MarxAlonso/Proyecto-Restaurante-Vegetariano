import { Router } from 'express';
import { MenuItem } from '../types/index.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Ensalada Verde',
    description: 'Mix de lechugas frescas con aderezo de oliva',
    price: 25.00,
    category: 'appetizer',
    available: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Bowl Vegano',
    description: 'Quinoa, garbanzos, aguacate y vegetales asados',
    price: 45.00,
    category: 'main',
    available: true,
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Hamburguesa de lentejas',
    description: 'Pan artesanal, lentejas, verduras y salsa vegana',
    price: 38.00,
    category: 'main',
    available: true,
    createdAt: new Date(),
  },
  {
    id: '4',
    name: 'Postre de coco',
    description: 'Postre de coco con frutas tropicales',
    price: 18.00,
    category: 'dessert',
    available: true,
    createdAt: new Date(),
  },
  {
    id: '5',
    name: 'Jugo Verde',
    description: 'Espinaca, manzana y pepino',
    price: 12.00,
    category: 'drink',
    available: true,
    createdAt: new Date(),
  },
];

router.get('/', (_req, res) => {
  res.json(menuItems);
});

router.get('/:id', (req, res) => {
  const item = menuItems.find(m => m.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json(item);
});

router.post('/', authenticate, requireRole('admin'), (req, res) => {
  const newItem: MenuItem = {
    id: crypto.randomUUID(),
    ...req.body,
    createdAt: new Date(),
  };
  menuItems.push(newItem);
  res.status(201).json(newItem);
});

router.put('/:id', authenticate, requireRole('admin'), (req, res) => {
  const index = menuItems.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  menuItems[index] = { ...menuItems[index], ...req.body };
  res.json(menuItems[index]);
});

router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
  const index = menuItems.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  menuItems.splice(index, 1);
  res.status(204).send();
});

export default router;