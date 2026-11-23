
'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Trash2,
  X,
} from 'lucide-react';

import {
  quotationKey,
  validPrice,
  type QuotationItem,
} from '@/types/quotation';

type QuotationDrawerProps = {
  open: boolean;
  items: QuotationItem[];
  onClose: () => void;
  onRemove: (key: string) => void;
  onClear: () => void;
};

type IncludedService = {
  id: string;
  name: string;
  slug: string;
};

type PackageComposition = {
  packageId: string;
  services: IncludedService[];
};

type CompositionState = {
  key: string;
  loading: boolean;
  packages: PackageComposition[];
  failedPackages: string[];
};

export default function QuotationDrawer({
  open,
  items,
  onClose,
  onRemove,
  onClear,
}: QuotationDrawerProps) {
  const t = useTranslations('QuotationDrawer');
  const locale = useLocale();

  const router = useRouter();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  /* ============================================================
     FORMATO MONETARIO
  ============================================================ */

  const money = (amount: number) => {
    return new Intl.NumberFormat(
      locale === 'en' ? 'en-US' : 'es-MX',
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  };

  /* ============================================================
     CONTINUAR A AGENDAR
  ============================================================ */

  function continueToAppointment() {
    if (items.length === 0) return;

    onClose();
    router.push('/agendar');
  }

  /* ============================================================
     PAQUETES SELECCIONADOS
  ============================================================ */

  const packageItems = items.filter(
    (item) => item.type === 'package'
  );

  const packageKey = packageItems
    .map((item) => `${item.id}:${item.slug}`)
    .sort()
    .join('|');

  const [composition, setComposition] =
    useState<CompositionState>({
      key: '',
      loading: false,
      packages: [],
      failedPackages: [],
    });

  /* ============================================================
     BLOQUEAR SCROLL Y CONTROLAR FOCO
  ============================================================ */

  useEffect(() => {
    if (!open) return;

    const previousOverflow =
      document.body.style.overflow;

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    document.body.style.overflow = 'hidden';

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key !== 'Tab') return;

      const dialog =
        document.getElementById('quotation-dialog');

      const focusable =
        dialog?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href]'
        );

      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener(
      'keydown',
      onKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        'keydown',
        onKeyDown
      );

      previousFocus?.focus();
    };
  }, [open, onClose]);

  /* ============================================================
     CONSULTAR COMPOSICIÓN DE PAQUETES
  ============================================================ */

  useEffect(() => {
    if (!open || packageItems.length === 0) {
      return;
    }

    const controller = new AbortController();

    const selectedPackages = [...packageItems];

    setComposition({
      key: packageKey,
      loading: true,
      packages: [],
      failedPackages: [],
    });

    async function loadCompositions() {
      const results = await Promise.all(
        selectedPackages.map(async (item) => {
          try {
            const response = await fetch(
              `/api/packages/${encodeURIComponent(
                item.slug
              )}`,
              {
                signal: controller.signal,
                cache: 'no-store',
              }
            );

            if (!response.ok) {
              throw new Error(
                'Unable to load package details.'
              );
            }

            const body: {
              data?: {
                services?: IncludedService[];
              };
            } = await response.json();

            if (!Array.isArray(body.data?.services)) {
              throw new Error(
                'Package services are missing.'
              );
            }

            return {
              ok: true as const,
              packageId: item.id,
              services: body.data.services,
            };
          } catch {
            return {
              ok: false as const,
              packageId: item.id,
            };
          }
        })
      );

      if (controller.signal.aborted) return;

      setComposition({
        key: packageKey,
        loading: false,

        packages: results
          .filter((result) => result.ok)
          .map((result) => ({
            packageId: result.packageId,
            services: result.services,
          })),

        failedPackages: results
          .filter((result) => !result.ok)
          .map((result) => result.packageId),
      });
    }

    void loadCompositions();

    return () => controller.abort();

    // packageKey identifies selected packages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, packageKey]);

  /* ============================================================
     DETECTAR ESTUDIOS REPETIDOS
  ============================================================ */

  const overlaps = useMemo(() => {
    if (
      !open ||
      composition.key !== packageKey ||
      composition.loading
    ) {
      return [];
    }

    const selectedStudies = items.filter(
      (item) => item.type === 'study'
    );

    return selectedStudies.flatMap((study) => {
      const containingPackages =
        composition.packages
          .filter((entry) =>
            entry.services.some(
              (service) => service.id === study.id
            )
          )
          .map(
            (entry) =>
              items.find(
                (item) =>
                  item.type === 'package' &&
                  item.id === entry.packageId
              )?.name
          )
          .filter(
            (name): name is string =>
              Boolean(name)
          );

      return containingPackages.length
        ? [{ study, containingPackages }]
        : [];
    });
  }, [composition, items, open, packageKey]);

  /* ============================================================
     DRAWER CERRADO
  ============================================================ */

  if (!open) return null;

  /* ============================================================
     CÁLCULOS
  ============================================================ */

  const missing = items.some(
    (item) => validPrice(item.price) === null
  );

  const subtotal = items.reduce(
    (sum, item) =>
      sum + (validPrice(item.price) ?? 0),
    0
  );

  const checking =
    packageItems.length > 0 &&
    (
      composition.key !== packageKey ||
      composition.loading
    );

  const failedCount =
    composition.failedPackages.length;

  return (
    <>
      {/* FONDO */}

      <button
        type="button"
        aria-label={t('closeQuotation')}
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-slate-950/40 backdrop-blur-[2px]"
      />

      {/* PANEL */}

      <aside
        id="quotation-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quotation-title"
        className="fixed inset-x-0 bottom-0 top-0 z-[80] flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-[-20px_0_60px_rgba(15,23,42,0.18)] sm:inset-x-auto sm:right-0 sm:max-w-xl"
      >
        {/* HEADER */}

        <header className="z-10 flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-4 sm:px-8 sm:py-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800 sm:h-11 sm:w-11">
              <ClipboardList className="h-5 w-5" />
            </span>

            <div className="min-w-0">
              <h2
                id="quotation-title"
                className="font-display text-xl font-bold text-primary-950"
              >
                {t('title')}
              </h2>

              <p className="text-sm text-slate-500">
                {t('selectedItems', {
                  count: items.length,
                })}
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            aria-label={t('close')}
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-700"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* CONTENIDO */}

        <div className="min-h-0 flex-1 overscroll-contain overflow-y-auto px-4 py-4 sm:px-8 sm:py-6">

          {/* SIN ELEMENTOS */}

          {items.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-600">
              {t('empty')}
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => {
                const price = validPrice(item.price);

                return (
                  <li
                    key={quotationKey(item)}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 p-3.5 sm:p-4"
                  >
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-accent-700">
                        {item.type === 'study'
                          ? t('study')
                          : t('package')}
                      </span>

                      <p className="mt-1 break-words text-sm font-semibold leading-5 text-primary-950 sm:text-base">
                        {item.name}
                      </p>

                      <p className="mt-2 text-sm font-bold text-primary-900">
                        {price === null
                          ? t('askPrice')
                          : `$${money(price)} MXN`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onRemove(quotationKey(item))
                      }
                      aria-label={t('removeItem', {
                        name: item.name,
                      })}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* REVISANDO PAQUETES */}

          {checking && (
            <p
              role="status"
              className="mt-5 text-sm text-slate-500"
            >
              {t('checkingPackages')}
            </p>
          )}

          {/* ESTUDIOS REPETIDOS */}

          {!checking && overlaps.length > 0 && (
            <div
              role="status"
              className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

                <div>
                  <p className="font-bold">
                    {t('duplicates.title')}
                  </p>

                  <p className="mt-1 text-sm leading-6">
                    {t('duplicates.description')}
                  </p>

                  <ul className="mt-3 space-y-2 text-sm">
                    {overlaps.map(
                      ({
                        study,
                        containingPackages,
                      }) => (
                        <li key={study.id}>
                          <strong>
                            {study.name}
                          </strong>

                          {' — '}

                          {t('duplicates.includedIn', {
                            packages:
                              containingPackages.join(', '),
                          })}
                        </li>
                      )
                    )}
                  </ul>

                  <p className="mt-3 text-sm leading-6">
                    {t('duplicates.notice')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ERROR AL VERIFICAR PAQUETES */}

          {!checking &&
            composition.key === packageKey &&
            failedCount > 0 && (
              <div
                role="status"
                className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700"
              >
                {t('verificationError', {
                  count: failedCount,
                })}
              </div>
            )}

          {/* VACIAR COTIZACIÓN */}

          {items.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="mt-5 text-sm font-semibold text-slate-500 underline underline-offset-4 hover:text-red-700"
            >
              {t('clearQuotation')}
            </button>
          )}
        </div>

        {/* FOOTER */}

        <footer className="z-10 shrink-0 border-t border-slate-100 bg-white px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 sm:px-8 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-primary-950">
              {missing
                ? t('knownSubtotal')
                : t('estimatedTotal')}
            </span>

            <span className="shrink-0 whitespace-nowrap font-display text-xl font-bold text-primary-950 sm:text-2xl">
              ${money(subtotal)}

              <span className="text-xs">
                {' '}MXN
              </span>
            </span>
          </div>

          {/* PRECIOS FALTANTES */}

          {missing && (
            <p className="mt-2 text-sm leading-6 text-amber-800">
              {t('missingPrices')}
            </p>
          )}

          {/* AVISO */}

          <p className="mt-3 text-xs leading-5 text-slate-500">
            {t('disclaimer')}
          </p>

          {/* CONTINUAR */}

          <button
            type="button"
            onClick={continueToAppointment}
            disabled={items.length === 0}
            className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('continueAppointment')}

            <ArrowRight className="h-4 w-4" />
          </button>
        </footer>
      </aside>
    </>
  );
}
