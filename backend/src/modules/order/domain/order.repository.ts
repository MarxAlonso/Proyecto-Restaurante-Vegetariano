import { OrderEntity } from './order.entity.js';

export interface OrderRepository {
  findAll(): Promise<OrderEntity[]>;
  findByUserId(userId: string): Promise<OrderEntity[]>;
  findById(id: string): Promise<OrderEntity | null>;
  save(order: any): Promise<OrderEntity>;
  updateStatus(id: string, status: string): Promise<OrderEntity>;
  findKitchenOrders(): Promise<OrderEntity[]>;
}
