import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { MercadoPagoService } from '../../../application/mercado-pago.service';
import { OrderService } from '../../../../order/application/order.service';

export class MercadoPagoController {
  constructor(
    private mercadoPagoService: MercadoPagoService,
    private orderService: OrderService
  ) {}

  private getUserId(req: Request): string | undefined {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        return decoded.id;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  async createPreference(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const { items, notes, orderType, tableId, customerName, customerEmail, customerPhone } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'No items provided' });
      }

      const order = await this.orderService.createOrder({
        userId,
        items,
        notes,
        orderType: orderType || 'DINE_IN',
        tableId: tableId || undefined,
        customerName: customerName || undefined,
        customerEmail: customerEmail || undefined,
        customerPhone: customerPhone || undefined,
      });

      const payerEmail = customerEmail || (req as any).user?.email;

      const preference = await this.mercadoPagoService.createPreference(
        order.id,
        items.map((i: any) => ({
          title: i.name || i.title,
          quantity: i.quantity,
          price: Number(i.price),
        })),
        payerEmail
      );

      await this.orderService.updateMercadoPagoPreference(order.id, preference.id);

      res.json({
        orderId: order.id,
        preferenceId: preference.id,
        initPoint: preference.initPoint,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async webhook(req: Request, res: Response) {
    try {
      await this.mercadoPagoService.processWebhook(req.query, req.body);
      res.status(200).json({ received: true });
    } catch (error: any) {
      res.status(200).json({ received: true });
    }
  }

  async getPaymentStatus(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const status = await this.mercadoPagoService.getPaymentStatus(paymentId);
      res.json({ status });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
