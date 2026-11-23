
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { RegisterView } from '@/components/auth/RegisterView';

/* ============================================================
   METADATOS SEGÚN EL IDIOMA
============================================================ */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('RegisterMetadata');

  return {
    title: t('title'),
    description: t('description'),
  };
}

/* ============================================================
   PÁGINA DE REGISTRO
============================================================ */

export default function RegisterPage() {
  return <RegisterView />;
}
