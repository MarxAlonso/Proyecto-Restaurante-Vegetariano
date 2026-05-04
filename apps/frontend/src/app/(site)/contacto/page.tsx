"use client";

import { motion } from "framer-motion";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Instagram, 
  Facebook, 
  Twitter,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ContactoPage() {
  return (
    <main className="pt-24 min-h-screen bg-white dark:bg-zinc-950 transition-colors pb-20">
      <div className="section-container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="title-main mb-4">Ponte en Contacto</h1>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            ¿Tienes alguna consulta o quieres realizar una reserva especial? Nuestro equipo está listo para atenderte.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            {[
              { icon: <MapPin className="w-6 h-6" />, title: "Ubicación", detail: "Av. Gastronomía 123, Lima, Perú", color: "text-primary" },
              { icon: <Phone className="w-6 h-6" />, title: "Teléfono", detail: "+51 987 654 321 / (01) 234 5678", color: "text-secondary" },
              { icon: <Clock className="w-6 h-6" />, title: "Horario", detail: "Lun - Sáb: 12pm - 11pm | Dom: 12pm - 5pm", color: "text-zinc-900 dark:text-white" },
              { icon: <Mail className="w-6 h-6" />, title: "Email", detail: "hola@restaurantveg.com", color: "text-primary" },
            ].map((info, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card p-6 flex items-start gap-4 hover:border-primary/30 transition-colors group"
              >
                <div className={cn("p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 transition-colors group-hover:bg-primary/10", info.color)}>
                  {info.icon}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white mb-1">{info.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{info.detail}</p>
                </div>
              </motion.div>
            ))}

            {/* Socials */}
            <div className="pt-6">
              <h4 className="font-bold mb-4 px-2">Síguenos</h4>
              <div className="flex gap-4">
                {[Instagram, Facebook, Twitter].map((Icon, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-primary hover:text-white transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2"
          >
            <div className="card p-8 lg:p-12 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-white flex items-center gap-3">
                <Send className="w-6 h-6 text-primary" />
                Envíanos un mensaje
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Nombre Completo</label>
                    <input type="text" className="input bg-white dark:bg-zinc-950" placeholder="Tu nombre..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Correo Electrónico</label>
                    <input type="email" className="input bg-white dark:bg-zinc-950" placeholder="tu@email.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Asunto</label>
                  <input type="text" className="input bg-white dark:bg-zinc-950" placeholder="¿Cómo podemos ayudarte?" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">Mensaje</label>
                  <textarea rows={5} className="input bg-white dark:bg-zinc-950 resize-none" placeholder="Escribe tu mensaje aquí..."></textarea>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  className="w-full btn-primary flex items-center justify-center gap-2 h-12"
                >
                  <Send className="w-4 h-4" />
                  Enviar Mensaje
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Motion Map Section (Shadcn-like premium feel) */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 relative rounded-[32px] overflow-hidden border border-zinc-200 dark:border-zinc-800 h-[500px] shadow-2xl group"
        >
          {/* Animated Background Placeholder for Map */}
          <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
             <img 
               src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
               alt="Map Background"
               className="w-full h-full object-cover opacity-40 grayscale group-hover:scale-105 transition-transform duration-1000"
             />
             
             {/* Motion Elements overlaying the map */}
             <div className="absolute inset-0 pointer-events-none">
                <motion.div 
                  animate={{ 
                    y: [0, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="relative">
                    <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping" />
                    <div className="bg-primary p-4 rounded-2xl shadow-xl relative z-10">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </motion.div>
             </div>
          </div>

          {/* Map Controls / Overlay */}
          <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
             <motion.div 
               initial={{ x: -20, opacity: 0 }}
               whileInView={{ x: 0, opacity: 1 }}
               className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50 shadow-lg max-w-sm"
             >
                <h4 className="font-bold text-zinc-900 dark:text-white mb-1">Nuestra Sede Central</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Visítanos y vive la experiencia RESTAURANTVEG en persona.</p>
                <div className="flex gap-2">
                   <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded uppercase">Abierto Ahora</span>
                   <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-bold rounded uppercase">Wifi Gratis</span>
                </div>
             </motion.div>

             <motion.a
               href="https://maps.google.com"
               target="_blank"
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="btn-secondary !px-8 flex items-center gap-2 shadow-lg"
             >
                <ExternalLink className="w-4 h-4" />
                Cómo llegar
             </motion.a>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
