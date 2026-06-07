"use client";

import { useEffect, useState } from "react";
import {
  Armchair, Plus, Loader2, Trash2, Users, X, Pencil,
  Calendar, Clock, Phone, Mail, User, ShoppingBag, AlertCircle,
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED";
}

interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string | null;
  status: string;
  userId?: string | null;
  user?: { id: string; name: string; email: string } | null;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menuItem?: { name: string };
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  user?: { id: string; name: string; email: string } | null;
  customerName?: string | null;
}

interface TableDetails {
  id: string;
  number: number;
  capacity: number;
  status: string;
  reservations: Reservation[];
  orders: Order[];
}

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Libre",
  OCCUPIED: "Ocupada",
  RESERVED: "Reservada",
};

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 hover:border-green-500",
  OCCUPIED: "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20",
  RESERVED: "border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20",
};

const STATUS_BADGE: Record<string, any> = {
  AVAILABLE: { label: "Libre", variant: "success" },
  OCCUPIED: { label: "Ocupada", variant: "destructive" },
  RESERVED: { label: "Reservada", variant: "warning" },
};

const ORDER_STATUS_BADGE: Record<string, any> = {
  PENDING: { label: "Pendiente", variant: "warning" },
  PREPARING: { label: "Preparando", variant: "secondary" },
  READY: { label: "Listo", variant: "success" },
  COMPLETED: { label: "Completado", variant: "default" },
};

