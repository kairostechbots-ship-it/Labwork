import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type AdminPageHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

/** Encabezado visual compartido por los módulos administrativos. */
export default function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <Link href="/admin" className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-primary-600 hover:text-primary-900">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>
        <h1 className="font-display text-2xl font-bold text-primary-950 sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
