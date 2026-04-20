import { Bell, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Header() {
  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 transition-colors">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Sistema de Gestión</h2>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors relative">
          <Bell size={20} className="text-zinc-600 dark:text-zinc-400" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-zinc-900" />
        </button>
        
        <div className="flex items-center gap-3 border-l border-zinc-200 dark:border-zinc-800 pl-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Administrador</p>
            <p className="text-[10px] text-primary font-bold uppercase">Super Admin</p>
          </div>
          <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-white font-bold">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
