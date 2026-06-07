import { ReservationEntity } from './reservation.entity';

export interface ReservationRepository {
  findAll(): Promise<ReservationEntity[]>;
  findById(id: string): Promise<ReservationEntity | null>;
  findByUserId(userId: string): Promise<ReservationEntity[]>;
  findByDate(date: Date): Promise<ReservationEntity[]>;
  create(data: any): Promise<ReservationEntity>;
  cancel(id: string): Promise<ReservationEntity>;
  getTableAvailability(tableId: string, date: Date, time: string): Promise<boolean>;
}
