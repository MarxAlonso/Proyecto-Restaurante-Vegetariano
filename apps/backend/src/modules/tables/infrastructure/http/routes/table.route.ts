import { Router } from 'express';
import { TableController } from '../controllers/table.controller';
import { TableService } from '../../../application/table.service';
import { PrismaTableRepository } from '../../persistence/prisma-table.repository';
import { authenticate, requireRole } from '../../../../../middleware/auth';

const router: Router = Router();

const tableRepository = new PrismaTableRepository();
const tableService = new TableService(tableRepository);
const tableController = new TableController(tableService);

router.get('/', (req, res) => tableController.getAll(req, res));
router.get('/available', (req, res) => tableController.getAvailable(req, res));
router.get('/details/:id', authenticate, requireRole('ADMIN'), (req, res) => tableController.getDetails(req, res));
router.get('/:id', (req, res) => tableController.getById(req, res));
router.post('/', authenticate, requireRole('ADMIN'), (req, res) => tableController.create(req, res));
router.put('/:id', authenticate, requireRole('ADMIN'), (req, res) => tableController.update(req, res));
router.patch('/:id', authenticate, requireRole('ADMIN', 'KITCHEN'), (req, res) => tableController.updateStatus(req, res));
router.delete('/:id', authenticate, requireRole('ADMIN'), (req, res) => tableController.delete(req, res));

export default router;
