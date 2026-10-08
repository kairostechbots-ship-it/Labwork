import Link from 'next/link';

import {
  ArrowRight,
  Mail,
  MapPin,
  MessageCircle,
} from 'lucide-react';

export default function ContactCards() {
  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ====================================================
            ENCABEZADO
        ===================================================== */}

        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent-600">
            Contacto directo
          </p>

          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-primary-950 sm:text-[28px]">
            Elige cómo comunicarte con nosotros
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Estamos disponibles para orientarte y resolver tus dudas.
          </p>
        </div>

        {/* ====================================================
            TARJETAS
        ===================================================== */}

        <div className="grid gap-4 md:grid-cols-3">

          {/* ==================================================
              WHATSAPP
          =================================================== */}

          <a
            href="https://wa.me/523310175474"
            target="_blank"
            rel="noopener noreferrer"
            className="
              group
              relative
              overflow-hidden
              rounded-[20px]
              border
              border-slate-200
              bg-white
              p-5
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-accent-200
              hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)]
            "
          >
            <div
              aria-hidden="true"
              className="
                absolute
                -right-8
                -top-8
                h-24
                w-24
                rounded-full
                bg-accent-50
                transition-transform
                duration-300
                group-hover:scale-125
              "
            />

            <div className="relative z-10">
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-accent-50
                  text-accent-600
                "
              >
                <MessageCircle className="h-5 w-5" />
              </div>

              <h3 className="mt-4 font-display text-[17px] font-bold text-primary-950">
                WhatsApp
              </h3>

              <p className="mt-1.5 text-[13px] leading-[1.65] text-slate-500">
                Escríbenos por nuestro WhatsApp general para solicitar
                información.
              </p>

              <p className="mt-3 text-sm font-bold text-primary-950">
                33 1017 5474
              </p>

              <div
                className="
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  text-xs
                  font-bold
                  text-accent-600
                "
              >
                Iniciar conversación

                <ArrowRight
                  className="
                    h-3.5
                    w-3.5
                    transition-transform
                    group-hover:translate-x-1
                  "
                />
              </div>
            </div>
          </a>

          {/* ==================================================
              CORREO
          =================================================== */}

          <a
            href="mailto:recepcionlabwork17@gmail.com"
            className="
              group
              relative
              overflow-hidden
              rounded-[20px]
              border
              border-slate-200
              bg-white
              p-5
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-primary-200
              hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)]
            "
          >
            <div
              aria-hidden="true"
              className="
                absolute
                -right-8
                -top-8
                h-24
                w-24
                rounded-full
                bg-primary-50
                transition-transform
                duration-300
                group-hover:scale-125
              "
            />

            <div className="relative z-10">
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
                "
              >
                <Mail className="h-5 w-5" />
              </div>

              <h3 className="mt-4 font-display text-[17px] font-bold text-primary-950">
                Correo electrónico
              </h3>

              <p className="mt-1.5 text-[13px] leading-[1.65] text-slate-500">
                También puedes enviarnos un correo con tus dudas o
                comentarios.
              </p>

              <p className="mt-3 break-all text-sm font-bold text-primary-950">
                recepcionlabwork17@gmail.com
              </p>

              <div
                className="
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  text-xs
                  font-bold
                  text-primary-700
                "
              >
                Enviar correo

                <ArrowRight
                  className="
                    h-3.5
                    w-3.5
                    transition-transform
                    group-hover:translate-x-1
                  "
                />
              </div>
            </div>
          </a>

          {/* ==================================================
              SUCURSALES
          =================================================== */}

          <Link
            href="/sucursales"
            className="
              group
              relative
              overflow-hidden
              rounded-[20px]
              border
              border-slate-200
              bg-white
              p-5
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-primary-200
              hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)]
            "
          >
            <div
              aria-hidden="true"
              className="
                absolute
                -right-8
                -top-8
                h-24
                w-24
                rounded-full
                bg-primary-50
                transition-transform
                duration-300
                group-hover:scale-125
              "
            />

            <div className="relative z-10">
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
                "
              >
                <MapPin className="h-5 w-5" />
              </div>

              <h3 className="mt-4 font-display text-[17px] font-bold text-primary-950">
                Contacta una sucursal
              </h3>

              <p className="mt-1.5 text-[13px] leading-[1.65] text-slate-500">
                Consulta el teléfono de la sucursal con la que deseas
                comunicarte.
              </p>

              <p className="mt-3 text-sm font-bold text-primary-950">
                Ajijic · Chapala · Jocotepec · San Antonio
              </p>

              <div
                className="
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  text-xs
                  font-bold
                  text-primary-700
                "
              >
                Ver sucursales

                <ArrowRight
                  className="
                    h-3.5
                    w-3.5
                    transition-transform
                    group-hover:translate-x-1
                  "
                />
              </div>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
}