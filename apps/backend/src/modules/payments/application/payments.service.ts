import { EmployeePaymentRepository } from '../domain/employee-payment.repository';
import prisma from '../../../infrastructure/persistence/prisma.client';

export class PaymentsService {
  constructor(private paymentRepository: EmployeePaymentRepository) {}

  async getByUserId(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    return this.paymentRepository.findByUserId(userId);
  }

  async create(data: { userId: string; amount: number; paymentDate: string; month: number; year: number }) {
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      throw new Error('User not found');
    }

    return this.paymentRepository.save({
      userId: data.userId,
      amount: data.amount,
      paymentDate: new Date(data.paymentDate),
      month: data.month,
      year: data.year,
    });
  }

  async delete(id: string) {
    return this.paymentRepository.delete(id);
  }
}
