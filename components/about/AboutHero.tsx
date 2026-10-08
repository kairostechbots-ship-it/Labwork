import Link from 'next/link';

import {
  ArrowRight,
  CalendarDays,
  MapPin,
} from 'lucide-react';

import HistoriaVisual from '@/components/about/HistoriaVisual';

export default function AboutHero() {
  return (
    <section
      className="
        relative
        overflow-hidden
        bg-gradient-to-br
        from-white
        via-white
        to-primary-50/40
      "
    >
      <div
        className="
          relative
          mx-auto
          grid
          min-h-[570px]
          max-w-7xl
          items-center
          gap-10
          px-4
          py-14
          sm:px-6
          lg:grid-cols-[0.92fr_1.08fr]
          lg:px-8
          lg:py-16
        "
      >
        {/* =====================================================
            IZQUIERDA
        ====================================================== */}

        <div className="relative z-10">
          {/* ETIQUETA */}

          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-primary-100
              bg-white
              px-3.5
              py-2
              text-xs
              font-bold
              uppercase
              tracking-[0.16em]
              text-primary-800
              shadow-sm
            "
          >
            <span className="h-2 w-2 rounded-full bg-accent-500" />

            Nosotros
          </div>

          {/* TÍTULO */}

          <h1
            className="
              mt-7
              max-w-[650px]
              font-display
              text-4xl
              font-bold
              tracking-[-0.045em]
              text-primary-950
              sm:text-5xl
              lg:text-[56px]
              lg:leading-[1.05]
            "
          >
            Crecemos contigo,

            <span className="block text-accent-500">
              cuidando lo que importa
            </span>
          </h1>

          {/* DESCRIPCIÓN */}

          <p
            className="
              mt-6
              max-w-[590px]
              text-base
              leading-8
              text-slate-600
              sm:text-[17px]
            "
          >
            Desde 2022 trabajamos para acercar servicios de análisis
            clínicos a las familias de la Ribera de Chapala, creciendo
            junto a nuestra comunidad.
          </p>

          {/* BOTONES */}

          <div
            className="
              mt-8
              flex
              flex-col
              gap-3
              sm:flex-row
            "
          >
            <Link
              href="/agendar"
              className="
                group
                inline-flex
                items-center
                justify-center
                gap-2.5
                rounded-xl
                bg-accent-500
                px-5
                py-3.5
                text-sm
                font-bold
                text-white
                shadow-[0_10px_30px_rgba(122,203,59,0.20)]
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-accent-600
              "
            >
              <CalendarDays className="h-4 w-4" />

              Agendar cita

              <ArrowRight
                className="
                  h-4
                  w-4
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </Link>

            <Link
              href="/sucursales"
              className="
                group
                inline-flex
                items-center
                justify-center
                gap-2.5
                rounded-xl
                border
                border-primary-200
                bg-white
                px-5
                py-3.5
                text-sm
                font-bold
                text-primary-900
                transition-all
                hover:-translate-y-0.5
                hover:bg-primary-50
              "
            >
              <MapPin className="h-4 w-4" />

              Conocer sucursales

              <ArrowRight
                className="
                  h-4
                  w-4
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>
        </div>

        {/* =====================================================
            DERECHA
        ====================================================== */}

        <div
          className="
            relative
            flex
            w-full
            items-center
            justify-center
          "
        >
          <HistoriaVisual />
        </div>
      </div>
    </section>
  );
}