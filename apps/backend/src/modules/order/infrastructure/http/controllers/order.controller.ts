import { Request, Response } from 'express';
import { OrderService } from '../../../application/order.service';

export class OrderController {
  constructor(private orderService: OrderService) {}

  private serializeOrder(order: any) {
    if (!order) return null;
    return {
      ...order,
      total: Number(order.total),
      items: order.items?.map((item: any) => ({
        ...item,
        price: Number(item.price),
      })),
    };
  }

  private serializeOrders(orders: any[]) {
    return orders.map(order => this.serializeOrder(order));
  }

  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const order = await this.orderService.createOrder({ ...req.body, userId });
      res.status(201).json(this.serializeOrder(order));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async createGuestOrder(req: Request, res: Response) {
    try {
      const order = await this.orderService.createOrder(req.body);
      res.status(201).json(this.serializeOrder(order));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserOrders(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      const orders = await this.orderService.getUserOrders(userId, userRole);
      res.json(this.serializeOrders(orders));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getKitchenOrders(req: Request, res: Response) {
    try {
      const orders = await this.orderService.getKitchenOrders();
      res.json(this.serializeOrders(orders));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      const userRole = (req as any).user?.role;
      const order = await this.orderService.updateStatus(req.params.id as string, status, userRole);
      res.json(this.serializeOrder(order));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const order = await this.orderService.getOrderById(req.params.id as string);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      if (order.userId && order.userId !== userId && userRole !== 'ADMIN' && userRole !== 'KITCHEN') {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(this.serializeOrder(order));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStats(_req: Request, res: Response) {
    try {
      const stats = await this.orderService.getOrderStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
