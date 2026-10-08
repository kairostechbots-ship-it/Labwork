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
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2">
        {/* Todos */}
        <button
          type="button"
          onClick={() => onChange('all')}
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

        {/* Categorías dinámicas */}
        {categories.map((category) => {
          const isActive = activeCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
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