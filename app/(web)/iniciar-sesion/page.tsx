
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { LoginView } from '@/components/auth/LoginView';

/* ============================================================
   METADATOS SEGÚN EL IDIOMA
============================================================ */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('LoginMetadata');

  return {
    title: t('title'),
    description: t('description'),
  };
}

/* ============================================================
   PÁGINA DE INICIO DE SESIÓN
============================================================ */

export default function LoginPage() {
  return <LoginView />;
}
