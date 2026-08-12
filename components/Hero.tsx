import { ArrowRight, Activity, Clock, ShieldCheck } from 'lucide-react';

export default function Hero() {
  return (
    <section id="inicio" className="relative pt-24 pb-32 overflow-hidden bg-slate-50">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
            </span>
            Resultados rápidos y precisos
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 tracking-tight mb-6">
            Tu salud en las <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-accent-400">
              mejores manos
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Laboratorio de análisis clínicos con tecnología de vanguardia. 
            Servicio a domicilio disponible y resultados en línea para tu comodidad.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#agendar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-accent-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-accent-500/30 hover:bg-accent-600 transition-all active:scale-95"
            >
              Agendar Cita
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#estudios"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white border border-slate-200 px-8 py-4 text-base font-medium text-slate-700 hover:bg-slate-50 transition-all"
            >
              Ver Estudios y Paquetes
            </a>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              icon: Activity,
              title: 'Tecnología de Punta',
              desc: 'Equipos automatizados para mayor precisión.'
            },
            {
              icon: Clock,
              title: 'Resultados Rápidos',
              desc: 'La mayoría de estudios disponibles el mismo día.'
            },
            {
              icon: ShieldCheck,
              title: 'Calidad Certificada',
              desc: 'Procesos estandarizados y avalados.'
            }
          ].map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
