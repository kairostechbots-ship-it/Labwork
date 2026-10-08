import {
  CalendarDays,
  FlaskConical,
  MapPin,
  Search,
} from 'lucide-react';

const benefits = [
  {
    icon: FlaskConical,
    title: 'Amplio catálogo',
    description: 'Consulta los estudios disponibles',
  },
  {
    icon: Search,
    title: 'Información accesible',
    description: 'Encuentra fácilmente lo que necesitas',
  },
  {
    icon: MapPin,
    title: 'Varias sucursales',
    description: 'Conoce nuestras ubicaciones',
  },
  {
    icon: CalendarDays,
    title: 'Agenda en línea',
    description: 'Programa tu cita fácilmente',
  },
];

export default function QuickBenefits() {
  return (
    <section className="border-y border-primary-100 bg-gradient-to-r from-primary-50/80 via-white to-primary-50/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="relative flex items-center gap-4 px-3 py-6 sm:px-5 lg:px-7 lg:py-7"
              >
                {/* Separador vertical */}
                {index !== 0 && (
                  <div className="absolute left-0 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-primary-100 lg:block" />
                )}

                {/* Icono */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-[0_5px_16px_rgba(15,23,42,0.05)] ring-1 ring-primary-100">
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={1.8}
                  />
                </div>

                {/* Información */}
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-bold text-primary-950">
                    {benefit.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}