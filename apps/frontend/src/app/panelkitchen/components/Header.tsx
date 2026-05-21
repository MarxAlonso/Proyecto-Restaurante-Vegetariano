import { Clock, Wifi, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Header() {
  const { user, logout } = useAuth();
  
  return (
    <header className="h-20 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 transition-colors">
      <div className="flex items-center gap-6 text-zinc-900 dark:text-white">
        <h2 className="text-2xl font-black tracking-tighter">TABLERO DE PEDIDOS</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-500 rounded-full text-xs font-bold border border-green-200 dark:border-green-900/50">
          <Wifi size={14} />
          EN LÍNEA
        </div>
      </div>

      <div className="flex items-center gap-8">
        <ThemeToggle />
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-mono">
            <Clock size={18} />
            <span className="text-xl">{new Date().toLocaleTimeString('es-ES')}</span>
          </div>
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase">Tiempo Real</p>
        </div>
        
        <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors">
          <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-white font-black text-xl">
            {user?.name?.charAt(0)?.toUpperCase() || "C"}
          </div>
          <div className="hidden md:block text-zinc-900 dark:text-white">
            <p className="text-sm font-bold">{user?.name}</p>
            <p className="text-[10px] text-zinc-500">Chef</p>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors text-red-600 dark:text-red-400"
            title="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
