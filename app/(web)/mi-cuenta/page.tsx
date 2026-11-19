import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { PatientAppointments } from '@/components/patients/PatientAppointments';

export default async function MiCuentaPage() {
  const session = await auth();
  if (!session?.user) redirect('/iniciar-sesion');
  if (session.user.role !== 'patient') redirect('/admin');

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-[#5b9d30]">PORTAL DE PACIENTES</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#0b376d]">
          Hola, {session.user.name}
        </h1>
        <p className="mt-2 text-slate-600">Consulta tus próximas citas y el historial de tus reservas en LabWork.</p>
        <PatientAppointments />
      </div>
    </main>
  );
}
