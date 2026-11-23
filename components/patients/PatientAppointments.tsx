'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowRight, CalendarDays, CalendarPlus, ChevronDown, ChevronUp,
  ClipboardList, Clock3, ExternalLink, FileText, House, Mail, MapPin,
  Navigation, Phone, Printer, RefreshCw, Stethoscope, UserRound,
} from 'lucide-react';

type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
type Tab = 'appointments' | 'results' | 'profile';
type Appointment = {
  id: string; folio: string; type: 'branch' | 'home'; requestedDate: string;
  requestedTime: string; status: AppointmentStatus; address: string | null;
  phone: string; patientName: string; email: string | null; birthDate: string;
  branchName: string | null; branchAddress: string | null; branchPhone: string | null;
  branchMapUrl: string | null; branchLatitude: number | null;
  branchLongitude: number | null; studies: string | null; notes: string | null;
  services: string[]; packages: string[];
};
type Profile = { id: string; name: string; email: string; birthDate: string | null };

const statusStyles: Record<AppointmentStatus, string> = {
  pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  confirmed: 'bg-blue-50 text-blue-800 ring-blue-200',
  cancelled: 'bg-red-50 text-red-700 ring-red-200',
  completed: 'bg-green-50 text-green-800 ring-green-200',
};
const RESULTS_URL = process.env.NEXT_PUBLIC_LABWORK_RESULTS_URL?.trim() ?? '';
const validResultsUrl = /^https:\/\/[^\s]+$/i.test(RESULTS_URL) ? RESULTS_URL : null;

