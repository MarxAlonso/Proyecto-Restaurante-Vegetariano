"use client";

import { useEffect, useState } from "react";
import { 
  DollarSign, 
  Users, 
  ShoppingBag, 
  ArrowUpRight,
  UtensilsCrossed,
  BarChart3
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    ingresos: 0,
    clientes: 0,
    pedidosActivos: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [usersRes, ordersRes] = await Promise.all([
          fetchApi("/users"),
          fetchApi("/orders")
        ]);

        const activeOrders = ordersRes.filter((o: any) => ["PENDING", "PREPARING"].includes(o.status));
        const totalIngresos = ordersRes
          .filter((o: any) => o.status === "COMPLETED")
          .reduce((acc: number, curr: any) => acc + parseFloat(curr.total), 0);

        setStats({
          ingresos: totalIngresos,
          clientes: usersRes.filter((u: any) => u.role === "CLIENT").length,
          pedidosActivos: activeOrders.length,
        });

        // Últimos 5 pedidos
        setRecentOrders(ordersRes.slice(0, 5));
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    // Refresco cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const STATS_CARDS = [
    { label: "Ingresos Totales", value: `S/ ${stats.ingresos.toFixed(2)}`, icon: DollarSign, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
    { label: "Clientes Registrados", value: stats.clientes, icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Pedidos Activos", value: stats.pedidosActivos, icon: ShoppingBag, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20" },
  ];

  const getStatusBadge = (status: string) => {
    const map: any = {
      PENDING: { label: "Pendiente", variant: "warning" },
      PREPARING: { label: "En Preparación", variant: "secondary" },
      READY: { label: "Listo", variant: "success" },
      COMPLETED: { label: "Completado", variant: "default" },
      CANCELLED: { label: "Cancelado", variant: "destructive" },
    };
    const mapped = map[status] || { label: status, variant: "outline" };
    return <Badge variant={mapped.variant}>{mapped.label}</Badge>;
  };

  if (loading) return <div className="p-8 text-center text-zinc-500">Cargando datos del panel...</div>;

  return (
    <div className="space-y-8 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-zinc-900 dark:text-white">Dashboard Administrativo</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Monitoreo en tiempo real de métricas y pedidos.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <BarChart3 size={18} />
          Exportar Reporte
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATS_CARDS.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts / Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Ventas de la Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700">
              <p className="text-zinc-400 text-sm">Gráfico Próximamente</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-zinc-500">No hay pedidos registrados.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Pedido</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-xs">{order.id.split('-')[0]}</TableCell>
                      <TableCell>S/ {parseFloat(order.total).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        {getStatusBadge(order.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
