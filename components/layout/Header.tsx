
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';

import {
  CalendarDays,
  ChevronDown,
  Globe2,
  LogOut,
  Menu,
  UserRound,
  X,
} from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

const navLinks = [
  { key: 'home', href: '/' },
  { key: 'studies', href: '/estudios' },
  { key: 'branches', href: '/sucursales' },
  { key: 'about', href: '/nosotros' },
  { key: 'contact', href: '/contacto' },
] as const;

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Header');

  const { data: session, status } = useSession();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] =
    useState(false);

  const accountRef = useRef<HTMLDivElement>(null);

  const isPatient =
    status === 'authenticated' &&
    session?.user?.role === 'patient';

  const isAccountPage = pathname.startsWith('/mi-cuenta');

  // Cerrar los menús al navegar
  useEffect(() => {
    setIsMenuOpen(false);
    setIsAccountOpen(false);
  }, [pathname]);

  // Cerrar menú de cuenta al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setIsAccountOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsAccountOpen(false);
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );

      document.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, []);

  function isActive(href: string) {
    return href === '/'
      ? pathname === '/'
      : pathname.startsWith(href);
  }

  // Cambiar idioma directamente con un clic
  function changeLanguage() {
    if (isChangingLanguage) return;

    const nextLocale = locale === 'es' ? 'en' : 'es';

    setIsChangingLanguage(true);
    setIsAccountOpen(false);
    setIsMenuOpen(false);

    // Guardar el idioma seleccionado durante un año
    document.cookie =
      `labwork-locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;

    // Actualizar el idioma del documento
    document.documentElement.lang = nextLocale;

    // Recargar los componentes del servidor
    // para obtener las nuevas traducciones
    router.refresh();

    setIsChangingLanguage(false);
  }

  async function handleSignOut() {
    setIsAccountOpen(false);
    setIsMenuOpen(false);

    await signOut({
      callbackUrl: '/',
    });
  }

  // Selector compacto ES / EN
  function renderLanguageSelector() {
    const nextLocale = locale === 'es' ? 'en' : 'es';

    return (
      <button
        type="button"
        onClick={changeLanguage}
        disabled={isChangingLanguage}
        aria-label={
          locale === 'es'
            ? 'Cambiar idioma a inglés'
            : 'Switch language to Spanish'
        }
        title={
          locale === 'es'
            ? 'Switch to English'
            : 'Cambiar a español'
        }
        className="
          inline-flex shrink-0 items-center gap-1.5
          rounded-lg px-2.5 py-2
          text-sm font-semibold text-white/85
          transition-all duration-200
          hover:bg-white/10 hover:text-white
          active:scale-95
          disabled:cursor-wait disabled:opacity-50
        "
      >
        <Globe2 className="h-[17px] w-[17px]" />

        <span>{nextLocale.toUpperCase()}</span>
      </button>
    );
  }

  return (
    <header
      className="
        sticky top-0 z-50 w-full
        border-b border-white/10
        bg-primary-900
        shadow-[0_4px_20px_rgba(15,23,42,0.08)]
      "
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="
            flex h-[82px] items-center
            justify-between gap-3
          "
        >

          {/* LOGO */}
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="flex shrink-0 items-center"
            aria-label="LabWork"
          >
            <Image
              src="/images/labwork-logo-white.png"
              alt="LabWork Análisis Clínicos"
              width={260}
              height={80}
              priority
              className="
                h-auto w-[145px]
                transition-opacity duration-200
                hover:opacity-95
                sm:w-[175px]
                xl:w-[195px]
              "
            />
          </Link>

          {/* NAVEGACIÓN ESCRITORIO */}
          <nav
            className="
              hidden items-center gap-0.5
              lg:flex xl:gap-1
            "
            aria-label={
              locale === 'es'
                ? 'Navegación principal'
                : 'Main navigation'
            }
          >
            {navLinks.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.key}
                  href={link.href}
                  className={`
                    relative whitespace-nowrap
                    rounded-lg px-2 py-2.5
                    text-[13px] font-semibold
                    transition-all duration-200

                    after:absolute
                    after:bottom-0
                    after:left-1/2
                    after:h-[2px]
                    after:-translate-x-1/2
                    after:rounded-full
                    after:bg-accent-400

                    xl:px-3 xl:text-sm

                    ${
                      active
                        ? 'text-white after:w-5'
                        : `text-white/75
                           hover:bg-white/[0.06]
                           hover:text-white
                           after:w-0
                           hover:after:w-5`
                    }
                  `}
                >
                  {t(link.key)}
                </Link>
              );
            })}
          </nav>

          {/* ACCIONES ESCRITORIO */}
          <div
            className="
              hidden shrink-0 items-center gap-1.5
              lg:flex xl:gap-2
            "
          >

            {/* AGENDAR CITA */}
            {!isAccountPage && (
              <Link
                href="/agendar"
                className="
                  inline-flex items-center justify-center
                  gap-2 whitespace-nowrap
                  rounded-lg bg-accent-500
                  px-3 py-3
                  text-[13px] font-bold text-white

                  shadow-[0_4px_14px_rgba(122,203,59,0.18)]

                  transition-all duration-200
                  hover:-translate-y-[1px]
                  hover:bg-accent-400

                  xl:px-4 xl:text-sm
                "
              >
                <CalendarDays className="h-[17px] w-[17px]" />
                {t('book')}
              </Link>
            )}

            {/* CUENTA DE PACIENTE */}
            {isPatient ? (
              <div
                className="relative"
                ref={accountRef}
              >
                <button
                  type="button"
                  onClick={() =>
                    setIsAccountOpen((prev) => !prev)
                  }
                  aria-expanded={isAccountOpen}
                  aria-haspopup="menu"
                  className="
                    inline-flex items-center gap-2
                    whitespace-nowrap rounded-lg
                    border border-white/20
                    px-3 py-2.5
                    text-[13px] font-semibold text-white
                    transition hover:bg-white/10
                    xl:text-sm
                  "
                >
                  <UserRound size={18} />

                  {t('account')}

                  <ChevronDown
                    size={15}
                    className={`
                      transition-transform
                      ${isAccountOpen ? 'rotate-180' : ''}
                    `}
                  />
                </button>

                {isAccountOpen && (
                  <div
                    role="menu"
                    className="
                      absolute right-0 top-full z-[60]
                      mt-3 w-56 overflow-hidden
                      rounded-xl border border-slate-200
                      bg-white p-1.5 shadow-xl
                    "
                  >
                    <Link
                      href="/mi-cuenta"
                      role="menuitem"
                      onClick={() =>
                        setIsAccountOpen(false)
                      }
                      className="
                        flex items-center gap-2
                        rounded-lg px-3 py-3
                        text-sm font-medium text-[#0b376d]
                        hover:bg-slate-50
                      "
                    >
                      <UserRound size={17} />

                      {locale === 'es'
                        ? 'Ir a mi cuenta'
                        : 'Go to my account'}
                    </Link>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() =>
                        void handleSignOut()
                      }
                      className="
                        flex w-full items-center gap-2
                        rounded-lg px-3 py-3
                        text-left text-sm font-medium
                        text-red-600 hover:bg-red-50
                      "
                    >
                      <LogOut size={17} />

                      {locale === 'es'
                        ? 'Cerrar sesión'
                        : 'Sign out'}
                    </button>
                  </div>
                )}
              </div>
            ) : status === 'unauthenticated' ? (
              <Link
                href="/iniciar-sesion"
                className="
                  inline-flex items-center gap-2
                  whitespace-nowrap rounded-lg
                  border border-white/20
                  px-3 py-3
                  text-[13px] font-semibold text-white
                  transition hover:bg-white/10
                  xl:text-sm
                "
              >
                <UserRound size={17} />
                {t('login')}
              </Link>
            ) : null}

            {/* CAMBIO DE IDIOMA */}
            {renderLanguageSelector()}
          </div>

          {/* CONTROLES MÓVILES */}
          <div
            className="
              flex items-center gap-1.5
              lg:hidden
            "
          >
            {renderLanguageSelector()}

            <button
              type="button"
              onClick={() =>
                setIsMenuOpen((prev) => !prev)
              }
              className="
                flex h-11 w-11 items-center
                justify-center rounded-lg
                border border-white/10
                text-white transition-colors
                hover:bg-white/10
              "
              aria-label={
                isMenuOpen
                  ? locale === 'es'
                    ? 'Cerrar menú'
                    : 'Close menu'
                  : locale === 'es'
                    ? 'Abrir menú'
                    : 'Open menu'
              }
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="
            border-t border-white/10
            bg-primary-900 shadow-xl
            lg:hidden
          "
        >
          <div className="mx-auto max-w-7xl px-4 pb-6 pt-3 sm:px-6">

            <nav
              className="flex flex-col"
              aria-label={
                locale === 'es'
                  ? 'Navegación móvil'
                  : 'Mobile navigation'
              }
            >
              {navLinks.map((link) => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.key}
                    href={link.href}
                    onClick={() =>
                      setIsMenuOpen(false)
                    }
                    className={`
                      flex items-center justify-between
                      border-b border-white/10
                      px-2 py-4
                      text-[15px] font-semibold
                      transition-colors

                      ${
                        active
                          ? 'text-accent-300'
                          : 'text-white/85 hover:text-white'
                      }
                    `}
                  >
                    {t(link.key)}

                    {active && (
                      <span
                        className="
                          h-1.5 w-1.5 rounded-full
                          bg-accent-400
                        "
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* AGENDAR CITA MÓVIL */}
            {!isAccountPage && (
              <Link
                href="/agendar"
                onClick={() =>
                  setIsMenuOpen(false)
                }
                className="
                  mt-5 flex w-full items-center
                  justify-center gap-2
                  rounded-lg bg-accent-500
                  px-5 py-3.5
                  text-sm font-bold text-white
                  transition hover:bg-accent-400
                "
              >
                <CalendarDays className="h-4 w-4" />
                {t('book')}
              </Link>
            )}

            {/* CUENTA MÓVIL */}
            {isPatient ? (
              <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                <Link
                  href="/mi-cuenta"
                  onClick={() =>
                    setIsMenuOpen(false)
                  }
                  className="
                    flex items-center gap-2
                    rounded-lg px-3 py-3
                    text-sm font-semibold text-white
                    hover:bg-white/10
                  "
                >
                  <UserRound size={18} />
                  {t('account')}
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    void handleSignOut()
                  }
                  className="
                    flex w-full items-center gap-2
                    rounded-lg px-3 py-3
                    text-left text-sm font-semibold
                    text-white/80 hover:bg-white/10
                  "
                >
                  <LogOut size={18} />

                  {locale === 'es'
                    ? 'Cerrar sesión'
                    : 'Sign out'}
                </button>
              </div>
            ) : status === 'unauthenticated' ? (
              <Link
                href="/iniciar-sesion"
                onClick={() =>
                  setIsMenuOpen(false)
                }
                className="
                  mt-4 flex items-center
                  justify-center gap-2
                  rounded-lg border border-white/20
                  px-4 py-3
                  text-sm font-semibold text-white
                "
              >
                <UserRound size={18} />
                {t('login')}
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
