
'use client';

import { useState, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b376d] focus:ring-4 focus:ring-blue-100';

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

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          'No pudimos iniciar sesión. Verifica tus credenciales o el estado de tu cuenta.',
        );
        return;
      }

      if (!result?.ok) {
        setError('No fue posible iniciar sesión. Intenta nuevamente.');
        return;
      }

      const destination = getSafeCallbackUrl();

      router.replace(destination);
      router.refresh();
    } catch {
      setError('Ocurrió un error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="login-email"
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
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="correo@ejemplo.com"
            className={`${inputClass} pl-11`}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="login-password"
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
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Ingresa tu contraseña"
            className={`${inputClass} pl-11 pr-12`}
          />

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={
              showPassword
                ? 'Ocultar contraseña'
                : 'Mostrar contraseña'
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
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7acb3b] px-5 py-3.5 text-sm font-semibold text-[#0b376d] transition hover:bg-[#6ab72f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        {!loading && <ArrowRight size={18} />}
      </button>
    </form>
  );
}
