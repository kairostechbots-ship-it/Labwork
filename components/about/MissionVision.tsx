
import { Eye, Target } from "lucide-react";

export default function MissionVision() {
  return (
    <section className="bg-white py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ENCABEZADO */}
        <div className="mb-9 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-600">
            Lo que guía nuestro trabajo
          </p>

          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary-950 sm:text-4xl">
            Misión y visión
          </h2>
        </div>

        {/* TARJETAS */}
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          {/* MISIÓN */}
          <article className="flex items-center gap-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgba(15,55,109,0.05)] transition-shadow hover:shadow-[0_12px_35px_rgba(15,55,109,0.09)]">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600">
              <Target size={30} strokeWidth={1.8} />
            </div>

            <div>
              <h3 className="font-display text-lg font-bold text-primary-950">
                Misión
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Acercar servicios de análisis clínicos a las familias de
                la Ribera de Chapala, ofreciendo una atención cercana,
                respetuosa y comprometida con cada paciente.
              </p>
            </div>
          </article>

          {/* VISIÓN */}
          <article className="flex items-center gap-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgba(15,55,109,0.05)] transition-shadow hover:shadow-[0_12px_35px_rgba(15,55,109,0.09)]">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
              <Eye size={30} strokeWidth={1.8} />
            </div>

            <div>
              <h3 className="font-display text-lg font-bold text-primary-950">
                Visión
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Continuar creciendo junto a nuestra comunidad,
                ampliando nuestra presencia y facilitando el acceso
                a servicios de análisis clínicos para más personas.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
