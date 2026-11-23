'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

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

function formatDate(date: string, locale: string) {

  if (!date) return '';

  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'es-MX', {

    dateStyle: 'full', timeZone: 'UTC',

  }).format(new Date(`${date}T12:00:00Z`));

}

const steps = [
  { key: 'attention', icon: Building2 },
  { key: 'schedule', icon: CalendarDays },
  { key: 'patient', icon: UserRound },
  { key: 'summary', icon: ClipboardList },
] as const;

function BranchContactActions({ branch }: { branch?: Branch }) {
  const t = useTranslations('AppointmentWizard');

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

          <Navigation className="h-4 w-4" /> {t('directions')}

        </a>

      )}

      {dialNumber && (

        <a href={`tel:${dialNumber}`}

          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-primary-900 transition hover:bg-slate-100">

          <Phone className="h-4 w-4" /> {t('call')} {phone}

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

function money(amount: number, locale: string) {

  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

}

export default function AppointmentWizard() {
  const t = useTranslations('AppointmentWizard');
  const locale = useLocale();

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

        if (!studiesResponse.ok || !packagesResponse.ok) throw new Error(t('quotation.validateError'));

        const [studiesBody, packagesBody] = await Promise.all([studiesResponse.json(), packagesResponse.json()]);

        if (!Array.isArray(studiesBody.data) || !Array.isArray(packagesBody.data)) throw new Error(t('quotation.invalidResponse'));

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

        if (invalid) setQuotationError(t('quotation.invalid'));

      } catch (error) {

        if (!controller.signal.aborted) setQuotationError(error instanceof Error ? error.message : t('quotation.loadError'));

      } finally {

        if (!controller.signal.aborted) setQuotationLoading(false);

      }

    }

    void loadQuotation();

    return () => controller.abort();

  }, [quotationRevision, t]);

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

        throw new Error(t('booking.missingSelection'));

      }

      if (appointmentType === 'home' && requestedDate < minAppointmentDate) { throw new Error(t('booking.homeAdvance')); }
      if (appointmentType === 'home' && homeAddress.trim().length < 5) {
        throw new Error(t('booking.homeAddress'));
      }
      if (appointmentType === 'home' && locationUrl.trim()) {
        const parsed = new URL(locationUrl.trim());
        if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error(t('booking.invalidProtocol'));
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

        throw new Error(typeof message === 'string' ? message : t('booking.submitError'));

      }

      if (!payload?.data?.id) throw new Error(t('booking.noId'));

      setBookingSuccess({

        id: payload.data.id,

        folio: typeof payload.data.folio === 'string' && payload.data.folio.trim()

          ? payload.data.folio.trim()

          : null,

        status: payload.data.status ?? 'pending',

      });

    } catch (err) {

      setBookingError(err instanceof Error ? err.message : t('booking.submitErrorShort'));

    } finally {

      setBookingLoading(false);

    }

  }

  function handlePatientContinue(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    const errors: Record<string, string> = {};

    const cleanPhone = phone.replace(/\D/g, '');

    if (profileLoading || profileError || !patientName || !email || !birthDate) {

      errors.profile = t('patient.profileInvalid');

    }

    if (cleanPhone.length !== 10) {

      errors.phone = t('patient.phoneInvalid');

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

          throw new Error(payload?.error?.message ?? t('patient.profileLoadError'));

        }

        if (!payload?.data?.id || !payload.data.name || !payload.data.email) {

          throw new Error(t('patient.profileIncomplete'));

        }

        const patient = payload.data as PatientProfile;

        if (!controller.signal.aborted) {

          setPatientName(patient.name);

          setEmail(patient.email);

          setBirthDate(patient.birthDate ?? '');

          if (!patient.birthDate) {

            setProfileError(t('patient.birthMissing'));

          }

        }

      } catch (err) {

        if (!controller.signal.aborted) {

          setProfileError(err instanceof Error ? err.message : t('patient.profileLoadError'));

        }

      } finally {

        if (!controller.signal.aborted) setProfileLoading(false);

      }

    }

    void loadProfile();

    return () => controller.abort();

  }, [t]);

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

        if (!response.ok) { const message = payload?.error?.message ?? payload?.error ?? payload?.message; throw new Error(typeof message === 'string' ? message : t('availability.loadError')); }

        if (!payload?.data || !Array.isArray(payload.data.slots)) {

          throw new Error(t('availability.invalidResponse'));

        }

        if (!controller.signal.aborted) setAvailability(payload.data as Availability);

      } catch (err) {

        if (controller.signal.aborted) return;

        setAvailabilityError(err instanceof Error ? err.message : t('availability.genericError'));

      } finally {

        if (!controller.signal.aborted) setAvailabilityLoading(false);

      }

    }

    void loadAvailability();

    return () => controller.abort();

  }, [step, selectedBranchId, requestedDate, appointmentType, availabilityReload, t]);

  async function loadBranches(signal?: AbortSignal) {

    setLoading(true);

    setError('');

    try {

      const response = await fetch('/api/branches', {

        cache: 'no-store',

        signal,

      });

      if (!response.ok) {

        throw new Error(t('branch.loadError'));

      }

      const payload = await response.json();

      // Se espera la respuesta { data: Branch[] }.

      if (!Array.isArray(payload.data)) {

        throw new Error(t('branch.invalidResponse'));

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

          : t('branch.genericError')

      );

    } finally {

      if (!signal?.aborted) setLoading(false);

    }

  }

  useEffect(() => {

    const controller = new AbortController();

    void loadBranches(controller.signal);

    return () => controller.abort();

  }, [t]);

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

              {t('hero.badge')}

            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">

              {t('hero.title')}

            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">

              {t('hero.description')}

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

                  key={item.key}

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

                    {t(`steps.${item.key}`)}

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

                      {t('stepCount', { step: 1 })}

                    </span>

                    <h2 className="mt-2 text-xl font-bold text-primary-900 sm:text-2xl">

                      {t('attention.title')}

                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">

                      {t('attention.description')}

                    </p>

                  </div>

                  <div className="mb-6 grid gap-3 sm:grid-cols-2">
                    {([['branch', t('attention.branchTitle'), t('attention.branchDetail')], ['home', t('attention.homeTitle'), t('attention.homeDetail')]] as const).map(([type, title, detail]) => (
                      <button key={type} type="button" aria-pressed={appointmentType === type}
                        onClick={() => { setAppointmentType(type); setRequestedTime(''); setAvailability(null); setHomeError(''); setRequestedDate(type === 'home' ? (() => { const d = new Date(`${today || todayInMexico()}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); })() : (today || todayInMexico())); }}
                        className={`rounded-2xl border-2 p-4 text-left transition ${appointmentType === type ? 'border-primary-900 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                        <span className="flex items-center gap-2 font-bold text-primary-900">{type === 'home' ? <MapPin className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}{title}</span>
                        <span className="mt-2 block text-sm text-slate-600">{detail}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mb-4 text-sm font-semibold text-slate-700">{appointmentType === 'home' ? t('attention.homeBranch') : t('attention.branchLabel')}</p>
                  {loading && (

                    <div className="space-y-3" role="status">

                      {[1, 2, 3].map((item) => (

                        <div

                          key={item}

                          className="h-24 animate-pulse rounded-2xl bg-slate-100"

                        />

                      ))}

                      <span className="sr-only">

                        {t('branch.loading')}

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

                        {t('retry')}

                      </button>

                    </div>

                  )}

                  {!loading && !error && branches.length === 0 && (

                    <div className="rounded-2xl bg-slate-50 p-6 text-center">

                      <Building2 className="mx-auto mb-3 h-8 w-8 text-slate-400" />

                      <p className="font-semibold text-slate-700">

                        {t('branch.none')}

                      </p>

                      <p className="mt-2 text-sm text-slate-500">

                        {t('branch.later')}

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
                      <h3 className="font-bold text-primary-900">{t('home.title')}</h3>
                      <div>
                        <label htmlFor="home-address" className="mb-2 block text-sm font-semibold text-slate-700">{t('home.address')}</label>
                        <textarea id="home-address" value={homeAddress} maxLength={1000} rows={3} onChange={(event) => { setHomeAddress(event.target.value); setHomeError(''); }}
                          placeholder={t('home.addressPlaceholder')} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-primary-900" />
                      </div>
                      <div>
                        <label htmlFor="home-map" className="mb-2 block text-sm font-semibold text-slate-700">{t('home.map')}</label>
                        <input id="home-map" type="url" value={locationUrl} maxLength={2000} onChange={(event) => { setLocationUrl(event.target.value); setHomeError(''); }}
                          placeholder="https://maps.app.goo.gl/..." className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary-900" />
                        <p className="mt-2 text-xs text-slate-500">{t('home.mapHelp')}</p>
                      </div>
                      {homeError && <p role="alert" className="text-sm text-red-700">{homeError}</p>}
                      <p className="text-xs leading-5 text-slate-600">{t('home.notice')}</p>
                    </div>
                  )}
                  {!quotationLoading && quotationItems.length === 0 && !quotationError && (

                    <div role="alert" className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">

                      <p className="text-sm font-bold text-amber-900">{t('quotation.requiredTitle')}</p>

                      <p className="mt-2 text-sm leading-6 text-amber-800">

                        {t('quotation.requiredText')}

                      </p>

                      <a href="/estudios" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800">

                        {t('quotation.explore')} <ArrowRight className="h-4 w-4" />

                      </a>

                    </div>

                  )}

                  {quotationError && (

                    <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                      {quotationError} <a href="/estudios" className="font-semibold underline">{t('quotation.review')}</a>

                    </div>

                  )}

                  <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">

                    <button

                      type="button"

                      disabled={!selectedBranch || loading || quotationBlocked}

                      onClick={() => { if (appointmentType === 'home') { if (homeAddress.trim().length < 5) { setHomeError(t('home.addressShort')); return; } if (locationUrl.trim()) { try { const url = new URL(locationUrl.trim()); if (!['https:', 'http:'].includes(url.protocol)) throw new Error(); } catch { setHomeError(t('home.mapInvalid')); return; } } } setHomeError(''); setStep(1); }}

                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-40"

                    >

                      {t('continue')}

                      <ArrowRight className="h-4 w-4" />

                    </button>

                  </div>

                </>

              ) : step === 1 ? (

                <>

                  <div className="mb-6">

                    <span className="text-xs font-bold uppercase tracking-widest text-green-700">{t('stepCount', { step: 2 })}</span>

                    <h2 className="mt-2 text-xl font-bold text-primary-900 sm:text-2xl">{t('schedule.title')}</h2>

                    <p className="mt-2 text-sm text-slate-500">{appointmentType === 'home' ? t('schedule.homeBranch') : t('schedule.branchSelected')}: {selectedBranch?.name}</p>

                  </div>

                  <label htmlFor="appointment-date" className="mb-2 block text-sm font-bold text-slate-700">

                    {appointmentType === 'home' ? t('schedule.homeDate') : t('schedule.branchDate')}

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

                      <h3 className="font-bold text-primary-900">{t('schedule.available')}</h3>

                      <p className="mt-1 text-xs capitalize text-slate-500">{formatDate(requestedDate, locale)}</p>

                    </div>

                    <Clock3 className="h-5 w-5 text-primary-900" />

                  </div>

                  {availabilityLoading && (

                    <div role="status" className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">

                      {[1, 2, 3, 4, 5, 6].map((n) => <div key={n} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}

                      <span className="sr-only">{t('schedule.loading')}</span>

                    </div>

                  )}

                  {!availabilityLoading && availabilityError && (

                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">

                      <p className="text-sm text-red-700">{availabilityError}</p>

                      <button type="button" onClick={() => setAvailabilityReload((value) => value + 1)} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-red-700">

                        <RefreshCw className="h-4 w-4" /> {t('schedule.retry')}

                      </button>

                    </div>

                  )}

                  {!availabilityLoading && !availabilityError && availability?.closed && (

                    <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">

                      {t('schedule.closed')}

                    </div>

                  )}

                  {!availabilityLoading && !availabilityError && availability && !availability.closed && (

                    <>

                      {availability.slots.filter((slot) => slot.available && (appointmentType === 'home' || (slot.remaining ?? 0) > 0)).length === 0 ? (

                        <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">

                          {t('schedule.noSlots')}

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

                                  {appointmentType === 'home' ? t('schedule.confirmation') : t('schedule.spotsCount', { count: slot.remaining ?? 0 })}

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

                      <ArrowLeft className="h-4 w-4" /> {t('schedule.changeAttention')}

                    </button>

                    <button type="button" disabled={!requestedTime || availabilityLoading || !availability || availabilityError !== ''}

                      onClick={() => setStep(2)} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary-900 px-6 py-3 text-sm font-bold text-white hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-40">

                      {t('continue')} <ArrowRight className="h-4 w-4" />

                    </button>

                  </div>

                </>

              ) : step === 2 ? (

                <>

                  <div className="mb-7">

                    <span className="text-xs font-bold uppercase tracking-widest text-green-700">{t('stepCount', { step: 3 })}</span>

                    <h2 className="mt-2 text-xl font-bold text-primary-900 sm:text-2xl">{t('patient.title')}</h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">

                      {t('patient.description')}

                    </p>

                  </div>

                  <form onSubmit={handlePatientContinue} noValidate>

                    {profileLoading && <p role="status" className="mb-5 text-sm text-slate-600">{t('patient.loading')}</p>}

                    {profileError && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{profileError} <a className="font-semibold underline" href="/mi-cuenta">{t('patient.account')}</a></div>}

                    {patientErrors.profile && <p role="alert" className="mb-4 text-sm text-red-600">{patientErrors.profile}</p>}

                    <div className="grid gap-5 sm:grid-cols-2">

                      <div className="sm:col-span-2">

                        <label htmlFor="patient-name" className="mb-2 block text-sm font-bold text-slate-700">{t('patient.fullName')} <span className="text-red-600">*</span></label>

                        <input id="patient-name" type="text" autoComplete="name" maxLength={160}

                          value={patientName} readOnly

                          aria-invalid={Boolean(patientErrors.patientName)} aria-describedby={patientErrors.patientName ? 'patient-name-error' : undefined}

                          placeholder={t('patient.namePlaceholder')} className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-900 focus:ring-2 focus:ring-blue-100" />

                        {patientErrors.patientName && <p id="patient-name-error" className="mt-1 text-xs text-red-600">{patientErrors.patientName}</p>}

                      </div>

                      <div>

                        <label htmlFor="birth-date" className="mb-2 block text-sm font-bold text-slate-700">{t('patient.birthDate')} <span className="text-red-600">*</span></label>

                        <input id="birth-date" type="date" max={today || undefined} value={birthDate}

                          readOnly

                          aria-invalid={Boolean(patientErrors.birthDate)} aria-describedby={patientErrors.birthDate ? 'birth-date-error' : undefined}

                          className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-900 focus:ring-2 focus:ring-blue-100" />

                        {patientErrors.birthDate && <p id="birth-date-error" className="mt-1 text-xs text-red-600">{patientErrors.birthDate}</p>}

                      </div>

                      <div>

                        <label htmlFor="patient-phone" className="mb-2 block text-sm font-bold text-slate-700">{t('patient.phone')} <span className="text-red-600">*</span></label>

                        <input id="patient-phone" type="tel" autoComplete="tel" inputMode="numeric" maxLength={20}

                          value={phone} onChange={(event) => { setPhone(event.target.value); setPatientErrors((previous) => ({ ...previous, phone: '' })); }}

                          aria-invalid={Boolean(patientErrors.phone)} aria-describedby={patientErrors.phone ? 'patient-phone-error' : undefined}

                          placeholder={t('patient.phonePlaceholder')} className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-900 focus:ring-2 focus:ring-blue-100" />

                        {patientErrors.phone && <p id="patient-phone-error" className="mt-1 text-xs text-red-600">{patientErrors.phone}</p>}

                      </div>

                      <div className="sm:col-span-2">

                        <label htmlFor="patient-email" className="mb-2 block text-sm font-bold text-slate-700">{t('patient.email')} <span className="text-red-600">*</span></label>

                        <input id="patient-email" type="email" autoComplete="email" maxLength={254}

                          value={email} readOnly

                          aria-invalid={Boolean(patientErrors.email)} aria-describedby={patientErrors.email ? 'patient-email-error' : undefined}

                          placeholder={t('patient.emailPlaceholder')} className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-900 focus:ring-2 focus:ring-blue-100" />

                        {patientErrors.email && <p id="patient-email-error" className="mt-1 text-xs text-red-600">{patientErrors.email}</p>}

                      </div>

                    </div>

                    <p className="mt-5 text-xs leading-5 text-slate-500">{t('patient.note')}</p>

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">

                      <button type="button" onClick={() => setStep(1)} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-900">

                        <ArrowLeft className="h-4 w-4" /> {t('patient.back')}

                      </button>

                      <button type="submit" disabled={profileLoading || Boolean(profileError)} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary-900 px-6 py-3 text-sm font-bold text-white hover:bg-primary-800">

                        {t('continue')} <ArrowRight className="h-4 w-4" />

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

                      <span className="mt-6 block text-xs font-bold uppercase tracking-widest text-green-700">{t('success.badge')}</span>

                      <h2 className="mt-2 text-2xl font-bold text-primary-900">{t('success.title')}</h2>

                      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">

                        {appointmentType === 'home' ? t('success.homeMessage') : t('success.branchMessage')}

                      </p>

                      <div className="mx-auto mt-6 max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left text-sm">

                        <p><strong>{t('success.folio')}</strong> <span className="break-words font-semibold text-primary-900">{bookingSuccess.folio ?? bookingSuccess.id}</span></p>

                        <p className="mt-2"><strong>{appointmentType === 'home' ? t('common.responsibleBranchColon') : t('common.branchColon')}</strong> {selectedBranch?.name}</p>

                        {appointmentType === 'branch' && selectedBranch?.address && <p className="mt-1 text-slate-500">{selectedBranch.address}</p>}

                        {appointmentType === 'branch' && <BranchContactActions branch={selectedBranch} />}
                        {appointmentType === 'home' && <div className="mt-3"><p><strong>{t('common.visitAddressColon')}</strong> {homeAddress}</p>{locationUrl.trim() && <a className="mt-1 inline-block break-all text-primary-900 underline" href={locationUrl.trim()} target="_blank" rel="noopener noreferrer">{t('success.map')}</a>}</div>}

                        <p className="mt-2"><strong>{t('common.dateColon')}</strong> {formatDate(requestedDate, locale)}</p>

                        <p className="mt-2"><strong>{t('common.timeColon')}</strong> {requestedTime} h</p>

                        <p className="mt-2"><strong>{t('common.patientColon')}</strong> {patientName}</p>

                        <p className="mt-2"><strong>{t('common.patientPhoneColon')}</strong> {phone}</p>

                        <p className="mt-2 break-words"><strong>{t('common.emailColon')}</strong> {email}</p>

                        {quotationItems.length > 0 && <div className="mt-4 border-t border-slate-200 pt-3"><strong>{t('common.testPackagesColon')}</strong>{quotationItems.map((item) => <p key={`${item.type}:${item.id}`} className="mt-1">{item.name} — {item.price === null ? t('common.pricePending') : money(item.price, locale)}</p>)}<p className="mt-2 font-bold">{quotationMissingPrices ? t('common.knownSubtotal') : t('common.estimatedTotal')}: {money(quotationSubtotal, locale)}</p></div>}

                      </div>

                      <button

                        type="button"

                        onClick={() => window.print()}

                        className="mx-auto mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-800"

                      >

                        <Printer className="h-4 w-4" /> {t('success.print')}

                      </button>

                      <p className="mt-4 text-xs text-slate-500">{t('success.keepFolio')}</p>

                      <a href="/mi-cuenta" className="mt-4 inline-block text-sm font-bold text-primary-900 underline">{t('success.myAppointments')}</a>

                    </div>

                  ) : (

                    <>

                      <span className="text-xs font-bold uppercase tracking-widest text-green-700">{t('stepCount', { step: 4 })}</span>

                      <h2 className="mt-2 text-xl font-bold text-primary-900 sm:text-2xl">{t('review.title')}</h2>

                      <p className="mt-2 text-sm leading-6 text-slate-500">{t('review.description')}</p>

                      <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">

                        <div>

                          <p className="font-bold text-primary-900">{appointmentType === 'home' ? t('review.homeTitle') : t('review.branchTitle')}</p>

                          <p className="mt-2"><strong>{appointmentType === 'home' ? t('common.responsibleBranchColon') : t('common.branchColon')}</strong> {selectedBranch?.name}</p>

                          {appointmentType === 'branch' && selectedBranch?.address && <p className="mt-1 text-slate-500">{selectedBranch.address}</p>}

                          {appointmentType === 'branch' && <BranchContactActions branch={selectedBranch} />}
                          {appointmentType === 'home' && <div className="mt-3"><p><strong>{t('common.visitAddressColon')}</strong> {homeAddress}</p>{locationUrl.trim() && <a className="mt-1 inline-block break-all text-primary-900 underline" href={locationUrl.trim()} target="_blank" rel="noopener noreferrer">{t('success.map')}</a>}</div>}

                          <p className="mt-2"><strong>{t('common.dateColon')}</strong> {formatDate(requestedDate, locale)}</p>

                          <p className="mt-1"><strong>{t('common.timeColon')}</strong> {requestedTime} h</p>

                        </div>

                        <div className="border-t border-slate-200 pt-4">

                          <p className="font-bold text-primary-900">{t('review.patientData')}</p>

                          <p className="mt-2"><strong>{t('common.nameColon')}</strong> {patientName}</p>

                          <p className="mt-1"><strong>{t('common.birthColon')}</strong> {formatDate(birthDate, locale)}</p>

                          <p className="mt-1"><strong>{t('common.phoneColon')}</strong> {phone}</p>

                          <p className="mt-1 break-words"><strong>{t('common.emailColon')}</strong> {email}</p>

                        </div>

                        <div className="border-t border-slate-200 pt-4">

                          <p className="font-bold text-primary-900">{t('common.testsPackages')}</p>

                          {quotationItems.length === 0 ? <p className="mt-2">{t('review.noItems')}</p> : quotationItems.map((item) => (

                            <p key={`${item.type}:${item.id}`} className="mt-2">{item.type === 'study' ? t('common.study') : t('common.package')}: {item.name} — {item.price === null ? t('common.pricePending') : money(item.price, locale)}</p>

                          ))}

                          {quotationItems.length > 0 && <p className="mt-3 font-bold">{quotationMissingPrices ? t('common.knownSubtotal') : t('common.estimatedTotal')}: {money(quotationSubtotal, locale)}</p>}

                          {quotationError && <p role="alert" className="mt-3 text-red-700">{quotationError}</p>}

                        </div>

                      </div>

                      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-slate-600">

                        {appointmentType === 'home' ? t('review.homeNotice') : t('review.branchNotice')}

                      </div>

                      {bookingError && (

                        <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">

                          <p className="text-sm text-red-700">{bookingError}</p>

                          {slotTaken && (

                            <button type="button" onClick={() => { setBookingError(''); setSlotTaken(false); setRequestedTime(''); setAvailabilityReload((value) => value + 1); setStep(1); }} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-red-700">

                              <CalendarDays className="h-4 w-4" /> {t('review.chooseAnother')}

                            </button>

                          )}

                        </div>

                      )}

                      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">

                        <button type="button" disabled={bookingLoading} onClick={() => setStep(2)} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-900 disabled:opacity-40">

                          <ArrowLeft className="h-4 w-4" /> {t('review.edit')}

                        </button>

                        <button type="button" disabled={bookingLoading || slotTaken || profileLoading || Boolean(profileError) || quotationBlocked} onClick={() => void submitAppointment()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary-900 px-6 py-3 text-sm font-bold text-white hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50">

                          {bookingLoading ? t('review.loading') : t('review.confirm')}

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

                    {t('sidebar.title')}

                  </h3>

                  <p className="text-xs text-slate-500">

                    {t('sidebar.description')}

                  </p>

                </div>

              </div>

              <div className="border-t border-slate-100 pt-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">

                  {appointmentType === 'home' ? t('schedule.homeBranch') : t('common.branch')}

                </p>

                <p className="mt-2 text-sm font-semibold text-slate-700">

                  {selectedBranch?.name ?? t('sidebar.notSelected')}{appointmentType === 'home' ? ' · A domicilio' : ''}

                </p>

              </div>

              <div className="mt-5 border-t border-slate-100 pt-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">

                  {t('sidebar.dateTime')}

                </p>

                <p className="mt-2 text-sm text-slate-500">

                  {requestedDate && requestedTime ? `${formatDate(requestedDate, locale)} · ${requestedTime} h` : t('sidebar.pending')}

                </p>

              </div>

              {step >= 2 && patientName.trim() && (

                <div className="mt-5 border-t border-slate-100 pt-5">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('sidebar.patient')}</p>

                  <p className="mt-2 text-sm font-semibold text-slate-700">{patientName.trim()}</p>

                  {step === 3 && <p className="mt-1 break-all text-xs text-slate-500">{email}</p>}

                </div>

              )}

              <div className="mt-5 border-t border-slate-100 pt-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('common.testsPackages')}</p>

                {quotationLoading ? <p className="mt-3 text-sm text-slate-500">{t('sidebar.validating')}</p> : (

                  <>

                    {quotationItems.length ? <ul className="mt-3 space-y-3">{quotationItems.map((item) => (

                      <li key={`${item.type}:${item.id}`} className="text-sm">

                        <span className="block text-xs text-slate-500">{item.type === 'study' ? t('common.study') : t('common.package')}</span>

                        <span className="font-semibold text-primary-900">{item.name}</span>

                        <span className="block text-slate-600">{item.price === null ? t('common.pricePending') : money(item.price, locale)}</span>

                      </li>

                    ))}</ul> : <p className="mt-3 text-sm text-slate-500">{t('sidebar.empty')}</p>}

                    {quotationItems.length > 0 && <div className="mt-4 flex justify-between gap-2 border-t border-slate-100 pt-3 text-sm font-bold text-primary-900"><span>{quotationMissingPrices ? t('common.knownSubtotal') : t('common.estimatedTotal')}</span><span>{money(quotationSubtotal, locale)}</span></div>}

                    {quotationMissingPrices && <p className="mt-2 text-xs text-amber-700">{t('sidebar.missing')}</p>}

                  </>

                )}

                {quotationError && <p role="alert" className="mt-3 text-xs text-red-700">{quotationError}</p>}

                <a href="/estudios" className="mt-4 inline-block text-xs font-semibold text-primary-900 underline">{t('sidebar.review')}</a>

                {quotationError && <button type="button" onClick={() => setQuotationRevision((n) => n + 1)} className="ml-3 text-xs font-semibold text-primary-900 underline">{t('schedule.retry')}</button>}

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

        <section id="labwork-print-receipt" className="hidden print:block bg-white p-8 text-black" aria-label={t('receipt.aria')}>

          <div className="mx-auto max-w-2xl">

            <div className="border-b-2 border-slate-800 pb-5">

              <h1 className="text-2xl font-bold">{t('receipt.brand')}</h1>

              <p className="mt-1 text-sm">{t('receipt.title')}</p>

            </div>

            <h2 className="mt-7 text-xl font-bold">{t('success.badge')}</h2>

            <p className="mt-2 text-sm">{appointmentType === 'home' ? t('receipt.homeMessage') : t('receipt.branchMessage')}</p>

            <dl className="mt-7 space-y-4 text-sm">

              <div><dt className="font-bold">{t('common.folio')}</dt><dd className="break-words text-lg font-bold tracking-wide">{bookingSuccess.folio ?? bookingSuccess.id}</dd></div>

              <div><dt className="font-bold">{t('sidebar.patient')}</dt><dd>{patientName}</dd></div>

              <div><dt className="font-bold">{t('common.patientPhone')}</dt><dd>{phone}</dd></div>

              <div><dt className="font-bold">{t('patient.email')}</dt><dd className="break-all">{email}</dd></div>

              <div><dt className="font-bold">{appointmentType === 'home' ? t('schedule.homeBranch') : t('common.branch')}</dt><dd>{selectedBranch?.name ?? t('receipt.notAvailable')}</dd></div>

              {appointmentType === 'branch' && selectedBranch?.address && <div><dt className="font-bold">{t('receipt.address')}</dt><dd>{selectedBranch.address}</dd></div>}
              {appointmentType === 'home' && <div><dt className="font-bold">{t('common.visitAddress')}</dt><dd>{homeAddress}</dd>{locationUrl.trim() && <dd className="break-all">{t('receipt.location')} {locationUrl.trim()}</dd>}</div>}

              {selectedBranch?.phone && <div><dt className="font-bold">{t('receipt.branchPhone')}</dt><dd>{selectedBranch.phone}</dd></div>}

              <div><dt className="font-bold">{t('common.date')}</dt><dd>{formatDate(requestedDate, locale)}</dd></div>

              <div><dt className="font-bold">{t('common.time')}</dt><dd>{requestedTime} h</dd></div>

              {quotationItems.length > 0 && <div><dt className="font-bold">{t('common.testsPackages')}</dt><dd>{quotationItems.map((item) => <p key={`${item.type}:${item.id}`}>{item.type === 'study' ? t('common.study') : t('common.package')}: {item.name} — {item.price === null ? t('common.pricePending') : money(item.price, locale)}</p>)}<p className="mt-2 font-bold">{quotationMissingPrices ? t('common.knownSubtotal') : t('common.estimatedTotal')}: {money(quotationSubtotal, locale)}</p></dd></div>}

            </dl>

            <p className="mt-10 border-t border-slate-300 pt-4 text-xs">{t('receipt.notice')}</p>

          </div>

        </section>

      )}

    </>

  );

}
