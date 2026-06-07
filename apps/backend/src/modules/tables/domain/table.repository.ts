import { TableEntity } from './table.entity';

export interface TableRepository {
  findAll(): Promise<TableEntity[]>;
  findAvailable(): Promise<TableEntity[]>;
  findById(id: string): Promise<TableEntity | null>;
  findByIdWithDetails(id: string): Promise<any | null>;
  findByNumber(number: number): Promise<TableEntity | null>;
  create(data: { number: number; capacity: number }): Promise<TableEntity>;
  update(id: string, data: { number?: number; capacity?: number }): Promise<TableEntity>;
  updateStatus(id: string, status: string): Promise<TableEntity>;
  clearReservationsAndOrders(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}
