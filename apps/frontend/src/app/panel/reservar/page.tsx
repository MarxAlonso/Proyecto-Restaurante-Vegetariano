'use client';

import { useState } from 'react';
import {
  Calendar, Clock, Users, User, Armchair,
  UtensilsCrossed, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/components/providers/AuthProvider';
import TableSelector from '@/components/TableSelector';

const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
];

const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

export default function PanelReservarPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: '', time: '', guests: 2, specialRequests: '',
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

    if (!formData.date || !formData.time) {
      setError('Completa todos los campos obligatorios.');
      return;
    }
    if (!selectedTableId) {
      setError('Selecciona una mesa.');
      return;
    }

    setLoading(true);
    try {
      await fetchApi('/reservations', {
        method: 'POST',
        body: JSON.stringify({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.email || '',
          ...formData,
          tableId: selectedTableId,
          guests: Number(formData.guests),
        }),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => new Date().toISOString().split('T')[0];

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Reserva Confirmada</h1>
        <p className="text-zinc-500 mb-6">Gracias {user?.name}. Tu mesa ha sido reservada.</p>
        <div className="card p-6 text-left bg-zinc-50 dark:bg-zinc-900/50 space-y-2 text-sm">
          <p><strong>Fecha:</strong> {formData.date}</p>
          <p><strong>Hora:</strong> {formData.time} hrs</p>
          <p><strong>Mesa:</strong> {selectedTableNumber}</p>
          <p><strong>Personas:</strong> {formData.guests}</p>
        </div>
        <button onClick={() => { setSubmitted(false); setSelectedTableId(null); setSelectedTableNumber(null); setFormData({ date: '', time: '', guests: 2, specialRequests: '' }); }}
          className="mt-6 btn-primary">Nueva Reserva</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reservar Mesa</h1>
        <p className="text-zinc-500">Selecciona fecha, hora y mesa disponible</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <h3 className="font-semibold text-sm mb-3 text-zinc-500 uppercase tracking-wider">Tu Cuenta</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
              <User className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-zinc-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 flex items-center gap-1"><Calendar className="w-4 h-4 text-primary" /> Fecha</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} min={getMinDate()} className="input h-10" required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 flex items-center gap-1"><Clock className="w-4 h-4 text-secondary" /> Hora</label>
            <select name="time" value={formData.time} onChange={handleChange} className="input h-10" required>
              <option value="">Seleccionar</option>
              {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 flex items-center gap-1"><Users className="w-4 h-4 text-primary" /> Personas</label>
            <select name="guests" value={formData.guests} onChange={handleChange} className="input h-10">
              {GUEST_OPTIONS.map(n => <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 flex items-center gap-1"><Armchair className="w-4 h-4 text-primary" /> Mesa</label>
          <button type="button" onClick={() => setShowTableSelector(true)}
            className={cn('w-full p-3 rounded-xl border-2 border-dashed text-left transition-all text-sm',
              selectedTableId ? 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 font-semibold' : 'border-zinc-300 dark:border-zinc-600 text-zinc-500')}>
            {selectedTableNumber ? <>Mesa {selectedTableNumber} seleccionada</> : 'Haz clic para seleccionar una mesa'}
          </button>
        </div>

        <div>
          <label className="text-sm font-medium mb-1">Solicitudes especiales</label>
          <textarea name="specialRequests" value={formData.specialRequests} onChange={handleChange} rows={3} className="input resize-none" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UtensilsCrossed className="w-5 h-5" /> Confirmar Reserva</>}
        </button>
      </form>

      <TableSelector open={showTableSelector} onClose={() => setShowTableSelector(false)}
        onSelect={handleTableSelect} mode="reservation" />
    </div>
  );
}
