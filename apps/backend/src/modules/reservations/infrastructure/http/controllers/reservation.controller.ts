import { Request, Response } from 'express';
import { ReservationService } from '../../../application/reservation.service';
import { TableService } from '../../../../tables/application/table.service';

export class ReservationController {
  constructor(
    private reservationService: ReservationService,
    private tableService: TableService
  ) {}

  async getAll(_req: Request, res: Response) {
    try {
      const reservations = await this.reservationService.getAllReservations();
      res.json(reservations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMyReservations(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: 'No autenticado' });
      const reservations = await this.reservationService.getMyReservations(userId);
      res.json(reservations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const reservation = await this.reservationService.getReservationById(req.params.id);
      if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada' });
      res.json(reservation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const reservation = await this.reservationService.createReservation({
        ...req.body,
        userId,
      });
      res.status(201).json(reservation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async cancel(req: Request, res: Response) {
    try {
      const reservation = await this.reservationService.cancelReservation(req.params.id);
      res.json(reservation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async checkAvailability(req: Request, res: Response) {
    try {
      const { date, time } = req.query;
      const availableTables = await this.tableService.getAvailableTables();
      res.json({ date, time, availableTables });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
