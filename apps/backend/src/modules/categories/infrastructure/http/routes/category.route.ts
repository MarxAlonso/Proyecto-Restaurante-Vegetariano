import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { CategoryService } from '../../../application/category.service';
import { PrismaCategoryRepository } from '../../persistence/prisma-category.repository';
import { authenticate, requireRole } from '../../../../../middleware/auth';

const router: Router = Router();

const categoryRepository = new PrismaCategoryRepository();
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get all categories
 *     description: Retrieve all menu categories
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get('/', (req, res) => categoryController.getAll(req, res));

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Category details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 */
router.get('/:id', (req, res) => categoryController.getById(req, res));

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags:
 *       - Categories
 *     summary: Create category
 *     description: Create a new category (Admin only)
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ensaladas
 *               description:
 *                 type: string
 *                 example: Ensaladas frescas y saludables
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       401:
 *         description: Unauthorized - Admin role required
 */
router.post('/', authenticate, requireRole('ADMIN'), (req, res) => categoryController.create(req, res));

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags:
 *       - Categories
 *     summary: Update category
 *     description: Update a category (Admin only)
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
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 */
router.put('/:id', authenticate, requireRole('ADMIN'), (req, res) => categoryController.update(req, res));

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags:
 *       - Categories
 *     summary: Delete category
 *     description: Delete a category (Admin only)
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
 *         description: Category deleted
 *       401:
 *         description: Unauthorized - Admin role required
 *       404:
 *         description: Category not found
 */
router.delete('/:id', authenticate, requireRole('ADMIN'), (req, res) => categoryController.delete(req, res));

export default router;
