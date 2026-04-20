import Link from "next/link";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  History, 
  User, 
  LogOut 
} from "lucide-react";

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/panel" },
  { icon: ShoppingBag, label: "Mis Pedidos", href: "/panel/pedidos" },
  { icon: History, label: "Historial", href: "/panel/historial" },
  { icon: User, label: "Perfil", href: "/panel/perfil" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
      <div className="p-6">
        <Link href="/" className="text-xl font-bold text-primary">
          RESTAURANT<span className="text-secondary">VEG</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors group"
          >
            <item.icon size={20} className="group-hover:text-primary transition-colors" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 rounded-lg transition-colors group">
          <LogOut size={20} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
