"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Leaf, 
  Flame, 
  UtensilsCrossed,
  ShoppingCart,
  ImageIcon
} from "lucide-react";
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

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ITEMS_PER_PAGE = 6;

const getCategoryIcon = (slug: string) => {
  const meaty = ["carnes", "parrillas", "pollos"];
  if (meaty.includes(slug)) return <Flame className="w-3 h-3" />;
  return <Leaf className="w-3 h-3" />;
};

const getCategoryColor = (slug: string) => {
  const meaty = ["carnes", "parrillas", "pollos"];
  return meaty.includes(slug) ? "bg-secondary" : "bg-primary";
};

export default function MenuPage() {
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("todas");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    Promise.all([
      fetchApi("/menu"),
      fetchApi("/categories"),
    ]).then(([items, cats]) => {
      setAllItems(items.filter((i: MenuItem) => i.available));
      setCategories(cats);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCat === "todas" || item.category?.slug === selectedCat;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCat, allItems]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleCategoryChange = (slug: string) => {
    setSelectedCat(slug);
    setPage(1);
  };

  const formatPrice = (price: number | string) => {
    return `S/ ${Number(price).toFixed(2)}`;
  };

  return (
    <main className="pt-24 min-h-screen bg-white dark:bg-zinc-950 transition-colors pb-20">
      <div className="section-container">
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

        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl w-full md:w-auto flex-wrap">
            <button
              onClick={() => handleCategoryChange("todas")}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                selectedCat === "todas"
                  ? "bg-white dark:bg-zinc-800 text-primary shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              <UtensilsCrossed className="w-4 h-4" />
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                  selectedCat === cat.slug
                    ? "bg-white dark:bg-zinc-800 text-primary shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                {getCategoryIcon(cat.slug)}
                {cat.name}
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

        {loading ? (
          <div className="text-center py-20 text-zinc-500">Cargando menú...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[600px]">
              <AnimatePresence mode="popLayout">
                {paginatedItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.23, 1, 0.32, 1] }}
                      className="bg-white dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100 dark:border-zinc-800/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] overflow-hidden group flex flex-col hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_40px_rgb(0,0,0,0.2)] transition-all duration-500"
                    >
                      <div className="relative h-56 overflow-hidden flex-shrink-0">
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
                              {item.name}
                            </h3>
                            <span className="text-primary font-black text-lg whitespace-nowrap bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-xl">{formatPrice(item.price)}</span>
                          </div>
                          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed line-clamp-3">
                            {item.description}
                          </p>
                        </div>
                        <button
                          onClick={() => addItem({ id: item.id, name: item.name, price: Number(item.price), image: item.image })}
                          className="mt-6 w-full py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl hover:bg-primary dark:hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2 group/btn"
                        >
                          <ShoppingCart className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                          Agregar al pedido
                        </button>
                      </div>
                    </motion.div>
                ))}
              </AnimatePresence>
            </div>

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
          </>
        )}
      </div>
    </main>
  );
}
