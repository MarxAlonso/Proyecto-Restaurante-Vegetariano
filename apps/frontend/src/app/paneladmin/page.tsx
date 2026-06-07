"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  Users,
  ShoppingBag,
  UtensilsCrossed,
  BarChart3,
  TrendingUp,
  Loader2,
  Armchair,
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PIE_COLORS = ["#2d5a27", "#8b0000", "#eab308", "#3b82f6"];

const STATUS_BADGE: any = {
  PENDING: { label: "Pendiente", variant: "warning" },
  PREPARING: { label: "Preparación", variant: "secondary" },
  READY: { label: "Listo", variant: "success" },
  COMPLETED: { label: "Completado", variant: "default" },
  CANCELLED: { label: "Cancelado", variant: "destructive" },
};

const PAYMENT_BADGE: any = {
  PENDING: { label: "Pendiente", variant: "warning" },
  APPROVED: { label: "Aprobado", variant: "success" },
  REJECTED: { label: "Rechazado", variant: "destructive" },
  REFUNDED: { label: "Reembolsado", variant: "outline" },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [adminStats, ordersRes, revenue] = await Promise.all([
          fetchApi("/orders/admin/stats"),
          fetchApi("/orders/admin/all"),
          fetchApi("/orders/admin/revenue?days=7"),
        ]);

        setStats(adminStats);
        setRecentOrders(ordersRes.slice(0, 5));
        setRevenueData(revenue);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number | string) => `S/ ${Number(price).toFixed(2)}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const STATS_CARDS = [
    {
      label: "Ingresos Totales",
      value: formatPrice(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Clientes Registrados",
      value: stats?.totalOrders || 0,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Pedidos Activos",
      value: (stats?.pendingOrders || 0) + (stats?.preparingOrders || 0),
      icon: ShoppingBag,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      label: "Pedidos Aprobados",
      value: stats?.approvedOrders || 0,
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
  ];

  const pieData = [
    { name: "Comer aquí", value: stats?.dineIn?.count || 0 },
    { name: "Para llevar", value: stats?.takeaway?.count || 0 },
  ].filter((d) => d.value > 0);

  const orderTypeRevenue = [
    { name: "Comer aquí", value: stats?.dineIn?.total || 0 },
    { name: "Para llevar", value: stats?.takeaway?.total || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-zinc-900 dark:text-white">
            Dashboard Administrativo
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Monitoreo en tiempo real de métricas y pedidos.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS_CARDS.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={18} />
              Ingresos Últimos 7 Días
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData.length === 0 || revenueData.every((d: any) => d.revenue === 0) ? (
              <div className="h-64 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700">
                <p className="text-zinc-400 text-sm">Sin datos de ingresos aún</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => {
                      const date = new Date(d + "T00:00:00");
                      return date.toLocaleDateString("es-PE", {
                        day: "numeric",
                        month: "short",
                      });
                    }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: any) => [`S/ ${Number(value).toFixed(2)}`, "Ingresos"]}
                    labelFormatter={(label) => {
                      const date = new Date(String(label) + "T00:00:00");
                      return date.toLocaleDateString("es-PE", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      });
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2d5a27"
                    strokeWidth={2}
                    dot={{ fill: "#2d5a27", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Order Type Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed size={18} />
              Pedidos por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="h-64 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700">
                <p className="text-zinc-400 text-sm">Sin datos de pedidos aún</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 w-full mt-2">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-zinc-500">Ingreso Comer aquí</p>
                    <p className="font-bold text-blue-600">
                      {formatPrice(stats?.dineIn?.total || 0)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-xs text-zinc-500">Ingreso Para llevar</p>
                    <p className="font-bold text-orange-600">
                      {formatPrice(stats?.takeaway?.total || 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Order Type Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={18} />
              Ingresos por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orderTypeRevenue.length === 0 ? (
              <div className="h-64 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700">
                <p className="text-zinc-400 text-sm">Sin datos</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={orderTypeRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: any) => [`S/ ${Number(value).toFixed(2)}`, "Ingresos"]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {orderTypeRevenue.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
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
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Mesa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead className="text-right">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-xs">
                        #{order.id.split("-")[0]}
                      </TableCell>
                      <TableCell className="text-xs">
                        {order.customerName || order.user?.name || "Anónimo"}
                      </TableCell>
                      <TableCell>
                        {order.table?.number ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                            <Armchair size={12} />
                            M{order.table.number}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {order.orderType === "DINE_IN" ? "Comer aquí" : "Llevar"}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">
                        {formatPrice(order.total)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            PAYMENT_BADGE[order.paymentStatus]?.variant || "outline"
                          }
                          className="text-[10px]"
                        >
                          {PAYMENT_BADGE[order.paymentStatus]?.label ||
                            order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={STATUS_BADGE[order.status]?.variant || "outline"}
                          className="text-[10px]"
                        >
                          {STATUS_BADGE[order.status]?.label || order.status}
                        </Badge>
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
