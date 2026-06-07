import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { OrderService } from '../../../application/order.service';
import { PrismaOrderRepository } from '../../persistence/prisma-order.repository';
import { authenticate, requireRole } from '../../../../../middleware/auth';

const router: Router = Router();

const orderRepository = new PrismaOrderRepository();
const orderService = new OrderService(orderRepository);
const orderController = new OrderController(orderService);

router.get('/', authenticate, (req, res) => orderController.getUserOrders(req, res));
router.get('/kitchen', authenticate, requireRole('KITCHEN', 'ADMIN'), (req, res) => orderController.getKitchenOrders(req, res));
router.get('/stats', authenticate, requireRole('KITCHEN', 'ADMIN'), (req, res) => orderController.getStats(req, res));
router.get('/admin/all', authenticate, requireRole('ADMIN'), (req, res) => orderController.getAllOrders(req, res));
router.get('/admin/stats', authenticate, requireRole('ADMIN'), (req, res) => orderController.getAdminStats(req, res));
router.get('/admin/revenue', authenticate, requireRole('ADMIN'), (req, res) => orderController.getDailyRevenue(req, res));
router.delete('/:id', authenticate, requireRole('ADMIN'), (req, res) => orderController.deleteOrder(req, res));
router.get('/:id', authenticate, (req, res) => orderController.getById(req, res));
router.post('/', authenticate, (req, res) => orderController.create(req, res));
router.post('/guest', (req, res) => orderController.createGuestOrder(req, res));
router.patch('/:id', authenticate, (req, res) => orderController.updateStatus(req, res));

export default router;
