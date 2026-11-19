'use client';

import { useEffect, useState } from 'react';

import type { FormEvent } from 'react';

import {

  ArrowLeft,

  ArrowRight,

  Building2,

  CalendarDays,

  Clock3,

  Check,

  ClipboardList,

  MapPin,

  Phone,

  Navigation,

  Printer,

  RefreshCw,

  UserRound,

} from 'lucide-react';

type Branch = {

  id: string;

  name: string;

  address: string;

  phone?: string | null;

  mapUrl?: string | null;

  isActive: boolean;

};

type AvailabilitySlot = { time: string; available: boolean; remaining: number | null };

type Availability = {

  branchId: string;

  branchName: string;

  date: string;

  closed: boolean;

  slotMinutes: number;

  capacity: number | null;

  slots: AvailabilitySlot[];

};

type PatientProfile = {

  id: string;

  name: string;

  email: string;

  birthDate: string | null;

};

function todayInMexico() {

  return new Intl.DateTimeFormat('sv-SE', {

    timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit',

  }).format(new Date());

}

function formatDate(date: string) {

  if (!date) return '';

  return new Intl.DateTimeFormat('es-MX', {

    dateStyle: 'full', timeZone: 'UTC',

  }).format(new Date(`${date}T12:00:00Z`));

}

const steps = [

  { label: 'Atención', icon: Building2 },

  { label: 'Horario', icon: CalendarDays },

  { label: 'Tus datos', icon: UserRound },

  { label: 'Resumen', icon: ClipboardList },

];

