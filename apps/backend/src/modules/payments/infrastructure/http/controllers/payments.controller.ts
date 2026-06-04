import { Request, Response } from 'express';
import { PaymentsService } from '../../../application/payments.service';

export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  async getByUserId(req: Request, res: Response) {
    try {
      const payments = await this.paymentsService.getByUserId(req.params.userId as string);
      res.json(payments);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const payment = await this.paymentsService.create(req.body);
      res.status(201).json(payment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.paymentsService.delete(req.params.id as string);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
