import { EmployeePaymentRepository } from '../../domain/employee-payment.repository';
import { EmployeePaymentEntity } from '../../domain/employee-payment.entity';
import prisma from '../../../../infrastructure/persistence/prisma.client';

export class PrismaEmployeePaymentRepository implements EmployeePaymentRepository {
  async findByUserId(userId: string): Promise<EmployeePaymentEntity[]> {
    const payments = await prisma.employeePayment.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    return payments as any as EmployeePaymentEntity[];
  }

  async findById(id: string): Promise<EmployeePaymentEntity | null> {
    const payment = await prisma.employeePayment.findUnique({ where: { id } });
    return payment as any as EmployeePaymentEntity | null;
  }

  async save(payment: Omit<EmployeePaymentEntity, 'id' | 'createdAt'>): Promise<EmployeePaymentEntity> {
    const created = await prisma.employeePayment.create({
      data: {
        userId: payment.userId,
        amount: payment.amount as any,
        paymentDate: payment.paymentDate,
        month: payment.month,
        year: payment.year,
      },
    });
    return created as any as EmployeePaymentEntity;
  }

  async delete(id: string): Promise<void> {
    await prisma.employeePayment.delete({ where: { id } });
  }
}
