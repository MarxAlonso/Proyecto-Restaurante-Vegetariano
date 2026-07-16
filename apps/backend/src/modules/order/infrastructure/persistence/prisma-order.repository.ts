import { OrderRepository } from '../../domain/order.repository';
import { OrderEntity, OrderItemEntity } from '../../domain/order.entity';
import prisma from '../../../../infrastructure/persistence/prisma.client';
import { Prisma } from '@prisma/client';

// ============================================================
// Conversión tipada de Prisma → OrderEntity
// Sin `as any` — mapeo explícito preserva type safety
// ISO 25010 - Maintainability (Analyzability)
// ============================================================

/**
 * Convierte un Order de Prisma (con items, user, table) a OrderEntity.
 */
function toOrderEntityFull(
  order: Prisma.OrderGetPayload<{
    include: {
      items: { include: { menuItem: true } };
      user: { select: { id: true; name: true; email: true } };
      table: { select: { id: true; number: true } };
    };
  }>,
): OrderEntity {
  return {
    id: order.id,
    userId: order.userId ?? undefined,
    status: order.status as OrderEntity['status'],
    total: Number(order.total),
    notes: order.notes,
    orderType: order.orderType as OrderEntity['orderType'],
    paymentStatus: order.paymentStatus as OrderEntity['paymentStatus'],
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    tableId: order.tableId,
    table: order.table,
    user: order.user,
    mercadoPagoPreferenceId: order.mercadoPagoPreferenceId,
    mercadoPagoPaymentId: order.mercadoPagoPaymentId,
    items: order.items.map(toOrderItemEntity),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

function toOrderItemEntity(item: {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: Prisma.Decimal | number;
}): OrderItemEntity {
  return {
    id: item.id,
    orderId: item.orderId,
    menuItemId: item.menuItemId,
    quantity: item.quantity,
    price: Number(item.price),
  };
}

/**
 * Convierte un Order con items (con o sin table) a OrderEntity.
 */
function toOrderEntitySimple(order: {
  id: string;
  userId: string | null;
  status: string;
  total: Prisma.Decimal | number;
  notes: string | null;
  orderType: string;
  paymentStatus: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  tableId: string | null;
  mercadoPagoPreferenceId: string | null;
  mercadoPagoPaymentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    orderId: string;
    menuItemId: string;
    quantity: number;
    price: Prisma.Decimal | number;
  }>;
  table?: { id: string; number: number } | null;
  user?: { id: string; name: string; email: string } | null;
}): OrderEntity {
  return {
    id: order.id,
    userId: order.userId ?? undefined,
    status: order.status as OrderEntity['status'],
    total: Number(order.total),
    notes: order.notes,
    orderType: order.orderType as OrderEntity['orderType'],
    paymentStatus: order.paymentStatus as OrderEntity['paymentStatus'],
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    tableId: order.tableId,
    table: order.table ?? null,
    user: order.user ?? null,
    mercadoPagoPreferenceId: order.mercadoPagoPreferenceId,
    mercadoPagoPaymentId: order.mercadoPagoPaymentId,
    items: order.items.map(toOrderItemEntity),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export class PrismaOrderRepository implements OrderRepository {
  async findAll(): Promise<OrderEntity[]> {
    const orders = await prisma.order.findMany({
      include: {
        items: { include: { menuItem: true } },
        user: { select: { id: true, name: true, email: true } },
        table: { select: { id: true, number: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map(toOrderEntityFull);
  }

  async findAllWithFilters(filters: {
    paymentStatus?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<OrderEntity[]> {
    const where: Prisma.OrderWhereInput = {};
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus as any;
    if (filters.status) where.status = filters.status as any;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { menuItem: true } },
        user: { select: { id: true, name: true, email: true } },
        table: { select: { id: true, number: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map(toOrderEntityFull);
  }

  async findByUserId(userId: string): Promise<OrderEntity[]> {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map(toOrderEntitySimple);
  }

  async findById(id: string): Promise<OrderEntity | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { menuItem: true } },
        table: { select: { id: true, number: true } },
      },
    });
    return order ? toOrderEntitySimple(order) : null;
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

    return toOrderEntitySimple(created);
  }

  async updateStatus(id: string, status: string): Promise<OrderEntity> {
    const updated = await prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: { items: true },
    });
    return toOrderEntitySimple(updated);
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
    return toOrderEntitySimple(updated);
  }

  async updateMercadoPagoPreference(id: string, preferenceId: string): Promise<OrderEntity> {
    const updated = await prisma.order.update({
      where: { id },
      data: { mercadoPagoPreferenceId: preferenceId },
      include: { items: true },
    });
    return toOrderEntitySimple(updated);
  }

  async findByPreferenceId(preferenceId: string): Promise<OrderEntity | null> {
    const order = await prisma.order.findFirst({
      where: { mercadoPagoPreferenceId: preferenceId },
      include: { items: true },
    });
    return order ? toOrderEntitySimple(order) : null;
  }

  async findKitchenOrders(): Promise<OrderEntity[]> {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'PREPARING', 'READY'] },
      },
      include: {
        items: { include: { menuItem: true } },
        table: { select: { id: true, number: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return orders.map(toOrderEntitySimple);
  }

  async countByStatus(): Promise<Record<string, number>> {
    const counts = await prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const stats: Record<string, number> = {
      PENDING: 0, PREPARING: 0, READY: 0, COMPLETED: 0, CANCELLED: 0,
    };
    counts.forEach((item) => { stats[item.status] = item._count._all; });
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
    const stats = await prisma.order.groupBy({
      by: ['orderType'],
      where: { paymentStatus: 'APPROVED' },
      _count: { orderType: true },
      _sum: { total: true },
    });
    return stats.map((item) => ({
      orderType: item.orderType,
      count: item._count.orderType,
      total: Number(item._sum.total ?? 0),
    }));
  }

  async deleteOrder(id: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
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
