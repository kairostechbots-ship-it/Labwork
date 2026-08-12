import { FileText, Heart, Shield, Activity, Microscope } from 'lucide-react';

const packages = [
  {
    id: 'basico',
    name: 'Checkup Básico',
    description: 'Ideal para revisión general anual.',
    price: '$850',
    icon: Shield,
    includes: [
      'Biometría Hemática (27 elementos)',
      'Química Sanguínea (6 elementos)',
      'Examen General de Orina',
    ]
  },
  {
    id: 'integral',
    name: 'Checkup Integral',
    description: 'Evaluación completa del estado de salud.',
    price: '$1,450',
    icon: Heart,
    popular: true,
    includes: [
      'Biometría Hemática Completa',
      'Química Sanguínea (27 elementos)',
      'Perfil de Lípidos',
      'Examen General de Orina',
      'Perfil Hepático'
    ]
  },
  {
    id: 'tiroideo',
    name: 'Perfil Tiroideo',
    description: 'Evaluación de la función de la glándula tiroides.',
    price: '$980',
    icon: Activity,
    includes: [
      'T3 Total y Libre',
      'T4 Total y Libre',
      'TSH (Hormona Estimulante)',
    ]
  }
];

const individualStudies = [
  'Biometría Hemática', 'Química Sanguínea', 'Examen General de Orina',
  'Perfil de Lípidos', 'Perfil Hepático', 'Pruebas de Coagulación',
  'Prueba de Embarazo (Sangre)', 'Grupo Sanguíneo y Rh', 'Cultivos'
];

export default function Services() {
  return (
    <section id="estudios" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
            Estudios y Paquetes Preventivos
          </h2>
          <p className="text-lg text-slate-600">
            Contamos con una amplia variedad de análisis clínicos para cuidar de tu salud y la de tu familia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`relative rounded-3xl p-8 border ${
                pkg.popular 
                  ? 'border-accent-500 shadow-xl shadow-accent-500/10 bg-white' 
                  : 'border-slate-200 bg-slate-50'
              } flex flex-col`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                  Más Solicitado
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  pkg.popular ? 'bg-primary-50 text-primary-800' : 'bg-white text-slate-600'
                }`}>
                  <pkg.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{pkg.name}</h3>
                </div>
              </div>
              
              <p className="text-slate-600 mb-6 flex-grow">{pkg.description}</p>
              
              <div className="mb-6">
                <span className="text-3xl font-display font-bold text-slate-900">{pkg.price}</span>
                <span className="text-slate-500 font-medium"> MXN</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {pkg.includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              
              <a
                href="#agendar"
                className={`w-full py-3 px-4 rounded-xl font-bold text-center transition-colors ${
                  pkg.popular 
                    ? 'bg-primary-900 text-white hover:bg-primary-800' 
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Agendar Cita
              </a>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-slate-50 p-8 md:p-12 border border-slate-200">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <Microscope className="w-6 h-6 text-primary-600" />
                <h3 className="text-2xl font-bold font-display text-slate-900">Estudios Individuales</h3>
              </div>
              <p className="text-slate-600 mb-6">
                Además de nuestros paquetes, realizamos más de 500 pruebas de rutina y especialidad.
              </p>
              <div className="flex flex-wrap gap-2">
                {individualStudies.map((study, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 font-medium">
                    {study}
                  </span>
                ))}
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-200 text-sm text-slate-700 font-medium">
                  + 500 más...
                </span>
              </div>
            </div>
            <div className="shrink-0">
              <a href="tel:5550101" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-base font-medium text-white hover:bg-slate-800 transition-colors">
                <FileText className="w-5 h-5" />
                Cotizar otro estudio
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
