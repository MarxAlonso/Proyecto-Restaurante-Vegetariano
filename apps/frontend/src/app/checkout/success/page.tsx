'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2 } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('payment_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId || paymentId) {
      setLoading(false);
    }
  }, [orderId, paymentId]);

  if (loading) {
    return (
      <main className="pt-24 min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="pt-24 min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center pb-20">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">¡Pago Exitoso!</h1>
        <p className="text-zinc-500 mb-2">Tu pedido ha sido registrado.</p>
        {orderId && (
          <p className="text-sm text-zinc-400 mb-6">Orden: #{orderId.slice(0, 8)}</p>
        )}
        <p className="text-sm text-zinc-500 mb-8">
          Pronto estaremos preparando tu pedido. Te notificaremos cuando esté listo.
        </p>
        <div className="space-y-3">
          <Link href="/menu" className="block btn-primary text-center">
            Seguir Pidiendo
          </Link>
          <Link href="/" className="block text-sm text-zinc-500 hover:text-primary">
            Volver al Inicio
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <main className="pt-24 min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}
