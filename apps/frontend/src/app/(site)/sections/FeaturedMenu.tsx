"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Leaf, Flame, ShoppingCart, Star, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchApi } from "@/lib/api";
import { useCart } from "@/components/providers/CartProvider";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  category: { id: string; name: string; slug: string } | null;
  image?: string | null;
  available: boolean;
}

const getCategoryIcon = (slug: string) => {
  const meaty = ["carnes", "parrillas", "pollos"];
  if (meaty.includes(slug)) return <Flame className="w-3 h-3" />;
  return <Leaf className="w-3 h-3" />;
};

const getCategoryColor = (slug: string) => {
  const meaty = ["carnes", "parrillas", "pollos"];
  return meaty.includes(slug) ? "bg-secondary" : "bg-primary";
};

export default function FeaturedMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    fetchApi("/menu")
      .then((data: MenuItem[]) => setItems(data.filter(i => i.available)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price: number | string) => `S/ ${Number(price).toFixed(2)}`;

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

        {loading ? (
          <div className="text-center py-20 text-zinc-500">Cargando platos destacados...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.slice(0, 3).map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="card group"
              >
                <div className="relative h-64 overflow-hidden">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-600" />
                    </div>
                  )}
                  {item.category && (
                    <div className={cn(
                      "absolute top-4 left-4 px-3 py-1.5 rounded-xl text-[12px] font-bold text-white flex items-center gap-1.5 backdrop-blur-md shadow-sm",
                      getCategoryColor(item.category.slug) === "bg-primary" ? "bg-primary/90" : "bg-secondary/90"
                    )}>
                      {getCategoryIcon(item.category.slug)}
                      {item.category.name}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <span className="text-primary font-black text-lg whitespace-nowrap bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-xl">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 line-clamp-2">
                    {item.description}
                  </p>
                  <button
                    onClick={() => addItem({ id: item.id, name: item.name, price: Number(item.price), image: item.image })}
                    className="w-full btn-primary !py-2.5 flex items-center justify-center gap-2 group/btn"
                  >
                    <ShoppingCart className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                    Añadir al Pedido
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
