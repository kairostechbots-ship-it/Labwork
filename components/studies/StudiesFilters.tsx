
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

type StudiesFiltersProps = {
  categories: string[];
  activeCategory: string;
  onChange: (category: string) => void;
};

export default function StudiesFilters({
  categories,
  activeCategory,
  onChange,
}: StudiesFiltersProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* =========================================
          MÓVIL: SELECTOR DE CATEGORÍAS
      ========================================= */}
      <div className="md:hidden">
        <div className="mb-2 flex items-center justify-between gap-3">
          <label
            htmlFor="studies-category-filter"
            className="text-sm font-bold text-primary-950"
          >
            Categorías
          </label>

          <span className="text-xs text-slate-500">
            Filtra los estudios
          </span>
        </div>

        <div className="relative">
          <SlidersHorizontal
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-primary-700"
          />

          <select
            id="studies-category-filter"
            value={activeCategory}
            onChange={(event) => onChange(event.target.value)}
            className="
              h-12 w-full appearance-none rounded-2xl
              border border-slate-200 bg-white
              py-3 pl-12 pr-11
              text-sm font-semibold text-primary-950
              shadow-[0_4px_16px_rgba(15,23,42,0.035)]
              outline-none transition-colors
              focus:border-primary-500
              focus:ring-2 focus:ring-primary-100
            "
          >
            <option value="all">
              Todas las categorías
            </option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-700"
          />
        </div>
      </div>

      {/* =========================================
          ESCRITORIO: BOTONES ORIGINALES
      ========================================= */}
      <div className="mx-auto hidden max-w-6xl flex-wrap items-center justify-center gap-2 md:flex">
        <button
          type="button"
          onClick={() => onChange('all')}
          aria-pressed={activeCategory === 'all'}
          className={`
            rounded-full border px-5 py-2.5
            text-sm font-semibold
            transition-all duration-200
            ${
              activeCategory === 'all'
                ? 'border-primary-900 bg-primary-900 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-900'
            }
          `}
        >
          Todos
        </button>

        {categories.map((category) => {
          const isActive = activeCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              aria-pressed={isActive}
              className={`
                rounded-full border px-5 py-2.5
                text-sm font-semibold
                transition-all duration-200
                ${
                  isActive
                    ? 'border-primary-900 bg-primary-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-900'
                }
              `}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
