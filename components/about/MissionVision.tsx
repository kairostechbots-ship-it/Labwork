
import { getTranslations } from "next-intl/server";
import { Eye, Target } from "lucide-react";

export default async function MissionVision() {
  const t = await getTranslations("MissionVision");

  return (
    <section className="bg-white py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ENCABEZADO */}
        <div className="mb-9 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-600">
            {t("badge")}
          </p>

          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary-950 sm:text-4xl">
            {t("title")}
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
                {t("mission.title")}
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                {t("mission.description")}
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
                {t("vision.title")}
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                {t("vision.description")}
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