function BranchContactActions({ branch }: { branch?: Branch }) {

  if (!branch) return null;

  const phone = branch.phone?.trim() ?? '';

  const dialNumber = phone.replace(/[^\d+]/g, '');

  const configuredMap = branch.mapUrl?.trim() ?? '';

  
const mapUrl =
  configuredMap.startsWith('https://') ||
  configuredMap.startsWith('http://')
    ? configuredMap
    : branch.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}`
      : '';

   

  

  if (!mapUrl && !dialNumber) return null;

  return (

    <div className="mt-4 flex flex-wrap gap-2">

      {mapUrl && (

        <a href={mapUrl} target="_blank" rel="noopener noreferrer"

          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary-900 px-4 py-2 text-sm font-semibold text-primary-900 transition hover:bg-blue-50">

          <Navigation className="h-4 w-4" /> Cómo llegar

        </a>

      )}

      {dialNumber && (

        <a href={`tel:${dialNumber}`}

          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-primary-900 transition hover:bg-slate-100">

          <Phone className="h-4 w-4" /> Llamar: {phone}

        </a>

      )}

    </div>

  );

}

const QUOTATION_STORAGE_KEY = 'labwork:quotation:v1';

type SavedQuotationItem = { type: 'study' | 'package'; id: string };

type CatalogQuotationItem = SavedQuotationItem & { name: string; price: number | null };

function readQuotation(): SavedQuotationItem[] {

  try {

    const raw = window.localStorage.getItem(QUOTATION_STORAGE_KEY);

    const parsed: unknown = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) return [];

    const seen = new Set<string>();

    return parsed.filter((entry): entry is SavedQuotationItem => {

      if (!entry || typeof entry !== 'object') return false;

      const item = entry as Record<string, unknown>;

      if ((item.type !== 'study' && item.type !== 'package') || typeof item.id !== 'string' || !item.id.trim()) return false;

      const key = `${item.type}:${item.id}`;

      if (seen.has(key)) return false;

      seen.add(key);

      return true;

    });

  } catch { return []; }

}

function catalogPrice(value: unknown): number | null {

  if (value === null || value === undefined || value === '') return null;

  const number = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(number) && number >= 0 ? number : null;

}

function money(amount: number) {

  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

}

export default function AppointmentWizard() {

  const [branches, setBranches] = useState<Branch[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [appointmentType, setAppointmentType] = useState<'branch' | 'home'>('branch');
  const [homeAddress, setHomeAddress] = useState('');
  const [locationUrl, setLocationUrl] = useState('');
  const [homeError, setHomeError] = useState('');

  const [step, setStep] = useState(0);

  const [requestedDate, setRequestedDate] = useState('');

  const [requestedTime, setRequestedTime] = useState('');

  const [availability, setAvailability] = useState<Availability | null>(null);

  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const [availabilityError, setAvailabilityError] = useState('');

  const [availabilityReload, setAvailabilityReload] = useState(0);

  const [today, setToday] = useState('');

  const [patientName, setPatientName] = useState('');

  const [profileLoading, setProfileLoading] = useState(true);

  const [profileError, setProfileError] = useState('');

  const [birthDate, setBirthDate] = useState('');

  const [phone, setPhone] = useState('');

  const [email, setEmail] = useState('');

  const [patientErrors, setPatientErrors] = useState<Record<string, string>>({});

  const [bookingLoading, setBookingLoading] = useState(false);

  const [bookingError, setBookingError] = useState('');

  const [bookingSuccess, setBookingSuccess] = useState<{ id: string; folio: string | null; status: string } | null>(null);

  const [slotTaken, setSlotTaken] = useState(false);

  const [quotationItems, setQuotationItems] = useState<CatalogQuotationItem[]>([]);

  const [quotationLoading, setQuotationLoading] = useState(true);

  const [quotationError, setQuotationError] = useState('');

  const [quotationInvalid, setQuotationInvalid] = useState(false);

  const [quotationRevision, setQuotationRevision] = useState(0);
  const minAppointmentDate = appointmentType === 'home' && today ? (() => { const d = new Date(`${today}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); })() : today;

  useEffect(() => {

    const controller = new AbortController();

    async function loadQuotation() {

      setQuotationLoading(true);

      setQuotationError('');

      setQuotationInvalid(false);

      try {

        const saved = readQuotation();

        if (saved.length === 0) {

          setQuotationItems([]);

          return;

        }

        const [studiesResponse, packagesResponse] = await Promise.all([

          fetch('/api/services', { cache: 'no-store', signal: controller.signal }),

          fetch('/api/packages', { cache: 'no-store', signal: controller.signal }),

        ]);

        if (!studiesResponse.ok || !packagesResponse.ok) throw new Error('No pudimos validar los estudios y paquetes seleccionados.');

        const [studiesBody, packagesBody] = await Promise.all([studiesResponse.json(), packagesResponse.json()]);

        if (!Array.isArray(studiesBody.data) || !Array.isArray(packagesBody.data)) throw new Error('El catálogo devolvió una respuesta inválida.');

        const studies = studiesBody.data as Array<{ id: string; name: string; price?: unknown; isActive: boolean }>;

        const packages = packagesBody.data as Array<{ id: string; name: string; price?: unknown; isActive: boolean }>;

        const restored: CatalogQuotationItem[] = [];

        let invalid = false;

        for (const item of saved) {

          const source = (item.type === 'study' ? studies : packages).find((entry) => entry.id === item.id && entry.isActive);

          if (!source) { invalid = true; continue; }

          restored.push({ type: item.type, id: item.id, name: source.name, price: catalogPrice(source.price) });

        }

        if (controller.signal.aborted) return;

        setQuotationItems(restored);

        setQuotationInvalid(invalid);

        if (invalid) setQuotationError('Algunos elementos ya no están disponibles. Revisa tu cotización antes de confirmar.');

      } catch (error) {

        if (!controller.signal.aborted) setQuotationError(error instanceof Error ? error.message : 'No se pudo cargar la cotización.');

      } finally {

        if (!controller.signal.aborted) setQuotationLoading(false);

      }

    }

    void loadQuotation();

    return () => controller.abort();

  }, [quotationRevision]);

  const quotationSubtotal = quotationItems.reduce((sum, item) => sum + (item.price ?? 0), 0);

  const quotationMissingPrices = quotationItems.some((item) => item.price === null);

  const quotationBlocked = quotationLoading || Boolean(quotationError) || quotationInvalid || quotationItems.length === 0;

  async function submitAppointment() {

    if (bookingLoading || bookingSuccess || profileLoading || profileError || quotationBlocked) return;

    setBookingLoading(true);

    setBookingError('');

    setSlotTaken(false);

    try {

      if (!selectedBranchId || !requestedDate || !requestedTime) {

        throw new Error('Falta seleccionar una sucursal, fecha u horario.');

      }

      if (appointmentType === 'home' && requestedDate < minAppointmentDate) { throw new Error('La toma a domicilio debe solicitarse al menos con un día de anticipación.'); }
      if (appointmentType === 'home' && homeAddress.trim().length < 5) {
        throw new Error('Ingresa una dirección completa para la toma a domicilio.');
      }
      if (appointmentType === 'home' && locationUrl.trim()) {
        const parsed = new URL(locationUrl.trim());
        if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('El enlace de ubicación debe ser HTTP o HTTPS.');
      }
      const response = await fetch('/api/appointments', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          patientName: patientName.trim(),

          birthDate,

          phone: phone.replace(/\D/g, ''),

          email: email.trim().toLowerCase(),

          type: appointmentType,
          address: appointmentType === 'home' ? homeAddress.trim() : null,
          locationUrl: appointmentType === 'home' ? (locationUrl.trim() || null) : null,

          branchId: selectedBranchId,

          requestedDate,

          requestedTime,

          serviceIds: quotationItems.filter((item) => item.type === 'study').map((item) => item.id),

          packageIds: quotationItems.filter((item) => item.type === 'package').map((item) => item.id),

        }),

      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {

        if (response.status === 409) setSlotTaken(true);

        if (response.status === 401) {

          window.location.assign('/iniciar-sesion?callbackUrl=%2Fagendar');

          return;

        }

        const message = payload?.error?.message ?? payload?.error ?? payload?.message;

        throw new Error(typeof message === 'string' ? message : 'No se pudo registrar la cita. Intenta nuevamente.');

      }

      if (!payload?.data?.id) throw new Error('El servidor no devolvió el identificador de la cita. Verifica el registro antes de reintentar.');

      setBookingSuccess({

        id: payload.data.id,

        folio: typeof payload.data.folio === 'string' && payload.data.folio.trim()

          ? payload.data.folio.trim()

          : null,

        status: payload.data.status ?? 'pending',

      });

    } catch (err) {

      setBookingError(err instanceof Error ? err.message : 'No se pudo registrar la cita.');

    } finally {

      setBookingLoading(false);

    }

  }

  function handlePatientContinue(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    const errors: Record<string, string> = {};

    const cleanPhone = phone.replace(/\D/g, '');

    if (profileLoading || profileError || !patientName || !email || !birthDate) {

      errors.profile = 'No se pudo validar tu cuenta. Revisa los datos de tu perfil.';

    }

    if (cleanPhone.length !== 10) {

      errors.phone = 'Ingresa un teléfono de 10 dígitos.';

    }

    setPatientErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setPhone(cleanPhone);

    setStep(3);

  }

  useEffect(() => {

    const controller = new AbortController();

    async function loadProfile() {

      try {

        const response = await fetch('/api/patients/me', {

          cache: 'no-store',

          signal: controller.signal,

        });

        if (response.status === 401) {

          window.location.assign('/iniciar-sesion?callbackUrl=%2Fagendar');

          return;

        }

        const payload = await response.json().catch(() => null);

        if (!response.ok) {

          throw new Error(payload?.error?.message ?? 'No fue posible cargar tu perfil.');

        }

        if (!payload?.data?.id || !payload.data.name || !payload.data.email) {

          throw new Error('Los datos de tu cuenta están incompletos.');

        }

        const patient = payload.data as PatientProfile;

        if (!controller.signal.aborted) {

          setPatientName(patient.name);

          setEmail(patient.email);

          setBirthDate(patient.birthDate ?? '');

          if (!patient.birthDate) {

            setProfileError('Tu cuenta no tiene fecha de nacimiento. Actualízala en tu perfil antes de reservar.');

          }

        }

      } catch (err) {

        if (!controller.signal.aborted) {

          setProfileError(err instanceof Error ? err.message : 'No fue posible cargar tu perfil.');

        }

      } finally {

        if (!controller.signal.aborted) setProfileLoading(false);

      }

    }

    void loadProfile();

    return () => controller.abort();

  }, []);

  useEffect(() => {

    const localToday = todayInMexico();

    setToday(localToday);

    setRequestedDate(localToday);

  }, []);

  useEffect(() => {

    if (step !== 1 || !selectedBranchId || !requestedDate) return;

    const controller = new AbortController();

    setAvailability(null);

    setAvailabilityError('');

    setAvailabilityLoading(true);

    setRequestedTime('');

    async function loadAvailability() {

      try {

        const params = new URLSearchParams({ branchId: selectedBranchId, date: requestedDate, type: appointmentType });

        const response = await fetch(`/api/availability?${params.toString()}`, {

          cache: 'no-store', signal: controller.signal,

        });

        const payload = await response.json();

        if (!response.ok) { const message = payload?.error?.message ?? payload?.error ?? payload?.message; throw new Error(typeof message === 'string' ? message : 'No se pudieron consultar los horarios.'); }

        if (!payload?.data || !Array.isArray(payload.data.slots)) {

          throw new Error('La respuesta de disponibilidad no es válida.');

        }

        if (!controller.signal.aborted) setAvailability(payload.data as Availability);

      } catch (err) {

        if (controller.signal.aborted) return;

        setAvailabilityError(err instanceof Error ? err.message : 'Error al consultar horarios.');

      } finally {

        if (!controller.signal.aborted) setAvailabilityLoading(false);

      }

    }

    void loadAvailability();

    return () => controller.abort();

  }, [step, selectedBranchId, requestedDate, appointmentType, availabilityReload]);

  async function loadBranches(signal?: AbortSignal) {

    setLoading(true);

    setError('');

    try {

      const response = await fetch('/api/branches', {

        cache: 'no-store',

        signal,

      });

      if (!response.ok) {

        throw new Error('No se pudieron cargar las sucursales.');

      }

      const payload = await response.json();

      // Se espera la respuesta { data: Branch[] }.

      if (!Array.isArray(payload.data)) {

        throw new Error('El formato de sucursales no es válido.');

      }

      const activeBranches = (payload.data as Branch[]).filter(

        (branch) => branch.isActive

      );

      setBranches(activeBranches);

    } catch (err) {

      if (signal?.aborted) return;

      setError(

        err instanceof Error

          ? err.message

          : 'Ocurrió un error al cargar las sucursales.'

      );

    } finally {

      if (!signal?.aborted) setLoading(false);

    }

  }

  useEffect(() => {

    const controller = new AbortController();

    void loadBranches(controller.signal);

    return () => controller.abort();

  }, []);

  const selectedBranch = branches.find(

    (branch) => branch.id === selectedBranchId

  );

  return (

    <>

      <main className="min-h-screen bg-slate-50 print:hidden">

        {/* Encabezado */}

        <section className="bg-primary-900 px-4 py-12 text-white sm:py-16">

          <div className="mx-auto max-w-6xl">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">

              <CalendarDays className="h-4 w-4 text-lime-300" />

              AGENDAMIENTO EN LÍNEA

            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">

              Agenda tu cita

            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">

              Elige dónde deseas realizar tus estudios.

              Te guiaremos durante el proceso.

            </p>

          </div>

        </section>

        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">

          {/* Indicador de pasos */}

          <div className="mb-7 grid grid-cols-4 gap-2 sm:mb-10">

            {steps.map((item, index) => {

              const Icon = item.icon;

              const active = index === step;

              const completed = index < step;

              return (

                <div

                  key={item.label}

                  className="flex flex-col items-center gap-2"

                >

                  <div

                    className={[

                      'flex h-10 w-10 items-center justify-center rounded-full border transition-colors sm:h-12 sm:w-12',

                      active

                        ? 'border-primary-900 bg-primary-900 text-white'

                        : completed

                          ? 'border-lime-500 bg-lime-100 text-green-800'

                          : 'border-slate-200 bg-white text-slate-400',

                    ].join(' ')}

                  >

                    {completed ? (

                      <Check className="h-5 w-5" />

                    ) : (

                      <Icon className="h-5 w-5" />

                    )}

                  </div>

                  <span

                    className={[

                      'text-center text-[11px] font-semibold sm:text-sm',

                      active ? 'text-primary-900' : 'text-slate-500',

                    ].join(' ')}

                  >

                    {item.label}

                  </span>

                </div>

              );

            })}

          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">

            {/* Formulario */}

            <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-8">

              {step === 0 ? (

                <>

                  <div className="mb-7">

                    <span className="text-xs font-bold uppercase tracking-widest text-green-700">

                      Paso 1 de 4

                    </span>

                    <h2 className="mt-2 text-xl font-bold text-primary-900 sm:text-2xl">

                      ¿Dónde deseas recibir atención?

                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">

                      Elige atención presencial o una toma de muestra a domicilio.

                    </p>

                  </div>

                  <div className="mb-6 grid gap-3 sm:grid-cols-2">
                    {([['branch', 'En sucursal', 'Acude al laboratorio'], ['home', 'A domicilio', 'Solicita una visita a tu dirección']] as const).map(([type, title, detail]) => (
                      <button key={type} type="button" aria-pressed={appointmentType === type}
                        onClick={() => { setAppointmentType(type); setRequestedTime(''); setAvailability(null); setHomeError(''); setRequestedDate(type === 'home' ? (() => { const d = new Date(`${today || todayInMexico()}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); })() : (today || todayInMexico())); }}
                        className={`rounded-2xl border-2 p-4 text-left transition ${appointmentType === type ? 'border-primary-900 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                        <span className="flex items-center gap-2 font-bold text-primary-900">{type === 'home' ? <MapPin className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}{title}</span>
                        <span className="mt-2 block text-sm text-slate-600">{detail}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mb-4 text-sm font-semibold text-slate-700">{appointmentType === 'home' ? 'Sucursal responsable de tu solicitud' : 'Selecciona tu sucursal'}</p>
                  {loading && (

                    <div className="space-y-3" role="status">

                      {[1, 2, 3].map((item) => (

                        <div

                          key={item}

                          className="h-24 animate-pulse rounded-2xl bg-slate-100"

                        />

                      ))}

                      <span className="sr-only">

                        Cargando sucursales...

                      </span>

                    </div>

                  )}

                  {!loading && error && (

                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

                      <p className="text-sm text-red-700">{error}</p>

                      <button

                        type="button"

                        onClick={() => void loadBranches()}

                        className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-red-700"

                      >

                        <RefreshCw className="h-4 w-4" />

                        Intentar de nuevo

                      </button>

                    </div>

                  )}

                  {!loading && !error && branches.length === 0 && (

                    <div className="rounded-2xl bg-slate-50 p-6 text-center">

                      <Building2 className="mx-auto mb-3 h-8 w-8 text-slate-400" />

                      <p className="font-semibold text-slate-700">

                        No hay sucursales disponibles.

                      </p>

                      <p className="mt-2 text-sm text-slate-500">

                        Intenta nuevamente más tarde.

                      </p>

                    </div>

                  )}

                  {!loading && !error && branches.length > 0 && (

                    <div className="space-y-3">

                      {branches.map((branch) => {

                        const selected =

                          selectedBranchId === branch.id;

                        return (

                          <button

                            key={branch.id}

                            type="button"

                            onClick={() => {

                              if (selectedBranchId !== branch.id) {

                                setSelectedBranchId(branch.id);

                                setRequestedTime('');

                                setAvailability(null);

                              }

                            }}

                            aria-pressed={selected}

                            className={[

                              'flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all sm:p-5',

                              selected

                                ? 'border-primary-900 bg-blue-50/70 shadow-sm'

                                : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50',

                            ].join(' ')}

                          >

                            <span

                              className={[

                                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',

                                selected

                                  ? 'bg-primary-900 text-white'

                                  : 'bg-blue-50 text-primary-900',

                              ].join(' ')}

                            >

                              <Building2 className="h-5 w-5" />

                            </span>

                            <span className="min-w-0 flex-1">

                              <span className="block font-bold text-primary-900">

                                {branch.name}

                              </span>

                              <span className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-slate-500 sm:text-sm">

                                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                                {branch.address}

                              </span>

                            </span>

                            <span

                              className={[

                                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',

                                selected

                                  ? 'border-primary-900 bg-primary-900 text-white'

                                  : 'border-slate-300',

                              ].join(' ')}

                            >

                              {selected && <Check className="h-3.5 w-3.5" />}

                            </span>

                          </button>

                        );

                      })}

                    </div>

                  )}

                  {appointmentType === 'home' && (
                    <div className="mt-6 space-y-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                      <h3 className="font-bold text-primary-900">Dirección de la toma a domicilio</h3>
                      <div>
                        <label htmlFor="home-address" className="mb-2 block text-sm font-semibold text-slate-700">Dirección completa *</label>
                        <textarea id="home-address" value={homeAddress} maxLength={1000} rows={3} onChange={(event) => { setHomeAddress(event.target.value); setHomeError(''); }}
                          placeholder="Calle, número, colonia, municipio, referencias para llegar" className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-primary-900" />
                      </div>
                      <div>
                        <label htmlFor="home-map" className="mb-2 block text-sm font-semibold text-slate-700">Enlace de Google Maps (opcional)</label>
                        <input id="home-map" type="url" value={locationUrl} maxLength={2000} onChange={(event) => { setLocationUrl(event.target.value); setHomeError(''); }}
                          placeholder="https://maps.app.goo.gl/..." className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary-900" />
                        <p className="mt-2 text-xs text-slate-500">Si conoces tu ubicación, puedes compartir el enlace. La dirección escrita sigue siendo necesaria.</p>
                      </div>
                      {homeError && <p role="alert" className="text-sm text-red-700">{homeError}</p>}
                      <p className="text-xs leading-5 text-slate-600">La fecha y el horario son solicitados; el laboratorio confirmará si puede realizar la visita.</p>
                    </div>
                  )}
                  {!quotationLoading && quotationItems.length === 0 && !quotationError && (

                    <div role="alert" className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">

                      <p className="text-sm font-bold text-amber-900">Primero selecciona tus estudios</p>

                      <p className="mt-2 text-sm leading-6 text-amber-800">

                        Para agendar una cita en LabWork necesitas agregar al menos un estudio o paquete a tu cotización.

                      </p>

                      <a href="/estudios" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800">

                        Explorar estudios <ArrowRight className="h-4 w-4" />

                      </a>

                    </div>

                  )}

                  {quotationError && (

                    <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                      {quotationError} <a href="/estudios" className="font-semibold underline">Revisar cotización</a>

                    </div>

                  )}

                  <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">

                    <button

                      type="button"

                      disabled={!selectedBranch || loading || quotationBlocked}

                      onClick={() => { if (appointmentType === 'home') { if (homeAddress.trim().length < 5) { setHomeError('Ingresa una dirección completa.'); return; } if (locationUrl.trim()) { try { const url = new URL(locationUrl.trim()); if (!['https:', 'http:'].includes(url.protocol)) throw new Error(); } catch { setHomeError('Ingresa un enlace de ubicación válido.'); return; } } } setHomeError(''); setStep(1); }}

                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-40"

                    >

                      Continuar

                      <ArrowRight className="h-4 w-4" />

                    </button>

                  </div>

                </>

              ) : step === 1 ? (

                <>

                  <div className="mb-6">

                    <span className="text-xs font-bold uppercase tracking-widest text-green-700">Paso 2 de 4</span>

                    <h2 className="mt-2 text-xl font-bold text-primary-900 sm:text-2xl">Selecciona fecha y horario</h2>

                    <p className="mt-2 text-sm text-slate-500">{appointmentType === 'home' ? 'Sucursal responsable' : 'Sucursal seleccionada'}: {selectedBranch?.name}</p>

                  </div>

                  <label htmlFor="appointment-date" className="mb-2 block text-sm font-bold text-slate-700">

                    {appointmentType === 'home' ? '¿Qué día deseas la visita?' : '¿Qué día deseas acudir?'}

                  </label>

                  <input

                    id="appointment-date" type="date" value={requestedDate} min={minAppointmentDate || undefined}

                    onChange={(event) => {

                      setRequestedDate(event.target.value);

                      setRequestedTime('');

                    }}

                    className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-900 focus:ring-2 focus:ring-blue-100 sm:max-w-xs"

                  />

                  <div className="mt-7 flex items-center justify-between gap-3">

                    <div>

                      <h3 className="font-bold text-primary-900">Horarios disponibles</h3>

                      <p className="mt-1 text-xs capitalize text-slate-500">{formatDate(requestedDate)}</p>

                    </div>

                    <Clock3 className="h-5 w-5 text-primary-900" />

                  </div>

                  {availabilityLoading && (

                    <div role="status" className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">

                      {[1, 2, 3, 4, 5, 6].map((n) => <div key={n} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}

                      <span className="sr-only">Consultando disponibilidad...</span>

                    </div>

                  )}

                  {!availabilityLoading && availabilityError && (

                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">

                      <p className="text-sm text-red-700">{availabilityError}</p>

                      <button type="button" onClick={() => setAvailabilityReload((value) => value + 1)} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-red-700">

                        <RefreshCw className="h-4 w-4" /> Reintentar

                      </button>

                    </div>

                  )}

                  {!availabilityLoading && !availabilityError && availability?.closed && (

                    <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">

                      No hay atención disponible para esta fecha. Selecciona otro día.

                    </div>

                  )}

                  {!availabilityLoading && !availabilityError && availability && !availability.closed && (

                    <>

                      {availability.slots.filter((slot) => slot.available && (appointmentType === 'home' || (slot.remaining ?? 0) > 0)).length === 0 ? (

                        <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">

                          No quedan horarios disponibles para esta fecha. Selecciona otro día.

                        </div>

                      ) : (

                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">

                          {availability.slots.filter((slot) => slot.available && (appointmentType === 'home' || (slot.remaining ?? 0) > 0)).map((slot) => {

                            const selected = requestedTime === slot.time;

                            return (

                              <button key={slot.time} type="button" aria-pressed={selected} onClick={() => setRequestedTime(slot.time)}

                                className={['min-h-14 rounded-xl border-2 px-3 py-2 text-center transition',

                                  selected ? 'border-primary-900 bg-primary-900 text-white' : 'border-slate-200 bg-white text-primary-900 hover:border-primary-900'].join(' ')}>

                                <span className="block text-sm font-bold">{slot.time}</span>

                                <span className={['mt-1 block text-[11px]', selected ? 'text-blue-100' : 'text-slate-500'].join(' ')}>

                                  {appointmentType === 'home' ? 'Sujeto a confirmación' : `${slot.remaining} ${slot.remaining === 1 ? 'lugar' : 'lugares'}`}

                                </span>

                              </button>

                            );

                          })}

                        </div>

                      )}

                    </>

                  )}

                  <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">

                    <button type="button" onClick={() => setStep(0)} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-900">

                      <ArrowLeft className="h-4 w-4" /> Cambiar atención

                    </button>

                    <button type="button" disabled={!requestedTime || availabilityLoading || !availability || availabilityError !== ''}

                      onClick={() => setStep(2)} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary-900 px-6 py-3 text-sm font-bold text-white hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-40">

                      Continuar <ArrowRight className="h-4 w-4" />

                    </button>

                  </div>

                </>

              ) : step === 2 ? (

                <>

                  <div className="mb-7">

                    <span className="text-xs font-bold uppercase tracking-widest text-green-700">Paso 3 de 4</span>

                    <h2 className="mt-2 text-xl font-bold text-primary-900 sm:text-2xl">Tus datos</h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">

                      Estos datos provienen de tu cuenta. Confirma tu teléfono de contacto.

                    </p>

                  </div>

                  <form onSubmit={handlePatientContinue} noValidate>

                    {profileLoading && <p role="status" className="mb-5 text-sm text-slate-600">Cargando los datos de tu cuenta...</p>}

                    {profileError && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{profileError} <a className="font-semibold underline" href="/mi-cuenta">Ir a mi cuenta</a></div>}

                    {patientErrors.profile && <p role="alert" className="mb-4 text-sm text-red-600">{patientErrors.profile}</p>}

                    <div className="grid gap-5 sm:grid-cols-2">

                      <div className="sm:col-span-2">

                        <label htmlFor="patient-name" className="mb-2 block text-sm font-bold text-slate-700">Nombre completo <span className="text-red-600">*</span></label>

                        <input id="patient-name" type="text" autoComplete="name" maxLength={160}

                          value={patientName} readOnly

                          aria-invalid={Boolean(patientErrors.patientName)} aria-describedby={patientErrors.patientName ? 'patient-name-error' : undefined}

                          placeholder="Nombre y apellidos" className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-900 focus:ring-2 focus:ring-blue-100" />

                        {patientErrors.patientName && <p id="patient-name-error" className="mt-1 text-xs text-red-600">{patientErrors.patientName}</p>}

                      </div>

                      <div>

                        <label htmlFor="birth-date" className="mb-2 block text-sm font-bold text-slate-700">Fecha de nacimiento <span className="text-red-600">*</span></label>

                        <input id="birth-date" type="date" max={today || undefined} value={birthDate}

                          readOnly

                          aria-invalid={Boolean(patientErrors.birthDate)} aria-describedby={patientErrors.birthDate ? 'birth-date-error' : undefined}

                          className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-900 focus:ring-2 focus:ring-blue-100" />

                        {patientErrors.birthDate && <p id="birth-date-error" className="mt-1 text-xs text-red-600">{patientErrors.birthDate}</p>}

                      </div>

                      <div>

                        <label htmlFor="patient-phone" className="mb-2 block text-sm font-bold text-slate-700">Número de teléfono <span className="text-red-600">*</span></label>

                        <input id="patient-phone" type="tel" autoComplete="tel" inputMode="numeric" maxLength={20}

                          value={phone} onChange={(event) => { setPhone(event.target.value); setPatientErrors((previous) => ({ ...previous, phone: '' })); }}

                          aria-invalid={Boolean(patientErrors.phone)} aria-describedby={patientErrors.phone ? 'patient-phone-error' : undefined}

                          placeholder="Ej. 3312345678" className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-900 focus:ring-2 focus:ring-blue-100" />

                        {patientErrors.phone && <p id="patient-phone-error" className="mt-1 text-xs text-red-600">{patientErrors.phone}</p>}

                      </div>

                      <div className="sm:col-span-2">

                        <label htmlFor="patient-email" className="mb-2 block text-sm font-bold text-slate-700">Correo electrónico <span className="text-red-600">*</span></label>

                        <input id="patient-email" type="email" autoComplete="email" maxLength={254}

                          value={email} readOnly

                          aria-invalid={Boolean(patientErrors.email)} aria-describedby={patientErrors.email ? 'patient-email-error' : undefined}

                          placeholder="correo@ejemplo.com" className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-900 focus:ring-2 focus:ring-blue-100" />

                        {patientErrors.email && <p id="patient-email-error" className="mt-1 text-xs text-red-600">{patientErrors.email}</p>}

                      </div>

                    </div>

                    <p className="mt-5 text-xs leading-5 text-slate-500">El nombre, correo y fecha de nacimiento están vinculados a tu cuenta. Para modificarlos, actualiza tu perfil.</p>

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">

                      <button type="button" onClick={() => setStep(1)} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-900">

                        <ArrowLeft className="h-4 w-4" /> Regresar al horario

                      </button>

                      <button type="submit" disabled={profileLoading || Boolean(profileError)} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary-900 px-6 py-3 text-sm font-bold text-white hover:bg-primary-800">

                        Continuar <ArrowRight className="h-4 w-4" />

                      </button>

                    </div>

                  </form>

                </>

              ) : (

                <>

                  {bookingSuccess ? (

                    <div role="status" className="py-5 text-center">

                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime-100 text-green-700">

                        <Check className="h-8 w-8" />

                      </div>

                      <span className="mt-6 block text-xs font-bold uppercase tracking-widest text-green-700">Solicitud registrada</span>

                      <h2 className="mt-2 text-2xl font-bold text-primary-900">Recibimos tu solicitud de cita</h2>

                      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">

                        {appointmentType === 'home' ? 'Recibimos tu solicitud a domicilio. El laboratorio revisará y confirmará la visita y el horario.' : 'Tu horario quedó reservado y la solicitud está pendiente de revisión por el laboratorio.'}

                      </p>

                      <div className="mx-auto mt-6 max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left text-sm">

                        <p><strong>Folio:</strong> <span className="break-words font-semibold text-primary-900">{bookingSuccess.folio ?? bookingSuccess.id}</span></p>

                        <p className="mt-2"><strong>{appointmentType === 'home' ? 'Sucursal responsable:' : 'Sucursal:'}</strong> {selectedBranch?.name}</p>

                        {appointmentType === 'branch' && selectedBranch?.address && <p className="mt-1 text-slate-500">{selectedBranch.address}</p>}

                        {appointmentType === 'branch' && <BranchContactActions branch={selectedBranch} />}
                        {appointmentType === 'home' && <div className="mt-3"><p><strong>Dirección de visita:</strong> {homeAddress}</p>{locationUrl.trim() && <a className="mt-1 inline-block break-all text-primary-900 underline" href={locationUrl.trim()} target="_blank" rel="noopener noreferrer">Ver ubicación en Google Maps</a>}</div>}

                        <p className="mt-2"><strong>Fecha:</strong> {formatDate(requestedDate)}</p>

                        <p className="mt-2"><strong>Horario:</strong> {requestedTime} h</p>

                        <p className="mt-2"><strong>Paciente:</strong> {patientName}</p>

                        <p className="mt-2"><strong>Teléfono del paciente:</strong> {phone}</p>

                        <p className="mt-2 break-words"><strong>Correo:</strong> {email}</p>

                        {quotationItems.length > 0 && <div className="mt-4 border-t border-slate-200 pt-3"><strong>Estudios y paquetes:</strong>{quotationItems.map((item) => <p key={`${item.type}:${item.id}`} className="mt-1">{item.name} — {item.price === null ? 'Precio por consultar' : money(item.price)}</p>)}<p className="mt-2 font-bold">{quotationMissingPrices ? 'Subtotal conocido' : 'Total estimado'}: {money(quotationSubtotal)}</p></div>}

                      </div>

                      <button

                        type="button"

                        onClick={() => window.print()}

                        className="mx-auto mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-800"

                      >

                        <Printer className="h-4 w-4" /> Imprimir / Guardar PDF

                      </button>

                      <p className="mt-4 text-xs text-slate-500">Conserva tu folio para cualquier aclaración.</p>

                      <a href="/mi-cuenta" className="mt-4 inline-block text-sm font-bold text-primary-900 underline">Ver mis citas en mi cuenta</a>

                    </div>

                  ) : (

                    <>

                      <span className="text-xs font-bold uppercase tracking-widest text-green-700">Paso 4 de 4</span>

                      <h2 className="mt-2 text-xl font-bold text-primary-900 sm:text-2xl">Revisa tu solicitud</h2>

                      <p className="mt-2 text-sm leading-6 text-slate-500">Verifica que los datos sean correctos antes de enviarla.</p>

                      <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">

                        <div>

                          <p className="font-bold text-primary-900">{appointmentType === 'home' ? 'Toma a domicilio y horario solicitado' : 'Sucursal y horario'}</p>

                          <p className="mt-2"><strong>{appointmentType === 'home' ? 'Sucursal responsable:' : 'Sucursal:'}</strong> {selectedBranch?.name}</p>

                          {appointmentType === 'branch' && selectedBranch?.address && <p className="mt-1 text-slate-500">{selectedBranch.address}</p>}

                          {appointmentType === 'branch' && <BranchContactActions branch={selectedBranch} />}
                          {appointmentType === 'home' && <div className="mt-3"><p><strong>Dirección de visita:</strong> {homeAddress}</p>{locationUrl.trim() && <a className="mt-1 inline-block break-all text-primary-900 underline" href={locationUrl.trim()} target="_blank" rel="noopener noreferrer">Ver ubicación en Google Maps</a>}</div>}

                          <p className="mt-2"><strong>Fecha:</strong> {formatDate(requestedDate)}</p>

                          <p className="mt-1"><strong>Horario:</strong> {requestedTime} h</p>

                        </div>

                        <div className="border-t border-slate-200 pt-4">

                          <p className="font-bold text-primary-900">Datos del paciente</p>

                          <p className="mt-2"><strong>Nombre:</strong> {patientName}</p>

                          <p className="mt-1"><strong>Nacimiento:</strong> {formatDate(birthDate)}</p>

                          <p className="mt-1"><strong>Teléfono:</strong> {phone}</p>

                          <p className="mt-1 break-words"><strong>Correo:</strong> {email}</p>

                        </div>

                        <div className="border-t border-slate-200 pt-4">

                          <p className="font-bold text-primary-900">Estudios y paquetes</p>

                          {quotationItems.length === 0 ? <p className="mt-2">Sin estudios ni paquetes.</p> : quotationItems.map((item) => (

                            <p key={`${item.type}:${item.id}`} className="mt-2">{item.type === 'study' ? 'Estudio' : 'Paquete'}: {item.name} — {item.price === null ? 'Precio por consultar' : money(item.price)}</p>

                          ))}

                          {quotationItems.length > 0 && <p className="mt-3 font-bold">{quotationMissingPrices ? 'Subtotal conocido' : 'Total estimado'}: {money(quotationSubtotal)}</p>}

                          {quotationError && <p role="alert" className="mt-3 text-red-700">{quotationError}</p>}

                        </div>

                      </div>

                      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-slate-600">

                        {appointmentType === 'home' ? 'Al enviar, se registrará tu solicitud de toma a domicilio. El horario está sujeto a confirmación del laboratorio.' : 'Al enviar, se registrará tu solicitud y se reservará el lugar seleccionado. El laboratorio revisará los detalles de atención.'}

                      </div>

                      {bookingError && (

                        <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">

                          <p className="text-sm text-red-700">{bookingError}</p>

                          {slotTaken && (

                            <button type="button" onClick={() => { setBookingError(''); setSlotTaken(false); setRequestedTime(''); setAvailabilityReload((value) => value + 1); setStep(1); }} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-red-700">

                              <CalendarDays className="h-4 w-4" /> Elegir otro horario

                            </button>

                          )}

                        </div>

                      )}

                      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">

                        <button type="button" disabled={bookingLoading} onClick={() => setStep(2)} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-900 disabled:opacity-40">

                          <ArrowLeft className="h-4 w-4" /> Editar mis datos

                        </button>

                        <button type="button" disabled={bookingLoading || slotTaken || profileLoading || Boolean(profileError) || quotationBlocked} onClick={() => void submitAppointment()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary-900 px-6 py-3 text-sm font-bold text-white hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50">

                          {bookingLoading ? 'Registrando solicitud...' : 'Confirmar solicitud'}

                          {!bookingLoading && <ArrowRight className="h-4 w-4" />}

                        </button>

                      </div>

                    </>

                  )}

                </>

              )}

            </div>

            {/* Resumen lateral */}

            <aside className="h-fit rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">

              <div className="mb-5 flex items-center gap-3">

                <div className="rounded-xl bg-blue-50 p-2.5 text-primary-900">

                  <ClipboardList className="h-5 w-5" />

                </div>

                <div>

                  <h3 className="font-bold text-primary-900">

                    Tu cita

                  </h3>

                  <p className="text-xs text-slate-500">

                    Resumen de tu selección

                  </p>

                </div>

              </div>

              <div className="border-t border-slate-100 pt-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">

                  {appointmentType === 'home' ? 'Sucursal responsable' : 'Sucursal'}

                </p>

                <p className="mt-2 text-sm font-semibold text-slate-700">

                  {selectedBranch?.name ?? 'Sin seleccionar'}{appointmentType === 'home' ? ' · A domicilio' : ''}

                </p>

              </div>

              <div className="mt-5 border-t border-slate-100 pt-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">

                  Fecha y horario

                </p>

                <p className="mt-2 text-sm text-slate-500">

                  {requestedDate && requestedTime ? `${formatDate(requestedDate)} · ${requestedTime} h` : 'Pendiente de seleccionar'}

                </p>

              </div>

              {step >= 2 && patientName.trim() && (

                <div className="mt-5 border-t border-slate-100 pt-5">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Paciente</p>

                  <p className="mt-2 text-sm font-semibold text-slate-700">{patientName.trim()}</p>

                  {step === 3 && <p className="mt-1 break-all text-xs text-slate-500">{email}</p>}

                </div>

              )}

              <div className="mt-5 border-t border-slate-100 pt-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Estudios y paquetes</p>

                {quotationLoading ? <p className="mt-3 text-sm text-slate-500">Validando cotización...</p> : (

                  <>

                    {quotationItems.length ? <ul className="mt-3 space-y-3">{quotationItems.map((item) => (

                      <li key={`${item.type}:${item.id}`} className="text-sm">

                        <span className="block text-xs text-slate-500">{item.type === 'study' ? 'Estudio' : 'Paquete'}</span>

                        <span className="font-semibold text-primary-900">{item.name}</span>

                        <span className="block text-slate-600">{item.price === null ? 'Precio por consultar' : money(item.price)}</span>

                      </li>

                    ))}</ul> : <p className="mt-3 text-sm text-slate-500">No has seleccionado estudios ni paquetes. Debes agregar al menos uno para agendar.</p>}

                    {quotationItems.length > 0 && <div className="mt-4 flex justify-between gap-2 border-t border-slate-100 pt-3 text-sm font-bold text-primary-900"><span>{quotationMissingPrices ? 'Subtotal conocido' : 'Total estimado'}</span><span>{money(quotationSubtotal)}</span></div>}

                    {quotationMissingPrices && <p className="mt-2 text-xs text-amber-700">El total no incluye los elementos sin precio.</p>}

                  </>

                )}

                {quotationError && <p role="alert" className="mt-3 text-xs text-red-700">{quotationError}</p>}

                <a href="/estudios" className="mt-4 inline-block text-xs font-semibold text-primary-900 underline">Revisar mi cotización</a>

                {quotationError && <button type="button" onClick={() => setQuotationRevision((n) => n + 1)} className="ml-3 text-xs font-semibold text-primary-900 underline">Reintentar</button>}

              </div>

            </aside>

          </div>

        </section>

      </main>

      <style>{`

      @media print {

        @page { size: A4; margin: 12mm; }

        /* Oculta encabezado, pie de página y demás elementos de Next.js.

           Conserva solamente los ancestros del comprobante y su contenido. */

        body *:not(:has(#labwork-print-receipt)):not(#labwork-print-receipt):not(#labwork-print-receipt *) {

          display: none !important;

        }

        \#labwork-print-receipt {

          display: block !important;

          width: 100% !important;

          max-width: none !important;

          padding: 0 !important;

          margin: 0 !important;

          color: #111827 !important;

          background: white !important;

        }

        \#labwork-print-receipt * {

          break-inside: avoid;

        }

      }

    `}</style>

      {bookingSuccess && (

        <section id="labwork-print-receipt" className="hidden print:block bg-white p-8 text-black" aria-label="Comprobante de solicitud de cita">

          <div className="mx-auto max-w-2xl">

            <div className="border-b-2 border-slate-800 pb-5">

              <h1 className="text-2xl font-bold">LabWork · Análisis Clínicos</h1>

              <p className="mt-1 text-sm">Comprobante de solicitud de cita</p>

            </div>

            <h2 className="mt-7 text-xl font-bold">Solicitud registrada</h2>

            <p className="mt-2 text-sm">{appointmentType === 'home' ? 'Solicitud de toma a domicilio pendiente de confirmación del laboratorio.' : 'El horario está reservado. La solicitud está pendiente de revisión por el laboratorio.'}</p>

            <dl className="mt-7 space-y-4 text-sm">

              <div><dt className="font-bold">Folio</dt><dd className="break-words text-lg font-bold tracking-wide">{bookingSuccess.folio ?? bookingSuccess.id}</dd></div>

              <div><dt className="font-bold">Paciente</dt><dd>{patientName}</dd></div>

              <div><dt className="font-bold">Teléfono del paciente</dt><dd>{phone}</dd></div>

              <div><dt className="font-bold">Correo electrónico</dt><dd className="break-all">{email}</dd></div>

              <div><dt className="font-bold">{appointmentType === 'home' ? 'Sucursal responsable' : 'Sucursal'}</dt><dd>{selectedBranch?.name ?? 'No disponible'}</dd></div>

              {appointmentType === 'branch' && selectedBranch?.address && <div><dt className="font-bold">Dirección</dt><dd>{selectedBranch.address}</dd></div>}
              {appointmentType === 'home' && <div><dt className="font-bold">Dirección de visita</dt><dd>{homeAddress}</dd>{locationUrl.trim() && <dd className="break-all">Ubicación: {locationUrl.trim()}</dd>}</div>}

              {selectedBranch?.phone && <div><dt className="font-bold">Teléfono de sucursal</dt><dd>{selectedBranch.phone}</dd></div>}

              <div><dt className="font-bold">Fecha</dt><dd>{formatDate(requestedDate)}</dd></div>

              <div><dt className="font-bold">Horario</dt><dd>{requestedTime} h</dd></div>

              {quotationItems.length > 0 && <div><dt className="font-bold">Estudios y paquetes</dt><dd>{quotationItems.map((item) => <p key={`${item.type}:${item.id}`}>{item.type === 'study' ? 'Estudio' : 'Paquete'}: {item.name} — {item.price === null ? 'Precio por consultar' : money(item.price)}</p>)}<p className="mt-2 font-bold">{quotationMissingPrices ? 'Subtotal conocido' : 'Total estimado'}: {money(quotationSubtotal)}</p></dd></div>}

            </dl>

            <p className="mt-10 border-t border-slate-300 pt-4 text-xs">Conserva este comprobante para cualquier aclaración. No sustituye la confirmación del laboratorio.</p>

          </div>

        </section>

      )}

    </>

  );

}
