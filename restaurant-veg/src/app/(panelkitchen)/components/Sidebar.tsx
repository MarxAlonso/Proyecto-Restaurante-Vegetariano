import Link from "next/link";
import { 
  ChefHat, 
  ListTodo, 
  CheckCircle2, 
  History,
  LogOut 
} from "lucide-react";

const MENU_ITEMS = [
  { icon: ListTodo, label: "Pedidos Pendientes", href: "/panelkitchen" },
  { icon: CheckCircle2, label: "Listos para Entrega", href: "/panelkitchen/listos" },
  { icon: History, label: "Historial Hoy", href: "/panelkitchen/historial" },
];

export default function Sidebar() {
  return (
    <aside className="w-20 lg:w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-all">
      <div className="p-6 flex items-center gap-3">
        <ChefHat className="text-secondary" size={32} />
        <span className="text-xl font-bold hidden lg:inline">COCINA</span>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-4">
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 p-3 hover:bg-zinc-900 rounded-xl transition-colors group"
          >
            <item.icon size={24} className="text-zinc-500 group-hover:text-secondary transition-colors" />
            <span className="font-semibold text-zinc-400 group-hover:text-white hidden lg:inline">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button className="flex items-center gap-4 p-3 w-full hover:bg-red-950/30 text-zinc-500 hover:text-red-500 rounded-xl transition-colors">
          <LogOut size={24} />
          <span className="font-semibold hidden lg:inline">Salir</span>
        </button>
      </div>
    </aside>
  );
}
