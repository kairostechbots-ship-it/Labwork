'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  FileText,
  FlaskConical,
  Info,
  X,
} from 'lucide-react';

import type { Study } from '@/types/study';

type StudyDetailsDrawerProps = {
  study: Study | null;
  onClose: () => void;
};

export default function StudyDetailsDrawer({
  study,
  onClose,
}: StudyDetailsDrawerProps) {
  useEffect(() => {
    if (!study) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [study, onClose]);

  if (!study) {
    return null;
  }

  const numericPrice = Number(study.price);

  const formattedPrice =
    study.price && !Number.isNaN(numericPrice)
      ? new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          minimumFractionDigits: 0,
        }).format(numericPrice)
      : null;

  const hasDescription = Boolean(study.description?.trim());
  const hasPreparation = Boolean(study.preparation?.trim());

  return (
    <>
      {/* Fondo */}
      <button
        type="button"
        aria-label="Cerrar detalles"
        onClick={onClose}
        className="fixed inset-0 z-50 cursor-default bg-slate-950/30 backdrop-blur-[2px]"
      />

      {/* Panel */}
      <aside className="fixed inset-y-0 right-0 z-[60] w-full overflow-y-auto bg-white shadow-[-20px_0_60px_rgba(15,23,42,0.15)] sm:max-w-xl lg:max-w-[620px]">
        <div className="min-h-full">
          {/* Header */}
          <div className="relative border-b border-slate-100 px-6 pb-7 pt-6 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-400">
                Estudios
                {study.category && (
                  <>
                    <span className="mx-2">›</span>
                    <span className="text-primary-700">
                      {study.category}
                    </span>
                  </>
                )}
              </p>

              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-primary-900"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-7 flex items-start justify-between gap-6">
              <div className="min-w-0">
                <h2 className="font-display text-2xl font-bold leading-tight text-primary-950 sm:text-3xl">
                  {study.name}
                </h2>

                {study.category && (
                  <span className="mt-4 inline-flex rounded-full bg-primary-50 px-4 py-2 text-xs font-bold text-primary-700">
                    {study.category}
                  </span>
                )}
              </div>

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <FlaskConical className="h-7 w-7" />
              </div>
            </div>
          </div>

          {/* Precio */}
          <div className="px-6 py-6 sm:px-8">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
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

              <Link
                href={`/agendar?estudio=${encodeURIComponent(study.slug)}`}
                className="inline-flex min-h-[72px] items-center justify-center gap-2 rounded-2xl bg-accent-500 px-6 text-sm font-bold text-white transition hover:bg-accent-600"
              >
                <CalendarDays className="h-4 w-4" />
                Agendar cita
              </Link>
            </div>
          </div>

          {/* Información */}
          <div className="border-t border-slate-100 px-6 py-7 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <Info className="h-4 w-4" />
              </div>

              <h3 className="font-display text-lg font-bold text-primary-950">
                Información
              </h3>
            </div>

            {hasDescription ? (
              <p className="mt-4 leading-7 text-slate-600">
                {study.description}
              </p>
            ) : (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-sm leading-6 text-slate-500">
                  La información detallada de este estudio estará
                  disponible próximamente.
                </p>
              </div>
            )}
          </div>

          {/* Preparación */}
          <div className="border-t border-slate-100 px-6 py-7 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
                <FileText className="h-4 w-4" />
              </div>

              <h3 className="font-display text-lg font-bold text-primary-950">
                Preparación
              </h3>
            </div>

            {hasPreparation ? (
              <p className="mt-4 whitespace-pre-line leading-7 text-slate-600">
                {study.preparation}
              </p>
            ) : (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-sm leading-6 text-slate-500">
                  Por el momento no hay indicaciones de preparación
                  registradas para este estudio.
                </p>
              </div>
            )}
          </div>

          {/* Aviso */}
          <div className="px-6 pb-8 sm:px-8">
            <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-5">
              <p className="text-sm leading-6 text-primary-800">
                Si tienes dudas sobre el estudio o su preparación,
                puedes consultarlas al momento de agendar tu cita.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}