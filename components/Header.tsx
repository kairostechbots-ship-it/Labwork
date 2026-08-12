'use client';
import Link from 'next/link';
import { Phone, MapPin, Menu, X, Activity } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Estudios', href: '#estudios' },
    { name: 'Sucursales', href: '#sucursales' },
    { name: 'Agendar Cita', href: '#agendar' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-900 flex items-center justify-center text-accent-400">
              <Activity className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">
              <span className="text-primary-900">Lab-</span><span className="text-accent-500">Work</span>
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <Link 
              href="/admin" 
              className="text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors ml-4"
            >
              Panel Admin
            </Link>
          </nav>
          
          <div className="hidden md:flex items-center gap-4">
            <a href="tel:5550101" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
              <Phone className="w-4 h-4" />
              <span>(555) 0101</span>
            </a>
            <a
              href="#agendar"
              className="inline-flex items-center justify-center rounded-full bg-accent-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-accent-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 transition-all active:scale-95"
            >
              Agendar Cita
            </a>
          </div>

          <div className="flex md:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-slate-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Toggle menu</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="space-y-1 px-4 pb-6 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-base font-medium text-slate-900 hover:bg-slate-50"
              >
                {link.name}
              </a>
            ))}
            <div className="mt-6 flex flex-col gap-3 px-3">
              <a href="tel:5550101" className="flex items-center gap-2 text-base font-medium text-slate-700">
                <Phone className="w-5 h-5 text-primary-600" />
                <span>(555) 0101</span>
              </a>
              <a
                href="#agendar"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center w-full rounded-full bg-accent-500 px-4 py-3 text-base font-bold text-white shadow-sm hover:bg-accent-600"
              >
                Agendar Cita
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
