"use client";

import { useEffect, useState } from "react";
import { Clock, Check, AlertCircle, ChefHat } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const data = await fetchApi('/orders/kitchen');
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    try {
      let nextStatus = 'PREPARING';
      if (currentStatus === 'PREPARING') nextStatus = 'READY';
      if (currentStatus === 'READY') nextStatus = 'COMPLETED';

      await fetchApi(`/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      
      fetchOrders(); // Refresh
    } catch (err: any) {
      alert("Error al actualizar: " + err.message);
    }
  };

  const getTimeElapsed = (createdAt: string) => {
    const start = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / 60000); // minutes
    return `${diff} min`;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400">
        <ChefHat size={64} className="animate-bounce mb-4 opacity-20" />
        <p className="text-xl font-bold uppercase tracking-widest opacity-20">Cargando Pedidos...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-colors">
      {orders.map((order) => (
        <div 
          key={order.id} 
          className={`flex flex-col h-fit rounded-2xl border-2 overflow-hidden bg-white dark:bg-zinc-900 ${
            order.status === 'PENDING' ? 'border-red-600' : 'border-zinc-200 dark:border-zinc-800'
          }`}
        >
          {/* Order Header */}
          <div className={`p-4 flex items-center justify-between ${
            order.status === 'PENDING' ? 'bg-red-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-300'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black">#{order.id.slice(0, 4)}</span>
              <span className="text-sm font-bold opacity-80 uppercase">Mesa {order.user?.name || "???"}</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold">
              <Clock size={16} />
              {getTimeElapsed(order.createdAt)}
            </div>
          </div>

          {/* Order Content */}
          <div className="p-4 flex-1 space-y-4">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-3">
                <span className="text-xl font-black text-secondary">{item.quantity}x</span>
                <div className="flex-1 text-zinc-900 dark:text-white">
                  <p className="text-lg font-bold leading-tight">{item.menuItem?.name || 'Item'}</p>
                  {order.notes && idx === 0 && (
                    <p className="text-xs text-orange-600 dark:text-orange-500 font-bold uppercase mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {order.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Order Footer */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-black/40 flex gap-2">
            <button className="flex-1 py-3 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl font-bold transition-colors uppercase">
              {order.status}
            </button>
            <button 
              onClick={() => handleUpdateStatus(order.id, order.status)}
              className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Check size={20} />
              {order.status === 'PENDING' ? 'PREPARAR' : order.status === 'PREPARING' ? 'LISTO' : 'ENTREGAR'}
            </button>
          </div>
        </div>
      ))}

      {orders.length === 0 && (
        <div className="h-64 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700">
          <ChefHat size={48} className="mb-2 opacity-20" />
          <p className="font-bold uppercase tracking-widest opacity-20">Esperando Pedido...</p>
        </div>
      )}
    </div>
  );
}
