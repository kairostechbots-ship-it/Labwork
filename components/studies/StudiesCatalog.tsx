'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import StudiesHero from './StudiesHero';

import StudiesTabs, {
  type CatalogTab,
} from './StudiesTabs';

import StudiesFilters from './StudiesFilters';
import StudyCard from './StudyCard';
import PackageCard from './PackageCard';
import StudiesEmpty from './StudiesEmpty';
import StudyDetailsDrawer from './StudyDetailsDrawer';
import PackageDetailsDrawer from './PackageDetailsDrawer';
import QuotationDrawer from './QuotationDrawer';
import { ClipboardList } from 'lucide-react';
import { packageToQuotationItem, quotationKey, studyToQuotationItem, type QuotationItem } from '@/types/quotation';

import type {
  PackagesResponse,
  StudiesResponse,
  Study,
  StudyPackage,
} from '@/types/study';

const QUOTATION_STORAGE_KEY = 'labwork:quotation:v1';

type SavedQuotationItem = { type: 'study' | 'package'; id: string };

function readSavedQuotation(): SavedQuotationItem[] {
  try {
    const raw = window.localStorage.getItem(QUOTATION_STORAGE_KEY);
    if (!raw) return [];
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is SavedQuotationItem =>
      typeof item === 'object' &&
      item !== null &&
      (item.type === 'study' || item.type === 'package') &&
      typeof item.id === 'string'
    );
  } catch (error) {
    console.warn('No fue posible recuperar la cotización guardada:', error);
    return [];
  }
}

