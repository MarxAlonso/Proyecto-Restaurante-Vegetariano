import { Router } from 'express';
import { ReservationController } from '../controllers/reservation.controller';
import { ReservationService } from '../../../application/reservation.service';
import { PrismaReservationRepository } from '../../persistence/prisma-reservation.repository';
import { TableService } from '../../../../tables/application/table.service';
import { PrismaTableRepository } from '../../../../tables/infrastructure/persistence/prisma-table.repository';
import { authenticate, requireRole, tryAuth } from '../../../../../middleware/auth';

const router: Router = Router();

const reservationRepository = new PrismaReservationRepository();
const tableRepository = new PrismaTableRepository();
const tableService = new TableService(tableRepository);
const reservationService = new ReservationService(reservationRepository);
const reservationController = new ReservationController(reservationService, tableService);

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     tags:
 *       - Reservations
 *     summary: Get all reservations
 *     description: Retrieve all reservations (Admin only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       401:
 *         description: Unauthorized - Admin role required
 */
router.get('/', authenticate, requireRole('ADMIN'), (req, res) => reservationController.getAll(req, res));

/**
 * @swagger
 * /api/reservations/my:
 *   get:
 *     tags:
 *       - Reservations
 *     summary: Get my reservations
 *     description: Retrieve current user's reservations
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of user's reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 */
router.get('/my', authenticate, (req, res) => reservationController.getMyReservations(req, res));

/**
 * @swagger
 * /api/reservations/availability:
 *   get:
 *     tags:
 *       - Reservations
 *     summary: Check table availability
 *     description: Check available tables for a specific date and time
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: guests
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Available tables
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Table'
 */
router.get('/availability', (req, res) => reservationController.checkAvailability(req, res));

/**
 * @swagger
 * /api/reservations/{id}:
 *   get:
 *     tags:
 *       - Reservations
 *     summary: Get reservation by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reservation details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: Reservation not found
 */
router.get('/:id', (req, res) => reservationController.getById(req, res));

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     tags:
 *       - Reservations
 *     summary: Create reservation
 *     description: Create a new reservation (authentication optional)
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
 *               - tableId
 *               - reservationDate
 *               - guests
 *             properties:
 *               tableId:
 *                 type: string
 *                 format: uuid
 *               reservationDate:
 *                 type: string
 *                 format: date-time
 *               guests:
 *                 type: integer
 *                 minimum: 1
 *               specialRequests:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reservation created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Invalid input or table not available
 */
router.post('/', tryAuth, (req, res) => reservationController.create(req, res));

/**
 * @swagger
 * /api/reservations/{id}/cancel:
 *   patch:
 *     tags:
 *       - Reservations
 *     summary: Cancel reservation
 *     description: Cancel a reservation
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
 *         description: Reservation cancelled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: Reservation not found
 */
router.patch('/:id/cancel', authenticate, (req, res) => reservationController.cancel(req, res));

export default router;
