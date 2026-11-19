'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import {
  CalendarDays,
  CheckCircle2,
  FileText,
  Info,
  Package,
  X,
} from 'lucide-react';

import type { PackageDetailsResponse, PackageIncludedService, StudyPackage } from '@/types/study';

type PackageDetailsDrawerProps = {
  studyPackage: StudyPackage | null;
  onClose: () => void;
};

export default function PackageDetailsDrawer({
  studyPackage,
  onClose,
}: PackageDetailsDrawerProps) {
  const [includedServices, setIncludedServices] = useState<PackageIncludedService[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [servicesError, setServicesError] = useState(false);

  useEffect(() => {
    if (!studyPackage) {
      setIncludedServices([]);
      setLoadingServices(false);
      setServicesError(false);
      return;
    }

    const controller = new AbortController();
    setIncludedServices([]);
    setLoadingServices(true);
    setServicesError(false);

    const loadPackageDetails = async () => {
      try {
        const response = await fetch(
          `/api/packages/${encodeURIComponent(studyPackage.slug)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error('No fue posible consultar el paquete.');
        }

        const result: PackageDetailsResponse = await response.json();
        if (!controller.signal.aborted) {
          setIncludedServices(result.data.services ?? []);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error al consultar estudios incluidos:', error);
          setServicesError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingServices(false);
        }
      }
    };

    void loadPackageDetails();
    return () => controller.abort();
  }, [studyPackage?.slug]);
  /*
  |--------------------------------------------------------------------------
  | ESC + BLOQUEAR SCROLL
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!studyPackage) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      'hidden';

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [studyPackage, onClose]);

  /*
  |--------------------------------------------------------------------------
  | SIN PAQUETE
  |--------------------------------------------------------------------------
  */

  if (!studyPackage) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | PRECIO
  |--------------------------------------------------------------------------
  */

  const numericPrice = Number(
    studyPackage.price
  );

  const formattedPrice =
    studyPackage.price &&
    !Number.isNaN(numericPrice)
      ? new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          minimumFractionDigits: 0,
        }).format(numericPrice)
      : null;

  /*
  |--------------------------------------------------------------------------
  | INFORMACIÓN DISPONIBLE
  |--------------------------------------------------------------------------
  */

  const hasDescription = Boolean(
    studyPackage.description?.trim()
  );

  const hasPreparation = Boolean(
    studyPackage.preparation?.trim()
  );

  return (
    <>
      {/* Overlay */}
      <button
        type="button"
        aria-label="Cerrar detalles del paquete"
        onClick={onClose}
        className="fixed inset-0 z-50 cursor-default bg-slate-950/35 backdrop-blur-[2px]"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="package-detail-title"
        className="fixed inset-y-0 right-0 z-[60] w-full overflow-y-auto bg-white shadow-[-20px_0_60px_rgba(15,23,42,0.18)] sm:max-w-xl lg:max-w-[620px]"
      >
        <div className="min-h-full">
          {/* =========================================================
              HEADER
          ========================================================== */}

          <div className="relative border-b border-slate-100 px-6 pb-7 pt-6 sm:px-8">
            {/* Breadcrumb */}

            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
                <span className="text-accent-700">
                  Paquetes
                </span>

                <span className="text-slate-300">
                  ›
                </span>

                <span className="truncate text-slate-400">
                  {studyPackage.name}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-primary-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Etiqueta */}

            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent-50 px-3 py-2 text-accent-700">
              <Package className="h-4 w-4" />

              <span className="text-xs font-bold uppercase tracking-[0.12em]">
                Paquete
              </span>
            </div>

            {/* Nombre */}

            <div className="mt-4 flex items-start justify-between gap-6">
              <div className="min-w-0">
                <h2
                  id="package-detail-title"
                  className="font-display text-2xl font-bold leading-tight text-primary-950 sm:text-3xl"
                >
                  {studyPackage.name}
                </h2>

                {hasDescription && (
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                    {studyPackage.description}
                  </p>
                )}
              </div>

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-700">
                <Package className="h-7 w-7" />
              </div>
            </div>
          </div>

          {/* =========================================================
              PRECIO + AGENDAR
          ========================================================== */}

          <div className="px-6 py-6 sm:px-8">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              {/* Precio */}

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-semibold text-slate-400">
                  Precio público
                </p>

                {formattedPrice ? (
                  <div className="mt-1 flex items-end gap-2">
                    <p className="font-display text-3xl font-bold tracking-tight text-primary-950">
                      {formattedPrice}
                    </p>

                    <span className="mb-1 text-xs font-bold text-primary-900">
                      MXN
                    </span>
                  </div>
                ) : (
                  <p className="mt-2 font-display text-xl font-bold text-primary-950">
                    Consultar precio
                  </p>
                )}
              </div>

              {/* Agendar */}

              <Link
                href={`/agendar?paquete=${encodeURIComponent(
                  studyPackage.slug
                )}`}
                className="inline-flex min-h-[72px] items-center justify-center gap-2 rounded-2xl bg-accent-600 px-6 text-sm font-bold text-white transition hover:bg-accent-700"
              >
                <CalendarDays className="h-4 w-4" />

                Agendar cita
              </Link>
            </div>
          </div>

          {/* =========================================================
              DETALLES
          ========================================================== */}

          <section className="border-t border-slate-100 px-6 py-7 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
                <Info className="h-4 w-4" />
              </div>

              <h3 className="font-display text-lg font-bold text-primary-950">
                Detalles del paquete
              </h3>
            </div>

            {hasDescription ? (
              <p className="mt-4 whitespace-pre-line leading-7 text-slate-600">
                {studyPackage.description}
              </p>
            ) : (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-sm leading-6 text-slate-500">
                  La información detallada de
                  este paquete estará disponible
                  próximamente.
                </p>
              </div>
            )}
          </section>

          {/* =========================================================
              PREPARACIÓN
          ========================================================== */}

          <section className="border-t border-slate-100 px-6 py-7 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <FileText className="h-4 w-4" />
              </div>

              <h3 className="font-display text-lg font-bold text-primary-950">
                Preparación
              </h3>
            </div>

            {hasPreparation ? (
              <p className="mt-4 whitespace-pre-line leading-7 text-slate-600">
                {studyPackage.preparation}
              </p>
            ) : (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-sm leading-6 text-slate-500">
                  Por el momento no hay
                  indicaciones de preparación
                  registradas para este paquete.
                </p>
              </div>
            )}
          </section>

          {/* =========================================================
              ESTUDIOS INCLUIDOS
          ========================================================== */}

          <section className="border-t border-slate-100 px-6 py-7 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
                <Package className="h-4 w-4" />
              </div>
              <h3 className="font-display text-lg font-bold text-primary-950">
                Estudios incluidos
              </h3>
              {!loadingServices && !servicesError && includedServices.length > 0 && (
                <span className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-bold text-accent-700">
                  {includedServices.length}
                </span>
              )}
            </div>

            {loadingServices ? (
              <div className="mt-4 space-y-3" role="status" aria-live="polite">
                <span className="sr-only">Cargando estudios incluidos</span>
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : servicesError ? (
              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-5">
                <p className="text-sm leading-6 text-red-700">
                  No fue posible consultar los estudios incluidos. Intenta abrir el paquete nuevamente.
                </p>
              </div>
            ) : includedServices.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {includedServices.map((service) => (
                  <li
                    key={service.id}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" aria-hidden="true" />
                    <span className="text-sm font-medium leading-6 text-primary-950">
                      {service.name}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-accent-200 bg-accent-50/40 p-5">
                <p className="text-sm leading-6 text-slate-500">
                  Este paquete todavía no tiene estudios relacionados en el catálogo.
                </p>
              </div>
            )}
          </section>

          {/* Aviso */}

          <div className="px-6 pb-8 sm:px-8">
            <div className="rounded-2xl border border-accent-100 bg-accent-50/60 p-5">
              <p className="text-sm leading-6 text-accent-900">
                Si tienes dudas sobre este
                paquete o su preparación,
                puedes consultarlas al momento
                de agendar tu cita.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}