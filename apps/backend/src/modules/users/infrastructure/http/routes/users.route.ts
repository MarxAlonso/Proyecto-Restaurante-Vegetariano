import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../../../application/users.service';
import { authenticate, requireRole } from '../../../../../middleware/auth';

const router: Router = Router();

const usersService = new UsersService();
const usersController = new UsersController(usersService);

/**
 * @swagger
 * /api/users/worker:
 *   post:
 *     tags:
 *       - Users
 *     summary: Create worker
 *     description: Create a new worker account (Admin only)
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
 *               - email
 *               - password
 *               - name
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: ['KITCHEN', 'DELIVERY']
 *     responses:
 *       201:
 *         description: Worker created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Admin role required
 */
router.post('/worker', authenticate, requireRole('ADMIN'), (req, res) => usersController.createWorker(req, res));

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: Retrieve all users (Admin only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Admin role required
 */
router.get('/', authenticate, requireRole('ADMIN'), (req, res) => usersController.getAll(req, res));

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user
 *     description: Update user information (Admin only)
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.put('/:id', authenticate, requireRole('ADMIN'), (req, res) => usersController.update(req, res));

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete user
 *     description: Delete a user (Admin only)
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
 *         description: User deleted
 *       401:
 *         description: Unauthorized - Admin role required
 *       404:
 *         description: User not found
 */
router.delete('/:id', authenticate, requireRole('ADMIN'), (req, res) => usersController.delete(req, res));

export default router;
