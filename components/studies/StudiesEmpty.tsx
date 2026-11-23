
'use client';

import { useTranslations } from 'next-intl';

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
  const t = useTranslations('StudiesEmpty');

  const content = {
    studies: {
      icon: FlaskConical,
      title: t('studies.title'),
      description: t('studies.description'),
    },
    packages: {
      icon: Package,
      title: t('packages.title'),
      description: t('packages.description'),
    },
    search: {
      icon: SearchX,
      title: t('search.title'),
      description: t('search.description'),
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
