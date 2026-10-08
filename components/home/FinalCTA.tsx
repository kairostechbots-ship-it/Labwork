import Link from 'next/link';

import {
  ArrowRight,
  CalendarDays,
  FlaskConical,
  Headphones,
  MapPin,
  MessageCircle,
} from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="bg-white px-4 pb-12 pt-4 sm:px-6 lg:px-8">
      <div
        className="
          relative
          mx-auto
          max-w-7xl
          overflow-hidden
          rounded-[30px]
          bg-primary-950
          shadow-[0_20px_60px_rgba(15,23,42,0.14)]
        "
      >
        {/* =====================================================
            DECORACIÓN
        ====================================================== */}

        <div
          aria-hidden="true"
          className="
            absolute
            -right-16
            -top-24
            h-80
            w-80
            rounded-full
            bg-primary-700/50
            blur-3xl
          "
        />

        <div
          aria-hidden="true"
          className="
            absolute
            -bottom-24
            left-[35%]
            h-64
            w-64
            rounded-full
            bg-accent-500/15
            blur-3xl
          "
        />

        <div
          aria-hidden="true"
          className="
            absolute
            -right-10
            bottom-[-45px]
            h-44
            w-44
            rounded-full
            border
            border-white/10
          "
        />

        <div
          aria-hidden="true"
          className="
            absolute
            right-10
            top-10
            h-24
            w-24
            rounded-full
            border
            border-white/10
          "
        />

        {/* =====================================================
            CONTENIDO
        ====================================================== */}

        <div
          className="
            relative
            z-10
            grid
            gap-8
            px-7
            py-10
            md:grid-cols-[1.2fr_0.8fr]
            md:items-center
            lg:px-12
            lg:py-12
          "
        >
          {/* ===================================================
              IZQUIERDA
          ==================================================== */}

          <div>
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-white/10
                bg-white/[0.06]
                px-3.5
                py-2
                text-xs
                font-bold
                uppercase
                tracking-[0.14em]
                text-accent-400
                backdrop-blur-sm
              "
            >
              <Headphones className="h-4 w-4" />

              Estamos para ayudarte
            </div>

            <h2
              className="
                mt-5
                max-w-2xl
                font-display
                text-3xl
                font-bold
                tracking-tight
                text-white
                sm:text-4xl
                lg:text-[42px]
                lg:leading-[1.1]
              "
            >
              ¿Listo para dar el siguiente paso?
            </h2>

            <p
              className="
                mt-4
                max-w-xl
                text-sm
                leading-7
                text-primary-100/80
                sm:text-base
              "
            >
              Agenda tu cita en línea o contáctanos si tienes dudas
              sobre nuestros estudios, sucursales o servicios.
            </p>

            {/* =================================================
                ACCESOS PEQUEÑOS
            ================================================== */}

            <div
              className="
                mt-6
                flex
                flex-wrap
                gap-x-6
                gap-y-3
                text-xs
                font-semibold
                text-primary-100/80
                sm:text-sm
              "
            >
              <Link
                href="/estudios"
                className="
                  inline-flex
                  items-center
                  gap-2
                  transition-colors
                  hover:text-white
                "
              >
                <FlaskConical className="h-4 w-4 text-accent-400" />

                Consulta estudios
              </Link>

              <Link
                href="/sucursales"
                className="
                  inline-flex
                  items-center
                  gap-2
                  transition-colors
                  hover:text-white
                "
              >
                <MapPin className="h-4 w-4 text-accent-400" />

                Encuentra tu sucursal
              </Link>

              <Link
                href="/contacto"
                className="
                  inline-flex
                  items-center
                  gap-2
                  transition-colors
                  hover:text-white
                "
              >
                <MessageCircle className="h-4 w-4 text-accent-400" />

                Resuelve tus dudas
              </Link>
            </div>
          </div>

          {/* ===================================================
              DERECHA
          ==================================================== */}

          <div
            className="
              flex
              flex-col
              gap-3
              md:items-end
            "
          >
            {/* AGENDAR */}

            <Link
              href="/agendar"
              className="
                group
                inline-flex
                w-full
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
                shadow-[0_10px_28px_rgba(122,203,59,0.22)]
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-accent-600
                hover:shadow-[0_14px_34px_rgba(122,203,59,0.30)]
                md:w-auto
              "
            >
              <CalendarDays className="h-4 w-4" />

              Agendar cita

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

            {/* CONTACTO */}

            <Link
              href="/contacto"
              className="
                group
                inline-flex
                w-full
                items-center
                justify-center
                gap-2.5
                rounded-xl
                border
                border-white/20
                bg-white/[0.04]
                px-6
                py-3.5
                text-sm
                font-bold
                text-white
                backdrop-blur-sm
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-white/30
                hover:bg-white/[0.08]
                md:w-auto
              "
            >
              <MessageCircle className="h-4 w-4" />

              Contactarnos

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

            {/* TEXTO AUXILIAR */}

            <p
              className="
                max-w-[230px]
                text-center
                text-[10px]
                leading-4
                text-primary-200/60
                md:text-right
              "
            >
              También puedes comunicarte con nosotros por WhatsApp
              o correo electrónico.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}