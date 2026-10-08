
import {
  ShieldCheck,
  UsersRound,
  BadgeCheck,
  FileText,
} from "lucide-react";

const values = [
  {
    title: "Confianza",
    description:
      "Construimos relaciones basadas en el respeto y la transparencia.",
    icon: ShieldCheck,
    tone: "green",
  },
  {
    title: "Cercanía",
    description:
      "Estamos presentes para nuestra comunidad y sus necesidades.",
    icon: UsersRound,
    tone: "blue",
  },
  {
    title: "Responsabilidad",
    description:
      "Actuamos con compromiso y profesionalismo en nuestro trabajo.",
    icon: BadgeCheck,
    tone: "green",
  },
  {
    title: "Claridad",
    description:
      "Buscamos ofrecer información comprensible a nuestros pacientes.",
    icon: FileText,
    tone: "blue",
  },
] as const;

export default function OurValues() {
  return (
    <section className="bg-primary-50/30 py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ENCABEZADO */}
        <div className="mb-9 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-600">
            Nuestros valores
          </p>

          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary-950 sm:text-4xl">
            Lo que nos impulsa cada día
          </h2>
        </div>

        {/* TARJETAS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => {
            const Icon = value.icon;
            const isGreen = value.tone === "green";

            return (
              <article
                key={value.title}
                className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_25px_rgba(15,55,109,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,55,109,0.09)]"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    isGreen
                      ? "bg-accent-50 text-accent-600"
                      : "bg-primary-50 text-primary-700"
                  }`}
                >
                  <Icon size={23} strokeWidth={1.8} />
                </div>

                <div className="min-w-0">
                  <h3 className="font-display text-[16px] font-bold text-primary-950">
                    {value.title}
                  </h3>

                  <p className="mt-1 text-[13px] leading-[21px] text-slate-500">
                    {value.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
