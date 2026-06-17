import { Router } from 'express';
import { MenuController } from '../controllers/menu.controller';
import { MenuService } from '../../../application/menu.service';
import { PrismaMenuItemRepository } from '../../persistence/prisma-menu-item.repository';
import { authenticate, requireRole } from '../../../../../middleware/auth';
import { upload } from '../../../../../middleware/upload.middleware';

const router: Router = Router();

const menuItemRepository = new PrismaMenuItemRepository();
const menuService = new MenuService(menuItemRepository);
const menuController = new MenuController(menuService);

/**
 * @swagger
 * /api/menu:
 *   get:
 *     tags:
 *       - Menu
 *     summary: Get all menu items
 *     description: Retrieve all available menu items
 *     responses:
 *       200:
 *         description: List of menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MenuItem'
 */
router.get('/', (req, res) => menuController.getAll(req, res));

/**
 * @swagger
 * /api/menu/{id}:
 *   get:
 *     tags:
 *       - Menu
 *     summary: Get menu item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Menu item ID
 *     responses:
 *       200:
 *         description: Menu item details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MenuItem'
 *       404:
 *         description: Menu item not found
 */
router.get('/:id', (req, res) => menuController.getById(req, res));

/**
 * @swagger
 * /api/menu:
 *   post:
 *     tags:
 *       - Menu
 *     summary: Create new menu item
 *     description: Add a new menu item (Admin only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ensalada Griega
 *               description:
 *                 type: string
 *                 example: Fresca ensalada con vegetales orgánicos
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 8.99
 *               category:
 *                 type: string
 *                 example: Ensaladas
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Menu item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MenuItem'
 *       401:
 *         description: Unauthorized - Admin role required
 *       400:
 *         description: Invalid input
 */
router.post('/', authenticate, requireRole('ADMIN'), upload.single('image'), (req, res) => menuController.create(req, res));

/**
 * @swagger
 * /api/menu/{id}:
 *   put:
 *     tags:
 *       - Menu
 *     summary: Update menu item
 *     description: Update an existing menu item (Admin only)
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               available:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MenuItem'
 *       401:
 *         description: Unauthorized - Admin role required
 *       404:
 *         description: Menu item not found
 */
router.put('/:id', authenticate, requireRole('ADMIN'), upload.single('image'), (req, res) => menuController.update(req, res));

/**
 * @swagger
 * /api/menu/{id}:
 *   delete:
 *     tags:
 *       - Menu
 *     summary: Delete menu item
 *     description: Delete a menu item (Admin only)
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
 *         description: Menu item deleted successfully
 *       401:
 *         description: Unauthorized - Admin role required
 *       404:
 *         description: Menu item not found
 */
router.delete('/:id', authenticate, requireRole('ADMIN'), (req, res) => menuController.delete(req, res));

export default router;
