import { ShoppingBag, Clock, Star, TrendingUp } from "lucide-react";

const STATS = [
  { label: "Pedidos Totales", value: "12", icon: ShoppingBag, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { label: "En Camino", value: "1", icon: Clock, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20" },
  { label: "Puntos Veg", value: "450", icon: Star, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
  { label: "Ahorro Mensual", value: "S/ 85", icon: TrendingUp, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
];

export default function ClientDashboard() {
  return (
    <div className="space-y-8 transition-colors">
      <div>
        <h1 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">¡Hola, Marx! 👋</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Aquí tienes un resumen de tus pedidos y actividad.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => (
          <div key={stat.label} className="card p-6 flex items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Pedidos Recientes</h2>
            <button className="text-primary text-sm font-semibold hover:underline">Ver todo</button>
          </div>

          <div className="card divide-y divide-zinc-100 dark:divide-zinc-800">
            {[1, 2, 3].map((order) => (
              <div key={order} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                    <ShoppingBag size={20} className="text-zinc-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Pedido #ORD-{1000 + order}</p>
                    <p className="text-xs text-zinc-500">20 de Abril, 2024 • 3 items</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">S/ 54.00</p>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">
                    Entregado
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold">Favoritos</h2>
          <div className="card p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Star size={32} className="text-primary" />
            </div>
            <div>
              <p className="font-bold">Hamburguesa Veggie</p>
              <p className="text-sm text-zinc-500">Has pedido este plato 5 veces este mes.</p>
            </div>
            <button className="w-full btn-primary !py-2 text-sm">
              Pedir de nuevo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
