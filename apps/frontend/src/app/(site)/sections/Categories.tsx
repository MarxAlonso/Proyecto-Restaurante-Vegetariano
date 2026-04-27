export default function Categories() {
  return (
    <section className="bg-zinc-50 dark:bg-zinc-950 py-20">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vegetariano */}
          <div className="relative h-[400px] rounded-2xl overflow-hidden group cursor-pointer">
            <img 
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Vegetariano"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-3xl font-bold mb-2">Vegetariano</h3>
              <p className="text-zinc-200 mb-4">Frescura y vitalidad en cada bocado.</p>
              <span className="inline-block px-6 py-2 border border-white rounded-full font-semibold group-hover:bg-white group-hover:text-primary transition-colors">
                Ver Todo
              </span>
            </div>
          </div>

          {/* Parrilla */}
          <div className="relative h-[400px] rounded-2xl overflow-hidden group cursor-pointer">
            <img 
              src="https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Parrilla"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-3xl font-bold mb-2">Parrilla</h3>
              <p className="text-zinc-200 mb-4">El sabor ahumado que te encanta.</p>
              <span className="inline-block px-6 py-2 border border-white rounded-full font-semibold group-hover:bg-white group-hover:text-secondary transition-colors">
                Ver Todo
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
