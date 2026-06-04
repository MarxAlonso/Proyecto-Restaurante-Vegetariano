import { EmployeePaymentEntity } from './employee-payment.entity';

export interface EmployeePaymentRepository {
  findByUserId(userId: string): Promise<EmployeePaymentEntity[]>;
  findById(id: string): Promise<EmployeePaymentEntity | null>;
  save(payment: Omit<EmployeePaymentEntity, 'id' | 'createdAt'>): Promise<EmployeePaymentEntity>;
  delete(id: string): Promise<void>;
}
