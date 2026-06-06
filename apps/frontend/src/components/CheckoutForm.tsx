'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, CreditCard, UtensilsCrossed, Package, Loader2 } from 'lucide-react';
import { useCart } from './providers/CartProvider';
import { useAuth } from './providers/AuthProvider';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface CheckoutFormProps {
  isGuest?: boolean;
}

export default function CheckoutForm({ isGuest = false }: CheckoutFormProps) {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState('');

  const formatPrice = (price: number | string) => `S/ ${Number(price).toFixed(2)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (items.length === 0) {
        throw new Error('El carrito está vacío');
      }

      if (isGuest) {
        if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
          throw new Error('Completa todos tus datos');
        }
      }

      const body: any = {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        orderType,
        notes: '',
      };

      if (isGuest) {
        body.customerName = customerInfo.name;
        body.customerEmail = customerInfo.email;
        body.customerPhone = customerInfo.phone;
      }

      const data = await fetchApi('/mercadopago/create-preference', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      clearCart();

      if (data.initPoint) {
        window.location.href = data.initPoint;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
        <h2 className="text-xl font-bold mb-2">Tu carrito está vacío</h2>
        <p className="text-zinc-500 mb-6">Agrega productos del menú antes de pagar</p>
        <button onClick={() => router.push('/menu')} className="btn-primary">
          Ir al Menú
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Finalizar Pedido</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Order Type */}
        <div className="card p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
          <h2 className="font-bold text-lg">Tipo de Pedido</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setOrderType('DINE_IN')}
              className={cn(
                "p-4 rounded-xl border-2 text-center transition-all",
                orderType === 'DINE_IN'
                  ? "border-primary bg-primary/5"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
              )}
            >
              <UtensilsCrossed className="w-6 h-6 mx-auto mb-2" />
              <span className="font-semibold">Comer Aquí</span>
              <p className="text-xs text-zinc-500 mt-1">Disfruta en el local</p>
            </button>
            <button
              type="button"
              onClick={() => setOrderType('TAKEAWAY')}
              className={cn(
                "p-4 rounded-xl border-2 text-center transition-all",
                orderType === 'TAKEAWAY'
                  ? "border-primary bg-primary/5"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
              )}
            >
              <Package className="w-6 h-6 mx-auto mb-2" />
              <span className="font-semibold">Para Llevar</span>
              <p className="text-xs text-zinc-500 mt-1">Recoge en el local</p>
            </button>
          </div>
        </div>

        {/* Customer Info (only for guests) */}
        {isGuest && (
          <div className="card p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h2 className="font-bold text-lg">Tus Datos</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={e => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="input w-full h-11"
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={e => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="input w-full h-11"
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={e => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="input w-full h-11"
                    placeholder="999 888 777"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="card p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
          <h2 className="font-bold text-lg">Resumen del Pedido</h2>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-zinc-500">x{item.quantity}</p>
                  </div>
                </div>
                <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <span className="text-lg font-bold">Total</span>
            <span className="text-xl font-bold text-primary">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary !py-4 text-lg flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pagar con Mercado Pago — {formatPrice(totalPrice)}
            </>
          )}
        </button>

        <p className="text-xs text-center text-zinc-400">
          Al pagar aceptas nuestros términos y condiciones. Serás redirigido a Mercado Pago para completar el pago de forma segura.
        </p>
      </form>
    </div>
  );
}
