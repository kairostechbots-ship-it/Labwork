import Link from "next/link";

import {
  ArrowRight,
  Building2,
  HeartHandshake,
  MapPin,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type TimelineItem = {
  label: string;
  title: string;
  text: string;
  icon: LucideIcon;
  tone: "blue" | "green";
  side: "left" | "right";
};

const TIMELINE: TimelineItem[] = [
  {
    label: "2022",
    title: "Nuestro inicio",
    text: "Lab-Work inicia en San Antonio.",
    icon: Building2,
    tone: "blue",
    side: "left",
  },
  {
    label: "Crecimiento",
    title: "La confianza nos impulsa",
    text: "Seguimos creciendo junto a nuestros pacientes.",
    icon: HeartHandshake,
    tone: "green",
    side: "right",
  },
  {
    label: "Hoy",
    title: "Más cerca de ti",
    text: "4 sucursales en la Ribera de Chapala.",
    icon: MapPin,
    tone: "blue",
    side: "left",
  },
];

export default function OurHistory() {
  return (
    <section className="relative overflow-hidden border-t border-primary-100/60 bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
          {/* =====================================================
              IZQUIERDA — HISTORIA
          ====================================================== */}
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-accent-700">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
              Nuestra historia
            </div>

            <h2 className="mt-4 max-w-[560px] font-display text-3xl font-bold tracking-[-0.035em] text-primary-950 sm:text-4xl lg:text-[42px] lg:leading-[1.12]">
              Una historia que sigue{" "}
              <span className="text-accent-500">creciendo</span>
            </h2>

            <div className="mt-6 max-w-[610px] space-y-4 text-[15px] leading-7 text-slate-600 sm:text-base">
              <p>
                Lab-Work inició en 2022 en San Antonio con el propósito de
                acercar servicios de análisis clínicos a la comunidad.
              </p>

              <p>
                Gracias a la confianza de nuestros pacientes, hemos
                continuado creciendo para brindar mayor comodidad y estar
                cada vez más cerca de quienes nos eligen.
              </p>

              <p>
                Hoy contamos con{" "}
                <strong className="font-semibold text-primary-950">
                  4 sucursales en la Ribera de Chapala
                </strong>
                , manteniendo la cercanía y atención que han acompañado
                nuestro crecimiento desde el inicio.
              </p>
            </div>

            <Link
              href="/sucursales"
              className="group mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary-800 transition-colors hover:text-accent-600"
            >
              Conoce nuestras sucursales
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* =====================================================
              DERECHA — LÍNEA DE TIEMPO
          ====================================================== */}
          <div className="relative mx-auto w-full max-w-[500px]">
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-50/70"
            />

            <ol className="relative z-10 py-6">
              {TIMELINE.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === TIMELINE.length - 1;
                const isLeft = item.side === "left";

                const nodeTone =
                  item.tone === "blue"
                    ? "bg-primary-700 shadow-[0_8px_20px_rgba(15,55,109,0.15)]"
                    : "bg-accent-500 shadow-[0_8px_20px_rgba(122,203,59,0.20)]";

                return (
                  <li
                    key={item.label}
                    className={`relative grid grid-cols-[44px_1fr] items-start gap-4 sm:grid-cols-[1fr_44px_1fr] sm:gap-5 ${
                      isLast ? "" : "pb-12"
                    }`}
                  >
                    {/* LÍNEA: del centro de este nodo al centro del siguiente */}
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className="absolute left-[22px] top-[22px] h-full w-px -translate-x-1/2 bg-primary-200 sm:left-1/2"
                      />
                    )}

                    {/* NODO */}
                    <div
                      aria-hidden="true"
                      className={`relative z-10 col-start-1 row-start-1 flex h-11 w-11 items-center justify-center rounded-full border-[5px] border-white text-white sm:col-start-2 ${nodeTone}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* TEXTO */}
                    <div
                      className={`col-start-2 row-start-1 pt-0.5 text-left ${
                        isLeft
                          ? "sm:col-start-1 sm:pr-2 sm:text-right"
                          : "sm:col-start-3 sm:pl-2"
                      }`}
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent-700">
                        {item.label}
                      </p>

                      <h3 className="mt-1 font-display text-lg font-bold text-primary-950">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        {item.text}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}