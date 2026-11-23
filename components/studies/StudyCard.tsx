
'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowRight,
  Check,
  FlaskConical,
  Plus,
} from 'lucide-react';

import type { Study } from '@/types/study';

type StudyCardProps = {
  study: Study;
  onViewDetails: (study: Study) => void;
  onAdd: (study: Study) => void;
  isAdded: boolean;
};

export default function StudyCard({
  study,
  onViewDetails,
  onAdd,
  isAdded,
}: StudyCardProps) {
  const t = useTranslations('StudyCard');
  const locale = useLocale();

  /* ============================================================
     FORMATO DEL PRECIO
  ============================================================ */

  const numericPrice = Number(study.price);

  const formattedPrice =
    study.price !== null &&
    study.price.trim() !== '' &&
    Number.isFinite(numericPrice) &&
    numericPrice >= 0
      ? new Intl.NumberFormat(
          locale === 'en' ? 'en-US' : 'es-MX',
          {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
          }
        ).format(numericPrice)
      : null;

  return (
    <article className="group relative flex h-full min-h-[225px] flex-col overflow-hidden rounded-[22px] border border-slate-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-primary-100 hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)] sm:min-h-[260px]">
      {/* Barra decorativa */}
      <div className="absolute inset-y-0 left-0 w-[5px] bg-accent-500" />

      <div
        aria-hidden="true"
        className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary-50/80 transition-transform duration-500 group-hover:scale-110"
      />

      <div className="relative flex h-full flex-1 flex-col p-4 pl-5 sm:p-6 sm:pl-7">
        {/* CATEGORÍA E ICONO */}

        <div className="flex items-start justify-between gap-3">
          {study.category ? (
            <p className="min-w-0 break-words text-[10px] font-bold uppercase tracking-[0.13em] text-primary-600 sm:text-[11px] sm:tracking-[0.15em]">
              {study.category}
            </p>
          ) : (
            <span />
          )}

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 sm:h-10 sm:w-10">
            <FlaskConical className="h-[18px] w-[18px]" />
          </div>
        </div>

        {/* NOMBRE DEL ESTUDIO */}

        <h3 className="mt-3 break-words font-display text-lg font-bold leading-snug text-primary-950 sm:mt-5 sm:text-xl">
          {study.name}
        </h3>

        {/* PRECIO Y ACCIONES */}

        <div className="mt-auto pt-4 sm:pt-6">
          <div className="border-t border-slate-100 pt-3 sm:pt-4">
            <p className="text-xs font-medium text-slate-400">
              {t('publicPrice')}
            </p>

            {formattedPrice ? (
              <div className="mt-1 flex items-end gap-1.5">
                <p className="font-display text-2xl font-bold tracking-tight text-primary-950">
                  {formattedPrice}
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
                onClick={() => onViewDetails(study)}
                className="inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl bg-primary-50 px-2 py-2.5 text-xs font-bold text-primary-800 transition-all hover:bg-primary-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 sm:gap-2 sm:text-sm"
              >
                {t('viewDetails')}

                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>

              <button
                type="button"
                disabled={isAdded}
                onClick={() => onAdd(study)}
                aria-label={
                  isAdded
                    ? t('addedAriaLabel', {
                        name: study.name,
                      })
                    : t('addAriaLabel', {
                        name: study.name,
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
