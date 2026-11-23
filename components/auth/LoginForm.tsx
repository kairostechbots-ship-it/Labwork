
'use client';

import { useState, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from 'lucide-react';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b376d] focus:ring-4 focus:ring-blue-100';

/* ============================================================
   REDIRECCIÓN SEGURA DESPUÉS DEL LOGIN
============================================================ */

function getSafeCallbackUrl(): string {
  const params = new URLSearchParams(window.location.search);
  const requestedUrl = params.get('callbackUrl');

  if (!requestedUrl) return '/mi-cuenta';

  // Solo permitimos rutas internas.
  if (
    !requestedUrl.startsWith('/') ||
    requestedUrl.startsWith('//') ||
    requestedUrl.includes('\\')
  ) {
    return '/mi-cuenta';
  }

  // Evitamos redirecciones circulares.
  const pathname = requestedUrl.split(/[?#]/)[0];

  if (
    pathname === '/iniciar-sesion' ||
    pathname === '/registro'
  ) {
    return '/mi-cuenta';
  }

  return requestedUrl;
}

/* ============================================================
   FORMULARIO DE INICIO DE SESIÓN
============================================================ */

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations('LoginForm');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<
    'invalidCredentials' | 'loginFailed' | 'unexpectedError' | null
  >(null);

  /* ============================================================
     ENVIAR FORMULARIO
  ============================================================ */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setErrorKey(null);
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrorKey('invalidCredentials');
        return;
      }

      if (!result?.ok) {
        setErrorKey('loginFailed');
        return;
      }

      const destination = getSafeCallbackUrl();

      router.replace(destination);
      router.refresh();
    } catch {
      setErrorKey('unexpectedError');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ========================================================
         CORREO ELECTRÓNICO
      ======================================================== */}

      <div>
        <label
          htmlFor="login-email"
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
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t('emailPlaceholder')}
            className={`${inputClass} pl-11`}
          />
        </div>
      </div>

      {/* ========================================================
         CONTRASEÑA
      ======================================================== */}

      <div>
        <label
          htmlFor="login-password"
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
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t('passwordPlaceholder')}
            className={`${inputClass} pl-11 pr-12`}
          />

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
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

      {/* ========================================================
         MENSAJES DE ERROR
      ======================================================== */}

      {errorKey && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {t(`errors.${errorKey}`)}
        </div>
      )}

      {/* ========================================================
         BOTÓN DE INICIO DE SESIÓN
      ======================================================== */}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7acb3b] px-5 py-3.5 text-sm font-semibold text-[#0b376d] transition hover:bg-[#6ab72f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? t('signingIn') : t('signIn')}

        {!loading && <ArrowRight size={18} />}
      </button>
    </form>
  );
}