export default function StudiesCatalog() {
  /*
  |--------------------------------------------------------------------------
  | DATOS
  |--------------------------------------------------------------------------
  */

  const [studies, setStudies] = useState<Study[]>(
    []
  );

  const [packages, setPackages] = useState<
    StudyPackage[]
  >([]);

  /*
  |--------------------------------------------------------------------------
  | TAB ACTIVO
  |--------------------------------------------------------------------------
  */

  const [activeTab, setActiveTab] =
    useState<CatalogTab>('studies');

  /*
  |--------------------------------------------------------------------------
  | BÚSQUEDA
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] = useState('');

  /*
  |--------------------------------------------------------------------------
  | CATEGORÍA
  |--------------------------------------------------------------------------
  */

  const [activeCategory, setActiveCategory] =
    useState('all');

  /*
  |--------------------------------------------------------------------------
  | ESTADOS DE CARGA
  |--------------------------------------------------------------------------
  */

  const [loading, setLoading] = useState(true);

  const [hasError, setHasError] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | ESTUDIO SELECCIONADO
  |--------------------------------------------------------------------------
  */

  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [quotationOpen, setQuotationOpen] = useState(false);
  const [quotationReady, setQuotationReady] = useState(false);
  const addQuotationItem = (item: QuotationItem) => {
    setQuotationItems((current) => current.some((existing) => quotationKey(existing) === quotationKey(item)) ? current : [...current, item]);
  };
  const removeQuotationItem = (key: string) => setQuotationItems((current) => current.filter((item) => quotationKey(item) !== key));

  const [selectedStudy, setSelectedStudy] =
    useState<Study | null>(null);
const [
  selectedPackage,
  setSelectedPackage,
] = useState<StudyPackage | null>(null);
  /*
  |--------------------------------------------------------------------------
  | CARGAR CATÁLOGO REAL
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true);
        setHasError(false);

        const [
          studiesResponse,
          packagesResponse,
        ] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/packages'),
        ]);

        if (
          !studiesResponse.ok ||
          !packagesResponse.ok
        ) {
          throw new Error(
            'No fue posible obtener el catálogo.'
          );
        }

        const studiesResult: StudiesResponse =
          await studiesResponse.json();

        const packagesResult: PackagesResponse =
          await packagesResponse.json();

        /*
        |--------------------------------------------------------------------------
        | ESTUDIOS ACTIVOS
        |--------------------------------------------------------------------------
        */

        const activeStudies = (
          studiesResult.data ?? []
        ).filter(
          (study) => study.isActive
        );

        /*
        |--------------------------------------------------------------------------
        | PAQUETES ACTIVOS
        |--------------------------------------------------------------------------
        */

        const activePackages = (
          packagesResult.data ?? []
        ).filter(
          (item) => item.isActive
        );

        /*
        |--------------------------------------------------------------------------
        | ÚNICAMENTE INFORMACIÓN REAL DE LA BD
        |--------------------------------------------------------------------------
        */

        setStudies(activeStudies);
        setPackages(activePackages);

        // Reconstruir la cotización desde el catálogo vigente, no desde
        // nombres o precios que pudieron quedar obsoletos en el navegador.
        const savedItems = readSavedQuotation();
        const restored: QuotationItem[] = [];
        const seen = new Set<string>();

        for (const saved of savedItems) {
          let quotationItem: QuotationItem | null = null;
          if (saved.type === 'study') {
            const study = activeStudies.find((entry) => entry.id === saved.id);
            if (study) quotationItem = studyToQuotationItem(study);
          } else {
            const studyPackage = activePackages.find((entry) => entry.id === saved.id);
            if (studyPackage) quotationItem = packageToQuotationItem(studyPackage);
          }

          if (!quotationItem) continue; // Ya no existe o está inactivo.
          const key = quotationKey(quotationItem);
          if (seen.has(key)) continue;
          seen.add(key);
          restored.push(quotationItem);
        }

        setQuotationItems(restored);
        setQuotationReady(true);
      } catch (error) {
        console.error(
          'Error al cargar el catálogo:',
          error
        );

        setHasError(true);
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, []);

  // Guardar solo los identificadores: al recargar, nombres y precios
  // se vuelven a obtener de la API. No sobrescribir si falló la carga.
  useEffect(() => {
    if (!quotationReady) return;
    try {
      const selected: SavedQuotationItem[] = quotationItems.map(({ type, id }) => ({ type, id }));
      window.localStorage.setItem(QUOTATION_STORAGE_KEY, JSON.stringify(selected));
    } catch (error) {
      console.warn('No fue posible guardar la cotización:', error);
    }
  }, [quotationItems, quotationReady]);

  /*
  |--------------------------------------------------------------------------
  | CATEGORÍAS
  |--------------------------------------------------------------------------
  */

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        studies
          .map((study) => study.category)
          .filter(
            (
              category
            ): category is string =>
              Boolean(category)
          )
      )
    ).sort((a, b) =>
      a.localeCompare(b, 'es')
    );
  }, [studies]);

  /*
  |--------------------------------------------------------------------------
  | ESTUDIOS FILTRADOS
  |--------------------------------------------------------------------------
  */

  const filteredStudies = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLocaleLowerCase('es');

    return studies.filter((study) => {
      const name =
        study.name.toLocaleLowerCase('es');

      const category =
        study.category?.toLocaleLowerCase(
          'es'
        ) ?? '';

      const description =
        study.description?.toLocaleLowerCase(
          'es'
        ) ?? '';

      const matchesSearch =
        !normalizedSearch ||
        name.includes(normalizedSearch) ||
        category.includes(normalizedSearch) ||
        description.includes(
          normalizedSearch
        );

      const matchesCategory =
        activeCategory === 'all' ||
        study.category === activeCategory;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    studies,
    search,
    activeCategory,
  ]);

  /*
  |--------------------------------------------------------------------------
  | PAQUETES FILTRADOS
  |--------------------------------------------------------------------------
  */

  const filteredPackages = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLocaleLowerCase('es');

    return packages.filter((item) => {
      if (!normalizedSearch) {
        return true;
      }

      const name =
        item.name.toLocaleLowerCase('es');

      const description =
        item.description?.toLocaleLowerCase(
          'es'
        ) ?? '';

      return (
        name.includes(normalizedSearch) ||
        description.includes(
          normalizedSearch
        )
      );
    });
  }, [packages, search]);

  /*
  |--------------------------------------------------------------------------
  | CAMBIAR TAB
  |--------------------------------------------------------------------------
  */

  const handleTabChange = (
    tab: CatalogTab
  ) => {
    setActiveTab(tab);
    setActiveCategory('all');
    setSearch('');
    setSelectedStudy(null);
  };

  /*
  |--------------------------------------------------------------------------
  | ABRIR DETALLES
  |--------------------------------------------------------------------------
  */

  const handleViewDetails = (
    study: Study
  ) => {
    setSelectedStudy(study);
  };

  /*
  |--------------------------------------------------------------------------
  | CERRAR DETALLES
  |--------------------------------------------------------------------------
  */

  const handleCloseDetails = () => {
    setSelectedStudy(null);
  };

  /*
  |--------------------------------------------------------------------------
  | ¿EXISTEN PAQUETES?
  |--------------------------------------------------------------------------
  */

  const hasPackages =
    packages.length > 0;

  return (
    <>
      {/* ================================================================
          HERO + BUSCADOR
      ================================================================= */}

      <StudiesHero
        search={search}
        onSearchChange={setSearch}
      />

      {/* ================================================================
          CATÁLOGO
      ================================================================= */}

      <section className="bg-slate-50/40 py-4 sm:py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* ============================================================
              TABS
          ============================================================= */}

          {!loading && !hasError && (
            <div className="flex justify-center">
              {hasPackages ? (
                <StudiesTabs
                  activeTab={activeTab}
                  onChange={
                    handleTabChange
                  }
                  studiesCount={
                    studies.length
                  }
                  packagesCount={
                    packages.length
                  }
                />
              ) : (
                <div className="flex items-center border-b border-slate-200">
                  <div className="relative flex items-center gap-2 pb-4 text-sm font-bold text-primary-900">
                    Estudios

                    {studies.length >
                      0 && (
                      <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700">
                        {
                          studies.length
                        }
                      </span>
                    )}

                    <span className="absolute bottom-[-1px] left-0 h-0.5 w-full rounded-full bg-accent-500" />
                  </div>
                </div>
              )}
            </div>
          )}

       {!quotationOpen && (
  <button
    type="button"
    onClick={() => setQuotationOpen(true)}
    className="
  fixed right-3 z-40
  bottom-[calc(1.25rem+env(safe-area-inset-bottom))]
  inline-flex min-h-11 items-center gap-2
  rounded-full bg-primary-900
  px-4 py-2.5
  text-xs font-bold text-white
  shadow-[0_8px_24px_rgba(11,55,109,0.22)]
  transition-all duration-200
  hover:bg-primary-800
  sm:right-6 sm:px-5 sm:py-3 sm:text-sm
"
  >
    <ClipboardList className="h-5 w-5" />

    Mi cotización

    <span className="rounded-full bg-accent-500 px-2 py-0.5 text-xs text-primary-950">
      {quotationItems.length}
    </span>
  </button>
)}

          {/* ============================================================
              LOADING
          ============================================================= */}

          {loading && (
            <div className="mt-8">
              {/* Categorías */}

              <div className="flex flex-wrap justify-center gap-2">
                {[1, 2, 3, 4, 5].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-10 w-32 animate-pulse rounded-full bg-slate-100"
                    />
                  )
                )}
              </div>

              {/* Encabezado */}

              <div className="mt-10 flex items-center justify-between">
                <div>
                  <div className="h-7 w-48 animate-pulse rounded-lg bg-slate-100" />

                  <div className="mt-2 h-4 w-28 animate-pulse rounded bg-slate-100" />
                </div>
              </div>

              {/* Cards */}

              <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                {[
                  1,
                  2,
                  3,
                  4,
                  5,
                  6,
                ].map((item) => (
                  <div
                    key={item}
                    className="h-[260px] animate-pulse rounded-[22px] bg-slate-100"
                  />
                ))}
              </div>
            </div>
          )}

          {/* ============================================================
              ERROR
          ============================================================= */}

          {!loading &&
            hasError && (
              <div className="mt-10 rounded-[24px] border border-red-100 bg-red-50 px-6 py-14 text-center">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  No pudimos cargar el
                  catálogo
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  Intenta nuevamente en
                  unos momentos.
                </p>
              </div>
            )}

          {/* ============================================================
              ESTUDIOS
          ============================================================= */}

          {!loading &&
            !hasError &&
            activeTab ===
              'studies' && (
              <div className="mt-4 sm:mt-8">

                {/* ======================================================
                    CATEGORÍAS
                ======================================================= */}

                {categories.length >
                  0 && (
                  <StudiesFilters
                    categories={
                      categories
                    }
                    activeCategory={
                      activeCategory
                    }
                    onChange={
                      setActiveCategory
                    }
                  />
                )}

                {/* ======================================================
                    ENCABEZADO DE RESULTADOS
                ======================================================= */}

                <div className="mt-5 flex flex-col gap-2 sm:mt-10 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h2 className="font-display text-2xl font-bold text-primary-950 sm:text-[28px]">
                        {activeCategory ===
                        'all'
                          ? 'Todos los estudios'
                          : activeCategory}
                      </h2>

                      <span className="text-sm font-semibold text-slate-400">
                        {
                          filteredStudies.length
                        }{' '}
                        {filteredStudies.length ===
                        1
                          ? 'resultado'
                          : 'resultados'}
                      </span>
                    </div>

                    {search && (
                      <p className="mt-2 text-sm text-slate-500">
                        Resultados para{' '}
                        <span className="font-semibold text-primary-800">
                          “{search}”
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* ======================================================
                    CARDS DE ESTUDIOS
                ======================================================= */}

                {filteredStudies.length >
                0 ? (
                  <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {filteredStudies.map(
                      (study) => (
                        <StudyCard
                          key={
                            study.id
                          }
                          study={
                            study
                          }
                          onViewDetails={handleViewDetails}
                          onAdd={(item) => addQuotationItem(studyToQuotationItem(item))}
                          isAdded={quotationItems.some(
                            (selected) => quotationKey(selected) === `study:${study.id}`
                          )}
                        />
                      )
                    )}
                  </div>
                ) : (
                  <div className="mt-6">
                    <StudiesEmpty
                      type={
                        studies.length ===
                          0 &&
                        !search
                          ? 'studies'
                          : 'search'
                      }
                    />
                  </div>
                )}
              </div>
            )}

          {/* ============================================================
              PAQUETES
          ============================================================= */}

          {!loading &&
            !hasError &&
            hasPackages &&
            activeTab ===
              'packages' && (
              <div className="mt-5 sm:mt-10">

                {/* ENCABEZADO */}

                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="font-display text-2xl font-bold text-primary-950 sm:text-[28px]">
                    Paquetes disponibles
                  </h2>

                  <span className="text-sm font-semibold text-slate-400">
                    {
                      filteredPackages.length
                    }{' '}
                    {filteredPackages.length ===
                    1
                      ? 'resultado'
                      : 'resultados'}
                  </span>
                </div>

                {/* PAQUETES */}

                {filteredPackages.length >
                0 ? (
                  <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredPackages.map(
                      (item) => (
                       <PackageCard
  key={item.id}
  studyPackage={item}
  onViewDetails={setSelectedPackage}
  onAdd={(item) => addQuotationItem(packageToQuotationItem(item))}
  isAdded={quotationItems.some((selected) => quotationKey(selected) === `package:${item.id}`)}
/>
                      )
                    )}
                  </div>
                ) : (
                  <div className="mt-6">
                    <StudiesEmpty type="search" />
                  </div>
                )}
              </div>
            )}
        </div>
      </section>

      <QuotationDrawer
        open={quotationOpen}
        items={quotationItems}
        onClose={() => setQuotationOpen(false)}
        onRemove={removeQuotationItem}
        onClear={() => setQuotationItems([])}
      />

      {/* ================================================================
          DRAWER DE DETALLES
      ================================================================= */}
<StudyDetailsDrawer
  study={selectedStudy}
  onClose={() => setSelectedStudy(null)}
/>

<PackageDetailsDrawer
  studyPackage={selectedPackage}
  onClose={() => setSelectedPackage(null)}
/>
    </>
  );
}