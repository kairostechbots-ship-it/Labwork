'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

import { RegisterForm } from './RegisterForm';
import { RegisterSuccess } from './RegisterSuccess';

export function RegisterView() {
  const [registered, setRegistered] = useState(false);

  return (
    <main className="min-h-[calc(100vh-90px)] bg-[#f7f9fc] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-[520px]">
        <Link
          href="/"
          className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0b376d]"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        {registered ? (
          <RegisterSuccess />
        ) : (
          <>
            <div className="mb-7 text-center">
              <span className="inline-flex rounded-full bg-[#eaf5e3] px-4 py-1.5 text-xs font-semibold text-[#376b20]">
                PORTAL DE PACIENTES
              </span>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#0b376d] sm:text-4xl">
                Crea tu cuenta
              </h1>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                Regístrate para gestionar tus citas y acceder a
                tus servicios de LabWork.
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_12px_45px_rgba(15,45,80,0.05)] sm:p-8">
              <RegisterForm onSuccess={() => setRegistered(true)} />

              <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-600">
                  ¿Ya tienes una cuenta?{' '}
                  <Link
                    href="/iniciar-sesion"
                    className="font-semibold text-[#0b376d] hover:underline"
                  >
                    Iniciar sesión
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-start justify-center gap-2 text-center text-xs leading-5 text-slate-500">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#5b9d30]" />
              <p>
                Tus datos se utilizarán para gestionar tu cuenta
                y tus solicitudes de cita conforme al aviso de privacidad.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}