import { Router } from 'express';
import { MercadoPagoController } from '../controllers/mercado-pago.controller';
import { MercadoPagoService } from '../../../application/mercado-pago.service';
import { OrderService } from '../../../../order/application/order.service';
import { PrismaOrderRepository } from '../../../../order/infrastructure/persistence/prisma-order.repository';

const router: Router = Router();

const orderRepository = new PrismaOrderRepository();
const orderService = new OrderService(orderRepository);
const mercadoPagoService = new MercadoPagoService(orderRepository);
const mercadoPagoController = new MercadoPagoController(mercadoPagoService, orderService);

router.post('/create-preference', (req, res) => mercadoPagoController.createPreference(req, res));
router.post('/webhook', (req, res) => mercadoPagoController.webhook(req, res));
router.get('/payment/:paymentId/status', (req, res) => mercadoPagoController.getPaymentStatus(req, res));

export default router;
