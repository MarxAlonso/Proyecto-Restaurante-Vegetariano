import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../../../application/users.service';
import { authenticate, requireRole } from '../../../../../middleware/auth';

const router: Router = Router();

const usersService = new UsersService();
const usersController = new UsersController(usersService);

router.post('/worker', authenticate, requireRole('ADMIN'), (req, res) => usersController.createWorker(req, res));
router.get('/', authenticate, requireRole('ADMIN'), (req, res) => usersController.getAll(req, res));
router.put('/:id', authenticate, requireRole('ADMIN'), (req, res) => usersController.update(req, res));
router.delete('/:id', authenticate, requireRole('ADMIN'), (req, res) => usersController.delete(req, res));

export default router;
