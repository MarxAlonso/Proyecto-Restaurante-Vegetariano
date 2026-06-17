import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { OrderService } from '../../../application/order.service';
import { PrismaOrderRepository } from '../../persistence/prisma-order.repository';
import { authenticate, requireRole } from '../../../../../middleware/auth';

const router: Router = Router();

const orderRepository = new PrismaOrderRepository();
const orderService = new OrderService(orderRepository);
const orderController = new OrderController(orderService);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get user orders
 *     description: Retrieve all orders for the authenticated user
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, (req, res) => orderController.getUserOrders(req, res));

/**
 * @swagger
 * /api/orders/kitchen:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get kitchen orders
 *     description: Retrieve orders for kitchen staff (Kitchen or Admin only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of kitchen orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized - Kitchen role required
 */
router.get('/kitchen', authenticate, requireRole('KITCHEN', 'ADMIN'), (req, res) => orderController.getKitchenOrders(req, res));

/**
 * @swagger
 * /api/orders/stats:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get order statistics
 *     description: Retrieve order statistics (Kitchen or Admin only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Order statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrders:
 *                   type: integer
 *                 completedOrders:
 *                   type: integer
 *                 averageOrderValue:
 *                   type: number
 *       401:
 *         description: Unauthorized - Kitchen role required
 */
router.get('/stats', authenticate, requireRole('KITCHEN', 'ADMIN'), (req, res) => orderController.getStats(req, res));

/**
 * @swagger
 * /api/orders/admin/all:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get all orders
 *     description: Retrieve all orders in the system (Admin only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized - Admin role required
 */
router.get('/admin/all', authenticate, requireRole('ADMIN'), (req, res) => orderController.getAllOrders(req, res));

/**
 * @swagger
 * /api/orders/admin/stats:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get admin order statistics
 *     description: Retrieve detailed order statistics (Admin only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Admin order statistics
 */
router.get('/admin/stats', authenticate, requireRole('ADMIN'), (req, res) => orderController.getAdminStats(req, res));

/**
 * @swagger
 * /api/orders/admin/revenue:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get daily revenue
 *     description: Retrieve daily revenue data (Admin only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Daily revenue data
 */
router.get('/admin/revenue', authenticate, requireRole('ADMIN'), (req, res) => orderController.getDailyRevenue(req, res));

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get order by ID
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.get('/:id', authenticate, (req, res) => orderController.getById(req, res));

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Create new order
 *     description: Create a new order for authenticated user
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     menuItemId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid input
 */
router.post('/', authenticate, (req, res) => orderController.create(req, res));

/**
 * @swagger
 * /api/orders/guest:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Create guest order
 *     description: Create an order without authentication (for guest users)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - guestEmail
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               guestEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Guest order created
 */
router.post('/guest', (req, res) => orderController.createGuestOrder(req, res));

/**
 * @swagger
 * /api/orders/{id}:
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Update order status
 *     description: Update the status of an order
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']
 *     responses:
 *       200:
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.patch('/:id', authenticate, (req, res) => orderController.updateStatus(req, res));

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     tags:
 *       - Orders
 *     summary: Delete order
 *     description: Delete an order (Admin only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order deleted
 *       401:
 *         description: Unauthorized - Admin role required
 *       404:
 *         description: Order not found
 */
router.delete('/:id', authenticate, requireRole('ADMIN'), (req, res) => orderController.deleteOrder(req, res));

export default router;
