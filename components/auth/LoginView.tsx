import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

import { LoginForm } from './LoginForm';

export function LoginView() {
  return (
    <main className="min-h-[calc(100vh-90px)] bg-[#f7f9fc] px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-[460px]">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0b376d]"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        <div className="mb-8 text-center">
          <span className="inline-flex rounded-full bg-[#eaf5e3] px-4 py-1.5 text-xs font-semibold text-[#376b20]">
            PORTAL DE PACIENTES
          </span>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#0b376d] sm:text-4xl">
            Bienvenido de nuevo
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Inicia sesión para consultar tus citas y acceder
            a tu espacio personal.
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_12px_45px_rgba(15,45,80,0.05)] sm:p-8">
          <LoginForm />

          <div className="mt-7 border-t border-slate-100 pt-6 text-center">
            <p className="text-sm text-slate-600">
              ¿Todavía no tienes cuenta?{' '}
              <Link
                href="/registro"
                className="font-semibold text-[#0b376d] hover:underline"
              >
                Crear una cuenta
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
          <ShieldCheck size={16} className="text-[#5b9d30]" />
          Acceso seguro a tu cuenta de LabWork.
        </div>
      </div>
    </main>
  );
}