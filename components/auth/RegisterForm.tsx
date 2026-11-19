'use client';

import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react';

type RegisterFormData = {
  name: string;
  email: string;
  birthDate: string;
  password: string;
  confirmPassword: string;
};

const initialForm: RegisterFormData = {
  name: '',
  email: '',
  birthDate: '',
  password: '',
  confirmPassword: '',
};

interface RegisterFormProps {
  onSuccess: () => void;
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b376d] focus:ring-4 focus:ring-blue-100';

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function updateField(
    field: keyof RegisterFormData,
    value: string,
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (form.password.length < 12) {
      setError('La contraseña debe tener al menos 12 caracteres.');
      return;
    }

    const today = new Date().toLocaleDateString('en-CA');

    if (!form.birthDate || form.birthDate > today) {
      setError('Selecciona una fecha de nacimiento válida.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/patients/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          birthDate: form.birthDate,
          password: form.password,
        }),
      });

      const contentType = response.headers.get('content-type') || '';

if (!contentType.includes('application/json')) {
  console.error('Respuesta inesperada del servidor:', {
    status: response.status,
    url: response.url,
    contentType,
  });

  throw new Error(
    `El servidor devolvió una respuesta inesperada (${response.status}). Revisa la terminal de Next.js.`,
  );
}

const result = await response.json();

if (!response.ok) {
  throw new Error(
    result.error || 'No fue posible crear tu cuenta.',
  );
}

      onSuccess();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="register-name"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Nombre completo
        </label>

        <div className="relative">
          <UserRound
            size={17}
            className="pointer-events-none absolute left-4 top-3.5 text-slate-400"
          />

          <input
            id="register-name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={160}
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Nombre y apellidos"
            className={`${inputClass} pl-11`}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="register-email"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Correo electrónico
        </label>

        <div className="relative">
          <Mail
            size={17}
            className="pointer-events-none absolute left-4 top-3.5 text-slate-400"
          />

          <input
            id="register-email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="correo@ejemplo.com"
            className={`${inputClass} pl-11`}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="register-birthdate"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Fecha de nacimiento
        </label>

        <input
          id="register-birthdate"
          type="date"
          required
          max={new Date().toISOString().slice(0, 10)}
          value={form.birthDate}
          onChange={(e) => updateField('birthDate', e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="register-password"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Contraseña
        </label>

        <div className="relative">
          <LockKeyhole
            size={17}
            className="pointer-events-none absolute left-4 top-3.5 text-slate-400"
          />

          <input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={72}
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            placeholder="Mínimo 12 caracteres"
            className={`${inputClass} pl-11 pr-12`}
          />

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={
              showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
            className="absolute right-4 top-3.5 text-slate-400 transition hover:text-[#0b376d]"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="register-confirm-password"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Confirmar contraseña
        </label>

        <input
          id="register-confirm-password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={72}
          value={form.confirmPassword}
          onChange={(e) =>
            updateField('confirmPassword', e.target.value)
          }
          placeholder="Repite tu contraseña"
          className={inputClass}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7acb3b] px-5 py-3.5 text-sm font-semibold text-[#0b376d] transition hover:bg-[#6ab72f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}
        {!loading && <ArrowRight size={18} />}
      </button>
    </form>
  );
}