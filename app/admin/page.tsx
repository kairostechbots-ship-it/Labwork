
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  CalendarCheck2,
  Clock3,
  FlaskConical,
  Package,
  MapPin,
  House,
  RefreshCw,
  AlertCircle,
  ClipboardList,
  ChevronRight,
  Activity,
  AlertTriangle,
} from 'lucide-react';

type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

type Appointment = {
  id: string;
  folio: string;
  patientName: string;
  requestedDate: string;
  requestedTime: string;
  type: 'home' | 'branch';
  branchId: string | null;
  status: AppointmentStatus;
  createdAt: string;
};

const modules = [
  {
    title: 'Gestión de citas',
    description:
      'Revisa solicitudes, confirma citas y da seguimiento a los pacientes.',
    href: '/admin/citas',
    icon: CalendarDays,
    color: 'blue',
  },
  {
    title: 'Estudios',
    description:
      'Administra los análisis disponibles y sus precios.',
    href: '/admin/estudios',
    icon: FlaskConical,
    color: 'green',
  },
  {
    title: 'Paquetes',
    description:
      'Organiza los paquetes y los estudios incluidos.',
    href: '/admin/paquetes',
    icon: Package,
    color: 'blue',
  },
  {
    title: 'Sucursales',
    description:
      'Consulta y actualiza la información de las sucursales.',
    href: '/admin/sucursales',
    icon: MapPin,
    color: 'green',
  },
];

function getStatusLabel(status: AppointmentStatus) {
  const labels: Record<AppointmentStatus, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Completada',
  };

  return labels[status] ?? status;
}

function getStatusClasses(status: AppointmentStatus) {
  switch (status) {
    case 'confirmed':
      return 'bg-green-50 text-green-700 ring-green-200';
    case 'pending':
      return 'bg-amber-50 text-amber-700 ring-amber-200';
    case 'cancelled':
      return 'bg-red-50 text-red-700 ring-red-200';
    case 'completed':
      return 'bg-primary-50 text-primary-700 ring-primary-200';
    default:
      return 'bg-slate-50 text-slate-600 ring-slate-200';
  }
}

// Fecha local del laboratorio: México.
const TIME_ZONE = 'America/Mexico_City';

function getTodayKey() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return `${get('year')}-${get('month')}-${get('day')}`;
}

function getCurrentTimeKey() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const hour =
    parts.find((part) => part.type === 'hour')?.value ?? '00';

  const minute =
    parts.find((part) => part.type === 'minute')?.value ?? '00';

  return `${hour}:${minute}`;
}

