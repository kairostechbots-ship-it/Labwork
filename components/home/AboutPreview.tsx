import Link from 'next/link';

import {
  ArrowRight,
  CalendarCheck2,
  Clock3,
  HeartHandshake,
  ShieldCheck,
} from 'lucide-react';

const benefits = [
  {
    icon: ShieldCheck,
    title: 'Información clara',
    description:
      'Consulta precios, preparación y datos importantes antes de acudir.',
  },
  {
    icon: Clock3,
    title: 'Consulta sencilla',
    description:
      'Encuentra estudios, paquetes y detalles de forma rápida.',
  },
  {
    icon: HeartHandshake,
    title: 'Atención cercana',
    description:
      'Encuentra una sucursal que se adapte a tus necesidades.',
  },
  {
    icon: CalendarCheck2,
    title: 'Agenda en línea',
    description:
      'Programa tu cita de manera sencilla desde nuestro sitio.',
  },
];

export default function AboutPreview() {
  return (
    <section className="relative overflow-hidden bg-primary-50/50 py-16 sm:py-20">
      {/* Decoración */}
      <div
        aria-hidden="true"
        className="
          absolute
          -left-28
          -top-28
          h-72
          w-72
          rounded-full
          bg-white/90
          blur-3xl
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute
          -right-32
          bottom-0
          h-80
          w-80
          rounded-full
          bg-primary-100/50
          blur-3xl
        "
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =====================================================
            CABECERA
        ====================================================== */}

        <div
          className="
            grid
            gap-8
            lg:grid-cols-[0.9fr_1.1fr]
            lg:items-end
            lg:gap-14
          "
        >
          <div>
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.22em]
                text-accent-600
              "
            >
              Conoce Lab-Work
            </p>

            <h2
              className="
                mt-3
                max-w-[560px]
                font-display
                text-3xl
                font-bold
                tracking-tight
                text-primary-950
                sm:text-4xl
                lg:text-[42px]
                lg:leading-[1.12]
              "
            >
              Una experiencia pensada para hacer
              <span className="text-accent-500">
                {' '}
                todo más sencillo
              </span>
            </h2>
          </div>

          <div>
            <p
              className="
                max-w-[600px]
                text-base
                leading-7
                text-slate-600
              "
            >
              En Lab-Work puedes consultar la información de tus estudios,
              conocer nuestras sucursales y organizar tu visita desde un solo
              lugar.
            </p>

            <Link
              href="/nosotros"
              className="
                group
                mt-5
                inline-flex
                items-center
                gap-2
                text-sm
                font-bold
                text-primary-900
                transition-colors
                hover:text-accent-600
              "
            >
              Conoce más sobre Lab-Work

              <ArrowRight
                className="
                  h-4
                  w-4
                  transition-transform
                  duration-200
                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>
        </div>

        {/* =====================================================
            BENEFICIOS
        ====================================================== */}

        <div
          className="
            mt-10
            grid
            gap-4
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          {benefits.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="
                group
                rounded-[22px]
                border
                border-primary-100
                bg-white/80
                p-5
                shadow-[0_8px_30px_rgba(15,23,42,0.04)]
                backdrop-blur-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-primary-200
                hover:shadow-[0_15px_35px_rgba(15,23,42,0.07)]
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-primary-50
                  text-primary-700
                  transition-all
                  duration-300
                  group-hover:bg-primary-900
                  group-hover:text-white
                "
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />
              </div>

              <h3
                className="
                  mt-4
                  font-display
                  text-base
                  font-bold
                  text-primary-950
                "
              >
                {title}
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}