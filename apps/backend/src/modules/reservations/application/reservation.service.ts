import { ReservationRepository } from '../domain/reservation.repository';

export class ReservationService {
  constructor(private reservationRepository: ReservationRepository) {}

  async getAllReservations() {
    return this.reservationRepository.findAll();
  }

  async getReservationById(id: string) {
    return this.reservationRepository.findById(id);
  }

  async getMyReservations(userId: string) {
    return this.reservationRepository.findByUserId(userId);
  }

  async createReservation(data: {
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    guests: number;
    tableId: string;
    userId?: string;
    specialRequests?: string;
  }) {
    const reservationDate = new Date(data.date);

    const isAvailable = await this.reservationRepository.getTableAvailability(
      data.tableId,
      reservationDate,
      data.time
    );

    if (!isAvailable) {
      throw new Error('La mesa no esta disponible en ese horario');
    }

    return this.reservationRepository.create({
      userId: data.userId || null,
      name: data.name,
      email: data.email,
      phone: data.phone,
      date: reservationDate,
      time: data.time,
      guests: data.guests,
      tableId: data.tableId,
      specialRequests: data.specialRequests || null,
    });
  }

  async cancelReservation(id: string) {
    return this.reservationRepository.cancel(id);
  }
}
