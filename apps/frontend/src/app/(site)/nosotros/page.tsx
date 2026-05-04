"use client";

import { motion } from "framer-motion";
import { Leaf, Sparkles, Star, Award, Users, Globe } from "lucide-react";

const PILLARES = [
  { 
    title: "Sostenibilidad", 
    desc: "Reducimos nuestra huella ambiental mediante procesos conscientes y empaques compostables.", 
    icon: <Leaf className="w-10 h-10 text-primary" /> 
  },
  { 
    title: "Innovación", 
    desc: "Buscamos constantemente nuevas formas de elevar los ingredientes tradicionales.", 
    icon: <Sparkles className="w-10 h-10 text-primary" /> 
  },
  { 
    title: "Excelencia", 
    desc: "No escatimamos en esfuerzos para brindar una atención cálida y platos perfectos.", 
    icon: <Star className="w-10 h-10 text-primary" /> 
  },
];

export default function NosotrosPage() {
  return (
    <main className="pt-24 min-h-screen bg-white dark:bg-zinc-950 transition-colors pb-20">
      <div className="section-container">
        {/* Historia Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
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
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <span className="block text-2xl font-bold text-primary">10+</span>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Años de Pasión</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <Users className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <span className="block text-2xl font-bold text-secondary">50k+</span>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Clientes Felices</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1550966842-2862ba996158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Nuestro Restaurante"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </motion.div>
        </div>

        {/* Valores Section */}
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-[40px] p-12 lg:p-20 border border-zinc-100 dark:border-zinc-800">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-4 text-zinc-900 dark:text-white"
            >
              Nuestros Pilares
            </motion.h2>
            <p className="text-zinc-500 dark:text-zinc-400">Lo que nos impulsa a mejorar cada día.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {PILLARES.map((pilar, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center group"
              >
                <div className="bg-white dark:bg-zinc-800 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all">
                  {pilar.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">{pilar.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{pilar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Misión/Visión Extra */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
           <motion.div 
             whileHover={{ scale: 1.02 }}
             className="p-10 rounded-3xl bg-primary text-white"
           >
              <Globe className="w-12 h-12 mb-6 opacity-80" />
              <h3 className="text-2xl font-bold mb-4">Nuestra Misión</h3>
              <p className="opacity-90 leading-relaxed">
                Revolucionar la forma en que las personas perciben la comida vegetariana, 
                elevando cada ingrediente a través de técnicas de parrilla artesanal 
                y un compromiso inquebrantable con el sabor.
              </p>
           </motion.div>
           <motion.div 
             whileHover={{ scale: 1.02 }}
             className="p-10 rounded-3xl bg-secondary text-white"
           >
              <Users className="w-12 h-12 mb-6 opacity-80" />
              <h3 className="text-2xl font-bold mb-4">Nuestra Visión</h3>
              <p className="opacity-90 leading-relaxed">
                Convertirnos en el referente regional de la cocina fusión saludable, 
                siendo reconocidos por nuestra innovación constante y el impacto positivo 
                en nuestra comunidad y medio ambiente.
              </p>
           </motion.div>
        </div>
      </div>
    </main>
  );
}
