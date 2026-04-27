import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { OrderService } from '../../../application/order.service.js';
import { PrismaOrderRepository } from '../../persistence/prisma-order.repository.js';
import { authenticate, requireRole } from '../../../../../middleware/auth.js';

const router: Router = Router();

const orderRepository = new PrismaOrderRepository();
const orderService = new OrderService(orderRepository);
const orderController = new OrderController(orderService);

router.get('/', authenticate, (req, res) => orderController.getUserOrders(req, res));
router.get('/kitchen', authenticate, requireRole('KITCHEN', 'ADMIN'), (req, res) => orderController.getKitchenOrders(req, res));
router.get('/stats', authenticate, requireRole('KITCHEN', 'ADMIN'), (req, res) => orderController.getStats(req, res));
router.get('/:id', authenticate, (req, res) => orderController.getById(req, res));
router.post('/', authenticate, (req, res) => orderController.create(req, res));
router.patch('/:id', authenticate, (req, res) => orderController.updateStatus(req, res));

export default router;