function formatDate(date: string, locale: string) {
  const [year, month, day] = date.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return date;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'es-MX', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
function formatTime(time: string, locale: string) {
  const [hours, minutes] = time.slice(0, 5).split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'es-MX', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC',
  }).format(new Date(Date.UTC(2020, 0, 1, hours, minutes)));
}
function mexicoNowKey() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}
function directionsUrl(a: Appointment) {
  const url = a.branchMapUrl?.trim();
  if (url && /^https:\/\//i.test(url)) return url;
  if (a.branchLatitude != null && a.branchLongitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${a.branchLatitude}%2C${a.branchLongitude}`;
  }
  if (a.branchAddress) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.branchAddress)}`;
  }
  return null;
}
function phoneUrl(phone: string | null) {
  const value = phone?.replace(/[^\d+]/g, '');
  return value ? `tel:${value}` : null;
}

function AppointmentCard({ appointment, onPrint }: {
  appointment: Appointment;
  onPrint: (appointment: Appointment) => void;
}) {
  const t = useTranslations('PatientAppointments');
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const items = [...appointment.services, ...appointment.packages];
  const call = appointment.type === 'branch' ? phoneUrl(appointment.branchPhone) : null;
  const directions = appointment.type === 'branch' ? directionsUrl(appointment) : null;
  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_5px_20px_rgba(11,55,109,0.035)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t('appointmentFolio')}</p>
          <h4 className="mt-1 break-all text-lg font-semibold text-[#0b376d]">{appointment.folio}</h4>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[appointment.status]}`}>
          {t(`status.${appointment.status}`)}
        </span>
      </div>
      <div className="mt-4 space-y-2.5 text-sm text-slate-600">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="inline-flex items-center gap-2"><CalendarDays size={16} className="text-[#5b9d30]" />{formatDate(appointment.requestedDate, locale)}</span>
          <span className="inline-flex items-center gap-2"><Clock3 size={16} className="text-[#5b9d30]" />{formatTime(appointment.requestedTime, locale)}</span>
        </div>
        <p className="flex items-start gap-2">
          {appointment.type === 'home' ? <House size={16} className="mt-0.5 shrink-0 text-[#5b9d30]" /> : <MapPin size={16} className="mt-0.5 shrink-0 text-[#5b9d30]" />}
          <span>{appointment.type === 'home'
            ? `${t('homeService')}${appointment.address ? ` · ${appointment.address}` : ''}`
            : `${appointment.branchName ?? t('branch')}${appointment.branchAddress ? ` · ${appointment.branchAddress}` : ''}`}</span>
        </p>
      </div>
      <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}
        className="mt-5 flex w-full items-center justify-between rounded-xl bg-[#f1f5f9] px-4 py-3 text-left text-sm font-semibold text-[#0b376d] transition hover:bg-[#e8eff7]">
        {t('detailsAndReceipt')} {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
      </button>
      {expanded && (
        <div className="mt-5 space-y-5 border-t border-slate-100 pt-5">
          <div className="space-y-2 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-800">{t('patient')}:</span> {appointment.patientName}</p>
            <p><span className="font-semibold text-slate-800">{t('phone')}:</span> {appointment.phone}</p>
            {appointment.email && <p className="break-all"><span className="font-semibold text-slate-800">{t('email')}:</span> {appointment.email}</p>}
          </div>
          {(items.length > 0 || appointment.studies) && (
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#0b376d]"><Stethoscope size={16} /> {t('studiesAndPackages')}</p>
              {items.length > 0 ? (
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
                  {items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                </ul>
              ) : <p className="mt-2 text-sm text-slate-600">{appointment.studies}</p>}
            </div>
          )}
          {appointment.type === 'branch' && (call || directions) && (
            <div className="grid gap-2 sm:grid-cols-2">
              {call && <a href={call} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-[#0b376d] hover:bg-slate-50"><Phone size={16} /> {t('callBranch')}</a>}
              {directions && <a href={directions} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-[#0b376d] hover:bg-slate-50"><Navigation size={16} /> {t('directions')}</a>}
            </div>
          )}
          <button type="button" onClick={() => onPrint(appointment)}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0b376d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#124987]">
            <Printer size={17} /> {t('printOrSavePdf')}
          </button>
          <p className="text-xs leading-5 text-slate-500">{t('savePdfHint')}</p>
        </div>
      )}
    </article>
  );
}

function PrintReceipt({ appointment }: { appointment: Appointment }) {
  const t = useTranslations('PatientAppointments');
  const locale = useLocale();
  const items = [...appointment.services, ...appointment.packages];
  return (
    <section id="patient-appointment-receipt" className="hidden bg-white text-black print:block" aria-label={t('receiptAriaLabel')}>
      <div className="mx-auto max-w-2xl">
        <div className="border-b-2 border-slate-800 pb-5">
          <h1 className="text-2xl font-bold">{t('receiptBrand')}</h1>
          <p className="mt-1 text-sm">{t('receiptTitle')}</p>
        </div>
        <h2 className="mt-7 text-xl font-bold">{t('folio')} {appointment.folio}</h2>
        <p className="mt-2 text-sm">{t('appointmentStatus')}: {t(`status.${appointment.status}`)}</p>
        <dl className="mt-7 space-y-4 text-sm">
          <div><dt className="font-bold">{t('patient')}</dt><dd>{appointment.patientName}</dd></div>
          <div><dt className="font-bold">{t('contactPhone')}</dt><dd>{appointment.phone}</dd></div>
          {appointment.email && <div><dt className="font-bold">{t('emailAddress')}</dt><dd className="break-all">{appointment.email}</dd></div>}
          <div><dt className="font-bold">{t('date')}</dt><dd>{formatDate(appointment.requestedDate, locale)}</dd></div>
          <div><dt className="font-bold">{t('time')}</dt><dd>{formatTime(appointment.requestedTime, locale)}</dd></div>
          {appointment.type === 'branch' ? (
            <>
              <div><dt className="font-bold">{t('branch')}</dt><dd>{appointment.branchName ?? t('notAvailable')}</dd></div>
              {appointment.branchAddress && <div><dt className="font-bold">{t('address')}</dt><dd>{appointment.branchAddress}</dd></div>}
              {appointment.branchPhone && <div><dt className="font-bold">{t('branchPhone')}</dt><dd>{appointment.branchPhone}</dd></div>}
            </>
          ) : <div><dt className="font-bold">{t('homeService')}</dt><dd>{appointment.address ?? t('addressNotAvailable')}</dd></div>}
          {items.length > 0 && <div><dt className="font-bold">{t('studiesAndPackages')}</dt><dd>{items.join(', ')}</dd></div>}
          {items.length === 0 && appointment.studies && <div><dt className="font-bold">{t('studies')}</dt><dd>{appointment.studies}</dd></div>}
        </dl>
        <p className="mt-10 border-t border-slate-300 pt-4 text-xs">{t('receiptNotice')}</p>
      </div>
    </section>
  );
}

export function PatientAppointments() {
  const t = useTranslations('PatientAppointments');
  const locale = useLocale();
  const [tab, setTab] = useState<Tab>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState<'appointmentsLoad' | 'appointmentsInvalid' | 'appointmentsUnknown' | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileErrorKey, setProfileErrorKey] = useState<'profileLoad' | 'profileUnavailable' | 'profileUnknown' | null>(null);
  const [printing, setPrinting] = useState<Appointment | null>(null);
  const [nowKey, setNowKey] = useState('');

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setErrorKey(null);
    try {
      const response = await fetch('/api/patients/me/appointments', { cache: 'no-store' });
      if (!response.ok) { setErrorKey('appointmentsLoad'); return; }
      const payload: { data?: Appointment[] } = await response.json();
      if (!Array.isArray(payload.data)) { setErrorKey('appointmentsInvalid'); return; }
      setAppointments(payload.data);
      setNowKey(mexicoNowKey());
    } catch {
      setErrorKey('appointmentsUnknown');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAppointments();
    setNowKey(mexicoNowKey());
    const interval = window.setInterval(() => setNowKey(mexicoNowKey()), 60_000);
    return () => window.clearInterval(interval);
  }, [loadAppointments]);

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const response = await fetch('/api/patients/me', { cache: 'no-store' });
        if (!response.ok) { if (active) setProfileErrorKey('profileLoad'); return; }
        const payload: { data?: Profile } = await response.json();
        if (!payload.data) { if (active) setProfileErrorKey('profileUnavailable'); return; }
        if (active) setProfile(payload.data);
      } catch {
        if (active) setProfileErrorKey('profileUnknown');
      } finally {
        if (active) setProfileLoading(false);
      }
    }
    void loadProfile();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!printing) return;
    const frame = window.requestAnimationFrame(() => window.requestAnimationFrame(() => window.print()));
    return () => window.cancelAnimationFrame(frame);
  }, [printing]);

  const { upcoming, history } = useMemo(() => {
    const upcoming = appointments.filter((a) =>
      (a.status === 'pending' || a.status === 'confirmed') &&
      `${a.requestedDate.slice(0, 10)}T${a.requestedTime.slice(0, 5)}` >= nowKey,
    ).sort((a, b) => `${a.requestedDate}T${a.requestedTime}`.localeCompare(`${b.requestedDate}T${b.requestedTime}`));
    const ids = new Set(upcoming.map((a) => a.id));
    return { upcoming, history: appointments.filter((a) => !ids.has(a.id)) };
  }, [appointments, nowKey]);

  const tiles: { id: Tab; title: string; subtitle: string; icon: typeof CalendarDays }[] = [
    { id: 'appointments', title: t('tabs.appointments.title'), subtitle: t('tabs.appointments.subtitle'), icon: CalendarDays },
    { id: 'results', title: t('tabs.results.title'), subtitle: t('tabs.results.subtitle'), icon: FileText },
    { id: 'profile', title: t('tabs.profile.title'), subtitle: t('tabs.profile.subtitle'), icon: UserRound },
  ];

  return (
    <>
      <section className="mt-8 space-y-8 print:hidden">
        <div className="grid gap-3 sm:grid-cols-3" role="tablist" aria-label={t('accountSections')}>
          {tiles.map((tile) => {
            const Icon = tile.icon;
            const active = tab === tile.id;
            return (
              <button key={tile.id} type="button" role="tab" aria-selected={active} onClick={() => setTab(tile.id)}
                className={`flex min-h-[86px] items-center gap-3 rounded-2xl border p-4 text-left transition sm:p-5 ${active ? 'border-[#bad6f2] bg-[#eef5fd] shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-[#0b376d] text-white' : 'bg-[#eef4fb] text-[#0b376d]'}`}><Icon size={21} /></span>
                <span className="min-w-0"><span className="block text-sm font-semibold text-[#0b376d]">{tile.title}</span><span className="mt-1 block text-xs text-slate-500">{tile.subtitle}</span></span>
                <ArrowRight size={15} className="ml-auto shrink-0 text-slate-400" />
              </button>
            );
          })}
        </div>

        {tab === 'appointments' && (
          <div role="tabpanel" className="space-y-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="text-xl font-semibold text-[#0b376d]">{t('myAppointments')}</h2><p className="mt-1 text-sm text-slate-500">{t('appointmentsDescription')}</p></div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => void loadAppointments()} disabled={loading} aria-label={t('refreshAppointments')} title={t('refreshAppointments')}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0b376d] transition hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={17} className={loading ? 'animate-spin' : ''} /></button>
                <Link href="/agendar" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#7acb3b] px-4 py-2.5 text-sm font-semibold text-[#0b376d] transition hover:bg-[#6ab72f]"><CalendarPlus size={17} /> {t('newAppointment')}</Link>
              </div>
            </div>
            {loading ? <div role="status" className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{t('loadingAppointments')}</div>
              : errorKey ? <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{t(`errors.${errorKey}`)}</div>
              : appointments.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
                  <ClipboardList size={32} className="mx-auto text-[#5b9d30]" />
                  <h3 className="mt-3 text-lg font-semibold text-[#0b376d]">{t('noAppointmentsTitle')}</h3>
                  <p className="mt-2 text-sm text-slate-600">{t('noAppointmentsDescription')}</p>
                  <Link href="/agendar" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0b376d] hover:underline">{t('bookFirstAppointment')} <ArrowRight size={16} /></Link>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5"><span className="rounded-xl bg-[#eaf5e3] p-3 text-[#5b9d30]"><CalendarDays size={21} /></span><div><p className="text-sm text-slate-500">{t('upcomingAppointments')}</p><p className="text-2xl font-semibold text-[#0b376d]">{upcoming.length}</p></div></div>
                    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5"><span className="rounded-xl bg-[#eef4fb] p-3 text-[#0b376d]"><ClipboardList size={21} /></span><div><p className="text-sm text-slate-500">{t('totalAppointments')}</p><p className="text-2xl font-semibold text-[#0b376d]">{appointments.length}</p></div></div>
                  </div>
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#0b376d]"><CalendarDays size={19} className="text-[#5b9d30]" /> {t('upcomingAppointments')}</h3>
                    {upcoming.length > 0 ? <div className="grid items-start gap-4 lg:grid-cols-2">{upcoming.map((a) => <AppointmentCard key={a.id} appointment={a} onPrint={setPrinting} />)}</div> : <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">{t('noUpcomingAppointments')}</p>}
                  </div>
                  {history.length > 0 && <div><h3 className="mb-3 text-lg font-semibold text-[#0b376d]">{t('appointmentHistory')}</h3><div className="grid items-start gap-4 lg:grid-cols-2">{history.map((a) => <AppointmentCard key={a.id} appointment={a} onPrint={setPrinting} />)}</div></div>}
                </>
              )}
          </div>
        )}

        {tab === 'results' && (
          <div role="tabpanel" className="max-w-3xl rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8">
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef4fb] text-[#0b376d]"><FileText size={26} /></div>
            <h2 className="text-xl font-semibold text-[#0b376d]">{t('viewResults')}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{t('resultsDescription')}</p>
            {validResultsUrl ? (
              <a href={validResultsUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0b376d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#124987]">{t('goToResultsPortal')} <ExternalLink size={17} /></a>
            ) : (
              <div className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-500"><ExternalLink size={17} /> {t('resultsLinkComingSoon')}</div>
            )}
            <p className="mt-4 text-xs text-slate-500">{t('resultsExternalNotice')}</p>
          </div>
        )}

        {tab === 'profile' && (
          <div role="tabpanel" className="max-w-3xl rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8">
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef4fb] text-[#0b376d]"><UserRound size={26} /></div>
            <h2 className="text-xl font-semibold text-[#0b376d]">{t('myProfile')}</h2>
            <p className="mt-2 text-sm text-slate-500">{t('profileDescription')}</p>
            {profileLoading ? <p className="mt-6 text-sm text-slate-500">{t('loadingProfile')}</p>
              : profileErrorKey ? <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{t(`errors.${profileErrorKey}`)}</p>
              : profile ? (
                <dl className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200 px-5">
                  <div className="py-4"><dt className="flex items-center gap-2 text-xs font-semibold text-slate-500"><UserRound size={15} /> {t('fullName')}</dt><dd className="mt-1 text-sm font-medium text-[#0b376d]">{profile.name}</dd></div>
                  <div className="py-4"><dt className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Mail size={15} /> {t('emailAddress')}</dt><dd className="mt-1 break-all text-sm font-medium text-[#0b376d]">{profile.email}</dd></div>
                  <div className="py-4"><dt className="flex items-center gap-2 text-xs font-semibold text-slate-500"><CalendarDays size={15} /> {t('birthDate')}</dt><dd className="mt-1 text-sm font-medium text-[#0b376d]">{profile.birthDate ? formatDate(profile.birthDate, locale) : t('notRegistered')}</dd></div>
                </dl>
              ) : null}
            <p className="mt-5 text-xs text-slate-500">{t('profileReadOnly')}</p>
          </div>
        )}
      </section>
      <style>{`@media print {
        @page { size: A4; margin: 12mm; }
        body * { visibility: hidden !important; }
        #patient-appointment-receipt, #patient-appointment-receipt * { visibility: visible !important; }
        #patient-appointment-receipt { display: block !important; position: absolute !important; left: 0; top: 0; width: 100%; padding: 0; margin: 0; }
      }`}</style>
      {printing && <PrintReceipt appointment={printing} />}
    </>
  );
}
