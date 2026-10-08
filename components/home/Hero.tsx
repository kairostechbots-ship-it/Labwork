import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowRight,
  CalendarDays,
  MapPin,
} from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Fondo decorativo izquierdo */}
      <div
        aria-hidden="true"
        className="
          absolute
          -left-40
          bottom-0
          h-[420px]
          w-[420px]
          rounded-full
          bg-accent-50/60
          blur-3xl
        "
      />

      {/* Fondo decorativo derecho */}
      <div
        aria-hidden="true"
        className="
          absolute
          -right-40
          top-0
          h-[520px]
          w-[520px]
          rounded-full
          bg-primary-50/80
          blur-3xl
        "
      />

      <div
        className="
          relative
          mx-auto
          grid
          min-h-[620px]
          max-w-7xl
          items-center
          gap-14
          px-4
          py-14
          sm:px-6
          lg:grid-cols-[1.03fr_0.97fr]
          lg:px-8
          lg:py-16
        "
      >
        {/* =====================================================
            COLUMNA IZQUIERDA
        ====================================================== */}
        <div className="relative z-10">
          {/* Etiqueta */}
          <div
            className="
              mb-6
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-primary-100
              bg-primary-50
              px-4
              py-2
              text-sm
              font-semibold
              text-primary-700
            "
          >
            <span className="h-2 w-2 rounded-full bg-accent-500" />
            Laboratorio de análisis clínicos
          </div>

          {/* Título */}
          <h1
            className="
              max-w-[680px]
              font-display
              text-4xl
              font-bold
              tracking-tight
              text-primary-950
              sm:text-5xl
              lg:text-[59px]
              lg:leading-[1.08]
            "
          >
            Tu salud comienza con

            <span className="block text-accent-500">
              información clara
            </span>
          </h1>

          {/* Descripción */}
          <p
            className="
              mt-5
              max-w-[590px]
              text-base
              leading-7
              text-slate-600
              sm:text-lg
              sm:leading-8
            "
          >
            Consulta nuestros estudios, encuentra la sucursal más
            conveniente para ti y agenda tu cita de manera sencilla.
          </p>

          {/* Botones */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/agendar"
              className="
                inline-flex
                items-center
                justify-center
                gap-2.5
                rounded-xl
                bg-accent-500
                px-6
                py-3.5
                text-sm
                font-bold
                text-white
                shadow-[0_8px_22px_rgba(122,203,59,0.20)]
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-accent-600
                hover:shadow-[0_10px_28px_rgba(122,203,59,0.28)]
                active:translate-y-0
              "
            >
              <CalendarDays className="h-4 w-4" />
              Agendar cita
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/estudios"
              className="
                inline-flex
                items-center
                justify-center
                rounded-xl
                border
                border-primary-200
                bg-white
                px-6
                py-3.5
                text-sm
                font-bold
                text-primary-900
                transition-all
                duration-200
                hover:border-primary-300
                hover:bg-primary-50
              "
            >
              Explorar estudios
            </Link>
          </div>

          {/* Sucursales */}
          <Link
            href="/sucursales"
            className="
              group
              mt-6
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-primary-800
              transition-colors
              hover:text-accent-600
            "
          >
            <MapPin className="h-4 w-4 text-accent-500" />

            Encuentra tu sucursal más cercana

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

        {/* =====================================================
            COLUMNA DERECHA
        ====================================================== */}
        <div
          className="
            relative
            mx-auto
            hidden
            h-[540px]
            w-full
            max-w-[540px]
            lg:block
          "
        >
          {/* Puntos azules superiores */}
          <div
            aria-hidden="true"
            className="
              absolute
              -right-8
              top-3
              z-0
              grid
              grid-cols-5
              gap-[10px]
              opacity-55
            "
          >
            {Array.from({ length: 25 }).map((_, index) => (
              <span
                key={`blue-top-${index}`}
                className="
                  h-[4px]
                  w-[4px]
                  rounded-full
                  bg-primary-300
                "
              />
            ))}
          </div>

          {/* Puntos verdes */}
          <div
            aria-hidden="true"
            className="
              absolute
              -right-10
              top-[260px]
              z-20
              grid
              grid-cols-5
              gap-[9px]
              opacity-75
            "
          >
            {Array.from({ length: 25 }).map((_, index) => (
              <span
                key={`green-right-${index}`}
                className="
                  h-[4px]
                  w-[4px]
                  rounded-full
                  bg-accent-500
                "
              />
            ))}
          </div>

          {/* Puntos inferiores */}
          <div
            aria-hidden="true"
            className="
              absolute
              bottom-[105px]
              left-[5px]
              z-0
              grid
              grid-cols-5
              gap-[9px]
              opacity-45
            "
          >
            {Array.from({ length: 25 }).map((_, index) => (
              <span
                key={`blue-bottom-${index}`}
                className="
                  h-[4px]
                  w-[4px]
                  rounded-full
                  bg-primary-300
                "
              />
            ))}
          </div>

          {/* Forma verde superior */}
          <div
            aria-hidden="true"
            className="
              absolute
              left-0
              top-10
              z-0
              h-[190px]
              w-[190px]
              rotate-[-8deg]
              rounded-[40px]
              bg-accent-100
            "
          />

          {/* Forma azul trasera */}
          <div
            aria-hidden="true"
            className="
              absolute
              bottom-5
              right-0
              z-[1]
              h-[455px]
              w-[420px]
              rotate-[6deg]
              rounded-[42px]
              bg-primary-900
            "
          />

          {/* Círculo azul */}
          <div
            aria-hidden="true"
            className="
              absolute
              -right-8
              bottom-20
              z-0
              h-32
              w-32
              rounded-full
              bg-primary-100
            "
          />

          {/* Forma verde inferior */}
          <div
            aria-hidden="true"
            className="
              absolute
              bottom-[-10px]
              right-[55px]
              z-0
              h-[145px]
              w-[190px]
              rotate-[-8deg]
              rounded-[36px]
              bg-accent-100/90
            "
          />

          {/* Imagen */}
          <div
            className="
              absolute
              right-5
              top-12
              z-10
              h-[435px]
              w-[430px]
              overflow-hidden
              rounded-[34px]
              border-[6px]
              border-white
              bg-primary-50
              shadow-[0_25px_60px_rgba(11,55,109,0.18)]
            "
          >
            <Image
              src="/images/home/laboratorio-hero.jpg"
              alt="Laboratorio de análisis clínicos"
              fill
              priority
              sizes="430px"
              className="object-cover"
            />
          </div>

          {/* Tarjeta flotante */}
          <Link
            href="/agendar"
            className="
              group
              absolute
              bottom-[5px]
              left-[-25px]
              z-30
              flex
              w-[310px]
              items-center
              gap-4
              rounded-2xl
              border
              border-slate-100
              bg-white
              p-4
              shadow-[0_15px_40px_rgba(15,23,42,0.13)]
              transition-all
              duration-200
              hover:-translate-y-1
              hover:shadow-[0_20px_45px_rgba(15,23,42,0.16)]
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-accent-50
                text-accent-600
              "
            >
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                ¿Necesitas un estudio?
              </p>

              <p className="mt-0.5 text-sm font-bold text-primary-950">
                Agenda tu cita en línea
              </p>
            </div>

            <ArrowRight
              className="
                ml-auto
                h-4
                w-4
                shrink-0
                text-accent-500
                transition-transform
                duration-200
                group-hover:translate-x-1
              "
            />
          </Link>
        </div>
      </div>
    </section>
  );
}