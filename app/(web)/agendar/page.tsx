
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import AppointmentWizard from '@/components/appointments/AppointmentWizard';

/* ============================================================
   METADATOS DINÁMICOS SEGÚN IDIOMA
============================================================ */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('AppointmentMetadata');

  return {
    title: t('title'),
    description: t('description'),
  };
}

/* ============================================================
   PÁGINA DE AGENDAMIENTO
============================================================ */

export default function AgendarPage() {
  return <AppointmentWizard />;
}
