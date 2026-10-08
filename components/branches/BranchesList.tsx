'use client';

import { useEffect, useState } from 'react';

import BranchCard from './BranchCard';
import BranchesEmpty from './BranchesEmpty';

import type {
  Branch,
  BranchesResponse,
} from '@/types/branch';

export default function BranchesList() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | OBTENER SUCURSALES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const getBranches = async () => {
      try {
        setHasError(false);

        const response = await fetch('/api/branches');

        if (!response.ok) {
          throw new Error(
            'No fue posible obtener las sucursales.'
          );
        }

        const result: BranchesResponse =
          await response.json();

        const activeBranches = (
          result.data ?? []
        ).filter((branch) => branch.isActive);

        setBranches(activeBranches);
      } catch (error) {
        console.error(
          'Error al cargar sucursales:',
          error
        );

        setHasError(true);
      } finally {
        setLoading(false);
      }
    };

    getBranches();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | SCROLL A SUCURSAL
  |--------------------------------------------------------------------------
  | Ejemplo:
  |
  | /sucursales#ajijic
  |
  | Como las sucursales se obtienen desde la API, esperamos a que terminen
  | de cargarse antes de buscar el elemento correspondiente.
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      loading ||
      hasError ||
      branches.length === 0
    ) {
      return;
    }

    const hash = window.location.hash;

    if (!hash) {
      return;
    }

    const branchSlug = decodeURIComponent(
      hash.replace('#', '')
    );

    /*
     * Esperamos brevemente para asegurarnos de que React
     * ya haya renderizado los BranchCard en el DOM.
     */
    const timer = window.setTimeout(() => {
      const element =
        document.getElementById(branchSlug);

      if (!element) {
        return;
      }

      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loading, hasError, branches]);

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ================================================================
            LOADING
        ================================================================= */}

        {loading && (
          <div className="space-y-8">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-[430px] animate-pulse rounded-[30px] bg-slate-100"
              />
            ))}
          </div>
        )}

        {/* ================================================================
            ERROR
        ================================================================= */}

        {!loading && hasError && (
          <div className="rounded-[28px] border border-red-100 bg-red-50 px-6 py-12 text-center">
            <h2 className="font-display text-xl font-bold text-slate-900">
              No pudimos cargar las sucursales
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Intenta nuevamente en unos momentos.
            </p>
          </div>
        )}

        {/* ================================================================
            VACÍO
        ================================================================= */}

        {!loading &&
          !hasError &&
          branches.length === 0 && (
            <BranchesEmpty />
          )}

        {/* ================================================================
            RESULTADOS
        ================================================================= */}

        {!loading &&
          !hasError &&
          branches.length > 0 && (
            <>
              {/* CONTADOR */}

              <div className="mb-8 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {branches.length}{' '}
                  {branches.length === 1
                    ? 'sucursal disponible'
                    : 'sucursales disponibles'}
                </p>

                <div className="flex items-center gap-2">
                  <span className="h-1 w-8 rounded-full bg-accent-500" />
                  <span className="h-1 w-3 rounded-full bg-primary-200" />
                </div>
              </div>

              {/* SUCURSALES */}

              <div className="space-y-8">
                {branches.map((branch) => (
                  <BranchCard
                    key={branch.id}
                    branch={branch}
                  />
                ))}
              </div>
            </>
          )}
      </div>
    </section>
  );
}