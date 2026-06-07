'use client';

import { useEffect, useState } from 'react';
import { X, Users, Armchair } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}

interface TableSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (tableId: string, tableNumber: number) => void;
  mode?: 'order' | 'reservation';
}

export default function TableSelector({ open, onClose, onSelect, mode = 'order' }: TableSelectorProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchApi('/tables')
        .then(setTables)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleSelect = (table: Table) => {
    if (table.status !== 'AVAILABLE') return;
    onSelect(table.id, table.number);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Armchair className="w-5 h-5 text-primary" />
              {mode === 'reservation' ? 'Selecciona tu Mesa' : 'Elige una Mesa'}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Haz clic en una mesa disponible para seleccionarla
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {tables.map((table) => {
                  const isAvailable = table.status === 'AVAILABLE';
                  return (
                    <button
                      key={table.id}
                      onClick={() => handleSelect(table)}
                      disabled={!isAvailable}
                      className={cn(
                        'aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 p-4 transition-all duration-200',
                        isAvailable
                          ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 hover:border-green-500 hover:bg-green-100 dark:hover:bg-green-900/40 hover:shadow-lg hover:scale-105 cursor-pointer'
                          : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 opacity-50 cursor-not-allowed'
                      )}
                    >
                      <span
                        className={cn(
                          'text-3xl font-black',
                          isAvailable ? 'text-green-700 dark:text-green-400' : 'text-zinc-400 dark:text-zinc-600'
                        )}
                      >
                        {table.number}
                      </span>
                      <div className="flex items-center gap-1">
                        <Users
                          size={12}
                          className={isAvailable ? 'text-green-600 dark:text-green-400' : 'text-zinc-400'}
                        />
                        <span
                          className={cn(
                            'text-xs font-semibold',
                            isAvailable ? 'text-green-600 dark:text-green-400' : 'text-zinc-400'
                          )}
                        >
                          {table.capacity}
                        </span>
                      </div>
                      <span
                        className={cn(
                          'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                          isAvailable
                            ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300'
                            : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                        )}
                      >
                        {table.status === 'AVAILABLE' ? 'Libre' : table.status === 'OCCUPIED' ? 'Ocupada' : 'Reservada'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-center gap-6 text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700" />
                  <span>Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-200 dark:border-zinc-700" />
                  <span>No disponible</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
