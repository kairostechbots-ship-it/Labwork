
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import {
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export function RegisterSuccess() {
  const t = useTranslations('RegisterSuccess');

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10">

      {/* ICONO DE REGISTRO */}

      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
        <CheckCircle2
          size={32}
          className="text-green-600"
        />
      </div>

      {/* TÍTULO */}

      <h1 className="text-2xl font-semibold text-[#0b376d]">
        {t('title')}
      </h1>

      {/* DESCRIPCIÓN */}

      <p className="mt-3 text-sm leading-7 text-slate-600">
        {t('description')}
      </p>

      {/* AVISO DE VERIFICACIÓN */}

      <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-4 text-left text-sm leading-6 text-amber-900">
        {t('verificationNotice')}
      </div>

      {/* VOLVER AL INICIO */}

      <Link
        href="/"
        className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b376d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#092c57]"
      >
        {t('backToHome')}

        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
