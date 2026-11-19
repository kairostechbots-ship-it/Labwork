import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function RegisterSuccess() {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
        <CheckCircle2 size={32} className="text-green-600" />
      </div>

      <h1 className="text-2xl font-semibold text-[#0b376d]">
        Registro recibido
      </h1>

      <p className="mt-3 text-sm leading-7 text-slate-600">
        Tu cuenta se registró correctamente y está pendiente
        de verificación.
      </p>

      <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-4 text-left text-sm leading-6 text-amber-900">
        La verificación por correo todavía no está habilitada.
        Tu cuenta permanecerá inactiva hasta completar ese proceso.
      </div>

      <Link
        href="/"
        className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b376d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#092c57]"
      >
        Volver al inicio
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}