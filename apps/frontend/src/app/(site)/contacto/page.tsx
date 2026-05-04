export default function ContactoPage() {
  return (
    <main className="pt-24 min-h-screen bg-white dark:bg-zinc-950 transition-colors">
      <div className="section-container">
        <div className="text-center mb-16">
          <h1 className="title-main mb-4">Ponte en Contacto</h1>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            ¿Tienes alguna consulta o quieres realizar una reserva especial? Estamos aquí para ayudarte.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card p-8">
              <h3 className="text-xl font-bold mb-4 text-primary">📍 Ubicación</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Av. Gastronomía 123<br />
                Lima, Perú
              </p>
            </div>
            <div className="card p-8">
              <h3 className="text-xl font-bold mb-4 text-primary">📞 Teléfono</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                +51 987 654 321<br />
                (01) 234 5678
              </p>
            </div>
            <div className="card p-8">
              <h3 className="text-xl font-bold mb-4 text-primary">⏰ Horario</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Lun - Sáb: 12:00 PM - 11:00 PM<br />
                Dom: 12:00 PM - 5:00 PM
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="card p-8 lg:p-12">
              <h2 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-white">Envíanos un mensaje</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Nombre Completo</label>
                    <input type="text" className="input" placeholder="Tu nombre..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Correo Electrónico</label>
                    <input type="email" className="input" placeholder="tu@email.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Asunto</label>
                  <input type="text" className="input" placeholder="¿Cómo podemos ayudarte?" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Mensaje</label>
                  <textarea rows={5} className="input resize-none" placeholder="Escribe tu mensaje aquí..."></textarea>
                </div>
                <button type="submit" className="w-full btn-primary">
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Map Placeholder */}
      <div className="mt-20 h-96 w-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
          alt="Map"
          className="w-full h-full object-cover opacity-50 grayscale"
        />
        <div className="absolute text-center">
          <p className="text-zinc-900 dark:text-white font-bold text-xl mb-4">Estamos aquí</p>
          <button className="btn-secondary">Abrir en Google Maps</button>
        </div>
      </div>
    </main>
  );
}
