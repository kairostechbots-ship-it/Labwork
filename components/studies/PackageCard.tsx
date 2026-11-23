
'use client';

import { useLocale, useTranslations } from 'next-intl';

import {
  ArrowRight,
  Check,
  Package,
  Plus,
} from 'lucide-react';

import type { StudyPackage } from '@/types/study';

type PackageCardProps = {
  studyPackage: StudyPackage;
  onViewDetails: (studyPackage: StudyPackage) => void;
  onAdd: (studyPackage: StudyPackage) => void;
  isAdded: boolean;
};

export default function PackageCard({
  studyPackage,
  onViewDetails,
  onAdd,
  isAdded,
}: PackageCardProps) {
  const t = useTranslations('PackageCard');
  const locale = useLocale();

  /* ============================================================
     FORMATO DEL PRECIO
  ============================================================ */

  const numericPrice = Number(studyPackage.price);

  const formattedPrice =
    studyPackage.price !== null &&
    studyPackage.price.trim() !== '' &&
    Number.isFinite(numericPrice) &&
    numericPrice >= 0
      ? new Intl.NumberFormat(
          locale === 'en' ? 'en-US' : 'es-MX',
          {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }
        ).format(numericPrice)
      : null;

  return (
    <article className="group relative flex h-full min-h-[225px] flex-col overflow-hidden rounded-[24px] border border-accent-100 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-accent-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)] sm:min-h-[260px] sm:p-6">
      {/* Barra decorativa izquierda */}
      <div className="absolute inset-y-0 left-0 w-[5px] bg-accent-500" />

      {/* Círculo decorativo */}
      <div
        aria-hidden="true"
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent-50 transition-transform duration-500 group-hover:scale-110"
      />

      <div className="relative flex h-full flex-1 flex-col pl-1">
        {/* ETIQUETA E ICONO */}

        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-lg bg-accent-50 px-3 py-2 text-accent-700">
            <Package className="h-4 w-4" />

            <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
              {t('packageLabel')}
            </span>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-700 sm:h-10 sm:w-10">
            <Package className="h-[18px] w-[18px]" />
          </div>
        </div>

        {/* NOMBRE DEL PAQUETE */}

        <h3 className="mt-3 break-words font-display text-lg font-bold leading-snug text-primary-950 sm:mt-5 sm:text-xl">
          {studyPackage.name}
        </h3>

        {/* DESCRIPCIÓN */}

        {studyPackage.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500 sm:mt-3 sm:leading-6">
            {studyPackage.description}
          </p>
        )}

        {/* PRECIO Y ACCIONES */}

        <div className="mt-auto pt-4 sm:pt-6">
          <div className="border-t border-slate-100 pt-3 sm:pt-4">
            <p className="text-xs font-medium text-slate-400">
              {t('publicPrice')}
            </p>

            {formattedPrice !== null ? (
              <div className="mt-1 flex items-end gap-1.5">
                <p className="font-display text-2xl font-bold tracking-tight text-primary-950">
                  ${formattedPrice}
                </p>

                <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  MXN
                </span>
              </div>
            ) : (
              <p className="mt-1 text-sm font-bold text-primary-800">
                {t('askPrice')}
              </p>
            )}

            {/* BOTONES */}

            <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4">
              <button
                type="button"
                onClick={() => onViewDetails(studyPackage)}
                className="inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl bg-accent-50 px-2 py-2.5 text-xs font-bold text-accent-800 transition-all hover:bg-accent-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 sm:gap-2 sm:text-sm"
              >
                {t('viewPackage')}

                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>

              <button
                type="button"
                disabled={isAdded}
                onClick={() => onAdd(studyPackage)}
                aria-label={
                  isAdded
                    ? t('addedAriaLabel', {
                        name: studyPackage.name,
                      })
                    : t('addAriaLabel', {
                        name: studyPackage.name,
                      })
                }
                className={`inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 sm:gap-2 sm:text-sm ${
                  isAdded
                    ? 'cursor-default bg-accent-50 text-accent-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-accent-50 hover:text-accent-700'
                }`}
              >
                {isAdded ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : (
                  <Plus className="h-4 w-4 shrink-0" />
                )}

                {isAdded ? t('added') : t('add')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
