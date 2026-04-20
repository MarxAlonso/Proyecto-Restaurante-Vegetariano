import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="section-container !py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          RESTAURANT<span className="text-secondary">VEG</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 font-medium">
          <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
          <Link href="/menu" className="hover:text-primary transition-colors">Menú</Link>
          <Link href="/nosotros" className="hover:text-primary transition-colors">Nosotros</Link>
          <Link href="/contacto" className="hover:text-primary transition-colors">Contacto</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold hover:text-primary">
            Ingresar
          </Link>
          <Link href="/reservar" className="btn-primary !py-2 !px-4 text-sm">
            Reservar
          </Link>
        </div>
      </div>
    </nav>
  );
}
