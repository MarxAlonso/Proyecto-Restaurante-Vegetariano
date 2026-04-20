import { Clock, Check, AlertCircle } from "lucide-react";

const ORDERS = [
  {
    id: "101",
    mesa: "05",
    time: "12 min",
    items: [
      { name: "Hamburguesa Vegana", qty: 2, notes: "Sin cebolla" },
      { name: "Papas Rústicas", qty: 1, notes: "" },
    ],
    status: "urgent"
  },
  {
    id: "102",
    mesa: "08",
    time: "5 min",
    items: [
      { name: "Costillas Parrilla", qty: 1, notes: "Término medio" },
      { name: "Ensalada Quinoa", qty: 1, notes: "" },
    ],
    status: "normal"
  },
  {
    id: "103",
    mesa: "12",
    time: "2 min",
    items: [
      { name: "Tacos de Lenteja", qty: 3, notes: "Picante extra" },
    ],
    status: "normal"
  }
];

export default function KitchenDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {ORDERS.map((order) => (
        <div 
          key={order.id} 
          className={`flex flex-col h-fit rounded-2xl border-2 overflow-hidden bg-zinc-900 ${
            order.status === 'urgent' ? 'border-red-600' : 'border-zinc-800'
          }`}
        >
          {/* Order Header */}
          <div className={`p-4 flex items-center justify-between ${
            order.status === 'urgent' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black">#{order.id}</span>
              <span className="text-sm font-bold opacity-80">MESA {order.mesa}</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold">
              <Clock size={16} />
              {order.time}
            </div>
          </div>

          {/* Order Content */}
          <div className="p-4 flex-1 space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="text-xl font-black text-secondary">{item.qty}x</span>
                <div className="flex-1">
                  <p className="text-lg font-bold leading-tight">{item.name}</p>
                  {item.notes && (
                    <p className="text-xs text-orange-500 font-bold uppercase mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Order Footer */}
          <div className="p-4 border-t border-zinc-800 bg-black/40 flex gap-2">
            <button className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors">
              VER
            </button>
            <button className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
              <Check size={20} />
              LISTO
            </button>
          </div>
        </div>
      ))}

      {/* Empty Slot Placeholder */}
      <div className="h-64 rounded-2xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-700">
        <ChefHat size={48} className="mb-2 opacity-20" />
        <p className="font-bold uppercase tracking-widest opacity-20">Esperando Pedido...</p>
      </div>
    </div>
  );
}

import { ChefHat } from "lucide-react";
