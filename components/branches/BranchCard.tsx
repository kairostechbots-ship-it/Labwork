
"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import {
  CalendarDays,
  Clock3,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react";

import BranchMap from "./BranchMap";

import type { Branch } from "@/types/branch";

type BranchCardProps = {
  branch: Branch;
};

/*
|--------------------------------------------------------------------------
| TRADUCCIÓN DE HORARIOS
|--------------------------------------------------------------------------
| Conserva el horario original de la base de datos.
| Solo traduce los nombres de los días para mostrarlos en inglés.
|--------------------------------------------------------------------------
*/

function translateBusinessHours(
  schedule: string,
  locale: string
): string {
  if (locale !== "en") {
    return schedule;
  }

  const translations: Array<[RegExp, string]> = [
    [/\blunes\b/gi, "Monday"],
    [/\bmartes\b/gi, "Tuesday"],
    [/\bmiércoles\b/gi, "Wednesday"],
    [/\bmiercoles\b/gi, "Wednesday"],
    [/\bjueves\b/gi, "Thursday"],
    [/\bviernes\b/gi, "Friday"],
    [/\bsábado\b/gi, "Saturday"],
    [/\bsabado\b/gi, "Saturday"],
    [/\bdomingo\b/gi, "Sunday"],
    [/\bcerrado\b/gi, "Closed"],
    [/\babierto\b/gi, "Open"],
    [/\ba\b/gi, "to"],
  ];

  let translated = schedule;

  for (const [pattern, replacement] of translations) {
    translated = translated.replace(pattern, replacement);
  }

  return translated;
}

export default function BranchCard({
  branch,
}: BranchCardProps) {
  const t = useTranslations("BranchCard");
  const locale = useLocale();

  /*
  |--------------------------------------------------------------------------
  | WHATSAPP
  |--------------------------------------------------------------------------
  */

  const whatsappUrl = branch.whatsapp
    ? `https://wa.me/${branch.whatsapp.replace(/\D/g, "")}`
    : null;

  /*
  |--------------------------------------------------------------------------
  | TELÉFONO
  |--------------------------------------------------------------------------
  */

  const phoneUrl = branch.phone
    ? `tel:${branch.phone.replace(/[^\d+]/g, "")}`
    : null;

  /*
  |--------------------------------------------------------------------------
  | FORMATO VISUAL DEL TELÉFONO
  |--------------------------------------------------------------------------
  */

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");

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
  */

  const businessHours = branch.businessHours
    ? branch.businessHours
        .split("|")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return (
    <article
      id={branch.slug}
      className="scroll-mt-28 overflow-hidden rounded-[26px] border border-slate-100 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]"
    >
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        {/* INFORMACIÓN */}
        <div className="flex flex-col p-6 sm:p-7 lg:p-8">
          {/* ENCABEZADO */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-600">
              {t("branch")}
            </p>

            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-primary-950 sm:text-3xl">
              {branch.name}
            </h2>
          </div>

          {/* DATOS */}
          <div className="mt-6 space-y-5">
            {/* DIRECCIÓN */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <MapPin className="h-[18px] w-[18px]" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                  {t("address")}
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
                    {t("hours")}
                  </p>

                  <div className="mt-1.5 space-y-1">
                    {businessHours.map((schedule, index) => (
                      <p
                        key={`${schedule}-${index}`}
                        className="text-sm leading-5 text-slate-600"
                      >
                        {translateBusinessHours(schedule, locale)}
                      </p>
                    ))}
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
                    {t("phone")}
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

          {/* ACCIONES */}
          <div className="mt-7">
            <div className="flex flex-wrap items-center gap-3">
              {/* AGENDAR CITA */}
              <Link
                href={`/agendar?branch=${branch.slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-bold text-white shadow-[0_7px_18px_rgba(122,203,59,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-600"
              >
                <CalendarDays className="h-4 w-4" />
                {t("bookAppointment")}
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

              {t("directions")}

              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </div>

        {/* MAPA */}
        <BranchMap
          name={branch.name}
          address={branch.address}
        />
      </div>
    </article>
  );
}
