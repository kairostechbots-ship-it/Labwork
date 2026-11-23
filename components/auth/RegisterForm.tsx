
'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';

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

type RegisterErrorKey =
  | 'passwordMismatch'
  | 'passwordTooShort'
  | 'invalidBirthDate'
  | 'registrationFailed'
  | 'unexpectedResponse'
  | 'unexpectedError';

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

/* ============================================================
   FECHA LOCAL EN FORMATO YYYY-MM-DD
============================================================ */

function getTodayLocalDate(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/* ============================================================
   FORMULARIO DE REGISTRO
============================================================ */

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const t = useTranslations('RegisterForm');

  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errorKey, setErrorKey] =
    useState<RegisterErrorKey | null>(null);

  const [serverError, setServerError] = useState('');

  /* ============================================================
     ACTUALIZAR CAMPOS
  ============================================================ */

  function updateField(
    field: keyof RegisterFormData,
    value: string,
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrorKey(null);
    setServerError('');
  }

  /* ============================================================
     ENVIAR REGISTRO
  ============================================================ */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setErrorKey(null);
    setServerError('');

    if (form.password !== form.confirmPassword) {
      setErrorKey('passwordMismatch');
      return;
    }

    if (form.password.length < 12) {
      setErrorKey('passwordTooShort');
      return;
    }

    const today = getTodayLocalDate();

    if (
      !form.birthDate ||
      !/^\d{4}-\d{2}-\d{2}$/.test(form.birthDate) ||
      form.birthDate > today ||
      Number.isNaN(
        new Date(`${form.birthDate}T12:00:00`).getTime()
      )
    ) {
      setErrorKey('invalidBirthDate');
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

      const contentType =
        response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        console.error('Unexpected server response:', {
          status: response.status,
          url: response.url,
          contentType,
        });

        setErrorKey('unexpectedResponse');
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        // El backend puede devolver errores en español.
        // No los mostramos directamente para mantener la interfaz bilingüe.
        console.error('Patient registration failed:', {
          status: response.status,
          error: result?.error,
        });

        setErrorKey('registrationFailed');
        return;
      }

      onSuccess();
    } catch (error) {
      console.error('Patient registration error:', error);

      setErrorKey('unexpectedError');
    } finally {
      setLoading(false);
    }
  }

  const displayedError = errorKey
    ? t(`errors.${errorKey}`)
    : serverError;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* NOMBRE COMPLETO */}

      <div>
        <label
          htmlFor="register-name"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {t('nameLabel')}
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
            onChange={(e) =>
              updateField('name', e.target.value)
            }
            placeholder={t('namePlaceholder')}
            className={`${inputClass} pl-11`}
          />
        </div>
      </div>

      {/* CORREO ELECTRÓNICO */}

      <div>
        <label
          htmlFor="register-email"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {t('emailLabel')}
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
            onChange={(e) =>
              updateField('email', e.target.value)
            }
            placeholder={t('emailPlaceholder')}
            className={`${inputClass} pl-11`}
          />
        </div>
      </div>

      {/* FECHA DE NACIMIENTO */}

      <div>
        <label
          htmlFor="register-birthdate"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {t('birthDateLabel')}
        </label>

        <input
          id="register-birthdate"
          type="date"
          required
          max={getTodayLocalDate()}
          value={form.birthDate}
          onChange={(e) =>
            updateField('birthDate', e.target.value)
          }
          className={inputClass}
        />
      </div>

      {/* CONTRASEÑA */}

      <div>
        <label
          htmlFor="register-password"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {t('passwordLabel')}
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
            onChange={(e) =>
              updateField('password', e.target.value)
            }
            placeholder={t('passwordPlaceholder')}
            className={`${inputClass} pl-11 pr-12`}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword((value) => !value)
            }
            aria-label={
              showPassword
                ? t('hidePassword')
                : t('showPassword')
            }
            className="absolute right-4 top-3.5 text-slate-400 transition hover:text-[#0b376d]"
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
      </div>

      {/* CONFIRMAR CONTRASEÑA */}

      <div>
        <label
          htmlFor="register-confirm-password"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {t('confirmPasswordLabel')}
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
          placeholder={t('confirmPasswordPlaceholder')}
          className={inputClass}
        />
      </div>

      {/* MENSAJE DE ERROR */}

      {displayedError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {displayedError}
        </div>
      )}

      {/* BOTÓN DE REGISTRO */}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7acb3b] px-5 py-3.5 text-sm font-semibold text-[#0b376d] transition hover:bg-[#6ab72f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? t('creatingAccount') : t('createAccount')}

        {!loading && <ArrowRight size={18} />}
      </button>
    </form>
  );
}
