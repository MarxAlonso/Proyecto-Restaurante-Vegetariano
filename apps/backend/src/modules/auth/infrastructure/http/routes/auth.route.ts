import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { AuthService } from '../../../application/auth.service.js';
import { PrismaUserRepository } from '../../persistence/prisma-user.repository.js';
import { authenticate } from '../../../../../middleware/auth.js';

const router: Router = Router();

const userRepository = new PrismaUserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.get('/me', authenticate, (req, res) => authController.me(req, res));

export default router;
