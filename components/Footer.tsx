import { Activity, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary-900 pt-16 pb-8 border-t border-primary-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary-900">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl">
                <span className="text-white">Lab-</span><span className="text-accent-400">Work</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Laboratorio de análisis clínicos comprometido con la precisión, rapidez y calidad en el servicio para el cuidado de tu salud.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Contacto</h4>
            <ul className="space-y-4">
              <li>
                <a href="tel:5550101" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm">
                  <Phone className="w-4 h-4" />
                  (555) 0101-0000
                </a>
              </li>
              <li>
                <a href="https://wa.me/525550101000" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm">
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a href="mailto:contacto@labwork.com" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm">
                  <Mail className="w-4 h-4" />
                  contacto@labwork.com
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Enlaces</h4>
            <ul className="space-y-4">
              <li><a href="#inicio" className="text-slate-400 hover:text-white transition-colors text-sm">Inicio</a></li>
              <li><a href="#estudios" className="text-slate-400 hover:text-white transition-colors text-sm">Estudios y Paquetes</a></li>
              <li><a href="#sucursales" className="text-slate-400 hover:text-white transition-colors text-sm">Sucursales</a></li>
              <li><a href="#agendar" className="text-slate-400 hover:text-white transition-colors text-sm">Agendar Cita</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-primary-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} Lab-Work Análisis Clínicos. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-white text-sm">Aviso de Privacidad</a>
            <a href="#" className="text-slate-500 hover:text-white text-sm">Términos y Condiciones</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
