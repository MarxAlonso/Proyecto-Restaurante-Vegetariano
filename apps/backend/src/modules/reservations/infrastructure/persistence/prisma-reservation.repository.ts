import { ReservationRepository } from '../../domain/reservation.repository';
import { ReservationEntity } from '../../domain/reservation.entity';
import prisma from '../../../../infrastructure/persistence/prisma.client';
import { Prisma } from '@prisma/client';

type ReservationWithRelations = Prisma.ReservationGetPayload<{
  include: {
    table: true;
    user: { select: { id: true; name: true; email: true } };
  };
}>;

function toReservationEntity(r: ReservationWithRelations): ReservationEntity {
  return {
    id: r.id,
    userId: r.userId,
    name: r.name,
    email: r.email,
    phone: r.phone,
    date: r.date,
    time: r.time,
    guests: r.guests,
    tableId: r.tableId,
    table: r.table,
    user: r.user ?? undefined,
    specialRequests: r.specialRequests,
    status: r.status as ReservationEntity['status'],
    createdAt: r.createdAt,
  };
}

type ReservationSimple = Prisma.ReservationGetPayload<{
  include: { table: true };
}>;

function toReservationSimple(r: ReservationSimple): ReservationEntity {
  return {
    id: r.id,
    userId: r.userId,
    name: r.name,
    email: r.email,
    phone: r.phone,
    date: r.date,
    time: r.time,
    guests: r.guests,
    tableId: r.tableId,
    table: r.table,
    specialRequests: r.specialRequests,
    status: r.status as ReservationEntity['status'],
    createdAt: r.createdAt,
  };
}

export class PrismaReservationRepository implements ReservationRepository {
  async findAll(): Promise<ReservationEntity[]> {
    const reservations = await prisma.reservation.findMany({
      include: {
        table: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return reservations.map(toReservationEntity);
  }

  async findById(id: string): Promise<ReservationEntity | null> {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        table: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    return reservation ? toReservationEntity(reservation) : null;
  }

  async findByUserId(userId: string): Promise<ReservationEntity[]> {
    const reservations = await prisma.reservation.findMany({
      where: { userId },
      include: { table: true },
      orderBy: { createdAt: 'desc' },
    });
    return reservations.map(toReservationSimple);
  }

  async findByDate(date: Date): Promise<ReservationEntity[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const reservations = await prisma.reservation.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
        status: 'CONFIRMED',
      },
      include: { table: true },
      orderBy: { time: 'asc' },
    });
    return reservations.map(toReservationSimple);
  }

  async create(data: any): Promise<ReservationEntity> {
    const reservation = await prisma.reservation.create({
      data: {
        userId: data.userId || null,
        name: data.name,
        email: data.email,
        phone: data.phone,
        date: data.date,
        time: data.time,
        guests: data.guests,
        tableId: data.tableId,
        specialRequests: data.specialRequests,
        status: 'CONFIRMED',
      },
      include: { table: true },
    });

    await prisma.table.update({
      where: { id: data.tableId },
      data: { status: 'RESERVED' },
    });

    return toReservationSimple(reservation);
  }

  async cancel(id: string): Promise<ReservationEntity> {
    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { table: true },
    });

    await prisma.table.update({
      where: { id: reservation.tableId },
      data: { status: 'AVAILABLE' },
    });

    return toReservationSimple(reservation);
  }

  async getTableAvailability(tableId: string, date: Date, time: string): Promise<boolean> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [targetHour] = time.split(':').map(Number);

    const existing = await prisma.reservation.findFirst({
      where: {
        tableId,
        date: { gte: startOfDay, lte: endOfDay },
        status: 'CONFIRMED',
        time: {
          in: [
            `${String(targetHour).padStart(2, '0')}:00`,
            `${String(targetHour).padStart(2, '0')}:30`,
            `${String(targetHour + 1).padStart(2, '0')}:00`,
            `${String(targetHour + 1).padStart(2, '0')}:30`,
          ],
        },
      },
    });

    return !existing;
  }
}
