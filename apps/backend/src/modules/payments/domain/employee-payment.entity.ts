export interface EmployeePaymentEntity {
  id: string;
  userId: string;
  amount: number;
  paymentDate: Date;
  month: number;
  year: number;
  createdAt: Date;
}
