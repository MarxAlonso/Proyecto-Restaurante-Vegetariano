import { OrderRepository } from '../domain/order.repository';

export class OrderService {
  constructor(private orderRepository: OrderRepository) {}

  async createOrder(data: any) {
    const { items, notes, userId, orderType, tableId, customerName, customerEmail, customerPhone } = data;

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
      tableId: tableId || null,
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

  async getAllOrders(filters: { paymentStatus?: string; status?: string; startDate?: string; endDate?: string }) {
    const dateFilters: { startDate?: Date; endDate?: Date } = {};
    if (filters.startDate) dateFilters.startDate = new Date(filters.startDate);
    if (filters.endDate) dateFilters.endDate = new Date(filters.endDate);
    return this.orderRepository.findAllWithFilters({
      paymentStatus: filters.paymentStatus,
      status: filters.status,
      ...dateFilters,
    });
  }

  async getAdminStats() {
    const allOrders = await this.orderRepository.findAllWithFilters({});
    const approvedOrders = allOrders.filter(o => o.paymentStatus === 'APPROVED');
    const totalRevenue = approvedOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const dineIn = approvedOrders.filter(o => o.orderType === 'DINE_IN');
    const takeaway = approvedOrders.filter(o => o.orderType === 'TAKEAWAY');
    const pendingOrders = allOrders.filter(o => o.status === 'PENDING').length;
    const preparingOrders = allOrders.filter(o => o.status === 'PREPARING').length;
    const completedOrders = allOrders.filter(o => o.status === 'COMPLETED').length;

    return {
      totalOrders: allOrders.length,
      approvedOrders: approvedOrders.length,
      totalRevenue,
      dineIn: { count: dineIn.length, total: dineIn.reduce((s, o) => s + Number(o.total), 0) },
      takeaway: { count: takeaway.length, total: takeaway.reduce((s, o) => s + Number(o.total), 0) },
      pendingOrders,
      preparingOrders,
      completedOrders,
      monthlyRevenue: 0,
    };
  }

  async getDailyRevenue(days: number = 7) {
    return this.orderRepository.getDailyRevenue(days);
  }

  async deleteOrder(id: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new Error('Pedido no encontrado');
    await this.orderRepository.deleteOrder(id);
  }
}
