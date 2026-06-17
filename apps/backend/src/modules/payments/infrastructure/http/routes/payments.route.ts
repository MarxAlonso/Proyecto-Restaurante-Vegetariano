import { Router } from 'express';
import { PaymentsController } from '../controllers/payments.controller';
import { PaymentsService } from '../../../application/payments.service';
import { PrismaEmployeePaymentRepository } from '../../persistence/prisma-employee-payment.repository';
import { authenticate, requireRole } from '../../../../../middleware/auth';

const router: Router = Router();

const repository = new PrismaEmployeePaymentRepository();
const service = new PaymentsService(repository);
const controller = new PaymentsController(service);

/**
 * @swagger
 * /api/payments/user/{userId}:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get user payments
 *     description: Get payment history for a user (Admin only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of payments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   date:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized - Admin role required
 */
router.get('/user/:userId', authenticate, requireRole('ADMIN'), (req, res) => controller.getByUserId(req, res));

/**
 * @swagger
 * /api/payments:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Create payment
 *     description: Record a new payment for employee (Admin only)
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
 *               - userId
 *               - amount
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               amount:
 *                 type: number
 *                 format: float
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment created
 *       401:
 *         description: Unauthorized - Admin role required
 */
router.post('/', authenticate, requireRole('ADMIN'), (req, res) => controller.create(req, res));

/**
 * @swagger
 * /api/payments/{id}:
 *   delete:
 *     tags:
 *       - Payments
 *     summary: Delete payment
 *     description: Delete a payment record (Admin only)
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
 *         description: Payment deleted
 *       401:
 *         description: Unauthorized - Admin role required
 */
router.delete('/:id', authenticate, requireRole('ADMIN'), (req, res) => controller.delete(req, res));

export default router;
