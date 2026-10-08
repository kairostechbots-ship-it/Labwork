
import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  FlaskConical,
} from "lucide-react";

export default function AboutCTA() {
  return (
    <section className="bg-white px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-24">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-primary-900 px-6 py-10 shadow-[0_20px_50px_rgba(11,55,109,0.14)] sm:px-10 lg:px-12 lg:py-12">

        {/* ELEMENTOS DECORATIVOS */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-primary-700/50"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-12 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-primary-500/20"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary-700/50"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 right-12 h-36 w-36 rounded-full bg-primary-500/15"
        />

        {/* CONTENIDO */}
        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_1.1fr_auto] lg:gap-10">

          {/* TÍTULO */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-accent-400">
              Lab-Work Análisis Clínicos
            </p>

            <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
              Seguimos creciendo junto
              <span className="block text-accent-400">
                a nuestra comunidad
              </span>
            </h2>
          </div>

          {/* DESCRIPCIÓN */}
          <div className="border-white/20 lg:border-l lg:pl-9">
            <p className="max-w-[420px] text-sm leading-7 text-primary-100">
              Desde 2022 hemos crecido gracias a la confianza de
              nuestros pacientes. Hoy seguimos trabajando para estar
              más cerca de las familias de la Ribera de Chapala.
            </p>
          </div>

          {/* BOTONES */}
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link
              href="/estudios"
              className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-primary-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-50"
            >
              <FlaskConical className="h-4 w-4" />

              Explorar estudios

              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/agendar"
              className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_25px_rgba(122,203,59,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-600"
            >
              <CalendarDays className="h-4 w-4" />

              Agendar cita

              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
