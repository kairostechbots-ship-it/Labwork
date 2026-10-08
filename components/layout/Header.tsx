'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { name: 'Inicio', href: '/' },
  { name: 'Estudios', href: '/estudios' },
  { name: 'Sucursales', href: '/sucursales' },
  { name: 'Nosotros', href: '/nosotros' },
  { name: 'Contacto', href: '/contacto' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname.startsWith(href);
  };

  return (
    <header
      className="
        sticky
        top-0
        z-50
        w-full
        border-b
        border-white/10
        bg-primary-900
        shadow-[0_4px_20px_rgba(15,23,42,0.08)]
      "
    >
      {/* =====================================================
          HEADER PRINCIPAL
      ====================================================== */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[82px] items-center justify-between">

          {/* LOGO */}
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="flex shrink-0 items-center"
            aria-label="Ir al inicio de Lab-Work"
          >
            <Image
              src="/images/labwork-logo-white.png"
              alt="Lab-Work Análisis Clínicos"
              width={260}
              height={80}
              priority
              className="
                h-auto
                w-[165px]
                transition-opacity
                duration-200
                hover:opacity-95
                sm:w-[180px]
                xl:w-[195px]
              "
            />
          </Link>

          {/* =====================================================
              NAVEGACIÓN DESKTOP
          ====================================================== */}
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
                  className={`
                    relative
                    rounded-lg
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    transition-all
                    duration-200

                    ${
                      active
                        ? 'text-white'
                        : 'text-white/75 hover:bg-white/[0.06] hover:text-white'
                    }

                    after:absolute
                    after:bottom-0
                    after:left-1/2
                    after:h-[2px]
                    after:-translate-x-1/2
                    after:rounded-full
                    after:bg-accent-400
                    after:transition-all
                    after:duration-200

                    ${
                      active
                        ? 'after:w-5'
                        : 'after:w-0 hover:after:w-5'
                    }
                  `}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* =====================================================
              ACCIÓN PRINCIPAL
          ====================================================== */}
          <div className="hidden items-center lg:flex">
            <Link
              href="/agendar"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-accent-500
                px-5
                py-3
                text-sm
                font-bold
                text-white
                shadow-[0_4px_14px_rgba(122,203,59,0.18)]
                transition-all
                duration-200
                hover:-translate-y-[1px]
                hover:bg-accent-400
                hover:shadow-[0_6px_18px_rgba(122,203,59,0.25)]
                active:translate-y-0
              "
            >
              <CalendarDays className="h-[17px] w-[17px]" />
              Agendar cita
            </Link>
          </div>

          {/* =====================================================
              BOTÓN MOBILE
          ====================================================== */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-lg
              border
              border-white/10
              text-white
              transition-colors
              hover:bg-white/10
              lg:hidden
            "
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

      {/* =====================================================
          MENÚ MOBILE
      ====================================================== */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="
            border-t
            border-white/10
            bg-primary-900
            shadow-xl
            lg:hidden
          "
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
                    className={`
                      flex
                      items-center
                      justify-between
                      border-b
                      border-white/10
                      px-2
                      py-4
                      text-[15px]
                      font-semibold
                      transition-colors

                      ${
                        active
                          ? 'text-accent-300'
                          : 'text-white/85 hover:text-white'
                      }
                    `}
                  >
                    {link.name}

                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* AGENDAR CITA MOBILE */}
            <div className="mt-5">
              <Link
                href="/agendar"
                onClick={() => setIsMenuOpen(false)}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-accent-500
                  px-5
                  py-3.5
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                  transition-all
                  duration-200
                  hover:bg-accent-400
                "
              >
                <CalendarDays className="h-4 w-4" />
                Agendar cita
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}