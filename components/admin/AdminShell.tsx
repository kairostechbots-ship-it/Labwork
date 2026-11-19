
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  CalendarDays,
  FlaskConical,
  Package,
  MapPin,
  CalendarClock,
  CalendarSync,
  Menu,
  X,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
  LogOut,
  UserRound,
  FileText,
  Info,
} from 'lucide-react';

type Props = {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
};

const navigation = [
  {
    href: '/admin',
    label: 'Inicio',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/citas',
    label: 'Citas',
    icon: CalendarDays,
  },
  {
    href: '/admin/estudios',
    label: 'Estudios',
    icon: FlaskConical,
  },
  {
    href: '/admin/paquetes',
    label: 'Paquetes',
    icon: Package,
  },
  {
    href: '/admin/sucursales',
    label: 'Sucursales',
    icon: MapPin,
  },
  {
    href: '/admin/horarios',
    label: 'Horarios y disponibilidad',
    icon: CalendarClock,
  },
  {
    href: '/admin/resultados',
    label: 'Resultados',
    icon: FileText,
    temporary: true,
  },
  {
    href: '/admin/google-calendar',
    label: 'Google Calendar',
    icon: CalendarSync,
  },
];

export default function AdminShell({
  children,
  userName,
  userEmail,
}: Props) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showResultsNotice, setShowResultsNotice] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen && !showResultsNotice) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setShowResultsNotice(false);
      }
    }

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [mobileOpen, showResultsNotice]);

  const currentPage =
    navigation.find((item) =>
      item.href === '/admin'
        ? pathname === '/admin'
        : pathname === item.href ||
          pathname.startsWith(`${item.href}/`)
    ) ?? navigation[0];

  function openResultsNotice() {
    setMobileOpen(false);
    setShowResultsNotice(true);
  }

  async function handleSignOut() {
    setLoggingOut(true);

    try {
      await signOut({ callbackUrl: '/' });
    } finally {
      setLoggingOut(false);
    }
  }

  function renderSidebar(isMobile: boolean) {
    const compact = !isMobile && collapsed;

    return (
      <>
        {/* LOGOTIPO */}
        <div
          className={`relative flex min-h-[116px] items-center border-b border-white/10 ${
            compact
              ? 'justify-center px-2'
              : 'px-5'
          }`}
        >
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className={`flex min-w-0 flex-col ${
              compact ? 'items-center' : 'items-start'
            }`}
            title={compact ? 'LabWork - Inicio' : undefined}
          >
            {compact ? (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <FlaskConical className="h-6 w-6 text-accent-400" />
              </div>
            ) : (
              <>
                <Image
                  src="/images/labwork-logo-white.png"
                  alt="LabWork Análisis Clínicos"
                  width={220}
                  height={75}
                  priority
                  className="h-auto w-[175px] object-contain"
                />

                <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                  Administración
                </span>
              </>
            )}
          </Link>
        </div>

        {/* NAVEGACIÓN */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          {!compact && (
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
              Menú principal
            </p>
          )}

          <nav
            aria-label="Navegación administrativa"
            className="space-y-1.5"
          >
            {navigation.map((item) => {
              const active =
                !('temporary' in item && item.temporary) &&
                (item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`));

              const Icon = item.icon;

              const itemClass = `group relative flex w-full items-center rounded-xl transition-all duration-200 ${
                compact
                  ? 'h-12 justify-center'
                  : 'gap-3 px-4 py-3'
              } ${
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/65 hover:bg-white/[0.08] hover:text-white'
              }`;

              const itemContent = (
                <>
                  {active && (
                    <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-accent-400" />
                  )}

                  <Icon
                    className={`h-[20px] w-[20px] shrink-0 ${
                      active
                        ? 'text-accent-400'
                        : 'text-white/60 group-hover:text-white'
                    }`}
                    strokeWidth={active ? 2.3 : 1.9}
                  />

                  {!compact && (
                    <>
                      <span className="min-w-0 flex-1 text-left text-sm font-semibold">
                        {item.label}
                      </span>

                      {active && (
                        <ChevronRight className="h-4 w-4 text-accent-400" />
                      )}
                    </>
                  )}
                </>
              );

              if ('temporary' in item && item.temporary) {
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={openResultsNotice}
                    className={itemClass}
                    title={compact ? item.label : undefined}
                    aria-label={item.label}
                  >
                    {itemContent}
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={itemClass}
                  title={compact ? item.label : undefined}
                  aria-label={compact ? item.label : undefined}
                >
                  {itemContent}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* USUARIO */}
        <div className="border-t border-white/10 p-3">
          <div
            className={`mb-3 flex items-center rounded-xl bg-white/[0.07] ${
              compact
                ? 'justify-center p-2'
                : 'gap-3 p-3'
            }`}
            title={compact ? userName : undefined}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-500/20 text-accent-300">
              <UserRound className="h-5 w-5" />
            </div>

            {!compact && (
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">
                  {userName || 'Administrador'}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-white/55">
                  {userEmail}
                </p>
              </div>
            )}
          </div>

          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            title={compact ? 'Ver sitio público' : undefined}
            aria-label={compact ? 'Ver sitio público' : undefined}
            className={`flex items-center rounded-lg text-xs font-semibold text-white/75 transition hover:bg-white/10 hover:text-white ${
              compact
                ? 'h-11 justify-center'
                : 'gap-3 px-3 py-2.5'
            }`}
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            {!compact && 'Ver sitio público'}
          </Link>

          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={loggingOut}
            title={compact ? 'Cerrar sesión' : undefined}
            aria-label={compact ? 'Cerrar sesión' : undefined}
            className={`mt-1 flex w-full items-center rounded-lg text-xs font-semibold text-white/75 transition hover:bg-red-500/15 hover:text-red-200 disabled:opacity-50 ${
              compact
                ? 'h-11 justify-center'
                : 'gap-3 px-3 py-2.5'
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!compact &&
              (loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión')}
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc] font-body text-primary-950">
      {/* SIDEBAR ESCRITORIO */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col bg-primary-900 shadow-[4px_0_24px_rgba(11,55,109,0.08)] transition-[width] duration-300 lg:flex ${
          collapsed ? 'w-[84px]' : 'w-[268px]'
        }`}
      >
        {renderSidebar(false)}
      </aside>

      {/* FONDO MÓVIL */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-primary-950/60 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR MÓVIL */}
      <aside
        id="admin-mobile-nav"
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col bg-primary-900 shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar menú"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>

        {renderSidebar(true)}
      </aside>

      {/* CONTENIDO */}
      <div
        className={`min-h-screen transition-[padding] duration-300 ${
          collapsed ? 'lg:pl-[84px]' : 'lg:pl-[268px]'
        }`}
      >
        {/* HEADER */}
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-primary-100 bg-white/95 px-4 backdrop-blur-md sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            {/* BOTÓN MÓVIL */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={mobileOpen}
              aria-controls="admin-mobile-nav"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary-100 text-primary-900 transition hover:bg-primary-50 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* BOTÓN COLAPSAR */}
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={
                collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'
              }
              aria-expanded={!collapsed}
              title={
                collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'
              }
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary-100 text-primary-900 transition hover:bg-primary-50 lg:flex"
            >
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-400 sm:text-[11px]">
                LabWork / Administración
              </p>

              <h1 className="truncate font-display text-base font-bold text-primary-950 sm:text-lg">
                {currentPage.label === 'Inicio'
                  ? 'Panel de control'
                  : currentPage.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden h-8 w-px bg-primary-100 sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-900">
                <UserRound className="h-5 w-5" />
              </div>

              <div className="hidden max-w-[190px] sm:block">
                <p className="truncate text-xs font-bold text-primary-950">
                  {userName || 'Administrador'}
                </p>
                <p className="text-[11px] text-primary-400">
                  Administrador
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* PÁGINA */}
        <main className="mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-7 sm:py-9 lg:px-9">
          {children}
        </main>
      </div>

      {/* AVISO DE RESULTADOS */}
      {showResultsNotice && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-primary-950/60 p-4 backdrop-blur-[3px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowResultsNotice(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="results-notice-title"
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-primary-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-900">
                  <FileText className="h-6 w-6" />
                </div>

                <div>
                  <h2
                    id="results-notice-title"
                    className="font-display text-lg font-bold text-primary-950"
                  >
                    Consulta de resultados
                  </h2>

                  <p className="text-xs text-primary-400">
                    Sistema externo de LabWork
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowResultsNotice(false)}
                aria-label="Cerrar aviso"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="flex items-start gap-3 rounded-xl border border-primary-100 bg-primary-50/60 p-4">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />

                <div>
                  <p className="text-sm font-bold text-primary-900">
                    Enlace próximamente disponible
                  </p>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Los resultados se consultan en el sistema externo
                    del laboratorio. El acceso estará disponible cuando
                    LabWork nos proporcione el enlace correspondiente.
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                Los resultados no se almacenan ni se administran desde
                este portal.
              </p>
            </div>

            <div className="flex justify-end border-t border-primary-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowResultsNotice(false)}
                className="rounded-xl bg-accent-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-accent-600"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
