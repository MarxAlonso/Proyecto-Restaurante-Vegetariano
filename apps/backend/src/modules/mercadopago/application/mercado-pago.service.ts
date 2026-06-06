import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import type { PreferenceRequest } from 'mercadopago/dist/clients/preference/commonTypes';
import { OrderRepository } from '../../order/domain/order.repository';

export class MercadoPagoService {
  private client: MercadoPagoConfig;
  private preference: Preference;
  private payment: Payment;

  constructor(private orderRepository: OrderRepository) {
    this.client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
      options: { timeout: 5000 },
    });
    this.preference = new Preference(this.client);
    this.payment = new Payment(this.client);
  }

  async createPreference(orderId: string, items: Array<{ title: string; quantity: number; price: number }>, payerEmail?: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const body: PreferenceRequest = {
      items: items.map((item) => ({
        id: item.title,
        title: item.title,
        quantity: Number(item.quantity),
        unit_price: Number(item.price),
        currency_id: 'PEN',
      })),
      payer: payerEmail ? { email: payerEmail } : undefined,
      back_urls: {
        success: `${frontendUrl}/checkout/success?orderId=${orderId}`,
        failure: `${frontendUrl}/checkout/failure?orderId=${orderId}`,
        pending: `${frontendUrl}/checkout/pending?orderId=${orderId}`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/mercadopago/webhook`,
      external_reference: orderId,
    };

    const result = await this.preference.create({ body });
    return {
      id: result.id!,
      initPoint: result.init_point!,
      sandboxInitPoint: result.sandbox_init_point!,
    };
  }

  async processWebhook(query: any, body: any) {
    const type = query.topic || query.type;

    if (type === 'payment') {
      const paymentId = query.id || body?.data?.id;
      if (!paymentId) return;

      const payment = await this.getPayment(String(paymentId));
      if (!payment) return;

      if (payment.external_reference) {
        const orderId = payment.external_reference;
        const mpPaymentId = payment.id;
        const mpStatus = payment.status;

        const statusMap: Record<string, string> = {
          approved: 'APPROVED',
          rejected: 'REJECTED',
          refunded: 'REFUNDED',
          cancelled: 'REJECTED',
        };

        const paymentStatus = (mpStatus && statusMap[mpStatus]) || 'PENDING';
        await this.orderRepository.updatePaymentStatus(orderId, paymentStatus, String(mpPaymentId));
      }
    }
  }

  private async getPayment(paymentId: string) {
    try {
      const result = await this.payment.get({ id: paymentId });
      return {
        id: result.id,
        status: result.status,
        external_reference: result.external_reference,
      };
    } catch {
      return null;
    }
  }

  async getPaymentStatus(paymentId: string) {
    try {
      const result = await this.payment.get({ id: paymentId });
      return result.status;
    } catch {
      return null;
    }
  }
}
