'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  ShoppingBag, Loader2, Armchair, Search, ShoppingCart, Plus, Minus, Trash2,
  UtensilsCrossed, Leaf, Flame, CreditCard, Package, Star
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useCart } from '@/components/providers/CartProvider';
import TableSelector from '@/components/TableSelector';
import { cn } from '@/lib/utils';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: { id: string; name: string; slug: string } | null;
  image?: string | null;
  available: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  menuItem?: { name: string; image?: string | null };
}

interface Order {
  id: string;
  status: string;
  total: number;
  orderType: string;
  paymentStatus: string;
  tableId?: string | null;
  table?: { id: string; number: number } | null;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' },
  PREPARING: { label: 'Preparando', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
  READY: { label: 'Listo', color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
  COMPLETED: { label: 'Completado', color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
};

const PAYMENT_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'Pagado', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Rechazado', color: 'bg-red-100 text-red-700' },
  REFUNDED: { label: 'Reembolsado', color: 'bg-purple-100 text-purple-700' },
};

export default function PedidosPage() {
  const { items: cartItems, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('todas');
  const [showCart, setShowCart] = useState(false);
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('TAKEAWAY');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedTableNumber, setSelectedTableNumber] = useState<number | null>(null);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    Promise.all([
      fetchApi('/menu'),
      fetchApi('/categories'),
      fetchApi('/orders'),
    ]).then(([items, cats, ords]) => {
      setMenuItems(items.filter((i: MenuItem) => i.available));
      setCategories(cats);
      setOrders(ords);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCat === 'todas' || item.category?.slug === selectedCat;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCat, menuItems]);

  const formatPrice = (price: number | string) => `S/ ${Number(price).toFixed(2)}`;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setCheckoutError('');
    setCheckoutLoading(true);
    try {
      if (orderType === 'DINE_IN' && !selectedTableId) {
        throw new Error('Selecciona una mesa');
      }
      const data = await fetchApi('/mercadopago/create-preference', {
        method: 'POST',
        body: JSON.stringify({
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          orderType,
          tableId: orderType === 'DINE_IN' ? selectedTableId : null,
        }),
      });
      clearCart();
      if (data.initPoint) {
        window.location.href = data.initPoint;
      }
    } catch (err: any) {
      setCheckoutError(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleReorder = async (order: Order) => {
    for (const item of order.items) {
      addItem({
        id: item.menuItemId,
        name: item.menuItem?.name || 'Producto',
        price: Number(item.price),
        image: item.menuItem?.image,
      });
    }
    setShowCart(true);
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const getCategoryIcon = (slug: string) => {
    return ['carnes', 'parrillas', 'pollos'].includes(slug)
      ? <Flame className="w-3 h-3" />
      : <Leaf className="w-3 h-3" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nuevo Pedido</h1>
          <p className="text-zinc-500">Selecciona tus platos favoritos</p>
        </div>
        <button onClick={() => setShowCart(!showCart)} className="btn-primary flex items-center gap-2 relative">
          <ShoppingCart size={18} />
          Carrito
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Search & Categories */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text" placeholder="Buscar plato..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 h-10 text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button onClick={() => setSelectedCat('todas')}
            className={cn('px-4 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all',
              selectedCat === 'todas' ? 'bg-primary text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700')}>
            Todas
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCat(cat.slug)}
              className={cn('px-4 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5',
                selectedCat === cat.slug ? 'bg-primary text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700')}>
              {getCategoryIcon(cat.slug)}{cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Cart Panel (slide-in) */}
      {showCart && (
        <div className="fixed inset-0 z-40" onClick={() => setShowCart(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart size={20} className="text-primary" /> Tu Pedido
              </h2>
              <div className="flex items-center gap-2">
                {cartItems.length > 0 && (
                  <button onClick={clearCart} className="text-xs text-red-500 font-medium">Vaciar</button>
                )}
                <button onClick={() => setShowCart(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="font-medium">Carrito vacio</p>
                  <p className="text-xs">Agrega productos del menu</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-primary font-bold text-sm">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg p-0.5">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-white dark:hover:bg-zinc-600"><Minus className="w-3 h-3" /></button>
                      <span className="font-semibold text-xs w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-white dark:hover:bg-zinc-600"><Plus className="w-3 h-3" /></button>
                    </div>
                    <span className="font-bold text-sm w-16 text-right">{formatPrice(item.price * item.quantity)}</span>
                    <button onClick={() => removeItem(item.id)} className="p-1 text-zinc-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                {/* Order Type */}
                <div className="flex gap-2">
                  <button onClick={() => setOrderType('TAKEAWAY')}
                    className={cn('flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all',
                      orderType === 'TAKEAWAY' ? 'border-primary bg-primary/5 text-primary' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500')}>
                    <Package className="w-4 h-4 mx-auto mb-0.5" />Llevar
                  </button>
                  <button onClick={() => setOrderType('DINE_IN')}
                    className={cn('flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all',
                      orderType === 'DINE_IN' ? 'border-primary bg-primary/5 text-primary' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500')}>
                    <UtensilsCrossed className="w-4 h-4 mx-auto mb-0.5" />Aqui
                  </button>
                </div>

                {orderType === 'DINE_IN' && (
                  <button onClick={() => setShowTableSelector(true)}
                    className={cn('w-full py-2 rounded-lg text-sm font-semibold border-2 border-dashed transition-all',
                      selectedTableId ? 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700' : 'border-zinc-300 dark:border-zinc-600 text-zinc-500')}>
                    {selectedTableNumber ? <>Mesa {selectedTableNumber}</> : 'Seleccionar Mesa'}
                  </button>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-black text-primary">{formatPrice(totalPrice)}</span>
                </div>

                {checkoutError && (
                  <p className="text-xs text-red-500 text-center">{checkoutError}</p>
                )}

                <button onClick={handleCheckout} disabled={checkoutLoading}
                  className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {checkoutLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <><CreditCard className="w-5 h-5" /> Pagar con MP</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            <div className="relative h-40 bg-zinc-100 dark:bg-zinc-800">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                  <UtensilsCrossed className="w-8 h-8" />
                </div>
              )}
              {item.category && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold text-white bg-primary/80 backdrop-blur-sm flex items-center gap-1">
                  {getCategoryIcon(item.category.slug)}{item.category.name}
                </span>
              )}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-sm">{item.name}</h3>
                  <span className="text-primary font-black text-sm whitespace-nowrap">{formatPrice(item.price)}</span>
                </div>
                <p className="text-xs text-zinc-500 line-clamp-2">{item.description}</p>
              </div>
              <button onClick={() => addItem({ id: item.id, name: item.name, price: Number(item.price), image: item.image })}
                className="mt-3 w-full py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-primary hover:text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="col-span-full text-center py-12 text-zinc-400">
            <Search className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="font-medium">No se encontraron platos</p>
          </div>
        )}
      </div>

      {/* Order History */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Star size={18} className="text-primary" />Historial de Pedidos</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-8">No tienes pedidos aun</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-zinc-500">{formatDate(order.createdAt)}</p>
                    <p className="font-bold text-sm">#{order.id.slice(0, 8)}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_LABELS[order.status]?.color || ''}`}>{STATUS_LABELS[order.status]?.label || order.status}</span>
                    <br />
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${PAYMENT_LABELS[order.paymentStatus]?.color || ''}`}>{PAYMENT_LABELS[order.paymentStatus]?.label || order.paymentStatus}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-zinc-400 mb-2">
                  <span>{order.orderType === 'DINE_IN' ? 'Comer aqui' : 'Para llevar'}</span>
                  {order.table?.number && <><span className="text-green-500">| Mesa {order.table.number}</span></>}
                  <span className="ml-auto font-bold text-primary">{formatPrice(order.total)}</span>
                </div>
                <button onClick={() => handleReorder(order)}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                  <ShoppingCart className="w-3 h-3" /> Pedir de nuevo
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <TableSelector open={showTableSelector} onClose={() => setShowTableSelector(false)}
        onSelect={(id, num) => { setSelectedTableId(id); setSelectedTableNumber(num); }} mode="order" />
    </div>
  );
}
