'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import {
  ArrowRight,
  Package,
} from 'lucide-react';

import type {
  PackagesResponse,
  StudyPackage,
} from '@/types/study';

export default function FeaturedPackages() {
  const [packages, setPackages] = useState<StudyPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        setLoading(true);

        const response = await fetch('/api/packages');

        if (!response.ok) {
          throw new Error(
            'No fue posible obtener los paquetes.'
          );
        }

        const result: PackagesResponse =
          await response.json();

        const activePackages = (
          result.data ?? []
        ).filter((item) => item.isActive);

        /*
         * Por ahora mostramos únicamente 3 paquetes.
         * Después podemos agregar isFeatured para que
         * se seleccionen desde administración.
         */
        setPackages(activePackages.slice(0, 3));
      } catch (error) {
        console.error(
          'Error al cargar paquetes en inicio:',
          error
        );

        setPackages([]);
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, []);

  if (!loading && packages.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-accent-50/50 py-14 sm:py-16">
      {/* Decoración */}
      <div
        aria-hidden="true"
        className="absolute -left-32 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-white/80 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -right-32 top-0 h-72 w-72 rounded-full bg-accent-100/60 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_2fr] lg:items-center">
          {/* ============================================================
              INFORMACIÓN
          ============================================================= */}

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">
              Paquetes
            </p>

            <h2 className="mt-2 max-w-sm font-display text-3xl font-bold leading-tight tracking-tight text-primary-950 sm:text-[34px]">
              Conoce nuestros{' '}
              <span className="text-accent-500">
                paquetes
              </span>
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500 sm:text-base">
              Consulta las opciones disponibles y encuentra
              la que mejor se adapte a lo que necesitas.
            </p>

            <Link
              href="/estudios"
              className="group mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary-800 transition-colors hover:text-accent-600"
            >
              Ver todos los paquetes

              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* ============================================================
              LOADING
          ============================================================= */}

          {loading && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-[220px] animate-pulse rounded-[22px] bg-white/80"
                />
              ))}
            </div>
          )}

          {/* ============================================================
              PAQUETES
          ============================================================= */}

          {!loading && packages.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {packages.map((item) => {
                const numericPrice = Number(item.price);

                const formattedPrice =
                  item.price &&
                  !Number.isNaN(numericPrice)
                    ? new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(numericPrice)
                    : null;

                return (
                  <Link
                    key={item.id}
                    href="/estudios"
                    className="group relative flex min-h-[220px] flex-col overflow-hidden rounded-[22px] border border-accent-100 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-accent-300 hover:shadow-[0_16px_38px_rgba(15,23,42,0.08)]"
                  >
                    {/* Decoración */}
                    <div
                      aria-hidden="true"
                      className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent-50 transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Tipo */}
                    <div className="relative flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
                        <Package className="h-4 w-4" />
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent-700">
                        Paquete
                      </span>
                    </div>

                    {/* Nombre */}
                    <h3 className="relative mt-4 font-display text-[17px] font-bold leading-snug text-primary-950">
                      {item.name}
                    </h3>

                    {/* Descripción solo si existe */}
                    {item.description && (
                      <p className="relative mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                        {item.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="relative mt-auto flex items-end justify-between gap-3 border-t border-accent-100 pt-4">
                      <div>
                        <p className="text-[10px] font-medium text-slate-400">
                          Precio público
                        </p>

                        {formattedPrice ? (
                          <p className="mt-0.5 font-display text-xl font-bold text-primary-950">
                            {formattedPrice}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs font-bold text-primary-800">
                            Consultar precio
                          </p>
                        )}
                      </div>

                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-accent-50 px-3 py-2 text-xs font-bold text-accent-800 transition-all group-hover:bg-accent-600 group-hover:text-white">
                        Ver paquete

                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}