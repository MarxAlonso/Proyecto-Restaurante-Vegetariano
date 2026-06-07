import { Router } from 'express';
import { ReservationController } from '../controllers/reservation.controller';
import { ReservationService } from '../../../application/reservation.service';
import { PrismaReservationRepository } from '../../persistence/prisma-reservation.repository';
import { TableService } from '../../../../tables/application/table.service';
import { PrismaTableRepository } from '../../../../tables/infrastructure/persistence/prisma-table.repository';
import { authenticate, requireRole, tryAuth } from '../../../../../middleware/auth';

const router: Router = Router();

const reservationRepository = new PrismaReservationRepository();
const tableRepository = new PrismaTableRepository();
const tableService = new TableService(tableRepository);
const reservationService = new ReservationService(reservationRepository);
const reservationController = new ReservationController(reservationService, tableService);

router.get('/', authenticate, requireRole('ADMIN'), (req, res) => reservationController.getAll(req, res));
router.get('/my', authenticate, (req, res) => reservationController.getMyReservations(req, res));
router.get('/availability', (req, res) => reservationController.checkAvailability(req, res));
router.get('/:id', (req, res) => reservationController.getById(req, res));
router.post('/', tryAuth, (req, res) => reservationController.create(req, res));
router.patch('/:id/cancel', authenticate, (req, res) => reservationController.cancel(req, res));

export default router;
