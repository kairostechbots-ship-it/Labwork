import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import GoogleCalendarSettings from './settings';

export default async function GoogleCalendarPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/api/auth/signin?callbackUrl=/admin/google-calendar');
  }

  if (session.user.role !== 'admin') {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-8">
          <h1 className="text-2xl font-bold text-slate-900">Acceso restringido</h1>
          <p className="mt-2 text-slate-600">Solo un administrador puede configurar Google Calendar.</p>
        </div>
      </main>
    );
  }

  return <GoogleCalendarSettings />;
}
