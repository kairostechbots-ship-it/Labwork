import Link from 'next/link';

import {
  ArrowRight,
  CalendarDays,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';

export default function ContactHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* =====================================================
          FONDOS DECORATIVOS
      ====================================================== */}

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

      <div
        aria-hidden="true"
        className="
          absolute
          -right-32
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
          min-h-[560px]
          max-w-7xl
          items-center
          gap-12
          px-4
          py-14
          sm:px-6
          lg:grid-cols-[0.95fr_1.05fr]
          lg:px-8
          lg:py-16
        "
      >
        {/* =====================================================
            COLUMNA IZQUIERDA
        ====================================================== */}

        <div className="relative z-10">
          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.22em]
              text-accent-600
            "
          >
            Contacto
          </p>

          <h1
            className="
              mt-4
              max-w-[620px]
              font-display
              text-4xl
              font-bold
              tracking-tight
              text-primary-950
              sm:text-5xl
              lg:text-[58px]
              lg:leading-[1.05]
            "
          >
            ¿En qué podemos
            <span className="block text-accent-500">
              ayudarte?
            </span>
          </h1>

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
            Si tienes dudas sobre estudios, citas,
            sucursales o cualquier otro tema, estamos
            para orientarte.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
              <MapPin className="h-4 w-4 text-primary-700" />

              Ver sucursales

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
            COLUMNA DERECHA
        ====================================================== */}

        <div
          className="
            relative
            hidden
            h-[440px]
            w-full
            lg:block
          "
        >
          {/* Círculo azul grande */}
          <div
            aria-hidden="true"
            className="
              absolute
              left-[7%]
              top-[4%]
              h-[360px]
              w-[360px]
              rounded-full
              bg-primary-50/80
            "
          />

          {/* Círculo derecho */}
          <div
            aria-hidden="true"
            className="
              absolute
              -right-12
              top-4
              h-[210px]
              w-[210px]
              rounded-full
              bg-primary-100/50
            "
          />

          {/* Órbita verde */}
          <div
            aria-hidden="true"
            className="
              absolute
              right-[5%]
              top-[12%]
              h-[300px]
              w-[300px]
              rounded-full
              border
              border-accent-200
            "
          />

          {/* Línea / órbita inferior */}
          <div
            aria-hidden="true"
            className="
              absolute
              bottom-[35px]
              left-[18%]
              h-[160px]
              w-[160px]
              rounded-full
              border
              border-accent-200
            "
          />

          {/* Puntos decorativos */}
          <div
            aria-hidden="true"
            className="
              absolute
              left-[37%]
              top-[4%]
              grid
              grid-cols-5
              gap-[10px]
              opacity-50
            "
          >
            {Array.from({ length: 20 }).map((_, index) => (
              <span
                key={index}
                className="
                  h-[4px]
                  w-[4px]
                  rounded-full
                  bg-primary-300
                "
              />
            ))}
          </div>

          {/* =================================================
              BURBUJA PRINCIPAL
          ================================================== */}

          <div
            className="
              absolute
              left-[34%]
              top-[37%]
              z-20
              flex
              h-[150px]
              w-[230px]
              items-center
              justify-center
              rounded-[32px]
              bg-white
              shadow-[0_24px_60px_rgba(15,23,42,0.12)]
            "
          >
            {/* Cola */}
            <div
              aria-hidden="true"
              className="
                absolute
                -bottom-5
                left-10
                h-12
                w-12
                rotate-45
                rounded-br-[12px]
                bg-white
              "
            />

            <div className="relative z-10 flex gap-3">
              <span className="h-4 w-4 rounded-full bg-primary-900" />
              <span className="h-4 w-4 rounded-full bg-primary-900" />
              <span className="h-4 w-4 rounded-full bg-primary-900" />
            </div>
          </div>

          {/* Burbuja azul secundaria */}
          <div
            aria-hidden="true"
            className="
              absolute
              left-[51%]
              top-[47%]
              z-10
              h-[140px]
              w-[190px]
              rounded-[28px]
              bg-primary-100/80
            "
          />

          {/* =================================================
              TELÉFONO
          ================================================== */}

          <div
            className="
              absolute
              right-[22%]
              top-[18%]
              z-30
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-[22px]
              bg-accent-50
              text-accent-700
              shadow-[0_10px_30px_rgba(15,23,42,0.08)]
            "
          >
            <Phone className="h-8 w-8" />
          </div>

          {/* =================================================
              CORREO
          ================================================== */}

          <div
            className="
              absolute
              right-[8%]
              top-[51%]
              z-30
              flex
              h-[76px]
              w-[76px]
              items-center
              justify-center
              rounded-[22px]
              bg-primary-50
              text-primary-700
              shadow-[0_10px_30px_rgba(15,23,42,0.08)]
            "
          >
            <Mail className="h-8 w-8" />
          </div>

          {/* =================================================
              PREGUNTA
          ================================================== */}

          <div
            className="
              absolute
              bottom-[12%]
              right-[16%]
              z-30
              flex
              h-[72px]
              w-[72px]
              items-center
              justify-center
              rounded-[20px]
              bg-white
              text-primary-700
              shadow-[0_10px_30px_rgba(15,23,42,0.08)]
            "
          >
            <HelpCircle className="h-8 w-8" />
          </div>

          {/* =================================================
              MENSAJE PEQUEÑO
          ================================================== */}

          <div
            className="
              absolute
              bottom-[6%]
              left-[16%]
              z-20
              flex
              h-[54px]
              w-[54px]
              items-center
              justify-center
              rounded-2xl
              bg-accent-500
              text-white
              shadow-[0_10px_24px_rgba(122,203,59,0.25)]
            "
          >
            <MessageCircle className="h-6 w-6" />
          </div>

          {/* Puntos de órbita */}
          <span
            aria-hidden="true"
            className="
              absolute
              right-[35%]
              top-[20%]
              h-4
              w-4
              rounded-full
              bg-primary-300
            "
          />

          <span
            aria-hidden="true"
            className="
              bottom-[23%]
              absolute
              left-[29%]
              h-4
              w-4
              rounded-full
              bg-accent-500
            "
          />

          <span
            aria-hidden="true"
            className="
              absolute
              right-[2%]
              top-[38%]
              h-4
              w-4
              rounded-full
              bg-accent-500
            "
          />
        </div>
      </div>
    </section>
  );
}