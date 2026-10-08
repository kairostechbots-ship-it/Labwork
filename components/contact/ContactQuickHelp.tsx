import Link from 'next/link';

import {
  ArrowRight,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';

export default function ContactQuickHelp() {
  return (
    <aside
      className="
        relative
        h-full
        overflow-hidden
        rounded-[24px]
        bg-primary-900
        p-7
        text-white
        shadow-[0_18px_45px_rgba(11,55,109,0.14)]
        sm:p-8
      "
    >
      {/* Decoración */}

      <div
        aria-hidden="true"
        className="
          absolute
          -right-20
          -top-20
          h-56
          w-56
          rounded-full
          bg-primary-700/60
          blur-3xl
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute
          -bottom-20
          -left-16
          h-52
          w-52
          rounded-full
          bg-accent-500/10
          blur-3xl
        "
      />

      <div className="relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent-400">
          Otras opciones
        </p>

        <h3 className="mt-3 max-w-sm font-display text-2xl font-bold leading-tight">
          ¿Prefieres comunicarte directamente?
        </h3>

        <p className="mt-3 text-sm leading-6 text-primary-100/75">
          También puedes escribirnos por WhatsApp, enviarnos un
          correo o comunicarte directamente con una de nuestras
          sucursales.
        </p>

        {/* Opciones */}

        <div className="mt-7 space-y-3">

          {/* WhatsApp */}

          <a
            href="https://wa.me/523310175474"
            target="_blank"
            rel="noopener noreferrer"
            className="
              group
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-white/10
              bg-white/5
              p-3
              transition-all
              hover:border-accent-400/40
              hover:bg-white/10
            "
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
                bg-accent-500
                text-primary-950
              "
            >
              <MessageCircle className="h-[18px] w-[18px]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold">
                WhatsApp
              </p>

              <p className="mt-0.5 text-[11px] text-primary-100/65">
                33 1017 5474
              </p>
            </div>

            <ArrowRight className="h-4 w-4 text-primary-200 transition-transform group-hover:translate-x-1" />
          </a>

          {/* Correo */}

          <a
            href="mailto:recepcionlabwork17@gmail.com"
            className="
              group
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-white/10
              bg-white/5
              p-3
              transition-all
              hover:bg-white/10
            "
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
                bg-white/10
                text-white
              "
            >
              <Mail className="h-[18px] w-[18px]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold">
                Correo electrónico
              </p>

              <p className="mt-0.5 truncate text-[11px] text-primary-100/65">
                recepcionlabwork17@gmail.com
              </p>
            </div>

            <ArrowRight className="h-4 w-4 text-primary-200 transition-transform group-hover:translate-x-1" />
          </a>

          {/* Llamadas */}

          <Link
            href="/sucursales"
            className="
              group
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-white/10
              bg-white/5
              p-3
              transition-all
              hover:bg-white/10
            "
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
                bg-white/10
                text-white
              "
            >
              <Phone className="h-[18px] w-[18px]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold">
                Llamar a una sucursal
              </p>

              <p className="mt-0.5 text-[11px] text-primary-100/65">
                Consulta los teléfonos disponibles
              </p>
            </div>

            <ArrowRight className="h-4 w-4 text-primary-200 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Acceso sucursales */}

        <div className="mt-7 border-t border-white/10 pt-5">
          <Link
            href="/sucursales"
            className="
              group
              inline-flex
              items-center
              gap-2
              text-xs
              font-bold
              text-accent-400
            "
          >
            <MapPin className="h-4 w-4" />

            Ver todas las sucursales

            <ArrowRight
              className="
                h-3.5
                w-3.5
                transition-transform
                group-hover:translate-x-1
              "
            />
          </Link>
        </div>
      </div>
    </aside>
  );
}