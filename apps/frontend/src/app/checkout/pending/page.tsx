'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';

export default function CheckoutPendingPage() {
  return (
    <main className="pt-24 min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center pb-20">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Pago Pendiente</h1>
        <p className="text-zinc-500 mb-8">
          El pago está siendo procesado. Te confirmaremos cuando se complete.
        </p>
        <Link href="/" className="block btn-primary text-center">
          Volver al Inicio
        </Link>
      </div>
    </main>
  );
}
