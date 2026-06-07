'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Clock, Armchair, Loader2, Users, XCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface Reservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  specialRequests?: string | null;
  table?: { id: string; number: number; capacity: number } | null;
}

export default function MisReservasPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/reservations/my')
      .then(setReservations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = reservations.filter(r => r.status === 'CONFIRMED' && new Date(r.date) >= today);
  const past = reservations.filter(r => r.status === 'CANCELLED' || new Date(r.date) < today);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancelar esta reserva?')) return;
    try {
      await fetchApi(`/reservations/${id}/cancel`, { method: 'PATCH' });
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'CANCELLED' } : r));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mis Reservas</h1>
        <p className="text-zinc-500">{reservations.length} {reservations.length === 1 ? 'reserva' : 'reservas'}</p>
      </div>

      {upcoming.length > 0 && (
        <div>
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> Proximas</h2>
          <div className="space-y-3">
            {upcoming.map(r => (
              <div key={r.id} className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center"><CalendarDays className="w-7 h-7 text-primary" /></div>
                  <div>
                    <p className="font-bold text-lg">{formatDate(r.date)}</p>
                    <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{r.time} hrs</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" />{r.guests} pers</span>
                      {r.table?.number && <span className="flex items-center gap-1"><Armchair className="w-4 h-4" />Mesa {r.table.number}</span>}
                    </div>
                    {r.specialRequests && <p className="text-xs text-zinc-400 mt-1 italic">{r.specialRequests}</p>}
                  </div>
                </div>
                <button onClick={() => handleCancel(r.id)} className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Cancelar reserva"><XCircle className="w-5 h-5" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2 text-zinc-400">Historial</h2>
          <div className="space-y-2">
            {past.map(r => (
              <div key={r.id} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-between opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center"><CalendarDays className="w-5 h-5 text-zinc-400" /></div>
                  <div>
                    <p className="font-semibold text-sm">{formatDate(r.date)} - {r.time} hrs</p>
                    <p className="text-xs text-zinc-400">{r.guests} pers | Mesa {r.table?.number || '-'} | {r.status === 'CANCELLED' ? 'Cancelada' : 'Completada'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reservations.length === 0 && (
        <div className="text-center py-16 text-zinc-400">
          <CalendarDays className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="font-bold text-lg">No tienes reservas</p>
          <p className="text-sm">Ve a Reservar Mesa para hacer una</p>
        </div>
      )}
    </div>
  );
}
