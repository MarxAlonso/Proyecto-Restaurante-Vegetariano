export interface OrderItemEntity {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: number;
}

export interface OrderEntity {
  id: string;
  userId?: string | null;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  total: number;
  notes?: string | null;
  orderType: 'DINE_IN' | 'TAKEAWAY';
  paymentStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  tableId?: string | null;
  table?: { id: string; number: number } | null;
  mercadoPagoPreferenceId?: string | null;
  mercadoPagoPaymentId?: string | null;
  items: OrderItemEntity[];
  createdAt: Date;
  updatedAt: Date;
}
