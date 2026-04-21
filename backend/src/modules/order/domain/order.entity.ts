export interface OrderItemEntity {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: number;
}

export interface OrderEntity {
  id: string;
  userId: string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  total: number;
  notes?: string | null;
  items: OrderItemEntity[];
  createdAt: Date;
  updatedAt: Date;
}
