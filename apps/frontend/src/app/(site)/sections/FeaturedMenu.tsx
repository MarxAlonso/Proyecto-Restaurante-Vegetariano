"use client";

import { motion } from "framer-motion";
import { Leaf, Flame, ShoppingCart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
  {
    id: 1,
    name: "Hamburguesa de Lentejas",
    description: "Con queso vegano, rúcula y cebollas caramelizadas.",
    price: "S/ 28.00",
    image: "https://images.unsplash.com/photo-1525059696034-4767759ad72b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tag: "Vegetariano"
  },
  {
    id: 2,
    name: "Costillas a la Parrilla",
    description: "Con salsa barbacoa de la casa y papas rústicas.",
    price: "S/ 45.00",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tag: "Parrilla"
  },
  {
    id: 3,
    name: "Ensalada Quinoa Real",
    description: "Palta, tomates cherry y vinagreta de cítricos.",
    price: "S/ 24.00",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tag: "Vegetariano"
  }
];

export default function FeaturedMenu() {
  return (
    <section className="bg-white dark:bg-zinc-950 py-24 transition-colors">
      <div className="section-container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-5 h-5 text-primary fill-primary" />
            <span className="text-primary font-bold uppercase tracking-widest text-xs">Selección Especial</span>
            <Star className="w-5 h-5 text-primary fill-primary" />
          </div>
          <h2 className="title-main mb-4 text-zinc-900 dark:text-white">Platos Destacados</h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Una selección de nuestros platos más aclamados, preparados con los ingredientes más frescos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MENU_ITEMS.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="card group"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className={cn(
                  "absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1 uppercase tracking-wider",
                  item.tag === 'Vegetariano' ? 'bg-primary' : 'bg-secondary'
                )}>
                  {item.tag === 'Vegetariano' ? <Leaf className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
                  {item.tag}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  <span className="text-primary font-bold">{item.price}</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 line-clamp-2">
                  {item.description}
                </p>
                <button className="w-full btn-primary !py-2.5 flex items-center justify-center gap-2 group/btn">
                  <ShoppingCart className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                  Añadir al Pedido
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
