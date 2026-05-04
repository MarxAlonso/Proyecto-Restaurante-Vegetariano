"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Leaf, 
  Flame, 
  UtensilsCrossed,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_ITEMS = [
  { id: 1, name: "Bruschettas Veganas", description: "Pan de masa madre, tomate concassé, albahaca y aceite de oliva.", price: "S/ 18.00", image: "https://images.unsplash.com/photo-1572656631137-7935297eff55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tag: "Vegetariano" },
  { id: 2, name: "Ensalada Quinoa Real", description: "Palta, tomates cherry, pepino y vinagreta de cítricos.", price: "S/ 24.00", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tag: "Vegetariano" },
  { id: 3, name: "Costillas BBQ", description: "Costillas de cerdo premium glaseadas con salsa de la casa.", price: "S/ 45.00", image: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tag: "Parrilla" },
  { id: 4, name: "Bife Angosto", description: "Corte premium de 400g servido con chimichurri.", price: "S/ 65.00", image: "https://images.unsplash.com/photo-1546241072-48010ad28c2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tag: "Parrilla" },
  { id: 5, name: "Hamburguesa de Lentejas", description: "Queso vegano, rúcula y cebollas caramelizadas.", price: "S/ 28.00", image: "https://images.unsplash.com/photo-1525059696034-4767759ad72b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tag: "Vegetariano" },
  { id: 6, name: "Lasaña de Berenjena", description: "Capas de berenjena, salsa pomodoro y queso de almendras.", price: "S/ 32.00", image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tag: "Vegetariano" },
  { id: 7, name: "Tacos de Jackfruit", description: "Sabor a 'pulled pork' vegetal con piña y cilantro.", price: "S/ 26.00", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tag: "Vegetariano" },
  { id: 8, name: "Parrillada Mixta", description: "Selección de cortes premium para compartir.", price: "S/ 120.00", image: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tag: "Parrilla" },
];

const ITEMS_PER_PAGE = 6;

export default function MenuPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [page, setPage] = useState(1);

  const filteredItems = useMemo(() => {
    return ALL_ITEMS.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "Todos" || item.tag === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    setPage(1);
  };

  return (
    <main className="pt-24 min-h-screen bg-white dark:bg-zinc-950 transition-colors pb-20">
      <div className="section-container">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="title-main mb-4">Explora nuestra Carta</h1>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Selecciona entre nuestras opciones vegetarianas llenas de frescura o disfruta del sabor ahumado de nuestra parrilla premium.
          </p>
        </motion.div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl w-full md:w-auto">
            {["Todos", "Vegetariano", "Parrilla"].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                  category === cat 
                    ? "bg-white dark:bg-zinc-800 text-primary shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                {cat === "Vegetariano" && <Leaf className="w-4 h-4" />}
                {cat === "Parrilla" && <Flame className="w-4 h-4" />}
                {cat === "Todos" && <UtensilsCrossed className="w-4 h-4" />}
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Buscar plato..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input pl-10 h-11"
            />
          </div>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[600px]">
          <AnimatePresence mode="popLayout">
            {paginatedItems.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="card group"
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <span className="text-primary font-bold">{item.price}</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 line-clamp-2">
                    {item.description}
                  </p>
                  <button className="w-full btn-primary !py-2.5 flex items-center justify-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Añadir al Pedido
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="bg-zinc-100 dark:bg-zinc-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">No encontramos resultados</h3>
            <p className="text-zinc-500">Prueba con otros términos de búsqueda o filtros.</p>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-16 gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-30"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={cn(
                    "w-10 h-10 rounded-lg font-bold transition-all",
                    page === n 
                      ? "bg-primary text-white" 
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-30"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
