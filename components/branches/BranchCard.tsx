import Link from 'next/link';

import {
  CalendarDays,
  Clock3,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from 'lucide-react';

import BranchMap from './BranchMap';

import type { Branch } from '@/types/branch';

type BranchCardProps = {
  branch: Branch;
};

export default function BranchCard({
  branch,
}: BranchCardProps) {
  /*
  |--------------------------------------------------------------------------
  | WHATSAPP
  |--------------------------------------------------------------------------
  */

  const whatsappUrl = branch.whatsapp
    ? `https://wa.me/${branch.whatsapp.replace(/\D/g, '')}`
    : null;

  /*
  |--------------------------------------------------------------------------
  | TELÉFONO
  |--------------------------------------------------------------------------
  */

  const phoneUrl = branch.phone
    ? `tel:${branch.phone.replace(/[^\d+]/g, '')}`
    : null;

  /*
  |--------------------------------------------------------------------------
  | FORMATO VISUAL DEL TELÉFONO
  |--------------------------------------------------------------------------
  | BD:
  | 3761151602
  |
  | Vista:
  | 376 115 1602
  |--------------------------------------------------------------------------
  */

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');

    if (digits.length === 10) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }

    return phone;
  };

  /*
  |--------------------------------------------------------------------------
  | GOOGLE MAPS
  |--------------------------------------------------------------------------
  */

  const directionsUrl =
    branch.mapUrl ||
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      branch.address
    )}`;

  /*
  |--------------------------------------------------------------------------
  | HORARIO
  |--------------------------------------------------------------------------
  | En la BD:
  |
  | Lunes a viernes... | Sábado... | Domingo cerrado
  |
  | Aquí separamos cada horario para mostrarlo en líneas.
  |--------------------------------------------------------------------------
  */

  const businessHours = branch.businessHours
    ? branch.businessHours
        .split('|')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return (
    <article
      id={branch.slug}
      className="scroll-mt-28 overflow-hidden rounded-[26px] border border-slate-100 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]"
    >
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        {/* ================================================================
            INFORMACIÓN
        ================================================================= */}

        <div className="flex flex-col p-6 sm:p-7 lg:p-8">
          {/* ENCABEZADO */}

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-600">
              Sucursal
            </p>

            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-primary-950 sm:text-3xl">
              {branch.name}
            </h2>
          </div>

          {/* ================================================================
              DATOS
          ================================================================= */}

          <div className="mt-6 space-y-5">
            {/* DIRECCIÓN */}

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <MapPin className="h-[18px] w-[18px]" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                  Dirección
                </p>

                <p className="mt-1 max-w-md text-sm leading-6 text-slate-600">
                  {branch.address}
                </p>
              </div>
            </div>

            {/* HORARIO */}

            {businessHours.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Clock3 className="h-[18px] w-[18px]" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                    Horario
                  </p>

                  <div className="mt-1.5 space-y-1">
                    {businessHours.map(
                      (schedule, index) => (
                        <p
                          key={`${schedule}-${index}`}
                          className="text-sm leading-5 text-slate-600"
                        >
                          {schedule}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TELÉFONO */}

            {branch.phone && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Phone className="h-[18px] w-[18px]" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                    Teléfono
                  </p>

                  {phoneUrl ? (
                    <a
                      href={phoneUrl}
                      className="mt-1 inline-block text-sm font-semibold text-primary-900 transition-colors hover:text-accent-600"
                    >
                      {formatPhone(branch.phone)}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-primary-900">
                      {formatPhone(branch.phone)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ================================================================
              ACCIONES
          ================================================================= */}

          <div className="mt-7">
            <div className="flex flex-wrap items-center gap-3">
              {/* AGENDAR CITA */}

              <Link
                href={`/agendar?branch=${branch.slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-bold text-white shadow-[0_7px_18px_rgba(122,203,59,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-600"
              >
                <CalendarDays className="h-4 w-4" />

                Agendar cita
              </Link>

              {/* WHATSAPP */}

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-primary-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-300 hover:bg-accent-50"
                >
                  <MessageCircle className="h-4 w-4 text-accent-600" />

                  WhatsApp
                </a>
              )}
            </div>

            {/* CÓMO LLEGAR */}

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary-800 transition-colors hover:text-accent-600"
            >
              <Navigation className="h-4 w-4" />

              Cómo llegar

              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </div>

        {/* ================================================================
            MAPA
        ================================================================= */}

        <BranchMap
          name={branch.name}
          address={branch.address}
        />
      </div>
    </article>
  );
}