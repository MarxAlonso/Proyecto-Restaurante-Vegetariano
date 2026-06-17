import { Router } from 'express';
import { TableController } from '../controllers/table.controller';
import { TableService } from '../../../application/table.service';
import { PrismaTableRepository } from '../../persistence/prisma-table.repository';
import { authenticate, requireRole } from '../../../../../middleware/auth';

const router: Router = Router();

const tableRepository = new PrismaTableRepository();
const tableService = new TableService(tableRepository);
const tableController = new TableController(tableService);

/**
 * @swagger
 * /api/tables:
 *   get:
 *     tags:
 *       - Tables
 *     summary: Get all tables
 *     description: Retrieve all restaurant tables
 *     responses:
 *       200:
 *         description: List of tables
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Table'
 */
router.get('/', (req, res) => tableController.getAll(req, res));

/**
 * @swagger
 * /api/tables/available:
 *   get:
 *     tags:
 *       - Tables
 *     summary: Get available tables
 *     description: Retrieve currently available tables
 *     responses:
 *       200:
 *         description: List of available tables
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Table'
 */
router.get('/available', (req, res) => tableController.getAvailable(req, res));

/**
 * @swagger
 * /api/tables/details/{id}:
 *   get:
 *     tags:
 *       - Tables
 *     summary: Get table details
 *     description: Get detailed information about a table (Admin only)
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
 *         description: Table details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Table'
 *       404:
 *         description: Table not found
 */
router.get('/details/:id', authenticate, requireRole('ADMIN'), (req, res) => tableController.getDetails(req, res));

/**
 * @swagger
 * /api/tables/{id}:
 *   get:
 *     tags:
 *       - Tables
 *     summary: Get table by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Table information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Table'
 *       404:
 *         description: Table not found
 */
router.get('/:id', (req, res) => tableController.getById(req, res));

/**
 * @swagger
 * /api/tables:
 *   post:
 *     tags:
 *       - Tables
 *     summary: Create table
 *     description: Create a new table (Admin only)
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
 *               - tableNumber
 *               - capacity
 *             properties:
 *               tableNumber:
 *                 type: integer
 *                 example: 1
 *               capacity:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       201:
 *         description: Table created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Table'
 */
router.post('/', authenticate, requireRole('ADMIN'), (req, res) => tableController.create(req, res));

/**
 * @swagger
 * /api/tables/{id}:
 *   put:
 *     tags:
 *       - Tables
 *     summary: Update table
 *     description: Update table information (Admin only)
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
 *             properties:
 *               tableNumber:
 *                 type: integer
 *               capacity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Table updated
 */
router.put('/:id', authenticate, requireRole('ADMIN'), (req, res) => tableController.update(req, res));

/**
 * @swagger
 * /api/tables/{id}:
 *   patch:
 *     tags:
 *       - Tables
 *     summary: Update table status
 *     description: Change table status (Admin or Kitchen only)
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
 *                 enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED']
 *     responses:
 *       200:
 *         description: Table status updated
 */
router.patch('/:id', authenticate, requireRole('ADMIN', 'KITCHEN'), (req, res) => tableController.updateStatus(req, res));

/**
 * @swagger
 * /api/tables/{id}:
 *   delete:
 *     tags:
 *       - Tables
 *     summary: Delete table
 *     description: Delete a table (Admin only)
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
 *         description: Table deleted
 */
router.delete('/:id', authenticate, requireRole('ADMIN'), (req, res) => tableController.delete(req, res));

export default router;
