import { Router } from 'express';
import { PaymentsController } from '../controllers/payments.controller';
import { PaymentsService } from '../../../application/payments.service';
import { PrismaEmployeePaymentRepository } from '../../persistence/prisma-employee-payment.repository';
import { authenticate, requireRole } from '../../../../../middleware/auth';

const router: Router = Router();

const repository = new PrismaEmployeePaymentRepository();
const service = new PaymentsService(repository);
const controller = new PaymentsController(service);

router.get('/user/:userId', authenticate, requireRole('ADMIN'), (req, res) => controller.getByUserId(req, res));
router.post('/', authenticate, requireRole('ADMIN'), (req, res) => controller.create(req, res));
router.delete('/:id', authenticate, requireRole('ADMIN'), (req, res) => controller.delete(req, res));

export default router;
