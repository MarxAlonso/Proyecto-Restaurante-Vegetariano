import { OrderEntity } from './order.entity';

export interface OrderRepository {
  findAll(): Promise<OrderEntity[]>;
  findAllWithFilters(filters: { paymentStatus?: string; status?: string; startDate?: Date; endDate?: Date }): Promise<OrderEntity[]>;
  findByUserId(userId: string): Promise<OrderEntity[]>;
  findById(id: string): Promise<OrderEntity | null>;
  save(order: any): Promise<OrderEntity>;
  updateStatus(id: string, status: string): Promise<OrderEntity>;
  findKitchenOrders(): Promise<OrderEntity[]>;
  countByStatus(): Promise<Record<string, number>>;
  getDailyRevenue(days: number): Promise<{ date: string; revenue: number }[]>;
  getOrderTypeStats(): Promise<{ orderType: string; count: number; total: number }[]>;
  updatePaymentStatus(id: string, paymentStatus: string, paymentId: string): Promise<OrderEntity>;
  updateMercadoPagoPreference(id: string, preferenceId: string): Promise<OrderEntity>;
  findByPreferenceId(preferenceId: string): Promise<OrderEntity | null>;
  deleteOrder(id: string): Promise<void>;
  updateTableStatus(tableId: string, status: string): Promise<void>;
}
