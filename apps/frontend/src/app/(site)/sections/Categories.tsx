"use client";

import { motion } from "framer-motion";
import { ArrowRight, Leaf, Flame } from "lucide-react";
import Link from "next/link";

export default function Categories() {
  return (
    <section className="bg-zinc-50 dark:bg-zinc-950 py-24 transition-colors">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vegetariano */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[450px] rounded-[32px] overflow-hidden group cursor-pointer shadow-xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Vegetariano"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
            <div className="absolute bottom-10 left-10 text-white right-10">
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="w-6 h-6" />
                <span className="uppercase tracking-[0.2em] text-xs font-bold opacity-80">Categoría</span>
              </div>
              <h3 className="text-4xl font-bold mb-3">Vegetariano</h3>
              <p className="text-zinc-100 mb-6 max-w-xs opacity-90">Explora la frescura y vitalidad de nuestros platos 100% vegetales.</p>
              <Link href="/menu?category=Vegetariano" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary rounded-full font-bold hover:bg-zinc-100 transition-colors group/btn">
                Explorar Carta
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          {/* Parrilla */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[450px] rounded-[32px] overflow-hidden group cursor-pointer shadow-xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Parrilla"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/20 to-transparent" />
            <div className="absolute bottom-10 left-10 text-white right-10">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-6 h-6" />
                <span className="uppercase tracking-[0.2em] text-xs font-bold opacity-80">Categoría</span>
              </div>
              <h3 className="text-4xl font-bold mb-3">Parrilla</h3>
              <p className="text-zinc-100 mb-6 max-w-xs opacity-90">El sabor ahumado y la técnica perfecta en cada corte premium.</p>
              <Link href="/menu?category=Parrilla" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-secondary rounded-full font-bold hover:bg-zinc-100 transition-colors group/btn">
                Explorar Carta
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
