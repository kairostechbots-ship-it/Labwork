import { ArrowRight, FlaskConical } from 'lucide-react';

import type { Study } from '@/types/study';

type StudyCardProps = {
  study: Study;
  onViewDetails: (study: Study) => void;
};

export default function StudyCard({
  study,
  onViewDetails,
}: StudyCardProps) {
  const numericPrice = Number(study.price);

  const formattedPrice =
    study.price && !Number.isNaN(numericPrice)
      ? new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          minimumFractionDigits: 0,
        }).format(numericPrice)
      : null;

  return (
    <article className="group relative overflow-hidden rounded-[22px] border border-slate-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-primary-100 hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)]">
      {/* Línea verde lateral */}
      <div className="absolute inset-y-0 left-0 w-[5px] bg-accent-500" />

      {/* Decoración */}
      <div
        aria-hidden="true"
        className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary-50/80 transition-transform duration-500 group-hover:scale-110"
      />

      <div className="relative flex min-h-[260px] flex-col p-6 pl-7">
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4">
          {study.category ? (
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary-600">
              {study.category}
            </p>
          ) : (
            <span />
          )}

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
            <FlaskConical className="h-[18px] w-[18px]" />
          </div>
        </div>

        {/* Nombre */}
        <div className="mt-5">
          <h3 className="max-w-[88%] font-display text-xl font-bold leading-snug text-primary-950">
            {study.name}
          </h3>
        </div>

        {/* Precio + botón */}
        <div className="mt-auto pt-6">
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Precio público
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
                    Consultar precio
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onViewDetails(study)}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary-50 px-4 py-2.5 text-sm font-bold text-primary-800 transition-all hover:bg-primary-900 hover:text-white"
              >
                Ver detalles
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}