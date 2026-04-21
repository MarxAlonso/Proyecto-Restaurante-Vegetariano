import { Request, Response } from 'express';
import { OrderService } from '../../../application/order.service.js';

export class OrderController {
  constructor(private orderService: OrderService) {}

  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const order = await this.orderService.createOrder(userId, req.body);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserOrders(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      const orders = await this.orderService.getUserOrders(userId, userRole);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getKitchenOrders(req: Request, res: Response) {
    try {
      const orders = await this.orderService.getKitchenOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      const userRole = (req as any).user?.role;
      const order = await this.orderService.updateStatus(req.params.id, status, userRole);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const order = await this.orderService.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      if (order.userId !== userId && userRole !== 'ADMIN' && userRole !== 'KITCHEN') {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
