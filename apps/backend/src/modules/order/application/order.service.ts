import { OrderRepository } from '../domain/order.repository';
import prisma from '../../../infrastructure/persistence/prisma.client';

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

  /**
   * Security best practice: Usar agregaciones nativas de Prisma/PostgreSQL
   * en lugar de cargar TODOS los registros en memoria y filtrar en JS.
   *
   * Antes: this.orderRepository.findAllWithFilters({}) cargaba 100k+ filas
   * en RAM para luego filtrar con .filter() en JavaScript.
   * Ahora: Prisma aggregate/groupBy delega el cómputo a PostgreSQL.
   *
   * ISO 25010 - Time Behaviour: O(1) en RAM vs O(n) anterior
   * ISO 25010 - Resource Utilization: Evita OOM en Edge Functions
   */
  async getAdminStats() {
    // Usar aggregate para totales en una sola query SQL
    const [approvedAgg, statusCounts, typeStats] = await Promise.all([
      prisma.order.aggregate({
        _count: { id: true },
        _sum: { total: true },
        where: { paymentStatus: 'APPROVED' },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.order.groupBy({
        by: ['orderType'],
        where: { paymentStatus: 'APPROVED' },
        _count: { orderType: true },
        _sum: { total: true },
      }),
    ]);

    const statusMap: Record<string, number> = {
      PENDING: 0, PREPARING: 0, READY: 0, COMPLETED: 0, CANCELLED: 0,
    };
    statusCounts.forEach((s) => { statusMap[s.status] = s._count._all; });

    const totalOrders = statusCounts.reduce((sum, s) => sum + s._count._all, 0);

    const dineIn = typeStats.find(t => t.orderType === 'DINE_IN');
    const takeaway = typeStats.find(t => t.orderType === 'TAKEAWAY');

    return {
      totalOrders,
      approvedOrders: approvedAgg._count.id,
      totalRevenue: Number(approvedAgg._sum.total ?? 0),
      dineIn: {
        count: dineIn?._count.orderType ?? 0,
        total: Number(dineIn?._sum.total ?? 0),
      },
      takeaway: {
        count: takeaway?._count.orderType ?? 0,
        total: Number(takeaway?._sum.total ?? 0),
      },
      pendingOrders: statusMap['PENDING'],
      preparingOrders: statusMap['PREPARING'],
      completedOrders: statusMap['COMPLETED'],
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
