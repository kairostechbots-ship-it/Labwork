'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import * as Lucide from 'lucide-react';

// Algunos paquetes de iconos pueden no exportar todos los nombres.
// Usar un icono de respaldo evita que React intente renderizar undefined.
function safeIcon(name: string): Lucide.LucideIcon {
  const icons = Lucide as unknown as Record<string, Lucide.LucideIcon | undefined>;
  return icons[name] ?? Lucide.Circle;
}
const AlertCircle = safeIcon('AlertCircle');
const AlertTriangle = safeIcon('AlertTriangle');
const ArrowLeft = safeIcon('ArrowLeft');
const CalendarCheck2 = safeIcon('CalendarCheck2');
const CalendarDays = safeIcon('CalendarDays');
const Check = safeIcon('Check');
const CheckCircle2 = safeIcon('CheckCircle2');
const ChevronLeft = safeIcon('ChevronLeft');
const ChevronRight = safeIcon('ChevronRight');
const Clock3 = safeIcon('Clock3');
const FilterX = safeIcon('FilterX');
const House = safeIcon('House');
const Loader2 = safeIcon('Loader2');
const Mail = safeIcon('Mail');
const MapPin = safeIcon('MapPin');
const MessageCircle = safeIcon('MessageCircle');
const RefreshCw = safeIcon('RefreshCw');
const Search = safeIcon('Search');
const UserRound = safeIcon('UserRound');
const X = safeIcon('X');
const XCircle = safeIcon('XCircle');
const FlaskConical = safeIcon('FlaskConical');
const Package = safeIcon('Package');

type Status = 'pending' | 'confirmed' | 'cancelled' | 'completed';
type Appointment = {
  id: string; folio: string; patientName: string; birthDate?: string | null;
  phone?: string | null; email?: string | null; type: 'home' | 'branch';
  branchId?: string | null; address?: string | null; requestedDate: string;
  requestedTime: string; status: Status; notes?: string | null;
};
type Detail = Appointment & {
  serviceIds?: string[]; packageIds?: string[];
  history?: { id?: string; previousStatus?: string | null; newStatus?: string;
    note?: string | null; createdAt?: string | null }[];
};
type CatalogItem = Record<string, unknown>;
type Catalog = { items: CatalogItem[]; error: boolean };

