import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowUpRight,
  CalendarDays,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';

const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Estudios', href: '/estudios' },
  { name: 'Sucursales', href: '/sucursales' },
  { name: 'Nosotros', href: '/nosotros' },
  { name: 'Contacto', href: '/contacto' },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-primary-900">
      {/* =====================================================
          DECORACIÓN
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          -right-40
          -top-40
          h-[420px]
          w-[420px]
          rounded-full
          bg-primary-800/30
          blur-3xl
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute
          -bottom-40
          -left-40
          h-[320px]
          w-[320px]
          rounded-full
          bg-accent-500/[0.04]
          blur-3xl
        "
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =====================================================
            PARTE PRINCIPAL
        ====================================================== */}

        <div
          className="
            grid
            gap-12
            py-14
            md:grid-cols-2
            lg:grid-cols-[1.4fr_0.75fr_1.15fr]
            lg:gap-16
            lg:py-16
          "
        >
          {/* =================================================
              MARCA
          ================================================== */}

          <div>
            <Link
              href="/"
              className="inline-flex"
              aria-label="Ir al inicio de Lab-Work"
            >
              <Image
                src="/images/labwork-logo-white.png"
                alt="Lab-Work Análisis Clínicos"
                width={250}
                height={80}
                className="h-auto w-[190px]"
              />
            </Link>

            <p
              className="
                mt-5
                max-w-[400px]
                text-sm
                leading-7
                text-white/55
              "
            >
              Consulta nuestros estudios, conoce nuestras sucursales
              y agenda tu cita con Lab-Work.
            </p>

            <Link
              href="/agendar"
              className="
                group
                mt-7
                inline-flex
                items-center
                gap-2
                text-sm
                font-bold
                text-accent-400
                transition-colors
                hover:text-accent-300
              "
            >
              <CalendarDays className="h-4 w-4" />

              Agendar una cita

              <ArrowUpRight
                className="
                  h-4
                  w-4
                  transition-transform
                  duration-200
                  group-hover:-translate-y-0.5
                  group-hover:translate-x-0.5
                "
              />
            </Link>
          </div>

          {/* =================================================
              NAVEGACIÓN
          ================================================== */}

          <div>
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.16em]
                text-white
              "
            >
              Navegación
            </p>

            <nav
              className="mt-5 flex flex-col gap-3"
              aria-label="Navegación del pie de página"
            >
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="
                    w-fit
                    text-sm
                    text-white/55
                    transition-colors
                    duration-200
                    hover:text-white
                  "
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* =================================================
              CONTACTO
          ================================================== */}

          <div>
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.16em]
                text-white
              "
            >
              Contacto
            </p>

            <div className="mt-5 space-y-5">
              {/* WHATSAPP */}

              <a
                href="https://wa.me/523310175474"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4"
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-white/[0.06]
                    text-accent-400
                    transition-colors
                    group-hover:bg-white/[0.10]
                  "
                >
                  <MessageCircle className="h-[18px] w-[18px]" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white/85">
                    WhatsApp
                  </p>

                  <p className="mt-0.5 text-xs text-white/40">
                    33 1017 5474
                  </p>
                </div>

                <ArrowUpRight
                  className="
                    ml-auto
                    h-4
                    w-4
                    shrink-0
                    text-white/25
                    transition-all
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                    group-hover:text-accent-400
                  "
                />
              </a>

              <div className="h-px bg-white/[0.07]" />

              {/* CORREO */}

              <a
                href="mailto:recepcionlabwork17@gmail.com"
                className="group flex items-center gap-4"
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-white/[0.06]
                    text-accent-400
                    transition-colors
                    group-hover:bg-white/[0.10]
                  "
                >
                  <Mail className="h-[18px] w-[18px]" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white/85">
                    Correo
                  </p>

                  <p
                    className="
                      mt-0.5
                      break-all
                      text-xs
                      text-white/40
                    "
                  >
                    recepcionlabwork17@gmail.com
                  </p>
                </div>

                <ArrowUpRight
                  className="
                    ml-auto
                    h-4
                    w-4
                    shrink-0
                    text-white/25
                    transition-all
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                    group-hover:text-accent-400
                  "
                />
              </a>

              <div className="h-px bg-white/[0.07]" />

              {/* TELÉFONOS DE SUCURSALES */}

              <Link
                href="/sucursales"
                className="group flex items-center gap-4"
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-white/[0.06]
                    text-accent-400
                    transition-colors
                    group-hover:bg-white/[0.10]
                  "
                >
                  <Phone className="h-[18px] w-[18px]" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white/85">
                    Llamar a una sucursal
                  </p>

                  <p className="mt-0.5 text-xs text-white/40">
                    Consulta teléfonos y ubicaciones
                  </p>
                </div>

                <ArrowUpRight
                  className="
                    ml-auto
                    h-4
                    w-4
                    shrink-0
                    text-white/25
                    transition-all
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                    group-hover:text-accent-400
                  "
                />
              </Link>
            </div>

            {/* ACCESO A CONTACTO */}

            <Link
              href="/contacto"
              className="
                group
                mt-6
                inline-flex
                items-center
                gap-2
                text-xs
                font-semibold
                text-white/50
                transition-colors
                hover:text-white
              "
            >
              <MapPin className="h-3.5 w-3.5 text-accent-400" />

              Ver todas las opciones de contacto

              <ArrowUpRight
                className="
                  h-3.5
                  w-3.5
                  transition-transform
                  group-hover:-translate-y-0.5
                  group-hover:translate-x-0.5
                "
              />
            </Link>
          </div>
        </div>

        {/* =====================================================
            PARTE INFERIOR
        ====================================================== */}

        <div
          className="
            flex
            flex-col
            gap-4
            border-t
            border-white/[0.08]
            py-6
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p className="text-xs text-white/35 sm:text-sm">
            © {new Date().getFullYear()} Lab-Work Análisis Clínicos.
            Todos los derechos reservados.
          </p>

          <Link
            href="/aviso-privacidad"
            className="
              w-fit
              text-xs
              text-white/35
              transition-colors
              hover:text-white/70
              sm:text-sm
            "
          >
            Aviso de privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}