import {
  FlaskConical,
  Package,
  SearchX,
} from 'lucide-react';

type StudiesEmptyProps = {
  type: 'studies' | 'packages' | 'search';
};

export default function StudiesEmpty({
  type,
}: StudiesEmptyProps) {
  const content = {
    studies: {
      icon: FlaskConical,
      title: 'No hay estudios disponibles',
      description:
        'Por el momento no hay estudios disponibles para mostrar.',
    },
    packages: {
      icon: Package,
      title: 'No hay paquetes disponibles',
      description:
        'Por el momento no hay paquetes disponibles para mostrar.',
    },
    search: {
      icon: SearchX,
      title: 'No encontramos resultados',
      description:
        'Intenta buscar con otro nombre o selecciona otra categoría.',
    },
  };

  const selected = content[type];
  const Icon = selected.icon;

  return (
    <div className="rounded-[28px] border border-slate-100 bg-slate-50/60 px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
        <Icon className="h-6 w-6" />
      </div>

      <h2 className="mt-5 font-display text-xl font-bold text-primary-950">
        {selected.title}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {selected.description}
      </p>
    </div>
  );
}