import Image from "next/image";

const MENU_CATEGORIES = [
  {
    name: "Entradas & Ensaladas",
    items: [
      { id: 1, name: "Bruschettas Veganas", description: "Pan de masa madre, tomate concassé, albahaca y aceite de oliva.", price: "S/ 18.00", image: "https://images.unsplash.com/photo-1572656631137-7935297eff55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tag: "Vegetariano" },
      { id: 2, name: "Ensalada Quinoa Real", description: "Palta, tomates cherry, pepino y vinagreta de cítricos.", price: "S/ 24.00", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tag: "Vegetariano" },
    ]
  },
  {
    name: "Nuestra Parrilla",
    items: [
      { id: 3, name: "Costillas BBQ", description: "Costillas de cerdo premium glaseadas con salsa de la casa.", price: "S/ 45.00", image: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tag: "Parrilla" },
      { id: 4, name: "Bife Angosto", description: "Corte premium de 400g servido con chimichurri.", price: "S/ 65.00", image: "https://images.unsplash.com/photo-1546241072-48010ad28c2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tag: "Parrilla" },
    ]
  },
  {
    name: "Especialidades Vegetarianas",
    items: [
      { id: 5, name: "Hamburguesa de Lentejas", description: "Queso vegano, rúcula y cebollas caramelizadas.", price: "S/ 28.00", image: "https://images.unsplash.com/photo-1525059696034-4767759ad72b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tag: "Vegetariano" },
      { id: 6, name: "Lasaña de Berenjena", description: "Capas de berenjena, salsa pomodoro y queso de almendras.", price: "S/ 32.00", image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", tag: "Vegetariano" },
    ]
  }
];

export default function MenuPage() {
  return (
    <main className="pt-24 min-h-screen bg-white dark:bg-zinc-950 transition-colors">
      <div className="section-container">
        <div className="text-center mb-16">
          <h1 className="title-main mb-4">Nuestra Carta</h1>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Explora nuestra variedad de platos preparados con pasión, combinando la mejor selección de vegetales y cortes premium a la parrilla.
          </p>
        </div>

        {MENU_CATEGORIES.map((category, idx) => (
          <div key={idx} className="mb-20">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-4 text-zinc-900 dark:text-white">
              {category.name}
              <div className="h-px bg-zinc-200 dark:border-zinc-800 flex-1"></div>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.items.map((item) => (
                <div key={item.id} className="card group">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white ${item.tag === 'Vegetariano' ? 'bg-primary' : 'bg-secondary'}`}>
                      {item.tag}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{item.name}</h3>
                      <span className="text-primary font-bold">{item.price}</span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">
                      {item.description}
                    </p>
                    <button className="w-full btn-primary !py-2">
                      Añadir al Pedido
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
