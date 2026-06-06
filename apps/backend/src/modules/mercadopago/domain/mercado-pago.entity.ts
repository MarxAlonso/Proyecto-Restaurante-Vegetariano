export interface MercadoPagoPreference {
  id: string;
  initPoint: string;
  sandboxInitPoint: string;
}

export interface MercadoPagoPayment {
  id: string;
  status: 'approved' | 'pending' | 'rejected' | 'refunded';
  statusDetail: string;
  paymentMethodId: string;
  transactionAmount: number;
}
