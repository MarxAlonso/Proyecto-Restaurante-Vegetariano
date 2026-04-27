import { Router } from 'express';
import { MenuController } from '../controllers/menu.controller.js';
import { MenuService } from '../../../application/menu.service.js';
import { PrismaMenuItemRepository } from '../../persistence/prisma-menu-item.repository.js';
import { authenticate, requireRole } from '../../../../../middleware/auth.js';

const router: Router = Router();

const menuItemRepository = new PrismaMenuItemRepository();
const menuService = new MenuService(menuItemRepository);
const menuController = new MenuController(menuService);

router.get('/', (req, res) => menuController.getAll(req, res));
router.get('/:id', (req, res) => menuController.getById(req, res));

router.post('/', authenticate, requireRole('ADMIN'), (req, res) => menuController.create(req, res));
router.put('/:id', authenticate, requireRole('ADMIN'), (req, res) => menuController.update(req, res));
router.delete('/:id', authenticate, requireRole('ADMIN'), (req, res) => menuController.delete(req, res));

export default router;
