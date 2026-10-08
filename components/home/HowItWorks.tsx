import {
  CalendarDays,
  FileText,
  Search,
} from 'lucide-react';

const steps = [
  {
    number: '1',
    icon: Search,
    title: 'Busca tu estudio',
    description:
      'Encuentra el análisis o paquete que necesitas.',
  },
  {
    number: '2',
    icon: FileText,
    title: 'Consulta la información',
    description:
      'Revisa el precio y los detalles disponibles.',
  },
  {
    number: '3',
    icon: CalendarDays,
    title: 'Agenda tu cita',
    description:
      'Elige tu sucursal y programa tu cita.',
  },
];

export default function HowItWorks() {
  return (
    <section className="border-y border-slate-100 bg-white py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_2fr] lg:items-center">
          {/* Encabezado */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-600">
              Así de fácil
            </p>

            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary-950 sm:text-[34px]">
              ¿Cómo funciona?
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
              Consulta, conoce y agenda en solo 3 pasos.
            </p>
          </div>

          {/* Pasos */}
          <div className="grid gap-7 sm:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="group relative flex gap-4"
                >
                  {/* Separador */}
                  {index !== 0 && (
                    <div
                      aria-hidden="true"
                      className="
                        absolute
                        -left-3
                        top-1
                        hidden
                        h-[92px]
                        w-px
                        bg-slate-100
                        sm:block
                      "
                    />
                  )}

                  {/* Número */}
                  <div
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-primary-100
                      bg-primary-50
                      text-xs
                      font-bold
                      text-primary-700
                    "
                  >
                    {step.number}
                  </div>

                  <div>
                    {/* Icono */}
                    <div
                      className="
                        mb-3
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-2xl
                        bg-primary-50
                        text-primary-700
                        transition-all
                        duration-200
                        group-hover:bg-primary-900
                        group-hover:text-white
                      "
                    >
                      <Icon
                        className="h-5 w-5"
                        strokeWidth={1.8}
                      />
                    </div>

                    <h3 className="font-display text-sm font-bold text-primary-950">
                      {step.title}
                    </h3>

                    <p className="mt-1.5 max-w-[200px] text-xs leading-5 text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}