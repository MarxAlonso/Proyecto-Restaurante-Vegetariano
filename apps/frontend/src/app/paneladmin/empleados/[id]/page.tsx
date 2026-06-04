"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  salary: number | null;
}

interface Payment {
  id: string;
  userId: string;
  amount: number;
  paymentDate: string;
  month: number;
  year: number;
  createdAt: string;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ amount: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(), paymentDate: new Date().toISOString().split("T")[0] });
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [users, paymentsData] = await Promise.all([
        fetchApi("/users"),
        fetchApi(`/payments/user/${params.id}`),
      ]);
      const emp = users.find((u: any) => u.id === params.id);
      if (!emp) { router.push("/paneladmin/empleados"); return; }
      setEmployee(emp);
      setPayments(paymentsData);
    } catch {
      router.push("/paneladmin/empleados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [params.id]);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await fetchApi("/payments", {
        method: "POST",
        body: JSON.stringify({
          userId: params.id,
          amount: parseFloat(form.amount),
          month: form.month,
          year: form.year,
          paymentDate: form.paymentDate,
        }),
      });
      setShowModal(false);
      setForm({ amount: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(), paymentDate: new Date().toISOString().split("T")[0] });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("¿Eliminar este registro de pago?")) return;
    try {
      await fetchApi(`/payments/${paymentId}`, { method: "DELETE" });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  if (loading) return <div className="p-8 text-center text-zinc-500">Cargando...</div>;
  if (!employee) return null;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/paneladmin/empleados")}
        className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={18} /> Volver a Empleados
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{employee.name}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">{employee.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={employee.role === "ADMIN" ? "default" : "secondary"} className="text-sm px-3 py-1">
            {employee.role === "ADMIN" ? "Admin" : "Cocina"}
          </Badge>
          <span className="text-sm text-zinc-500">
            Salario base: <strong className="text-zinc-900 dark:text-white">
              {employee.salary ? `S/ ${Number(employee.salary).toFixed(2)}` : "No asignado"}
            </strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Pagado</p>
            <p className="text-2xl font-bold text-green-600">S/ {totalPaid.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Pagos Registrados</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{payments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Último Pago</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">
              {payments.length > 0
                ? `${MONTHS[payments[0].month - 1]} ${payments[0].year}`
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Historial de Pagos</CardTitle>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Registrar Pago
          </button>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-center text-zinc-500 py-8">No hay pagos registrados para este empleado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Fecha de Pago</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{MONTHS[p.month - 1]} {p.year}</TableCell>
                    <TableCell>{new Date(p.paymentDate).toLocaleDateString("es-PE")}</TableCell>
                    <TableCell className="font-semibold text-green-600">S/ {Number(p.amount).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleDeletePayment(p.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Eliminar pago"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h2 className="text-lg font-bold mb-4 text-zinc-900 dark:text-white">Registrar Pago</h2>
            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Monto (S/)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Mes</label>
                  <select
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  >
                    {MONTHS.map((name, idx) => (
                      <option key={idx + 1} value={idx + 1}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Año</label>
                  <input
                    type="number"
                    required
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Fecha de Pago</label>
                <input
                  type="date"
                  required
                  value={form.paymentDate}
                  onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary px-4 py-2">
                  Registrar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
