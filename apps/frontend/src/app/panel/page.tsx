'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Clock, Star, TrendingUp, Loader2, Armchair } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchApi } from "@/lib/api";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/orders')
      .then((data) => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const userName = user?.name?.split(' ')[0] || 'Usuario';
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o: any) => ['PENDING', 'PREPARING', 'READY'].includes(o.status)).length;
  const completedOrders = orders.filter((o: any) => o.status === 'COMPLETED').length;
  const totalSpent = orders
    .filter((o: any) => o.paymentStatus === 'APPROVED')
    .reduce((s: number, o: any) => s + Number(o.total), 0);
  const recentOrders = orders.slice(0, 3);

  const formatPrice = (price: number | string) => `S/ ${Number(price).toFixed(2)}`;
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const STATS = [
    { label: "Pedidos Totales", value: String(totalOrders), icon: ShoppingBag, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Pedidos Activos", value: String(activeOrders), icon: Clock, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20" },
    { label: "Completados", value: String(completedOrders), icon: Star, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
    { label: "Total Gastado", value: formatPrice(totalSpent), icon: TrendingUp, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 transition-colors">
      <div>
        <h1 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">¡Hola, {userName}! 👋</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Aquí tienes un resumen de tus pedidos y actividad.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => (
          <div key={stat.label} className="card p-6 flex items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Pedidos Recientes</h2>
            <a href="/panel/pedidos" className="text-primary text-sm font-semibold hover:underline">Ver todo</a>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            {recentOrders.length === 0 ? (
              <div className="p-6 text-center">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-zinc-300" />
                <p className="font-medium text-zinc-500">No tienes pedidos aún</p>
                <p className="text-xs text-zinc-400 mt-1">Explora el menú y haz tu primer pedido</p>
              </div>
            ) : (
              recentOrders.map((order: any) => (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                      <ShoppingBag size={20} className="text-zinc-400" />
                    </div>
                    <div>
                      <p className="font-semibold">Pedido #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-zinc-500">
                        {formatDate(order.createdAt)} • {order.items?.length || 0} items •{' '}
                        {order.orderType === 'DINE_IN' ? 'Comer aquí' : 'Para llevar'}
                        {order.table?.number && (
                          <span className="ml-1 inline-flex items-center gap-0.5 text-green-600 dark:text-green-400 font-medium">
                            • <Armchair size={10} /> Mesa {order.table.number}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(order.total)}</p>
                    <span className={`inline-block px-2 py-1 text-[10px] font-bold rounded uppercase ${
                      order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status === 'PENDING' ? 'Pendiente' :
                       order.status === 'PREPARING' ? 'Preparando' :
                       order.status === 'READY' ? 'Listo' :
                       order.status === 'COMPLETED' ? 'Completado' :
                       order.status === 'CANCELLED' ? 'Cancelado' : order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold">Resumen</h2>
          <div className="card p-6 space-y-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">Pedidos Totales</span>
              <span className="font-bold">{totalOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">Completados</span>
              <span className="font-bold text-green-600">{completedOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">Cancelados</span>
              <span className="font-bold text-red-600">{orders.filter((o: any) => o.status === 'CANCELLED').length}</span>
            </div>
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Gastado</span>
                <span className="font-bold text-lg text-primary">{formatPrice(totalSpent)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
