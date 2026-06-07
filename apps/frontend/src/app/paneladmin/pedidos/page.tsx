"use client";

import { useEffect, useState } from "react";
import { Filter, Loader2, ShoppingBag, UtensilsCrossed, Trash2, MoreHorizontal, CheckCircle, Armchair } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  notes?: string | null;
  tableId?: string | null;
  table?: { id: string; number: number } | null;
  createdAt: string;
  items: OrderItem[];
  user?: { id: string; name: string; email: string } | null;
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendiente" },
  { value: "PREPARING", label: "Preparación" },
  { value: "READY", label: "Listo" },
  { value: "COMPLETED", label: "Completado" },
  { value: "CANCELLED", label: "Cancelado" },
];

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

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPayment, setFilterPayment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await fetchApi("/orders/admin/all");
      setOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("¿Estás seguro de eliminar este pedido? Esta acción no se puede deshacer.")) return;
    try {
      await fetchApi(`/orders/${orderId}`, { method: "DELETE" });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (error: any) {
      alert("Error al eliminar: " + error.message);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await fetchApi(`/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (error: any) {
      alert("Error al actualizar: " + error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterPayment && o.paymentStatus !== filterPayment) return false;
    if (filterStatus && o.status !== filterStatus) return false;
    return true;
  });

  const getCustomerName = (order: Order) => {
    return order.customerName || order.user?.name || "Anónimo";
  };

  const getCustomerEmail = (order: Order) => {
    return order.customerEmail || order.user?.email || "-";
  };

  const formatPrice = (price: number | string) => `S/ ${Number(price).toFixed(2)}`;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Gestión de Pedidos</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            {orders.length} pedidos registrados
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2">
          <Filter size={16} className="text-zinc-400" />
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="bg-transparent text-sm outline-none text-zinc-600 dark:text-zinc-300"
          >
            <option value="">Todos los pagos</option>
            <option value="PENDING">Pendiente</option>
            <option value="APPROVED">Aprobado</option>
            <option value="REJECTED">Rechazado</option>
            <option value="REFUNDED">Reembolsado</option>
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2">
          <Filter size={16} className="text-zinc-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent text-sm outline-none text-zinc-600 dark:text-zinc-300"
          >
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="PREPARING">Preparación</option>
            <option value="READY">Listo</option>
            <option value="COMPLETED">Completado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
              <p className="font-medium text-zinc-500">No hay pedidos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Mesa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-xs">
                        #{order.id.split("-")[0]}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{getCustomerName(order)}</p>
                          <p className="text-xs text-zinc-500">{getCustomerEmail(order)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.table?.number ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                            <Armchair size={12} />
                            Mesa {order.table.number}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                          {order.orderType === "DINE_IN" ? (
                            <>
                              <UtensilsCrossed size={14} />
                              Comer aquí
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={14} />
                              Para llevar
                            </>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} prod.
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(order.total)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={PAYMENT_BADGE[order.paymentStatus]?.variant || "outline"}>
                          {PAYMENT_BADGE[order.paymentStatus]?.label || order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Badge variant={STATUS_BADGE[order.status]?.variant || "outline"}>
                            {STATUS_BADGE[order.status]?.label || order.status}
                          </Badge>
                          <div className="relative">
                            <button
                              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                              onClick={(e) => {
                                const btn = e.currentTarget;
                                const dropdown = btn.nextElementSibling as HTMLElement;
                                dropdown?.classList.toggle("hidden");
                              }}
                            >
                              <MoreHorizontal size={14} className="text-zinc-400" />
                            </button>
                            <div className="hidden absolute right-0 top-6 z-10 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 min-w-[140px]">
                              {STATUS_OPTIONS.filter((opt) => opt.value !== order.status).map((opt) => (
                                <button
                                  key={opt.value}
                                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                  onClick={() => handleUpdateStatus(order.id, opt.value)}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-zinc-500">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                          title="Eliminar pedido"
                        >
                          <Trash2 size={16} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Pedidos Aprobados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter((o) => o.paymentStatus === "APPROVED").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Ingresos Confirmados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatPrice(
                orders
                  .filter((o) => o.paymentStatus === "APPROVED")
                  .reduce((s, o) => s + Number(o.total), 0)
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Comer aquí / Para llevar
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {orders.filter((o) => o.orderType === "DINE_IN").length}
              </p>
              <p className="text-xs text-zinc-500">Comer aquí</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {orders.filter((o) => o.orderType === "TAKEAWAY").length}
              </p>
              <p className="text-xs text-zinc-500">Para llevar</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
