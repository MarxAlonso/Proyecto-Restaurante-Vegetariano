import { TableRepository } from '../../domain/table.repository';
import { TableEntity } from '../../domain/table.entity';
import prisma from '../../../../infrastructure/persistence/prisma.client';

export class PrismaTableRepository implements TableRepository {
  async findAll(): Promise<TableEntity[]> {
    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' },
    });
    return tables as any as TableEntity[];
  }

  async findAvailable(): Promise<TableEntity[]> {
    const tables = await prisma.table.findMany({
      where: { status: 'AVAILABLE' },
      orderBy: { number: 'asc' },
    });
    return tables as any as TableEntity[];
  }

  async findById(id: string): Promise<TableEntity | null> {
    const table = await prisma.table.findUnique({ where: { id } });
    return table as any as TableEntity | null;
  }

  async findByIdWithDetails(id: string): Promise<any | null> {
    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        reservations: {
          where: { status: 'CONFIRMED' },
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { date: 'desc' },
        },
        orders: {
          where: { status: { in: ['PENDING', 'PREPARING', 'READY'] } },
          include: {
            items: { include: { menuItem: true } },
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return table;
  }

  async findByNumber(number: number): Promise<TableEntity | null> {
    const table = await prisma.table.findUnique({ where: { number } });
    return table as any as TableEntity | null;
  }

  async create(data: { number: number; capacity: number }): Promise<TableEntity> {
    const table = await prisma.table.create({
      data: { number: data.number, capacity: data.capacity, status: 'AVAILABLE' },
    });
    return table as any as TableEntity;
  }

  async update(id: string, data: { number?: number; capacity?: number }): Promise<TableEntity> {
    const table = await prisma.table.update({
      where: { id },
      data,
    });
    return table as any as TableEntity;
  }

  async updateStatus(id: string, status: string): Promise<TableEntity> {
    const table = await prisma.table.update({
      where: { id },
      data: { status: status as any },
    });
    return table as any as TableEntity;
  }

  async clearReservationsAndOrders(id: string): Promise<void> {
    await prisma.reservation.updateMany({
      where: { tableId: id, status: 'CONFIRMED' },
      data: { status: 'CANCELLED' },
    });
    await prisma.order.updateMany({
      where: { tableId: id, status: { in: ['PENDING', 'PREPARING', 'READY'] } },
      data: { status: 'CANCELLED' },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.table.delete({ where: { id } });
  }
}
