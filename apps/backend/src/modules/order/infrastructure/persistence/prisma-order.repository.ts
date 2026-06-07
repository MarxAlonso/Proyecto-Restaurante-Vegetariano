import { OrderRepository } from '../../domain/order.repository';
import { OrderEntity } from '../../domain/order.entity';
import prisma from '../../../../infrastructure/persistence/prisma.client';

export class PrismaOrderRepository implements OrderRepository {
  async findAll(): Promise<OrderEntity[]> {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { menuItem: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
        table: { select: { id: true, number: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return orders as any as OrderEntity[];
  }

  async findAllWithFilters(filters: { paymentStatus?: string; status?: string; startDate?: Date; endDate?: Date }): Promise<OrderEntity[]> {
    const where: any = {};
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
    if (filters.status) where.status = filters.status;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: { menuItem: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
        table: { select: { id: true, number: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return orders as any as OrderEntity[];
  }

  async findByUserId(userId: string): Promise<OrderEntity[]> {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return orders as any as OrderEntity[];
  }

  async findById(id: string): Promise<OrderEntity | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { menuItem: true },
        },
        table: { select: { id: true, number: true } },
      },
    });
    return order as any as OrderEntity | null;
  }

  async save(data: any): Promise<OrderEntity> {
    const created = await prisma.order.create({
      data: {
        userId: data.userId,
        status: data.status,
        total: data.total,
        notes: data.notes,
        orderType: data.orderType || 'DINE_IN',
        paymentStatus: data.paymentStatus || 'PENDING',
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        tableId: data.tableId || null,
        items: {
          create: data.items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true, table: true },
    });

    if (data.tableId) {
      await prisma.table.update({
        where: { id: data.tableId },
        data: { status: 'OCCUPIED' },
      });
    }

    return created as any as OrderEntity;
  }

  async updateStatus(id: string, status: string): Promise<OrderEntity> {
    const updated = await prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: { items: true },
    });
    return updated as any as OrderEntity;
  }

  async updatePaymentStatus(id: string, paymentStatus: string, paymentId: string): Promise<OrderEntity> {
    const updated = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: paymentStatus as any,
        mercadoPagoPaymentId: paymentId,
      },
      include: { items: true },
    });
    return updated as any as OrderEntity;
  }

  async updateMercadoPagoPreference(id: string, preferenceId: string): Promise<OrderEntity> {
    const updated = await prisma.order.update({
      where: { id },
      data: { mercadoPagoPreferenceId: preferenceId },
      include: { items: true },
    });
    return updated as any as OrderEntity;
  }

  async findByPreferenceId(preferenceId: string): Promise<OrderEntity | null> {
    const order = await prisma.order.findFirst({
      where: { mercadoPagoPreferenceId: preferenceId },
      include: { items: true },
    });
    return order as any as OrderEntity | null;
  }

  async findKitchenOrders(): Promise<OrderEntity[]> {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ['PENDING', 'PREPARING', 'READY'],
        },
      },
      include: {
        items: {
          include: { menuItem: true },
        },
        table: { select: { id: true, number: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return orders as any as OrderEntity[];
  }

  async countByStatus(): Promise<Record<string, number>> {
    const counts = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });

    const stats: Record<string, number> = {
      PENDING: 0,
      PREPARING: 0,
      READY: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    counts.forEach((item: { status: string; _count: { _all: number } }) => {
      stats[item.status] = item._count._all;
    });

    return stats;
  }

  async getDailyRevenue(days: number): Promise<{ date: string; revenue: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: 'APPROVED',
        createdAt: { gte: startDate },
      },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const revenueMap = new Map<string, number>();
    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      revenueMap.set(d.toISOString().split('T')[0], 0);
    }

    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      revenueMap.set(dateKey, (revenueMap.get(dateKey) || 0) + Number(order.total));
    });

    return Array.from(revenueMap.entries()).map(([date, revenue]) => ({ date, revenue }));
  }

  async getOrderTypeStats(): Promise<{ orderType: string; count: number; total: number }[]> {
    const orders = await prisma.order.findMany({
      where: { paymentStatus: 'APPROVED' },
      select: { orderType: true, total: true },
    });

    const statsMap = new Map<string, { count: number; total: number }>();
    orders.forEach((order) => {
      const key = order.orderType;
      const existing = statsMap.get(key) || { count: 0, total: 0 };
      existing.count += 1;
      existing.total += Number(order.total);
      statsMap.set(key, existing);
    });

    return Array.from(statsMap.entries()).map(([orderType, data]) => ({
      orderType,
      count: data.count,
      total: data.total,
    }));
  }

  async deleteOrder(id: string): Promise<void> {
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new Error('Pedido no encontrado');

    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });

    if (order.tableId) {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'AVAILABLE' },
      });
    }
  }

  async updateTableStatus(tableId: string, status: string): Promise<void> {
    await prisma.table.update({
      where: { id: tableId },
      data: { status: status as any },
    });
  }
}
