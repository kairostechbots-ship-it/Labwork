import {
  ArrowRight,
  Package,
} from 'lucide-react';

import type { StudyPackage } from '@/types/study';

type PackageCardProps = {
  studyPackage: StudyPackage;
  onViewDetails: (
    studyPackage: StudyPackage
  ) => void;
};

export default function PackageCard({
  studyPackage,
  onViewDetails,
}: PackageCardProps) {
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

  return (
    <article className="group relative flex min-h-[260px] h-full flex-col overflow-hidden rounded-[24px] border border-accent-100 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-accent-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)]">
      {/* Línea verde */}
      <div className="absolute inset-y-0 left-0 w-[5px] bg-accent-500" />

      {/* Decoración */}
      <div
        aria-hidden="true"
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent-50 transition-transform duration-500 group-hover:scale-110"
      />

      <div className="relative flex h-full flex-col pl-1">
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-accent-50 px-3 py-2 text-accent-700">
              <Package className="h-4 w-4" />

              <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                Paquete
              </span>
            </div>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
            <Package className="h-[18px] w-[18px]" />
          </div>
        </div>

        {/* Nombre */}
        <div className="mt-5">
          <h3 className="font-display text-xl font-bold leading-snug text-primary-950">
            {studyPackage.name}
          </h3>

          {studyPackage.description && (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
              {studyPackage.description}
            </p>
          )}
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
                onClick={() =>
                  onViewDetails(studyPackage)
                }
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent-50 px-4 py-2.5 text-sm font-bold text-accent-800 transition-all hover:bg-accent-600 hover:text-white"
              >
                Ver paquete

                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}