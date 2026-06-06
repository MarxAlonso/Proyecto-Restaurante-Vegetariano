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
        items: {
          create: data.items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });
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
}
