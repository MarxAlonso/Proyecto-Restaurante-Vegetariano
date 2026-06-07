import { TableRepository } from '../domain/table.repository';

export class TableService {
  constructor(private tableRepository: TableRepository) {}

  async getAllTables() {
    return this.tableRepository.findAll();
  }

  async getAvailableTables() {
    return this.tableRepository.findAvailable();
  }

  async getTableById(id: string) {
    return this.tableRepository.findById(id);
  }

  async getTableDetails(id: string) {
    return this.tableRepository.findByIdWithDetails(id);
  }

  async updateTableStatus(id: string, status: string) {
    if (status === 'AVAILABLE') {
      await this.tableRepository.clearReservationsAndOrders(id);
    }
    return this.tableRepository.updateStatus(id, status);
  }

  async createTable(data: { number: number; capacity: number }) {
    const existing = await this.tableRepository.findByNumber(data.number);
    if (existing) throw new Error('Ya existe una mesa con ese numero');
    return this.tableRepository.create(data);
  }

  async updateTable(id: string, data: { number?: number; capacity?: number }) {
    if (data.number) {
      const existing = await this.tableRepository.findByNumber(data.number);
      if (existing && existing.id !== id) throw new Error('Ya existe una mesa con ese numero');
    }
    return this.tableRepository.update(id, data);
  }

  async deleteTable(id: string) {
    return this.tableRepository.delete(id);
  }
}
