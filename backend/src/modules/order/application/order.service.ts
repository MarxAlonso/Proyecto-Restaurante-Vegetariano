import { OrderRepository } from '../domain/order.repository.js';

export class OrderService {
  constructor(private orderRepository: OrderRepository) {}

  async createOrder(userId: string, data: any) {
    const { items, notes } = data;

    if (!items || items.length === 0) {
      throw new Error('No items provided');
    }

    const total = items.reduce((sum: number, item: any) => sum + (Number(item.price) * item.quantity), 0);

    return this.orderRepository.save({
      userId,
      status: 'PENDING',
      total,
      notes,
      items: items.map((item: any) => ({
        menuItemId: item.id || item.menuItemId,
        quantity: item.quantity,
        price: Number(item.price),
      })),
    });
  }

  async getUserOrders(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.orderRepository.findAll();
    }
    return this.orderRepository.findByUserId(userId);
  }

  async getKitchenOrders() {
    return this.orderRepository.findKitchenOrders();
  }

  async updateStatus(orderId: string, status: string, userRole: string) {
    // Basic validation based on role
    const upperStatus = status.toUpperCase();
    
    if (userRole === 'KITCHEN' && !['PREPARING', 'READY'].includes(upperStatus)) {
      throw new Error('Invalid status for kitchen');
    }

    if (userRole === 'CLIENT' && upperStatus !== 'CANCELLED') {
      throw new Error('Clients can only cancel orders');
    }

    return this.orderRepository.updateStatus(orderId, upperStatus);
  }

  async getOrderById(id: string) {
    return this.orderRepository.findById(id);
  }
}
