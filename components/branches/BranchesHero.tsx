import { MapPin } from 'lucide-react';

export default function BranchesHero() {
  return (
    <section className="relative overflow-hidden border-b border-primary-100 bg-primary-50/40 py-16 sm:py-20">
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-32 h-[360px] w-[360px] rounded-full bg-accent-100/50 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-20 h-[300px] w-[300px] rounded-full bg-primary-100/50 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm">
          <MapPin className="h-4 w-4 text-accent-500" />
          Nuestras sucursales
        </div>

        <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-bold tracking-tight text-primary-950 sm:text-5xl">
          Encuentra tu sucursal
          <span className="text-accent-500"> Lab-Work</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          Consulta nuestras ubicaciones y horarios de atención.
        </p>
      </div>
    </section>
  );
}