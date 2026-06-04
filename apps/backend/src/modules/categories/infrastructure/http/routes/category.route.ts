import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { CategoryService } from '../../../application/category.service';
import { PrismaCategoryRepository } from '../../persistence/prisma-category.repository';
import { authenticate, requireRole } from '../../../../../middleware/auth';

const router: Router = Router();

const categoryRepository = new PrismaCategoryRepository();
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

router.get('/', (req, res) => categoryController.getAll(req, res));
router.get('/:id', (req, res) => categoryController.getById(req, res));

router.post('/', authenticate, requireRole('ADMIN'), (req, res) => categoryController.create(req, res));
router.put('/:id', authenticate, requireRole('ADMIN'), (req, res) => categoryController.update(req, res));
router.delete('/:id', authenticate, requireRole('ADMIN'), (req, res) => categoryController.delete(req, res));

export default router;