function getAppointmentDate(item: Appointment) {
  if (!item.requestedDate) return null;

  const date = new Date(`${item.requestedDate}T12:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date: Date | null) {
  if (!date) return 'Fecha no disponible';

  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatTime(item: Appointment) {
  if (!item.requestedTime) return 'Sin horario';

  return item.requestedTime.slice(0, 5);
}

function isOverdue(
  item: Appointment,
  today: string,
  currentTime: string
) {
  if (item.status !== 'pending') return false;

  if (!item.requestedDate) return false;

  if (item.requestedDate < today) return true;

  if (item.requestedDate > today) return false;

  if (!item.requestedTime) return false;

  return item.requestedTime.slice(0, 5) < currentTime;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent = 'blue',
}: {
  title: string;
  value: number | string;
  description: string;
  icon: typeof CalendarDays;
  accent?: 'blue' | 'green' | 'amber';
}) {
  const colors = {
    blue: 'bg-primary-50 text-primary-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="rounded-2xl border border-primary-100/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-primary-950">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${colors[accent]}`}
        >
          <Icon className="h-6 w-6" strokeWidth={1.9} />
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default function AdminPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Referencia de tiempo que se actualiza al consultar la API.
  const [referenceTime, setReferenceTime] = useState<Date>(
    () => new Date()
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadAppointments() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/appointments', {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `No se pudieron consultar las citas (${response.status}).`
          );
        }

        const result = await response.json();

        if (!Array.isArray(result.data)) {
          throw new Error(
            'La respuesta de citas no tiene el formato esperado.'
          );
        }

        if (!controller.signal.aborted) {
          setAppointments(result.data);
          setLastUpdated(new Date());
          setReferenceTime(new Date());
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : 'Ocurrió un error al consultar las citas.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadAppointments();

    return () => controller.abort();
  }, [refreshKey]);

  const today = useMemo(() => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(referenceTime);

    const get = (type: string) =>
      parts.find((part) => part.type === type)?.value ?? '';

    return `${get('year')}-${get('month')}-${get('day')}`;
  }, [referenceTime]);

  const currentTime = useMemo(() => {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(referenceTime);

    const hour =
      parts.find((part) => part.type === 'hour')?.value ?? '00';

    const minute =
      parts.find((part) => part.type === 'minute')?.value ?? '00';

    return `${hour}:${minute}`;
  }, [referenceTime]);

  const stats = useMemo(() => {
    const active = appointments.filter(
      (item) => item.status !== 'cancelled'
    );

    return {
      today: active.filter(
        (item) => item.requestedDate === today
      ).length,

      pending: appointments.filter(
        (item) => item.status === 'pending'
      ).length,

      confirmed: appointments.filter(
        (item) => item.status === 'confirmed'
      ).length,

      home: appointments.filter(
        (item) =>
          item.type === 'home' &&
          item.status === 'pending'
      ).length,

      overdue: appointments.filter((item) =>
        isOverdue(item, today, currentTime)
      ).length,
    };
  }, [appointments, today, currentTime]);

  // Citas que necesitan atención:
  // 1. Pendientes atrasadas
  // 2. Pendientes actuales y futuras
  // 3. Confirmadas actuales y futuras
  const attentionAppointments = useMemo(() => {
    return appointments
      .filter(
        (item) =>
          item.status === 'pending' ||
          item.status === 'confirmed'
      )
      .filter(
        (item) =>
          item.status === 'pending' ||
          item.requestedDate >= today
      )
      .sort((a, b) => {
        const aOverdue = isOverdue(a, today, currentTime);
        const bOverdue = isOverdue(b, today, currentTime);

        if (aOverdue !== bOverdue) {
          return aOverdue ? -1 : 1;
        }

        if (a.status !== b.status) {
          return a.status === 'pending' ? -1 : 1;
        }

        const dateA = `${a.requestedDate}T${a.requestedTime}`;
        const dateB = `${b.requestedDate}T${b.requestedTime}`;

        return dateA.localeCompare(dateB);
      })
      .slice(0, 5);
  }, [appointments, today, currentTime]);

  const currentDate = new Intl.DateTimeFormat('es-MX', {
    timeZone: TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(referenceTime);

  return (
    <div className="space-y-7">
      {/* BIENVENIDA */}
      <section className="relative overflow-hidden rounded-[26px] bg-primary-900 px-6 py-7 text-white shadow-[0_12px_35px_rgba(11,55,109,0.12)] sm:px-9 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border-[45px] border-white/[0.035]" />

        <div className="pointer-events-none absolute bottom-[-110px] right-[18%] h-60 w-60 rounded-full bg-accent-400/[0.07] blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white/85">
              <Activity className="h-3.5 w-3.5 text-accent-400" />
              CENTRO DE OPERACIONES
            </div>

            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Bienvenido a LabWork
              <span className="text-accent-400">.</span>
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
              Consulta la actividad del laboratorio y administra
              las solicitudes de tus pacientes desde un solo lugar.
            </p>

            <p className="mt-3 text-xs font-medium capitalize text-white/55">
              {currentDate}
            </p>
          </div>

          <Link
            href="/admin/citas"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-600"
          >
            Gestionar citas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* RESUMEN GENERAL */}
      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-primary-950">
              Resumen general
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Información de las citas registradas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-primary-100 bg-white px-4 py-2.5 text-xs font-bold text-primary-700 transition hover:bg-primary-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? 'animate-spin' : ''
              }`}
            />
            Actualizar
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-bold">
                No se pudo cargar la información
              </p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Citas de hoy"
            value={loading || error ? '—' : stats.today}
            description="Citas no canceladas para hoy"
            icon={CalendarDays}
          />

          <StatCard
            title="Pendientes"
            value={loading || error ? '—' : stats.pending}
            description="Solicitudes sin confirmar"
            icon={Clock3}
            accent="amber"
          />

          <StatCard
            title="Confirmadas"
            value={loading || error ? '—' : stats.confirmed}
            description="Citas confirmadas registradas"
            icon={CalendarCheck2}
            accent="green"
          />

          <StatCard
            title="A domicilio"
            value={loading || error ? '—' : stats.home}
            description="Solicitudes a domicilio pendientes"
            icon={House}
          />
        </div>

        {lastUpdated && !error && (
          <p className="mt-3 text-right text-[11px] text-slate-400">
            Actualizado a las{' '}
            {new Intl.DateTimeFormat('es-MX', {
              timeZone: TIME_ZONE,
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }).format(lastUpdated)}
          </p>
        )}
      </section>

      {/* ALERTA DE SOLICITUDES ATRASADAS */}
      {!loading && !error && stats.overdue > 0 && (
        <section className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-bold text-amber-900">
                {stats.overdue === 1
                  ? 'Tienes 1 solicitud pendiente con horario vencido'
                  : `Tienes ${stats.overdue} solicitudes pendientes con horario vencido`}
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-800/80">
                Estas citas aún requieren revisión.
                Su estado no se modifica automáticamente.
              </p>
            </div>
          </div>

          <Link
            href="/admin/citas"
            className="inline-flex shrink-0 items-center gap-2 self-start text-xs font-bold text-amber-900 hover:underline sm:self-center"
          >
            Revisar solicitudes
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      {/* CITAS Y ACCESOS RÁPIDOS */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
        {/* CITAS QUE REQUIEREN ATENCIÓN */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-primary-100/80 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary-100/80 px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-display text-lg font-bold text-primary-950">
                Citas que requieren atención
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Solicitudes pendientes y próximas confirmadas
              </p>
            </div>

            <Link
              href="/admin/citas"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 hover:text-primary-900"
            >
              Ver todas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : error ? (
            <div className="px-6 py-14 text-center">
              <AlertCircle className="mx-auto h-9 w-9 text-slate-300" />

              <p className="mt-3 text-sm text-slate-500">
                No fue posible consultar las citas.
              </p>
            </div>
          ) : attentionAppointments.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-500">
                <ClipboardList className="h-7 w-7" />
              </div>

              <p className="mt-4 text-sm font-bold text-primary-950">
                No hay citas que requieran atención
              </p>

              <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-slate-500">
                Las nuevas solicitudes pendientes aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-primary-50">
              {attentionAppointments.map((item) => {
                const date = getAppointmentDate(item);

                const overdue = isOverdue(
                  item,
                  today,
                  currentTime
                );

                return (
                  <Link
                    key={item.id}
                    href={`/admin/citas/${item.id}`}
                    className="group flex items-center gap-3 px-5 py-4 transition hover:bg-primary-50/50 sm:px-6"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        overdue
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-primary-50 text-primary-700'
                      }`}
                    >
                      {item.type === 'home' ? (
                        <House className="h-5 w-5" />
                      ) : (
                        <CalendarDays className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-primary-950">
                        {item.patientName || 'Paciente'}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.folio}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(date)}
                        {' · '}
                        {formatTime(item)}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        {item.type === 'home'
                          ? 'Toma a domicilio'
                          : 'Atención en sucursal'}
                      </p>

                      {overdue && (
                        <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                          <AlertTriangle className="h-3 w-3" />
                          Horario vencido
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`hidden rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset sm:inline-flex ${getStatusClasses(item.status)}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>

                      <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary-700" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ACCESOS RÁPIDOS */}
        <section className="rounded-2xl border border-primary-100/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="font-display text-lg font-bold text-primary-950">
              Accesos rápidos
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Administra los módulos del laboratorio.
            </p>
          </div>

          <div className="space-y-2">
            {modules.map((module) => {
              const Icon = module.icon;
              const green = module.color === 'green';

              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-primary-100 hover:bg-primary-50/60"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      green
                        ? 'bg-green-50 text-green-700'
                        : 'bg-primary-50 text-primary-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-primary-950">
                      {module.title}
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      {module.description}
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary-700" />
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
