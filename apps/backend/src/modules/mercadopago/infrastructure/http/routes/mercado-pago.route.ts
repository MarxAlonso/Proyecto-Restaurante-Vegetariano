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

/**
 * @swagger
 * /api/mercadopago/create-preference:
 *   post:
 *     tags:
 *       - Payment - MercadoPago
 *     summary: Create payment preference
 *     description: Create a MercadoPago payment preference for an order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *     properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Payment preference created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preferenceId:
 *                   type: string
 *                   description: MercadoPago preference ID
 *                 initPoint:
 *                   type: string
 *                   description: URL to redirect user for payment
 *       400:
 *         description: Invalid order or preference creation failed
 */
router.post('/create-preference', (req, res) => mercadoPagoController.createPreference(req, res));

/**
 * @swagger
 * /api/mercadopago/webhook:
 *   post:
 *     tags:
 *       - Payment - MercadoPago
 *     summary: MercadoPago webhook
 *     description: Receive payment notifications from MercadoPago. This endpoint validates webhook signatures.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: ['payment', 'plan', 'subscription', 'invoice']
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received: 
 *                   type: boolean
 *       400:
 *         description: Invalid webhook signature
 */
router.post('/webhook', (req, res) => mercadoPagoController.webhook(req, res));

/**
 * @swagger
 * /api/mercadopago/payment/{paymentId}/status:
 *   get:
 *     tags:
 *       - Payment - MercadoPago
 *     summary: Get payment status
 *     description: Get the current status of a MercadoPago payment
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: MercadoPago payment ID
 *     responses:
 *       200:
 *         description: Payment status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: ['pending', 'approved', 'authorized', 'in_process', 'in_mediation', 'rejected', 'cancelled', 'refunded', 'disputed']
 *                 amount:
 *                   type: number
 *       404:
 *         description: Payment not found
 */
router.get('/payment/:paymentId/status', (req, res) => mercadoPagoController.getPaymentStatus(req, res));

export default router;
