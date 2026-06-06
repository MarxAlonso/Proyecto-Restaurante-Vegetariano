import { OrderRepository } from '../domain/order.repository';

export class OrderService {
  constructor(private orderRepository: OrderRepository) {}

  async createOrder(data: any) {
    const { items, notes, userId, orderType, customerName, customerEmail, customerPhone } = data;

    if (!items || items.length === 0) {
      throw new Error('No items provided');
    }

    const total = items.reduce((sum: number, item: any) => sum + (Number(item.price) * item.quantity), 0);

    return this.orderRepository.save({
      userId: userId || null,
      status: 'PENDING',
      total,
      notes,
      orderType: orderType || 'DINE_IN',
      paymentStatus: 'PENDING',
      customerName: customerName || null,
      customerEmail: customerEmail || null,
      customerPhone: customerPhone || null,
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

  async getOrderStats() {
    return this.orderRepository.countByStatus();
  }

  async updateMercadoPagoPreference(orderId: string, preferenceId: string) {
    return this.orderRepository.updateMercadoPagoPreference(orderId, preferenceId);
  }

  async findByPreferenceId(preferenceId: string) {
    return this.orderRepository.findByPreferenceId(preferenceId);
  }
}
