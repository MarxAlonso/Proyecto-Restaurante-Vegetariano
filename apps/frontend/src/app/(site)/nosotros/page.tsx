import Image from "next/image";

export default function NosotrosPage() {
  return (
    <main className="pt-24 min-h-screen bg-white dark:bg-zinc-950 transition-colors">
      <div className="section-container">
        {/* Historia Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h1 className="title-main mb-6">Nuestra Historia</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
              Nacimos de una visión simple: demostrar que la gastronomía de alta calidad puede ser inclusiva, 
              saludable y profundamente satisfactoria. En RESTAURANTVEG, fusionamos lo mejor de dos mundos 
              aparentemente opuestos: la frescura orgánica del mundo vegetal y la técnica milenaria de la parrilla.
            </p>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
              Cada ingrediente que llega a nuestra cocina es seleccionado bajo estrictos estándares de calidad 
              y sostenibilidad, apoyando a productores locales para garantizar el sabor más auténtico.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <span className="block text-4xl font-bold text-primary mb-2">10+</span>
                <span className="text-sm text-zinc-500 uppercase tracking-wider">Años de Pasión</span>
              </div>
              <div>
                <span className="block text-4xl font-bold text-secondary mb-2">100%</span>
                <span className="text-sm text-zinc-500 uppercase tracking-wider">Calidad Premium</span>
              </div>
            </div>
          </div>
          <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1550966842-2862ba996158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Nuestro Restaurante"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Valores Section */}
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-3xl p-12 lg:p-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-white">Nuestros Pilares</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Lo que nos impulsa a mejorar cada día.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Sostenibilidad", desc: "Reducimos nuestra huella ambiental mediante procesos conscientes y empaques compostables.", icon: "🌱" },
              { title: "Innovación", desc: "Buscamos constantemente nuevas formas de elevar los ingredientes tradicionales.", icon: "✨" },
              { title: "Excelencia", desc: "No escatimamos en esfuerzos para brindar una atención cálida y platos perfectos.", icon: "⭐" },
            ].map((pilar, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl mb-6">{pilar.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">{pilar.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400">{pilar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
