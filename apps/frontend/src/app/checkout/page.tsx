'use client';

import CheckoutForm from "@/components/CheckoutForm";

export default function GuestCheckoutPage() {
  return (
    <main className="pt-24 min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
      <div className="section-container">
        <CheckoutForm isGuest />
      </div>
    </main>
  );
}
