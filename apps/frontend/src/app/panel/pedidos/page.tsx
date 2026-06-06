'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  menuItem?: { name: string; image?: string | null };
}

interface Order {
  id: string;
  status: string;
  total: number;
  orderType: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' },
  PREPARING: { label: 'Preparando', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
  READY: { label: 'Listo', color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
  COMPLETED: { label: 'Completado', color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
};

const PAYMENT_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'Pagado', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Rechazado', color: 'bg-red-100 text-red-700' },
  REFUNDED: { label: 'Reembolsado', color: 'bg-purple-100 text-purple-700' },
};

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/orders')
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price: number | string) => `S/ ${Number(price).toFixed(2)}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mis Pedidos</h1>
        <p className="text-zinc-500">Historial de tus pedidos realizados</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
          <p className="font-medium">No tienes pedidos aún</p>
          <p className="text-sm text-zinc-500">Explora el menú y haz tu primer pedido</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-zinc-500">{formatDate(order.createdAt)}</p>
                  <p className="font-bold text-lg">Orden #{order.id.slice(0, 8)}</p>
                </div>
                <div className="text-right space-y-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${STATUS_LABELS[order.status]?.color || ''}`}>
                    {STATUS_LABELS[order.status]?.label || order.status}
                  </span>
                  <br />
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${PAYMENT_LABELS[order.paymentStatus]?.color || ''}`}>
                    {PAYMENT_LABELS[order.paymentStatus]?.label || order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      {item.menuItem?.image && (
                        <img src={item.menuItem.image} alt={item.menuItem.name} className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{item.menuItem?.name || 'Producto'}</p>
                        <p className="text-xs text-zinc-500">x{item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-sm text-zinc-500">
                  {order.orderType === 'DINE_IN' ? 'Comer aquí' : 'Para llevar'}
                </span>
                <span className="text-lg font-bold text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
