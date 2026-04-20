import Image from "next/image";

const MENU_ITEMS = [
  {
    id: 1,
    name: "Hamburguesa de Lentejas",
    description: "Con queso vegano, rúcula y cebollas caramelizadas.",
    price: "S/ 28.00",
    image: "https://images.unsplash.com/photo-1525059696034-4767759ad72b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tag: "Vegetariano"
  },
  {
    id: 2,
    name: "Costillas a la Parrilla",
    description: "Con salsa barbacoa de la casa y papas rústicas.",
    price: "S/ 45.00",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tag: "Parrilla"
  },
  {
    id: 3,
    name: "Ensalada Quinoa Real",
    description: "Palta, tomates cherry y vinagreta de cítricos.",
    price: "S/ 24.00",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tag: "Vegetariano"
  }
];

export default function FeaturedMenu() {
  return (
    <section className="bg-white dark:bg-black py-20">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="title-main mb-4">Platos Destacados</h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Una selección de nuestros platos más aclamados, preparados con los ingredientes más frescos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MENU_ITEMS.map((item) => (
            <div key={item.id} className="card group">
              <div className="relative h-64 overflow-hidden">
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
                  <h3 className="text-xl font-bold">{item.name}</h3>
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
    </section>
  );
}