// Ajusta únicamente estas rutas si tus catálogos usan otros endpoints.
const CATALOG_URLS = {
  branches: '/api/admin/branches',
  services: '/api/admin/services',
  packages: '/api/admin/packages',
};
const PAGE_SIZE = 8;
const TZ = 'America/Mexico_City';
const labels: Record<Status, string> = {
  pending: 'Pendiente', confirmed: 'Confirmada',
  cancelled: 'Cancelada', completed: 'Completada',
};
const badges: Record<Status, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  confirmed: 'bg-green-50 text-green-700 ring-green-200',
  cancelled: 'bg-red-50 text-red-700 ring-red-200',
  completed: 'bg-blue-50 text-blue-700 ring-blue-200',
};
function localNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
}
function dateLabel(value?: string | null) {
  if (!value) return 'Sin fecha';
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(date);
}
function timeLabel(value?: string | null) { return value ? value.slice(0, 5) : 'Sin horario'; }
function overdue(a: Appointment, now: ReturnType<typeof localNow>) {
  return a.status === 'pending' && (a.requestedDate < now.date ||
    (a.requestedDate === now.date && timeLabel(a.requestedTime) < now.time));
}
function textField(item: CatalogItem, keys: string[]) {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}
function catalogId(item: CatalogItem) {
  const value = item.id ?? item.serviceId ?? item.packageId ?? item.branchId;
  return value === undefined || value === null ? null : String(value);
}
function unwrapCatalog(json: unknown): CatalogItem[] {
  if (Array.isArray(json)) return json.filter(x => x && typeof x === 'object');
  if (!json || typeof json !== 'object') return [];
  const body = json as Record<string, unknown>;
  const candidates = [body.data, body.items, body.results];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate.filter(x => x && typeof x === 'object');
    if (candidate && typeof candidate === 'object') {
      const nested = candidate as Record<string, unknown>;
      if (Array.isArray(nested.items)) return nested.items.filter(x => x && typeof x === 'object');
      if (Array.isArray(nested.data)) return nested.data.filter(x => x && typeof x === 'object');
    }
  }
  return [];
}
async function fetchCatalog(url: string): Promise<Catalog> {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return { items: [], error: true };
    return { items: unwrapCatalog(await response.json()), error: false };
  } catch { return { items: [], error: true }; }
}
function findCatalogItem(items: CatalogItem[], id: string | null | undefined) {
  if (id == null) return null;
  return items.find(item => catalogId(item) === String(id)) ?? null;
}
function StatusBadge({ status }: { status: Status }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${badges[status] ?? ''}`}>{labels[status] ?? status}</span>;
}
function Metric({ title, value, icon: Icon, color }: {
  title: string; value: number | string; icon: Lucide.LucideIcon;
  color: 'blue' | 'amber' | 'green' | 'red';
}) {
  const colors = { blue: 'bg-blue-50 text-blue-700', amber: 'bg-amber-50 text-amber-700',
    green: 'bg-green-50 text-green-700', red: 'bg-red-50 text-red-700' };
  return <div className="rounded-2xl border border-primary-100/80 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 font-display text-3xl font-bold text-primary-950">{value}</p></div>
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors[color]}`}><Icon className="h-5 w-5" /></div>
    </div></div>;
}
function phoneWhatsapp(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `52${digits}`;
  if (digits.length === 13 && digits.startsWith('521')) return `52${digits.slice(3)}`;
  return digits;
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catalogs, setCatalogs] = useState<Record<keyof typeof CATALOG_URLS, Catalog>>({
    branches: { items: [], error: false }, services: { items: [], error: false }, packages: { items: [], error: false },
  });
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [action, setAction] = useState<'confirmed' | 'cancelled' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'warning'; message: string } | null>(null);
  const [now, setNow] = useState(localNow);

  const loadAppointments = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/appointments', { cache: 'no-store' });
      if (!response.ok) throw new Error(`No se pudieron consultar las citas (${response.status}).`);
      const json = await response.json();
      if (!Array.isArray(json.data)) throw new Error('Formato de citas inesperado.');
      setAppointments(json.data);
      setNow(localNow());
    } catch (err) { setError(err instanceof Error ? err.message : 'Error al cargar las citas.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  const loadCatalogs = useCallback(async () => {
    setCatalogLoading(true);
    const [branches, services, packages] = await Promise.all([
      fetchCatalog(CATALOG_URLS.branches), fetchCatalog(CATALOG_URLS.services), fetchCatalog(CATALOG_URLS.packages),
    ]);
    setCatalogs({ branches, services, packages });
    setCatalogLoading(false);
  }, []);
  useEffect(() => { void loadAppointments(); void loadCatalogs(); }, [loadAppointments, loadCatalogs]);
  useEffect(() => {
    if (!selectedId) { setDetail(null); setDetailError(null); return; }
    const controller = new AbortController();
    setDetailLoading(true); setDetailError(null); setDetail(null);
    fetch(`/api/admin/appointments/${selectedId}`, { cache: 'no-store', signal: controller.signal })
      .then(async r => { if (!r.ok) throw new Error('No se pudo consultar el detalle.'); return r.json(); })
      .then(json => { if (!controller.signal.aborted) setDetail(json.data); })
      .catch(err => { if (!controller.signal.aborted) setDetailError(err instanceof Error ? err.message : 'Error al consultar cita.'); })
      .finally(() => { if (!controller.signal.aborted) setDetailLoading(false); });
    return () => controller.abort();
  }, [selectedId]);
  useEffect(() => {
    if (!selectedId && !action) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) { if (action) setAction(null); else setSelectedId(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, action, saving]);
  const stats = useMemo(() => ({
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  }), [appointments]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return appointments.filter(a =>
      (!query || a.patientName?.toLowerCase().includes(query) || a.folio?.toLowerCase().includes(query)) &&
      (statusFilter === 'all' || a.status === statusFilter) &&
      (locationFilter === 'all' || (locationFilter === 'home' && a.type === 'home') || (locationFilter === 'branch' && a.type === 'branch') || (locationFilter.startsWith('branch:') && a.type === 'branch' && String(a.branchId ?? '') === locationFilter.slice(7))) &&
      (!dateFilter || a.requestedDate === dateFilter)
    ).sort((a, b) => {
      const aLate = overdue(a, now), bLate = overdue(b, now);
      if (aLate !== bLate) return aLate ? -1 : 1;
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (b.status === 'pending' && a.status !== 'pending') return 1;
      return `${a.requestedDate}T${a.requestedTime}`.localeCompare(`${b.requestedDate}T${b.requestedTime}`);
    });
  }, [appointments, search, statusFilter, locationFilter, dateFilter, now]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const branch = detail ? findCatalogItem(catalogs.branches.items, detail.branchId) : null;
  const branchName = branch && textField(branch, ['name', 'nombre', 'branchName', 'title']);
  const branchAddress = branch && textField(branch, ['address', 'direccion', 'fullAddress', 'streetAddress']);
  const services = (detail?.serviceIds ?? []).map(id => ({
    id, item: findCatalogItem(catalogs.services.items, id),
  }));
  const packages = (detail?.packageIds ?? []).map(id => ({
    id, item: findCatalogItem(catalogs.packages.items, id),
  }));
  async function submitAction() {
    if (!detail || !action || saving) return;
    const id = detail.id;
    const status = action;
    setSaving(true); setActionError(null); setNotice(null);
    try {
      const response = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note: actionNote.trim() || undefined }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(typeof json.error === 'string' ? json.error : json.error?.message ?? json.message ?? 'No se pudo actualizar la cita.');
      if (!json.data) throw new Error('El servidor no confirmó la actualización.');
      const updated = json.data as Appointment;
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
      setDetail(prev => prev ? { ...prev, ...updated } : prev);
      setAction(null);
      if (json.calendarSync?.status === 'error') {
        setNotice({ type: 'warning', message: `La cita quedó ${labels[status].toLowerCase()}, pero Google Calendar no se sincronizó: ${json.calendarSync.message || 'revisa la integración.'}` });
      } else {
        setNotice({ type: 'success', message: `La cita ${updated.folio || ''} se actualizó correctamente.` });
      }
      void loadAppointments(true);
      try {
        const r = await fetch(`/api/admin/appointments/${id}`, { cache: 'no-store' });
        if (r.ok) { const refreshed = await r.json(); setDetail(refreshed.data); }
      } catch { /* El cambio ya se guardó; no revertir por un fallo de refresco. */ }
    } catch (err) { setActionError(err instanceof Error ? err.message : 'Error al actualizar la cita.'); }
    finally { setSaving(false); }
  }
  return <div className="space-y-7">
    <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div><Link href="/admin" className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-900"><ArrowLeft className="h-4 w-4" />Volver al inicio</Link>
        <h2 className="font-display text-2xl font-bold text-primary-950 sm:text-3xl">Gestión de citas</h2>
        <p className="mt-2 text-sm text-slate-500">Consulta y administra las solicitudes de los pacientes.</p></div>
      <button type="button" onClick={() => { void loadAppointments(true); void loadCatalogs(); }} disabled={loading || refreshing}
        className="inline-flex w-fit items-center gap-2 rounded-xl border border-primary-100 bg-white px-4 py-3 text-sm font-semibold text-primary-700 shadow-sm transition hover:bg-primary-50 disabled:opacity-50">
        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />Actualizar citas</button>
    </section>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric title="Total de citas" value={loading ? '—' : stats.total} icon={CalendarDays} color="blue" />
      <Metric title="Pendientes" value={loading ? '—' : stats.pending} icon={Clock3} color="amber" />
      <Metric title="Confirmadas" value={loading ? '—' : stats.confirmed} icon={CalendarCheck2} color="green" />
      <Metric title="Canceladas" value={loading ? '—' : stats.cancelled} icon={XCircle} color="red" />
    </div>
    {!catalogLoading && (catalogs.branches.error || catalogs.services.error || catalogs.packages.error) && (
      <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        No se pudieron cargar algunos catálogos. Los nombres de sucursales, estudios o paquetes podrían no aparecer. Verifica los permisos GET de /api/admin/branches, /api/admin/services y /api/admin/packages.
      </div>
    )}
    {error && <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="h-5 w-5" />{error}</div>}
    {notice && <div role="status" className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-sm ${notice.type === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-green-200 bg-green-50 text-green-800'}`}>
      <div className="flex items-start gap-2">{notice.type === 'warning' ? <AlertTriangle className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}<p>{notice.message}</p></div>
      <button onClick={() => setNotice(null)} aria-label="Cerrar aviso"><X className="h-4 w-4" /></button></div>}
    <section className="overflow-hidden rounded-2xl border border-primary-100/80 bg-white shadow-sm">
      <div className="border-b border-primary-100/80 p-5 sm:p-6">
        <h3 className="font-display text-lg font-bold text-primary-950">Solicitudes registradas</h3>
        <p className="mt-1 mb-5 text-xs text-slate-500">Busca, filtra y selecciona una cita para ver su detalle.</p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(200px,1fr)_160px_220px_165px_auto]">
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar paciente o folio..." aria-label="Buscar paciente o folio"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-primary-400" /></div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} aria-label="Filtrar estado" className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
            <option value="all">Todos los estados</option><option value="pending">Pendientes</option><option value="confirmed">Confirmadas</option><option value="cancelled">Canceladas</option><option value="completed">Completadas</option></select>
          <select value={locationFilter} onChange={e => { setLocationFilter(e.target.value); setPage(1); }} aria-label="Filtrar por sucursal o domicilio" className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
            <option value="all">Todas las ubicaciones</option>
            <option value="home">A domicilio</option>
            <option value="branch">Todas las sucursales</option>
            {catalogs.branches.items.map(item => {
              const id = catalogId(item);
              if (!id) return null;
              return <option key={id} value={`branch:${id}`}>{textField(item, ['name', 'nombre', 'branchName', 'title']) ?? `Sucursal ${id}`}</option>;
            })}
          </select>
          <input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1); }} aria-label="Filtrar fecha" className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700" />
          <button type="button" onClick={() => { setSearch(''); setStatusFilter('all'); setLocationFilter('all'); setDateFilter(''); setPage(1); }} title="Limpiar filtros" className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-slate-600 hover:bg-slate-50"><FilterX className="h-4 w-4" /><span className="xl:hidden">Limpiar</span></button>
        </div>
      </div>
      {loading ? <div className="space-y-3 p-6">{[1,2,3,4,5].map(n => <div key={n} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div>
      : filtered.length === 0 ? <div className="px-6 py-16 text-center"><CalendarDays className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-4 text-sm font-bold text-primary-950">No se encontraron citas</p></div>
      : <><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead className="bg-primary-50/60"><tr className="text-[11px] font-bold uppercase tracking-wide text-primary-700">
        <th className="px-5 py-4">Folio</th><th className="px-5 py-4">Paciente</th><th className="px-5 py-4">Fecha y hora</th><th className="px-5 py-4">Sucursal / atención</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4 text-right">Acción</th></tr></thead>
        <tbody className="divide-y divide-slate-100">{visible.map(a => <tr key={a.id} className="hover:bg-primary-50/40">
          <td className="whitespace-nowrap px-5 py-4 text-xs font-bold text-primary-800">{a.folio}</td>
          <td className="px-5 py-4"><p className="max-w-[230px] truncate text-sm font-semibold text-primary-950">{a.patientName}</p></td>
          <td className="whitespace-nowrap px-5 py-4"><p className="text-sm font-medium text-slate-700">{dateLabel(a.requestedDate)}</p><p className="mt-1 text-xs text-slate-400">{timeLabel(a.requestedTime)}</p>{overdue(a, now) && <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700"><AlertTriangle className="h-3 w-3" />Horario vencido</span>}</td>
          <td className="px-5 py-4"><span className="inline-flex items-center gap-1.5 text-xs text-slate-600">{a.type === 'home' ? <House className="h-4 w-4 text-primary-600" /> : <MapPin className="h-4 w-4 text-primary-600" />}{a.type === 'home' ? 'A domicilio' : (textField(findCatalogItem(catalogs.branches.items, a.branchId) ?? {}, ['name', 'nombre', 'branchName', 'title']) ?? (catalogLoading ? 'Cargando sucursal...' : catalogs.branches.error ? 'Sucursal no disponible' : 'Sucursal sin identificar'))}</span></td>
          <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
          <td className="px-5 py-4 text-right"><button type="button" onClick={() => { setSelectedId(a.id); setNotice(null); }} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-primary-700 hover:bg-primary-50">Ver detalle<ChevronRight className="h-4 w-4" /></button></td>
        </tr>)}</tbody></table></div>
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-slate-500">Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length} citas</p>
          <div className="flex items-center gap-2"><button type="button" disabled={currentPage === 1} onClick={() => setPage(v => Math.max(1, v - 1))} aria-label="Anterior" className="rounded-lg border border-slate-200 p-2 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><span className="px-2 text-xs">Página {currentPage} de {pages}</span><button type="button" disabled={currentPage === pages} onClick={() => setPage(v => Math.min(pages, v + 1))} aria-label="Siguiente" className="rounded-lg border border-slate-200 p-2 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button></div></div></>}
    </section>
    {selectedId && <div className="fixed inset-0 z-[80]">
      <button type="button" aria-label="Cerrar detalle" onClick={() => { if (!saving) setSelectedId(null); }} className="absolute inset-0 bg-primary-950/50 backdrop-blur-[2px]" />
      <aside role="dialog" aria-modal="true" aria-label="Detalle de la cita" className="absolute inset-y-0 right-0 flex w-full max-w-[540px] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-primary-100 px-5 py-5 sm:px-7"><div><h3 className="font-display text-xl font-bold text-primary-950">Detalle de cita</h3><p className="mt-1 text-xs text-slate-500">Información de la solicitud</p></div><button type="button" onClick={() => { if (!saving) setSelectedId(null); }} aria-label="Cerrar panel" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
        {detailLoading ? <div className="flex flex-1 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>
        : detailError || !detail ? <div className="p-7 text-sm text-red-600">{detailError || 'No se encontró la cita.'}</div>
        : <><div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-7">
          <div className="rounded-2xl bg-primary-900 p-5 text-white"><p className="text-xs text-white/60">{detail.folio}</p><h4 className="mt-2 font-display text-lg font-bold">{detail.patientName}</h4><div className="mt-4 flex flex-wrap items-center gap-3"><StatusBadge status={detail.status} /><span className="text-xs text-white/70">{detail.type === 'home' ? 'Toma a domicilio' : 'Atención en sucursal'}</span></div></div>
          <section><h4 className="mb-3 text-sm font-bold text-primary-950">Fecha y horario</h4><div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-4"><CalendarDays className="mb-2 h-5 w-5 text-primary-600" /><p className="text-xs text-slate-400">Fecha</p><p className="mt-1 text-sm font-semibold text-primary-950">{dateLabel(detail.requestedDate)}</p></div><div className="rounded-xl bg-slate-50 p-4"><Clock3 className="mb-2 h-5 w-5 text-primary-600" /><p className="text-xs text-slate-400">Horario</p><p className="mt-1 text-sm font-semibold text-primary-950">{timeLabel(detail.requestedTime)}</p></div></div></section>
          <section><h4 className="mb-3 text-sm font-bold text-primary-950">Datos del paciente</h4><div className="space-y-3 rounded-xl border border-slate-100 p-4">
            <div className="flex items-start gap-3"><UserRound className="mt-0.5 h-4 w-4 text-primary-500" /><div><p className="text-xs text-slate-400">Nombre completo</p><p className="text-sm font-medium text-slate-700">{detail.patientName}</p></div></div>
            {detail.phone && <p className="text-sm text-slate-600">Teléfono: {detail.phone}</p>}
            {detail.email && <p className="break-all text-sm text-slate-600">Correo: {detail.email}</p>}
            {detail.birthDate && <p className="text-sm text-slate-600">Fecha de nacimiento: {dateLabel(detail.birthDate)}</p>}
            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              {detail.phone && <a href={`https://wa.me/${phoneWhatsapp(detail.phone)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"><MessageCircle className="h-4 w-4" />WhatsApp</a>}
              {detail.email && <a href={`mailto:${detail.email}`} className="flex items-center justify-center gap-2 rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-100"><Mail className="h-4 w-4" />Enviar correo</a>}
            </div>
          </div></section>
          <section><h4 className="mb-3 text-sm font-bold text-primary-950">Lugar de atención</h4><div className="flex items-start gap-3 rounded-xl border border-slate-100 p-4">{detail.type === 'home' ? <House className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" /> : <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />}<div className="min-w-0">
            <p className="text-sm font-bold text-primary-950">{detail.type === 'home' ? 'Toma a domicilio' : (branchName || 'Atención en sucursal')}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{detail.type === 'home' ? (detail.address || 'Dirección no disponible') : (branchAddress || (catalogLoading ? 'Consultando sucursal...' : catalogs.branches.error ? 'No se pudo consultar el catálogo de sucursales.' : branchName ? 'Dirección no disponible.' : 'Nombre de sucursal no disponible en el catálogo.'))}</p>
          </div></div></section>
          <section><h4 className="mb-3 text-sm font-bold text-primary-950">Estudios solicitados</h4><div className="space-y-2">
            {services.length ? services.map(({ id, item }) => <div key={id} className="flex items-start gap-3 rounded-xl border border-slate-100 p-4"><FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" /><div><p className="text-sm font-semibold text-primary-950">{(item && textField(item, ['name', 'nombre', 'serviceName', 'title'])) || (catalogLoading ? 'Consultando estudio...' : 'Estudio sin nombre disponible')}</p>{!item && !catalogLoading && <p className="mt-1 text-xs text-slate-400">Identificador: {id}</p>}</div></div>)
            : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No hay estudios individuales asociados.</p>}
          </div></section>
          <section><h4 className="mb-3 text-sm font-bold text-primary-950">Paquetes solicitados</h4><div className="space-y-2">
            {packages.length ? packages.map(({ id, item }) => <div key={id} className="flex items-start gap-3 rounded-xl border border-slate-100 p-4"><Package className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" /><div><p className="text-sm font-semibold text-primary-950">{(item && textField(item, ['name', 'nombre', 'packageName', 'title'])) || (catalogLoading ? 'Consultando paquete...' : 'Paquete sin nombre disponible')}</p>{!item && !catalogLoading && <p className="mt-1 text-xs text-slate-400">Identificador: {id}</p>}</div></div>)
            : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No hay paquetes asociados.</p>}
          </div></section>
          {detail.notes && <section><h4 className="mb-3 text-sm font-bold text-primary-950">Observaciones</h4><p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{detail.notes}</p></section>}
          <section><h4 className="mb-3 text-sm font-bold text-primary-950">Historial de estados</h4>{detail.history?.length ? <div className="space-y-3">{detail.history.map((entry, index) => <div key={entry.id ?? index} className="rounded-xl border border-slate-100 p-4"><p className="text-sm font-semibold text-primary-950">{entry.previousStatus || 'Inicio'} → {entry.newStatus || 'Actualización'}</p>{entry.note && <p className="mt-2 text-xs text-slate-600">{entry.note}</p>}{entry.createdAt && <p className="mt-2 text-[11px] text-slate-400">{new Date(entry.createdAt).toLocaleString('es-MX', { timeZone: TZ })}</p>}</div>)}</div> : <p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">Aún no hay cambios de estado registrados.</p>}</section>
        </div><div className="border-t border-primary-100 bg-white p-5 sm:p-6">{detail.status === 'pending' ? <div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => { setAction('cancelled'); setActionNote(''); setActionError(null); }} className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-50"><XCircle className="h-4 w-4" />Cancelar</button><button type="button" onClick={() => { setAction('confirmed'); setActionNote(''); setActionError(null); }} className="flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-3 text-sm font-bold text-white hover:brightness-95"><Check className="h-4 w-4" />Confirmar</button></div> : <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Estado actual: <strong>{labels[detail.status]}</strong></div>}</div></>}
      </aside></div>}
    {action && detail && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary-950/60 p-4"><div role="dialog" aria-modal="true" aria-labelledby="action-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h3 id="action-title" className="font-display text-xl font-bold text-primary-950">¿{action === 'confirmed' ? 'Confirmar' : 'Cancelar'} esta cita?</h3><p className="mt-3 text-sm text-slate-600">{detail.folio} · {detail.patientName}</p><p className="mt-1 text-xs text-slate-500">{dateLabel(detail.requestedDate)} a las {timeLabel(detail.requestedTime)}</p><label htmlFor="action-note" className="mt-5 block text-sm font-semibold text-primary-950">Observaciones</label><textarea id="action-note" value={actionNote} onChange={e => setActionNote(e.target.value)} rows={3} disabled={saving} placeholder="Observación (opcional)" className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-primary-400" />{actionError && <p role="alert" className="mt-3 text-xs text-red-600">{actionError}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setAction(null)} disabled={saving} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-50">Volver</button><button type="button" onClick={() => void submitAction()} disabled={saving} className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 ${action === 'confirmed' ? 'bg-accent-500' : 'bg-red-600'}`}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? 'Guardando...' : action === 'confirmed' ? 'Confirmar cita' : 'Cancelar cita'}</button></div></div></div>}
  </div>;
}
