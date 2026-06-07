"use client";

import { useEffect, useState } from "react";
import { Clock, Check, AlertCircle, ChefHat, Armchair } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    try {
      let nextStatus = 'PREPARING';
      if (currentStatus === 'PREPARING') nextStatus = 'READY';

      await fetchApi(`/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });

      fetchOrders();
    } catch (err: any) {
      alert("Error al actualizar: " + err.message);
    }
  };

  const getTimeElapsed = (createdAt: string) => {
    const start = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / 60000);
    return `${diff} min`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Panel Cocina</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {orders.length} {orders.length === 1 ? 'pedido activo' : 'pedidos activos'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-colors">
        {orders.map((order) => (
          <Card
            key={order.id}
            className={`flex flex-col overflow-hidden border-2 ${
              order.status === 'PENDING' ? 'border-red-600' : order.status === 'PREPARING' ? 'border-blue-500' : 'border-green-500'
            }`}
          >
            <CardHeader className={`p-4 flex flex-row items-center justify-between space-y-0 ${
              order.status === 'PENDING' ? 'bg-red-600 text-white' :
              order.status === 'PREPARING' ? 'bg-blue-600 text-white' :
              'bg-green-600 text-white'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black">#{order.id.slice(0, 4)}</span>
                {order.table?.number && (
                  <span className="text-sm font-bold opacity-80 bg-white/20 px-2 py-0.5 rounded flex items-center gap-1">
                    <Armchair size={14} />
                    M{order.table.number}
                  </span>
                )}
                {order.orderType === 'TAKEAWAY' && (
                  <span className="text-sm font-bold opacity-80 bg-white/20 px-2 py-0.5 rounded">
                    Llevar
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <div className="flex items-center gap-1 text-sm font-bold">
                  <Clock size={14} />
                  {getTimeElapsed(order.createdAt)}
                </div>
                <span className="text-[10px] opacity-70">{formatDate(order.createdAt)}</span>
              </div>
            </CardHeader>

            <CardContent className="p-4 flex-1 space-y-4">
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
            </CardContent>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-black/40 flex flex-col gap-2">
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {order.status === 'PENDING' ? 'Pendiente' : order.status === 'PREPARING' ? 'Preparando' : 'Listo'}
                </span>
              </div>
              {order.status !== 'READY' && (
                <button
                  onClick={() => handleUpdateStatus(order.id, order.status)}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-white ${
                    order.status === 'PENDING' ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  <Check size={20} />
                  {order.status === 'PENDING' ? 'INICIAR PREPARACIÓN' : 'MARCAR COMO LISTO'}
                </button>
              )}
            </div>
          </Card>
        ))}

        {orders.length === 0 && (
          <div className="h-64 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700">
            <ChefHat size={48} className="mb-2 opacity-20" />
            <p className="font-bold uppercase tracking-widest opacity-20">Esperando Pedido...</p>
          </div>
        )}
      </div>
    </div>
  );
}
