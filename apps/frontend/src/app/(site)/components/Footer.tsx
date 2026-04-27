import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
      <div className="section-container grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <Link href="/" className="text-2xl font-bold text-primary mb-6 block">
            RESTAURANT<span className="text-secondary">VEG</span>
          </Link>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-sm mb-6">
            La mejor experiencia gastronómica vegetariana y a la parrilla. 
            Productos frescos del campo a tu mesa.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold mb-4">Enlaces</h4>
          <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
            <li><Link href="/menu">Menú</Link></li>
            <li><Link href="/reservar">Reservar</Link></li>
            <li><Link href="/nosotros">Nosotros</Link></li>
            <li><Link href="/contacto">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4">Contacto</h4>
          <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>Av. Principal 123, Lima</li>
            <li>+51 987 654 321</li>
            <li>info@restaurantveg.com</li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-zinc-200 dark:border-zinc-800 py-8 text-center text-sm text-zinc-500">
        <p>© 2024 Restaurant Veg. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
