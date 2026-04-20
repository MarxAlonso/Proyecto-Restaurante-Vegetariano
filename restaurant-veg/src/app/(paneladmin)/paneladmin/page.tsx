import { 
  DollarSign, 
  Users, 
  ShoppingBag, 
  ArrowUpRight,
  ArrowDownRight,
  UtensilsCrossed
} from "lucide-react";

const STATS = [
  { label: "Ingresos Hoy", value: "S/ 2,450.00", trend: "+12.5%", isUp: true, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
  { label: "Nuevos Clientes", value: "24", trend: "+4.2%", isUp: true, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Pedidos Activos", value: "18", trend: "-2.4%", isUp: false, icon: ShoppingBag, color: "text-orange-600", bg: "bg-orange-50" },
  { label: "Plato Top", value: "Hamburguesa Veg", trend: "Destacado", isUp: true, icon: UtensilsCrossed, color: "text-purple-600", bg: "bg-purple-50" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard Administrativo</h1>
          <p className="text-zinc-500 text-sm">Bienvenido de nuevo. Aquí está lo que sucede hoy.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <BarChart3 size={18} />
          Exportar Reporte
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => (
          <div key={stat.label} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div className={`flex items-center text-xs font-bold ${stat.isUp ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend}
                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <p className="text-sm text-zinc-500 font-medium mb-1">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts / Tables Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h3 className="font-bold mb-6">Ventas de la Semana</h3>
          <div className="h-64 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700">
            <p className="text-zinc-400 text-sm">Gráfico de ventas (Chart.js / Recharts)</p>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold mb-6">Pedidos Recientes</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-200" />
                  <div>
                    <p className="text-sm font-semibold">Cliente #{1200 + i}</p>
                    <p className="text-[10px] text-zinc-500">Mesa {i + 2} • 14:30 PM</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded">
                  En Preparación
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { BarChart3 } from "lucide-react";
