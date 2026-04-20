import { Clock, Wifi } from "lucide-react";

export default function Header() {
  return (
    <header className="h-20 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-8">
      <div className="flex items-center gap-6">
        <h2 className="text-2xl font-black tracking-tighter">TABLERO DE PEDIDOS</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 text-green-500 rounded-full text-xs font-bold border border-green-900/50">
          <Wifi size={14} />
          EN LÍNEA
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 text-zinc-400 font-mono">
            <Clock size={18} />
            <span className="text-xl">14:45:22</span>
          </div>
          <p className="text-[10px] font-bold text-zinc-600 uppercase">Tiempo Real</p>
        </div>
        
        <div className="flex items-center gap-4 bg-zinc-900 p-2 rounded-xl border border-zinc-800">
          <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-white font-black text-xl">
            C1
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold">Chef Principal</p>
            <p className="text-[10px] text-zinc-500">Turno Tarde</p>
          </div>
        </div>
      </div>
    </header>
  );
}
