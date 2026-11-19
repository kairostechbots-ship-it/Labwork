
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  CalendarDays,
  ChevronDown,
  LogOut,
  Menu,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const navLinks = [
  { name: 'Inicio', href: '/' },
  { name: 'Estudios', href: '/estudios' },
  { name: 'Sucursales', href: '/sucursales' },
  { name: 'Nosotros', href: '/nosotros' },
  { name: 'Contacto', href: '/contacto' },
];

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);

  const isPatient =
    status === 'authenticated' &&
    session?.user?.role === 'patient';

  const isAccountPage = pathname.startsWith('/mi-cuenta');

  useEffect(() => {
    setIsMenuOpen(false);
    setIsAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setIsAccountOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function isActive(href: string) {
    return href === '/'
      ? pathname === '/'
      : pathname.startsWith(href);
  }

  async function handleSignOut() {
    setIsAccountOpen(false);
    setIsMenuOpen(false);

    await signOut({
      callbackUrl: '/',
    });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-primary-900 shadow-[0_4px_20px_rgba(15,23,42,0.08)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[82px] items-center justify-between gap-4">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="flex shrink-0 items-center"
            aria-label="Ir al inicio de LabWork"
          >
            <Image
              src="/images/labwork-logo-white.png"
              alt="LabWork Análisis Clínicos"
              width={260}
              height={80}
              priority
              className="h-auto w-[165px] transition-opacity duration-200 hover:opacity-95 sm:w-[180px] xl:w-[195px]"
            />
          </Link>

          <nav
            className="hidden items-center gap-2 lg:flex"
            aria-label="Navegación principal"
          >
            {navLinks.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:-translate-x-1/2 after:rounded-full after:bg-accent-400 after:transition-all duration-200 ${
                    active
                      ? 'text-white after:w-5'
                      : 'text-white/75 hover:bg-white/[0.06] hover:text-white after:w-0 hover:after:w-5'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {!isAccountPage && (
              <Link
                href="/agendar"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-500 px-5 py-3 text-sm font-bold text-white shadow-[0_4px_14px_rgba(122,203,59,0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-accent-400"
              >
                <CalendarDays className="h-[17px] w-[17px]" />
                Agendar cita
              </Link>
            )}

            {isPatient ? (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setIsAccountOpen((value) => !value)}
                  aria-expanded={isAccountOpen}
                  aria-haspopup="menu"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <UserRound size={18} />
                  Mi cuenta
                  <ChevronDown
                    size={15}
                    className={`transition-transform ${
                      isAccountOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isAccountOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
                  >
                    <Link
                      href="/mi-cuenta"
                      role="menuitem"
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-[#0b376d] hover:bg-slate-50"
                    >
                      <UserRound size={17} />
                      Ir a mi cuenta
                    </Link>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => void handleSignOut()}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : status === 'unauthenticated' ? (
              <Link
                href="/iniciar-sesion"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <UserRound size={17} />
                Iniciar sesión
              </Link>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 text-white transition-colors hover:bg-white/10 lg:hidden"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
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

      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-white/10 bg-primary-900 shadow-xl lg:hidden"
        >
          <div className="mx-auto max-w-7xl px-4 pb-6 pt-3 sm:px-6">
            <nav
              className="flex flex-col"
              aria-label="Navegación móvil"
            >
              {navLinks.map((link) => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center justify-between border-b border-white/10 px-2 py-4 text-[15px] font-semibold transition-colors ${
                      active
                        ? 'text-accent-300'
                        : 'text-white/85 hover:text-white'
                    }`}
                  >
                    {link.name}
                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {!isAccountPage && (
              <Link
                href="/agendar"
                onClick={() => setIsMenuOpen(false)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-accent-400"
              >
                <CalendarDays className="h-4 w-4" />
                Agendar cita
              </Link>
            )}

            {isPatient ? (
              <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                <Link
                  href="/mi-cuenta"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <UserRound size={18} />
                  Mi cuenta
                </Link>

                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-semibold text-white/80 hover:bg-white/10"
                >
                  <LogOut size={18} />
                  Cerrar sesión
                </button>
              </div>
            ) : status === 'unauthenticated' ? (
              <Link
                href="/iniciar-sesion"
                onClick={() => setIsMenuOpen(false)}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold text-white"
              >
                <UserRound size={18} />
                Iniciar sesión
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
