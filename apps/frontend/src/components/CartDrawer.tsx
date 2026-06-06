'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingCart, X, Plus, Minus, Trash2, ImageIcon } from 'lucide-react';
import { useCart } from './providers/CartProvider';
import { useAuth } from './providers/AuthProvider';
import Link from 'next/link';

export default function CartDrawer() {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price: number | string) => `S/ ${Number(price).toFixed(2)}`;

  const drawerContent = open ? (
    <div className="fixed inset-0 z-[9999]" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
      <div
        className="absolute right-0 top-0 h-[100dvh] w-full max-w-md bg-white dark:bg-zinc-950 shadow-2xl flex flex-col transition-transform"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 backdrop-blur-md">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Tu Pedido
          </h2>
          <div className="flex items-center gap-4">
            {items.length > 0 && (
              <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors">
                Vaciar
              </button>
            )}
            <button onClick={() => setOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-zinc-50 dark:bg-zinc-900/50">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400">
              <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
              </div>
              <p className="text-xl font-bold text-zinc-600 dark:text-zinc-300 mb-2">Tu carrito está vacío</p>
              <p className="text-sm text-center">Agrega deliciosos platillos de nuestro menú para empezar</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-zinc-500 mb-2">{totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu carrito</p>
              {items.map(item => (
                <div key={item.id} className="flex items-start gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm group">
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-100 dark:bg-zinc-800">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-zinc-900 dark:text-white truncate text-lg">{item.name}</p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-zinc-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-primary font-bold text-lg mt-1">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-zinc-700 shadow-sm transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-semibold text-sm w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-zinc-700 shadow-sm transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-6 space-y-5 bg-white dark:bg-zinc-950 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-zinc-600 dark:text-zinc-400">Total a Pagar</span>
              <span className="text-3xl font-black text-primary">{formatPrice(totalPrice)}</span>
            </div>
            <Link
              href={user ? '/panel/checkout' : '/checkout'}
              onClick={() => setOpen(false)}
              className="flex w-full py-4 bg-primary text-white text-center font-bold text-lg rounded-xl hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {user ? 'Proceder al Pago' : 'Pagar como Invitado'}
            </Link>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative p-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-200 transition-colors"
      >
        <ShoppingCart className="w-5 h-5" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </button>

      {mounted && createPortal(drawerContent, document.body)}
    </>
  );
}
