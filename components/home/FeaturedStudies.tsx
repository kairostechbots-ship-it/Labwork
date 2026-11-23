
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import {
  ArrowRight,
  FlaskConical,
} from 'lucide-react';

import type {
  StudiesResponse,
  Study,
} from '@/types/study';

export default function FeaturedStudies() {
  const t = useTranslations('FeaturedStudies');
  const locale = useLocale();

  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadStudies = async () => {
      try {
        setLoading(true);

        const response = await fetch('/api/services', {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            'No fue posible obtener los estudios.'
          );
        }

        const result: StudiesResponse =
          await response.json();

        const activeStudies = (
          result.data ?? []
        ).filter((study) => study.isActive);

        /*
         * Por ahora mostramos 3 estudios activos.
         * Más adelante podemos utilizar isFeatured
         * para seleccionarlos desde administración.
         */
        setStudies(activeStudies.slice(0, 3));
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === 'AbortError'
        ) {
          return;
        }

        console.error(
          'Error al cargar estudios en inicio:',
          error
        );

        setStudies([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadStudies();

    return () => {
      controller.abort();
    };
  }, []);

  if (!loading && studies.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-white py-14 sm:py-16">
      {/* Decoración derecha */}
      <div
        aria-hidden="true"
        className="absolute -right-40 top-0 h-[320px] w-[320px] rounded-full bg-primary-50/40 blur-3xl"
      />

      {/* Decoración izquierda */}
      <div
        aria-hidden="true"
        className="absolute -left-40 bottom-0 h-[260px] w-[260px] rounded-full bg-accent-50/40 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ============================================================
            ENCABEZADO
        ============================================================= */}

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-600">
              {t('eyebrow')}
            </p>

            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary-950 sm:text-[34px] sm:leading-[1.12]">
              {t('title')}{' '}
              <span className="text-accent-500">
                {t('highlight')}
              </span>
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
              {t('description')}
            </p>
          </div>

          <Link
            href="/estudios"
            className="group inline-flex shrink-0 items-center gap-2 pb-1 text-sm font-bold text-primary-800 transition-colors hover:text-accent-600"
          >
            {t('viewAll')}

            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* ============================================================
            LOADING
        ============================================================= */}

        {loading && (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[190px] animate-pulse rounded-[22px] border border-slate-100 bg-slate-50"
              />
            ))}
          </div>
        )}

        {/* ============================================================
            ESTUDIOS
        ============================================================= */}

        {!loading && studies.length > 0 && (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {studies.map((study) => {
              const numericPrice = Number(study.price);

              const formattedPrice =
                study.price != null &&
                study.price !== '' &&
                Number.isFinite(numericPrice)
                  ? new Intl.NumberFormat(
                      locale === 'en' ? 'en-MX' : 'es-MX',
                      {
                        style: 'currency',
                        currency: 'MXN',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }
                    ).format(numericPrice)
                  : null;

              return (
                <Link
                  key={study.id}
                  href={`/estudios?buscar=${encodeURIComponent(
                    study.name
                  )}`}
                  className="group relative flex min-h-[190px] flex-col overflow-hidden rounded-[22px] border border-slate-100 bg-white p-5 pl-6 shadow-[0_8px_28px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-primary-100 hover:shadow-[0_16px_38px_rgba(15,23,42,0.08)]"
                >
                  {/* Línea lateral */}
                  <div className="absolute inset-y-0 left-0 w-[4px] bg-accent-500" />

                  {/* Decoración */}
                  <div
                    aria-hidden="true"
                    className="absolute -right-9 -top-9 h-24 w-24 rounded-full bg-primary-50/80 transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Categoría + icono */}
                  <div className="relative flex items-start justify-between gap-4">
                    {study.category ? (
                      <p className="pt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-primary-600">
                        {study.category}
                      </p>
                    ) : (
                      <span />
                    )}

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                      <FlaskConical className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Nombre */}
                  <h3 className="relative mt-4 max-w-[88%] font-display text-[17px] font-bold leading-snug text-primary-950">
                    {study.name}
                  </h3>

                  {/* Footer */}
                  <div className="relative mt-auto flex items-end justify-between gap-4 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-[10px] font-medium text-slate-400">
                        {t('publicPrice')}
                      </p>

                      {formattedPrice ? (
                        <div className="mt-0.5 flex items-end gap-1">
                          <p className="font-display text-xl font-bold text-primary-950">
                            {formattedPrice}
                          </p>

                          <span className="mb-0.5 text-[9px] font-bold text-slate-400">
                            MXN
                          </span>
                        </div>
                      ) : (
                        <p className="mt-1 text-xs font-bold text-primary-800">
                          {t('askPrice')}
                        </p>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-primary-50 px-3.5 py-2 text-xs font-bold text-primary-700 transition-all group-hover:bg-primary-900 group-hover:text-white">
                      {t('details')}

                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
