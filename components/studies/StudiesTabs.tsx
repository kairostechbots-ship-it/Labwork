import { FlaskConical, Package } from 'lucide-react';

export type CatalogTab = 'studies' | 'packages';

type StudiesTabsProps = {
  activeTab: CatalogTab;
  onChange: (tab: CatalogTab) => void;
  studiesCount: number;
  packagesCount: number;
};

export default function StudiesTabs({
  activeTab,
  onChange,
  studiesCount,
  packagesCount,
}: StudiesTabsProps) {
  return (
    <div className="inline-flex rounded-2xl bg-slate-100 p-1.5">
      <button
        type="button"
        onClick={() => onChange('studies')}
        className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
          activeTab === 'studies'
            ? 'bg-white text-primary-900 shadow-sm'
            : 'text-slate-500 hover:text-primary-900'
        }`}
      >
        <FlaskConical className="h-4 w-4" />
        Estudios
        {studiesCount > 0 && (
          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-700">
            {studiesCount}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => onChange('packages')}
        className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
          activeTab === 'packages'
            ? 'bg-white text-primary-900 shadow-sm'
            : 'text-slate-500 hover:text-primary-900'
        }`}
      >
        <Package className="h-4 w-4" />
        Paquetes
        {packagesCount > 0 && (
          <span className="rounded-full bg-accent-50 px-2 py-0.5 text-xs text-accent-700">
            {packagesCount}
          </span>
        )}
      </button>
    </div>
  );
}