export default function MesasPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [newCapacity, setNewCapacity] = useState("4");

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [tableDetails, setTableDetails] = useState<TableDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editNumber, setEditNumber] = useState("");
  const [editCapacity, setEditCapacity] = useState("");

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const data = await fetchApi("/tables");
      setTables(data);
    } catch (error) {
      console.error("Error loading tables:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTableDetails = async (tableId: string) => {
    setDetailsLoading(true);
    try {
      const data = await fetchApi(`/tables/details/${tableId}`);
      setTableDetails(data);
      setEditNumber(String(data.number));
      setEditCapacity(String(data.capacity));
    } catch (error) {
      console.error("Error loading table details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const openDetails = (tableId: string) => {
    setSelectedTableId(tableId);
    setShowDetailsModal(true);
    setEditing(false);
    loadTableDetails(tableId);
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi("/tables", {
        method: "POST",
        body: JSON.stringify({ number: parseInt(newNumber), capacity: parseInt(newCapacity) }),
      });
      setShowAddForm(false);
      setNewNumber("");
      setNewCapacity("4");
      loadTables();
    } catch (error: any) {
      alert("Error al crear mesa: " + error.message);
    }
  };

  const handleUpdateStatus = async (tableId: string, newStatus: string) => {
    try {
      await fetchApi(`/tables/${tableId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, status: newStatus as Table["status"] } : t)));
      if (tableDetails) setTableDetails({ ...tableDetails, status: newStatus });
    } catch (error: any) {
      alert("Error al actualizar: " + error.message);
    }
  };

  const handleEditTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTableId) return;
    try {
      await fetchApi(`/tables/${selectedTableId}`, {
        method: "PUT",
        body: JSON.stringify({ number: parseInt(editNumber), capacity: parseInt(editCapacity) }),
      });
      setEditing(false);
      loadTables();
      loadTableDetails(selectedTableId);
    } catch (error: any) {
      alert("Error al editar: " + error.message);
    }
  };

  const handleDelete = async (tableId: string, tableNumber: number) => {
    if (!confirm(`Eliminar Mesa ${tableNumber}? Esta accion no se puede deshacer.`)) return;
    try {
      await fetchApi(`/tables/${tableId}`, { method: "DELETE" });
      setTables((prev) => prev.filter((t) => t.id !== tableId));
      setShowDetailsModal(false);
    } catch (error: any) {
      alert("Error al eliminar: " + error.message);
    }
  };

  const statusCounts = {
    available: tables.filter((t) => t.status === "AVAILABLE").length,
    occupied: tables.filter((t) => t.status === "OCCUPIED").length,
    reserved: tables.filter((t) => t.status === "RESERVED").length,
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const formatPrice = (price: number | string) => `S/ ${Number(price).toFixed(2)}`;

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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Gestion de Mesas</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">{tables.length} mesas</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Agregar Mesa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">Disponibles</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-green-600">{statusCounts.available}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">Ocupadas</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-red-600">{statusCounts.occupied}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">Reservadas</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-yellow-600">{statusCounts.reserved}</p></CardContent></Card>
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleAddTable} className="flex items-end gap-4 flex-wrap">
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">Numero de Mesa</label>
                <input type="number" value={newNumber} onChange={(e) => setNewNumber(e.target.value)} className="input w-32" min="1" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">Capacidad</label>
                <select value={newCapacity} onChange={(e) => setNewCapacity(e.target.value)} className="input w-32">
                  {[2, 4, 6, 8, 10].map((n) => (<option key={n} value={n}>{n} personas</option>))}
                </select>
              </div>
              <button type="submit" className="btn-primary">Crear Mesa</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancelar</button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => openDetails(table.id)}
            className={cn(
              "rounded-2xl border-2 p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer text-left",
              STATUS_COLORS[table.status]
            )}
          >
            <div className="w-14 h-14 rounded-xl bg-current/10 flex items-center justify-center">
              <Armchair className="w-7 h-7" />
            </div>
            <span className="text-3xl font-black">Mesa {table.number}</span>
            <div className="flex items-center gap-1 text-sm opacity-80">
              <Users size={14} />
              <span>{table.capacity} personas</span>
            </div>
            <Badge variant={STATUS_BADGE[table.status]?.variant || "outline"} className="text-xs">
              {STATUS_BADGE[table.status]?.label || table.status}
            </Badge>
          </button>
        ))}
      </div>

      {/* Table Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)} />
          <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6 flex items-start justify-between rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Armchair className="w-7 h-7 text-primary" />
                </div>
                <div>
                  {editing ? (
                    <form onSubmit={handleEditTable} className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editNumber}
                        onChange={(e) => setEditNumber(e.target.value)}
                        className="input w-20 text-center text-2xl font-bold h-10"
                        min="1"
                        required
                      />
                      <select
                        value={editCapacity}
                        onChange={(e) => setEditCapacity(e.target.value)}
                        className="input w-32 h-10 text-sm"
                      >
                        {[2, 4, 6, 8, 10].map((n) => (<option key={n} value={n}>{n} pers.</option>))}
                      </select>
                      <button type="submit" className="btn-primary text-sm !px-3 !py-1.5">Guardar</button>
                      <button type="button" onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400">Cancelar</button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Mesa {tableDetails?.number}</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{tableDetails?.capacity} personas</p>
                      </div>
                      <button onClick={() => setEditing(true)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Editar">
                        <Pencil size={16} className="text-zinc-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {tableDetails && (
                  <Badge variant={STATUS_BADGE[tableDetails.status]?.variant || "outline"}>
                    {STATUS_BADGE[tableDetails.status]?.label || tableDetails.status}
                  </Badge>
                )}
                <button onClick={() => setShowDetailsModal(false)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <X size={20} className="text-zinc-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {detailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : tableDetails ? (
                <>
                  {/* Status Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {tableDetails.status !== "AVAILABLE" && (
                      <button onClick={() => handleUpdateStatus(tableDetails.id, "AVAILABLE")} className="px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm font-semibold">Marcar como Libre</button>
                    )}
                    {tableDetails.status !== "OCCUPIED" && (
                      <button onClick={() => handleUpdateStatus(tableDetails.id, "OCCUPIED")} className="px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-semibold">Marcar como Ocupada</button>
                    )}
                    {tableDetails.status !== "RESERVED" && (
                      <button onClick={() => handleUpdateStatus(tableDetails.id, "RESERVED")} className="px-4 py-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors text-sm font-semibold">Marcar como Reservada</button>
                    )}
                    <button onClick={() => handleDelete(tableDetails.id, tableDetails.number)} className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-sm font-semibold flex items-center gap-1 ml-auto">
                      <Trash2 size={14} /> Eliminar Mesa
                    </button>
                  </div>

                  {/* Active Orders */}
                  {tableDetails.orders.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <ShoppingBag size={18} className="text-primary" />
                        Pedidos Activos
                      </h3>
                      <div className="space-y-3">
                        {tableDetails.orders.map((order) => (
                          <div key={order.id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold">#Pedido {order.id.slice(0, 8)}</span>
                                <Badge variant={ORDER_STATUS_BADGE[order.status]?.variant || "outline"}>
                                  {ORDER_STATUS_BADGE[order.status]?.label || order.status}
                                </Badge>
                              </div>
                              <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />{formatDate(order.createdAt)}
                              </span>
                              {order.user?.name && (
                                <span className="flex items-center gap-1">
                                  <User size={12} />{order.user.name}
                                </span>
                              )}
                            </div>
                            {order.items.length > 0 && (
                              <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                                {order.items.map((item, i) => (
                                  <span key={item.id}>{i > 0 && ", "}{item.quantity}x {item.menuItem?.name || "Item"}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reservations */}
                  {tableDetails.reservations.length > 0 ? (
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Calendar size={18} className="text-primary" />
                        Reservas ({tableDetails.reservations.length})
                      </h3>
                      <div className="space-y-3">
                        {tableDetails.reservations.map((res) => (
                          <div key={res.id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <User size={14} className="text-primary" />
                                <span className="font-semibold">{res.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail size={14} className="text-zinc-400" />
                                <span className="text-zinc-600 dark:text-zinc-400">{res.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone size={14} className="text-secondary" />
                                <span>{res.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-zinc-400" />
                                <span>{formatDate(res.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock size={14} className="text-zinc-400" />
                                <span>{res.time} hrs</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users size={14} className="text-zinc-400" />
                                <span>{res.guests} {res.guests === 1 ? "persona" : "personas"}</span>
                              </div>
                            </div>
                            {res.specialRequests && (
                              <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700 flex items-start gap-2 text-sm">
                                <AlertCircle size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                                <span className="text-zinc-600 dark:text-zinc-400">{res.specialRequests}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-zinc-400">
                      <Calendar size={32} className="mx-auto mb-2 opacity-40" />
                      <p className="font-medium">No hay reservas para esta mesa</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-zinc-400">
                  <p>Error al cargar los detalles de la mesa</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
