import {
  FlaskConical,
  Search,
} from 'lucide-react';

type StudiesHeroProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export default function StudiesHero({
  search,
  onSearchChange,
}: StudiesHeroProps) {
  return (
    <section className="relative overflow-hidden bg-primary-900">
      {/* Círculo decorativo derecho */}
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-32 h-80 w-80 rounded-full border border-white/10"
      />

      {/* Luz verde */}
      <div
        aria-hidden="true"
        className="absolute right-20 top-10 h-40 w-40 rounded-full bg-accent-500/10 blur-3xl"
      />

      {/* Luz azul inferior */}
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-primary-700/40 blur-3xl"
      />

      {/* Decoración derecha tipo laboratorio */}
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 hidden h-full w-[38%] lg:block"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-primary-800/50 to-transparent" />

        <div className="absolute right-20 top-1/2 flex -translate-y-1/2 items-end gap-4 opacity-[0.08]">
          <div className="h-32 w-10 rounded-b-2xl rounded-t-md border-4 border-white" />
          <div className="h-44 w-12 rounded-b-2xl rounded-t-md border-4 border-white" />
          <div className="h-36 w-10 rounded-b-2xl rounded-t-md border-4 border-white" />
          <div className="h-52 w-12 rounded-b-2xl rounded-t-md border-4 border-white" />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="max-w-4xl">
          {/* Etiqueta */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-primary-100">
            <FlaskConical className="h-4 w-4 text-accent-400" />

            Estudios y paquetes
          </div>

          {/* Título */}
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Encuentra el estudio{' '}
            <span className="text-accent-400">
              que necesitas
            </span>
          </h1>

          {/* Descripción */}
          <p className="mt-3 max-w-2xl text-base leading-7 text-primary-100/80 sm:text-lg">
            Consulta nuestro catálogo de estudios disponibles
            en Lab-Work.
          </p>

          {/* BUSCADOR */}
          <div className="relative mt-7 max-w-4xl">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-600" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                onSearchChange(event.target.value)
              }
              placeholder="Buscar estudio, análisis o perfil..."
              aria-label="Buscar estudio"
              className="
                h-[62px]
                w-full
                rounded-2xl
                border
                border-white/20
                bg-white
                pl-14
                pr-6
                text-[15px]
                font-medium
                text-primary-950
                shadow-[0_14px_35px_rgba(0,0,0,0.14)]
                outline-none
                transition-all
                duration-200
                placeholder:font-normal
                placeholder:text-slate-400
                focus:border-accent-400
                focus:ring-4
                focus:ring-accent-500/15
              "
            />
          </div>
        </div>
      </div>
    </section>
  );
}