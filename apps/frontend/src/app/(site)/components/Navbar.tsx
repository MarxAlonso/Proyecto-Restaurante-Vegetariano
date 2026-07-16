'use client';

import { useState } from 'react';
import Link from "next/link";
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from "@/components/ThemeToggle";
import CartDrawer from "@/components/CartDrawer";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Navbar() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/menu', label: 'Menú' },
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/contacto', label: 'Contacto' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="section-container !py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary" onClick={() => setMobileOpen(false)}>
          RESTAURANT<span className="text-secondary">VEG</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 font-medium">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="hover:text-primary transition-colors text-zinc-600 dark:text-zinc-300">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <CartDrawer />
          <ThemeToggle />
          {user ? (
            <Link href="/panel" className="hidden sm:inline text-sm font-semibold hover:text-primary text-zinc-700 dark:text-zinc-200">
              Mi Panel
            </Link>
          ) : (
            <Link href="/login" className="hidden sm:inline text-sm font-semibold hover:text-primary text-zinc-700 dark:text-zinc-200">
              Ingresar
            </Link>
          )}
          <Link href="/reservar" className="btn-primary !py-2 !px-4 text-sm">
            Reservar
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-200 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[9999]" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
          <div
            className="absolute right-0 top-0 h-[100dvh] w-full max-w-sm bg-white dark:bg-zinc-950 shadow-2xl flex flex-col transition-transform"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
              <Link href="/" className="text-xl font-bold text-primary" onClick={() => setMobileOpen(false)}>
                RESTAURANT<span className="text-secondary">VEG</span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-lg font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-4 border-zinc-200 dark:border-zinc-800" />
              {user ? (
                <Link
                  href="/panel"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-lg font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  Mi Panel
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-lg font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  Ingresar
                </Link>
              )}
            </div>

            <div className="px-6 py-6 border-t border-zinc-200 dark:border-zinc-800">
              <Link
                href="/reservar"
                onClick={() => setMobileOpen(false)}
                className="flex w-full py-4 bg-primary text-white text-center font-bold text-lg rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all items-center justify-center gap-2"
              >
                Reservar Mesa
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
