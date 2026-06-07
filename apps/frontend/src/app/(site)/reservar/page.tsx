"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  User,
  UtensilsCrossed,
  CheckCircle,
  AlertCircle,
  Armchair,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchApi } from "@/lib/api";
import TableSelector from "@/components/TableSelector";

const TIME_SLOTS = [
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"
];

const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

export default function ReservarPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: 2,
    specialRequests: "",
  });
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedTableNumber, setSelectedTableNumber] = useState<number | null>(null);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTableSelect = (tableId: string, tableNumber: number) => {
    setSelectedTableId(tableId);
    setSelectedTableNumber(tableNumber);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (!selectedTableId) {
      setError("Por favor selecciona una mesa.");
      return;
    }

    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError("La fecha debe ser hoy o un día posterior.");
      return;
    }

    setLoading(true);
    try {
      await fetchApi("/reservations", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          tableId: selectedTableId,
          guests: Number(formData.guests),
        }),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Error al crear la reserva");
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  if (submitted) {
    return (
      <main className="pt-24 min-h-screen bg-white dark:bg-zinc-950 transition-colors pb-20">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </motion.div>
            <h1 className="title-main mb-4">Reserva Confirmada!</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-lg">
              Gracias <span className="font-bold text-primary">{formData.name}</span>. Tu reserva ha sido registrada exitosamente.
            </p>

            <div className="card p-8 text-left bg-zinc-50 dark:bg-zinc-900/50">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-zinc-900 dark:text-white">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
                Detalles de tu Reserva
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-500 mb-1">Fecha</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">{formData.date}</p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Hora</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">{formData.time}</p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Personas</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">{formData.guests} comensales</p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Mesa</p>
                  <p className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Armchair size={14} />
                    Mesa {selectedTableNumber}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Contacto</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">{formData.phone}</p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Email</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">{formData.email}</p>
                </div>
              </div>
              {formData.specialRequests && (
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <p className="text-zinc-500 mb-1">Solicitudes especiales</p>
                  <p className="font-medium text-zinc-700 dark:text-zinc-300">{formData.specialRequests}</p>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSubmitted(false);
                setSelectedTableId(null);
                setSelectedTableNumber(null);
                setFormData({ name: "", email: "", phone: "", date: "", time: "", guests: 2, specialRequests: "" });
              }}
              className="mt-8 btn-primary"
            >
              Realizar otra reserva
            </motion.button>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 min-h-screen bg-white dark:bg-zinc-950 transition-colors pb-20">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="title-main mb-4">Reserva tu Mesa</h1>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Vive la experiencia gastronómica que tenemos para ti. Reserva tu mesa y disfruta de la mejor fusión vegetariana y de parrilla en la ciudad.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2"
          >
            <div className="card p-8 lg:p-12">
              <h2 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-white flex items-center gap-3">
                <Calendar className="w-6 h-6 text-primary" />
                Completar Reserva
              </h2>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1 flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input bg-white dark:bg-zinc-950"
                      placeholder="Tu nombre..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-secondary" />
                      Telefono *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input bg-white dark:bg-zinc-950"
                      placeholder="+51 987 654 321"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Correo Electronico *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input bg-white dark:bg-zinc-950"
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Fecha *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={getMinDate()}
                      className="input bg-white dark:bg-zinc-950"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-secondary" />
                      Hora *
                    </label>
                    <select
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="input bg-white dark:bg-zinc-950"
                      required
                    >
                      <option value="">Seleccionar</option>
                      {TIME_SLOTS.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1 flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      Comensales
                    </label>
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      className="input bg-white dark:bg-zinc-950"
                    >
                      {GUEST_OPTIONS.map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "persona" : "personas"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1 flex items-center gap-2">
                    <Armchair className="w-4 h-4 text-primary" />
                    Mesa *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTableSelector(true)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 border-dashed text-left transition-all",
                      selectedTableId
                        ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                        : "border-zinc-300 dark:border-zinc-600 hover:border-primary"
                    )}
                  >
                    {selectedTableNumber ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-200 dark:bg-green-800 flex items-center justify-center">
                          <span className="font-black text-green-700 dark:text-green-300">{selectedTableNumber}</span>
                        </div>
                        <span className="font-bold text-green-700 dark:text-green-400">Mesa {selectedTableNumber} seleccionada</span>
                      </div>
                    ) : (
                      <span className="text-zinc-500 font-medium">Haz clic para seleccionar una mesa</span>
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
                    Solicitudes Especiales
                  </label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows={4}
                    className="input bg-white dark:bg-zinc-950 resize-none"
                    placeholder="Ej: Mesa junto a la ventana, celebra un cumpleanos, alergia a frutos secos..."
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center gap-2 h-12 text-lg"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <UtensilsCrossed className="w-5 h-5" />
                      Confirmar Reserva
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white mb-1">Horario de Atencion</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Lunes a Viernes: 12pm - 11pm
                    <br />
                    Sabados y Domingos: 12pm - 5pm
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6 hover:border-secondary/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-secondary/10 text-secondary">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white mb-1">Reservas por Telefono</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    +51 987 654 321
                    <br />
                    (01) 234 5678
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white mb-1">Politica de Cancelacion</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Cancela o reprograma hasta 2 horas antes de tu reserva sin costo adicional.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <TableSelector
        open={showTableSelector}
        onClose={() => setShowTableSelector(false)}
        onSelect={handleTableSelect}
        mode="reservation"
      />
    </main>
  );
}
