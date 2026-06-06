'use client';

import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function CheckoutFailurePage() {
  return (
    <main className="pt-24 min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center pb-20">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Pago Rechazado</h1>
        <p className="text-zinc-500 mb-8">
          El pago no pudo ser procesado. Verifica tus datos e intenta nuevamente.
        </p>
        <div className="space-y-3">
          <Link href="/checkout" className="block btn-primary text-center">
            Intentar de Nuevo
          </Link>
          <Link href="/menu" className="block text-sm text-zinc-500 hover:text-primary">
            Volver al Menú
          </Link>
        </div>
      </div>
    </main>
  );
}
