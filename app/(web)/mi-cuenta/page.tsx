
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { auth } from '@/auth';
import { PatientAppointments } from '@/components/patients/PatientAppointments';

/* ============================================================
   METADATOS SEGÚN EL IDIOMA
============================================================ */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('PatientAccountMetadata');

  return {
    title: t('title'),
    description: t('description'),
    robots: {
      index: false,
      follow: false,
    },
  };
}

/* ============================================================
   PORTAL DE PACIENTES
============================================================ */

export default async function MiCuentaPage() {
  const session = await auth();

  // Usuario sin sesión.
  if (!session?.user) {
    redirect('/iniciar-sesion');
  }

  // Solo pacientes pueden acceder a esta página.
  if (session.user.role !== 'patient') {
    redirect('/admin');
  }

  const t = await getTranslations('PatientAccount');

  return (
    <div className="min-h-screen bg-[#f7f9fc] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">

        {/* IDENTIFICADOR DEL PORTAL */}

        <p className="text-sm font-semibold text-[#5b9d30]">
          {t('badge')}
        </p>

        {/* BIENVENIDA */}

        <h1 className="mt-3 text-3xl font-semibold text-[#0b376d]">
          {t('greeting', {
            name: session.user.name || t('defaultName'),
          })}
        </h1>

        {/* DESCRIPCIÓN */}

        <p className="mt-2 text-slate-600">
          {t('description')}
        </p>

        {/* CITAS DEL PACIENTE */}

        <PatientAppointments />
      </div>
    </div>
  );
}
