import { Bell, Search, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Header() {
  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 transition-colors">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input
          type="text"
          placeholder="Buscar platos, pedidos..."
          className="input !pl-10 !py-1.5 text-sm text-zinc-900 dark:text-white"
        />
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors relative">
          <Bell size={20} className="text-zinc-600 dark:text-zinc-400" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900" />
        </button>

        <div className="flex items-center gap-3 border-l border-zinc-200 dark:border-zinc-800 pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Marx Chipana</p>
            <p className="text-xs text-zinc-500">Cliente Premium</p>
          </div>
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
            MC
          </div>
        </div>
      </div>
    </header>
  );
}
