import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="title-main text-white mb-6">
          Sabor Natural & <span className="text-secondary">Parrilla Premium</span>
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-zinc-200">
          Descubre la fusión perfecta entre la frescura vegetal y el ahumado inconfundible de nuestra parrilla. 
          Una experiencia gastronómica única en el corazón de la ciudad.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/menu" className="btn-primary text-center">
            Ver Menú
          </Link>
          <Link href="/reservar" className="btn-secondary text-center">
            Reservar Mesa
          </Link>
        </div>
      </div>
    </section>
  );
}
