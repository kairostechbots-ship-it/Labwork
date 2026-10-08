'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  ArrowRight,
  MapPin,
} from 'lucide-react';

import type {
  Branch,
  BranchesResponse,
} from '@/types/branch';

/* ============================================================
   MAPA DINÁMICO
============================================================ */

const BranchesMap = dynamic(
  () => import('@/components/home/BranchesMap'),
  {
    ssr: false,

    loading: () => (
      <div className="flex h-full items-center justify-center bg-primary-50">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-primary-200 border-t-primary-700" />

          <p className="mt-2 text-xs font-medium text-slate-500">
            Cargando mapa...
          </p>
        </div>
      </div>
    ),
  }
);

/* ============================================================
   COMPONENTE
============================================================ */

export default function BranchesPreview() {
  const [branches, setBranches] = useState<Branch[]>([]);

  const [selectedBranch, setSelectedBranch] =
    useState<Branch | null>(null);

  const [loading, setLoading] = useState(true);

  /* ==========================================================
     OBTENER SUCURSALES
  ========================================================== */

  useEffect(() => {
    const getBranches = async () => {
      try {
        setLoading(true);

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
        ).filter(
          (branch) =>
            branch.isActive &&
            branch.latitude != null &&
            branch.longitude != null
        );

        setBranches(activeBranches);
      } catch (error) {
        console.error(
          'Error al cargar sucursales:',
          error
        );

        setBranches([]);
      } finally {
        setLoading(false);
      }
    };

    getBranches();
  }, []);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <section className="bg-white py-14 sm:py-16">
      {/* ======================================================
          CONTENEDOR
      ======================================================= */}

      <div className="mx-auto max-w-[1420px] px-4 sm:px-6 lg:px-8">
        {/* ====================================================
            CARD PRINCIPAL
        ===================================================== */}

        <div
          className="
            overflow-hidden
            rounded-[30px]
            border
            border-primary-100
            bg-gradient-to-br
            from-primary-50/90
            via-white
            to-accent-50/40
            shadow-[0_18px_50px_rgba(15,23,42,0.06)]
          "
        >
          <div
            className="
              grid
              gap-0

              lg:grid-cols-[260px_minmax(500px,1.45fr)_minmax(360px,0.9fr)]
              lg:items-stretch
            "
          >
            {/* =================================================
                COLUMNA IZQUIERDA
            ================================================== */}

            <div
              className="
                flex
                flex-col
                justify-center
                px-6
                py-9
                sm:px-7
                lg:px-7
                lg:py-8
              "
            >
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.22em]
                  text-accent-600
                "
              >
                Nuestras sucursales
              </p>

              <h2
                className="
                  mt-3
                  font-display
                  text-[30px]
                  font-bold
                  leading-[1.12]
                  tracking-tight
                  text-primary-950
                "
              >
                Encuentra la sucursal{' '}
                <span className="text-accent-500">
                  más conveniente
                </span>{' '}
                para ti
              </h2>

              <p
                className="
                  mt-4
                  max-w-[230px]
                  text-[14px]
                  leading-7
                  text-slate-600
                "
              >
                Consulta nuestras ubicaciones y elige la
                sucursal que mejor se adapte a ti.
              </p>

              <Link
                href="/sucursales"
                className="
                  group
                  mt-6
                  inline-flex
                  w-fit
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-primary-200
                  bg-white
                  px-4
                  py-3
                  text-[12px]
                  font-bold
                  text-primary-900
                  shadow-sm
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-primary-300
                  hover:shadow-md
                "
              >
                Ver todas las sucursales

                <ArrowRight
                  className="
                    h-3.5
                    w-3.5
                    shrink-0
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                  "
                />
              </Link>
            </div>

            {/* =================================================
                MAPA
            ================================================== */}

            <div
              className="
                relative
                isolate
                z-0
                mx-5
                h-[300px]
                overflow-hidden
                rounded-[24px]
                border
                border-white
                shadow-[0_10px_30px_rgba(15,23,42,0.08)]

                sm:mx-7

                lg:mx-0
                lg:my-6
                lg:h-auto
                lg:min-h-[300px]
              "
            >
              {loading ? (
                <div className="flex h-full items-center justify-center bg-primary-50">
                  <div className="text-center">
                    <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-primary-200 border-t-primary-700" />

                    <p className="mt-2 text-xs text-slate-500">
                      Cargando mapa...
                    </p>
                  </div>
                </div>
              ) : branches.length > 0 ? (
                <BranchesMap
                  branches={branches}
                  selectedBranch={selectedBranch}
                  onSelectBranch={setSelectedBranch}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-primary-50">
                  <div className="px-6 text-center">
                    <MapPin className="mx-auto h-6 w-6 text-primary-600" />

                    <p className="mt-2 text-sm font-semibold text-primary-900">
                      No hay sucursales disponibles
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* =================================================
                COLUMNA DERECHA
            ================================================== */}

            <div
              className="
                flex
                flex-col
                justify-center
                px-5
                py-7
                sm:px-6
                lg:px-6
              "
            >
              <div className="space-y-2">
                {branches.map((branch) => {
                  const isSelected =
                    selectedBranch?.id === branch.id;

                  const shortName =
                    branch.name.replace(
                      /^Sucursal\s+/i,
                      ''
                    );

                  return (
                    <div
                      key={branch.id}
                      className={`
                        group
                        flex
                        items-center
                        gap-3
                        rounded-2xl
                        border
                        px-3
                        py-3
                        transition-all
                        duration-200

                        ${
                          isSelected
                            ? `
                              border-primary-200
                              bg-white
                              shadow-[0_6px_20px_rgba(15,23,42,0.07)]
                            `
                            : `
                              border-transparent
                              hover:border-primary-100
                              hover:bg-white/80
                            `
                        }
                      `}
                    >
                      {/* =======================================
                          PIN
                      ======================================== */}

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedBranch(branch)
                        }
                        aria-label={`Mostrar ${branch.name} en el mapa`}
                        className={`
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          border
                          transition-all
                          duration-200

                          ${
                            isSelected
                              ? `
                                border-primary-900
                                bg-primary-900
                                text-white
                              `
                              : `
                                border-primary-100
                                bg-white
                                text-primary-700
                                group-hover:border-primary-200
                              `
                          }
                        `}
                      >
                        <MapPin className="h-4.5 w-4.5" />
                      </button>

                      {/* =======================================
                          INFORMACIÓN
                      ======================================== */}

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedBranch(branch)
                        }
                        className="
                          min-w-0
                          flex-1
                          text-left
                        "
                      >
                        <p
                          className="
                            truncate
                            font-display
                            text-[14px]
                            font-bold
                            text-primary-950
                          "
                        >
                          {shortName}
                        </p>

                        {branch.address && (
                          <p
                            className="
                              mt-1
                              line-clamp-1
                              text-[11px]
                              leading-5
                              text-slate-500
                            "
                          >
                            {branch.address}
                          </p>
                        )}
                      </button>

                      {/* =======================================
                          VER SUCURSAL
                      ======================================== */}

                      <Link
  href={`/sucursales#${branch.slug}`}
  className="
    group/details
    flex
    shrink-0
    items-center
    gap-1.5
    rounded-lg
    px-2
    py-2
    text-[10px]
    font-bold
    text-primary-800
    transition-all
    hover:bg-primary-50
    hover:text-accent-600
  "
>
  <span>
    Ver sucursal
  </span>

  <ArrowRight
    className="
      h-3.5
      w-3.5
      transition-transform
      duration-200
      group-hover/details:translate-x-0.5
    "
  />
</Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}