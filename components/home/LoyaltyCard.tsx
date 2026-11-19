
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Gift,
  Heart,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

export default function LoyaltyCard() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    // Respetar preferencias de accesibilidad.
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    if (
      reducedMotion.matches ||
      !('IntersectionObserver' in window)
    ) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="tarjeta-lealtad"
      aria-labelledby="loyalty-title"
      className="overflow-hidden bg-slate-50 px-4 py-16 sm:px-6 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">

          {/* INFORMACIÓN */}
          <div
            className={`transition-all duration-700 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
              isVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-8 opacity-0'
            }`}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-900">
              <Gift className="h-4 w-4" />
              Programa de lealtad
            </span>

            <h2
              id="loyalty-title"
              className="mt-6 text-3xl font-extrabold leading-tight text-blue-950 sm:text-4xl lg:text-5xl"
            >
              Tu salud merece
              <span className="block text-lime-600">
                beneficios especiales.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
              En LabWork queremos reconocer tu compromiso
              con el cuidado de tu salud. Con nuestra tarjeta
              de lealtad, cada visita al laboratorio te acerca
              a nuevos beneficios.
            </p>

            {/* BENEFICIOS */}
            <div className="mt-8 space-y-5">

              <div className="group flex items-start gap-4">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-800 transition-transform duration-300 group-hover:scale-110">
                  <Heart className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-bold text-blue-950">
                    Cada visita cuenta
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Acumula sellos por tus visitas al laboratorio.
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-4">
                <div className="rounded-xl bg-lime-100 p-3 text-lime-700 transition-transform duration-300 group-hover:scale-110">
                  <Gift className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-bold text-blue-950">
                    Recibe beneficios
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Al completar tu tarjeta podrás recibir
                    descuentos, regalos o estudios gratuitos,
                    según tu historial.
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-4">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-800 transition-transform duration-300 group-hover:scale-110">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-bold text-blue-950">
                    Sin fecha de vencimiento
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Tu tarjeta no caduca. Cuando la completes,
                    podrás comenzar una nueva.
                  </p>
                </div>
              </div>
            </div>

            {/* SOLICITAR TARJETA */}
            <div className="mt-10">
              <p className="mb-3 text-lg font-extrabold text-[#122a57]">
                ¡Solicita tu tarjeta de lealtad en LabWork!
              </p>

              <Link
                href="/sucursales"
                className="group inline-flex max-w-full items-center justify-center gap-2 rounded-xl bg-blue-900 px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-blue-800 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 motion-reduce:transform-none"
              >
                <MapPin className="h-5 w-5 shrink-0" />

                <span>
                  Encuentra tu sucursal LabWork
                </span>

                <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none" />
              </Link>

              <p className="mt-3 text-sm text-slate-500">
                Pídela directamente en el laboratorio.
              </p>
            </div>
          </div>

          {/* TARJETA ILUSTRATIVA */}
          <div
            className={`relative mx-auto w-full max-w-lg transition-all duration-1000 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
              isVisible
                ? 'translate-x-0 opacity-100'
                : 'translate-x-10 opacity-0'
            }`}
            style={{
              transitionDelay: isVisible ? '150ms' : '0ms',
            }}
          >
            {/* Resplandor de fondo */}
            <div className="pointer-events-none absolute -inset-5 rounded-[2.5rem] bg-lime-200/40 blur-3xl" />

            {/* Tarjeta */}
            <div className="group relative overflow-hidden rounded-[2rem] bg-[#07336B] p-6 text-white shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_30px_70px_rgba(7,51,107,0.28)] motion-reduce:transform-none sm:p-9">

              {/* Decoración */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-blue-500/20 transition-transform duration-700 group-hover:scale-110 motion-reduce:transform-none" />

              <div className="relative">
                {/* Encabezado */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">
                      LabWork
                    </p>

                    <h3 className="mt-2 text-2xl font-extrabold">
                      Tarjeta de lealtad
                    </h3>
                  </div>

                  <Gift className="h-8 w-8 shrink-0 text-lime-300 transition-transform duration-500 group-hover:rotate-12 motion-reduce:transform-none" />
                </div>

                {/* Nombre ilustrativo */}
                <div className="mt-8 rounded-xl bg-white/10 px-4 py-3">
                  <p className="text-xs text-blue-100">
                    Nombre del paciente
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    Tu nombre aquí
                  </p>
                </div>

                <p className="mt-8 text-center text-sm font-bold uppercase tracking-wide text-blue-100">
                  Cada visita te acerca a tu meta
                </p>

                {/* SELLOS */}
                <div className="mt-6 grid grid-cols-5 gap-3">
                  {Array.from({ length: 10 }, (_, index) => (
                    <div
                      key={index}
                      className={`flex aspect-square items-center justify-center rounded-full border-2 transition-transform duration-300 hover:scale-110 motion-reduce:transform-none ${
                        index === 9
                          ? 'border-lime-300 bg-lime-300 text-blue-950'
                          : 'border-white/70 bg-white'
                      }`}
                    >
                      {index === 9 && (
                        <span className="text-[9px] font-extrabold sm:text-xs">
                          META
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Beneficio */}
                <div className="mt-8 rounded-xl bg-lime-300 px-4 py-4 text-center text-blue-950">
                  <p className="text-sm font-extrabold">
                    ¡Completa tu tarjeta y descubre tus beneficios!
                  </p>
                </div>

                <p className="mt-4 text-center text-xs leading-5 text-blue-100">
                  Los beneficios se determinan de acuerdo con
                  el historial de cada paciente.
                </p>
              </div>
            </div>

            {/* Nota inferior */}
            <p className="mt-5 text-center text-xs text-slate-500">
              Representación ilustrativa de la tarjeta física.
              Solicítala directamente en el laboratorio.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
