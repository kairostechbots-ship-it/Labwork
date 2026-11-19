'use client';

import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock3, House, Loader2, MapPin, RefreshCw, Save, Settings2 } from 'lucide-react';

type Branch = { id: string; name: string; isActive: boolean };
type Mode = 'branch' | 'home';
type Schedule = {
  weekdayOpen: string;
  weekdayClose: string;
  saturdayOpen: string;
  saturdayClose: string;
  slotMinutes: number;
  capacity: number;
  isActive: boolean;
  allowSameDay?: boolean;
  minimumAdvanceDays?: number;
  requiresConfirmation?: boolean;
};

const DEFAULT_BRANCH: Schedule = {
  weekdayOpen: '07:00', weekdayClose: '17:00', saturdayOpen: '07:00', saturdayClose: '14:00',
  slotMinutes: 30, capacity: 1, allowSameDay: true, isActive: true,
};
const DEFAULT_HOME: Schedule = {
  weekdayOpen: '08:00', weekdayClose: '16:00', saturdayOpen: '08:00', saturdayClose: '13:00',
  slotMinutes: 60, capacity: 1, minimumAdvanceDays: 1, requiresConfirmation: true, isActive: false,
};
const normalizeTime = (value: string) => value.slice(0, 5);
const toMinutes = (value: string) => { const [h, m] = value.split(':').map(Number); return h * 60 + m; };
const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:bg-slate-50';
const labelClass = 'mb-1.5 block text-xs font-semibold text-slate-600';

async function readJson(response: Response) {
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json?.error || json?.message || `Error HTTP ${response.status}`);
  return json;
}
function normalize(data: Schedule, mode: Mode): Schedule {
  const base = mode === 'home' ? DEFAULT_HOME : DEFAULT_BRANCH;
  return {
    ...base,
    weekdayOpen: normalizeTime(data.weekdayOpen), weekdayClose: normalizeTime(data.weekdayClose),
    saturdayOpen: normalizeTime(data.saturdayOpen), saturdayClose: normalizeTime(data.saturdayClose),
    slotMinutes: Number(data.slotMinutes), capacity: Number(data.capacity),
    isActive: Boolean(data.isActive),
    ...(mode === 'home' ? {
      minimumAdvanceDays: Number(data.minimumAdvanceDays), requiresConfirmation: Boolean(data.requiresConfirmation),
    } : { allowSameDay: Boolean(data.allowSameDay) }),
  };
}

export default function HorariosPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState('');
  const [mode, setMode] = useState<Mode>('branch');
  const [form, setForm] = useState<Schedule>(DEFAULT_BRANCH);
  const [original, setOriginal] = useState<Schedule | null>(null);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const requestId = useRef(0);

  const endpoint = useCallback((id: string, kind: Mode) =>
    `/api/admin/branches/${encodeURIComponent(id)}/${kind === 'home' ? 'home-schedule' : 'schedule'}`,
  []);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const json = await readJson(await fetch('/api/admin/branches', { cache: 'no-store' }));
        if (!active) return;
        const items: Branch[] = json.data ?? [];
        setBranches(items);
        setBranchId(current => items.some(item => item.id === current) ? current : (items[0]?.id ?? ''));
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'No se pudieron cargar las sucursales.');
      } finally { if (active) setLoadingBranches(false); }
    }
    void load();
    return () => { active = false; };
  }, []);

  const loadSchedule = useCallback(async (id: string, kind: Mode) => {
    const currentRequest = ++requestId.current;
    setSuccess(''); setError(''); setOriginal(null);
    setForm(kind === 'home' ? DEFAULT_HOME : DEFAULT_BRANCH);
    if (!id) { setLoadingSchedule(false); return; }
    setLoadingSchedule(true);
    try {
      const json = await readJson(await fetch(endpoint(id, kind), { cache: 'no-store' }));
      if (currentRequest !== requestId.current) return;
      const schedule: Schedule | null = json.data?.schedule ?? null;
      if (schedule) {
        const normalized = normalize(schedule, kind);
        setForm(normalized); setOriginal(normalized);
      }
    } catch (e) {
      if (currentRequest === requestId.current) setError(e instanceof Error ? e.message : 'No se pudo cargar el horario.');
    } finally { if (currentRequest === requestId.current) setLoadingSchedule(false); }
  }, [endpoint]);

  useEffect(() => {
    void loadSchedule(branchId, mode);
    return () => { requestId.current += 1; };
  }, [branchId, mode, loadSchedule]);

  function update<K extends keyof Schedule>(key: K, value: Schedule[K]) {
    setForm(previous => ({ ...previous, [key]: value }));
    setSuccess('');
  }

  const validation = useMemo(() => {
    const errors: string[] = [];
    for (const [start, end, label] of [
      ['weekdayOpen', 'weekdayClose', 'lunes a viernes'],
      ['saturdayOpen', 'saturdayClose', 'sábado'],
    ] as const) {
      const difference = toMinutes(form[end]) - toMinutes(form[start]);
      if (!Number.isFinite(difference) || difference <= 0) errors.push(`El cierre de ${label} debe ser posterior a la apertura.`);
      else if (difference < form.slotMinutes) errors.push(`El horario de ${label} debe permitir al menos un espacio.`);
    }
    if (!Number.isInteger(form.slotMinutes) || form.slotMinutes < 5 || form.slotMinutes > 240) errors.push('La duración debe estar entre 5 y 240 minutos.');
    if (!Number.isInteger(form.capacity) || form.capacity < 1 || form.capacity > 1000) errors.push('La capacidad debe estar entre 1 y 1000.');
    if (mode === 'home' && (!Number.isInteger(form.minimumAdvanceDays) || (form.minimumAdvanceDays ?? -1) < 0 || (form.minimumAdvanceDays ?? 91) > 90)) errors.push('La anticipación debe estar entre 0 y 90 días.');
    return errors;
  }, [form, mode]);

  const dirty = !original || JSON.stringify(form) !== JSON.stringify(original);
  const selectedBranch = branches.find(branch => branch.id === branchId);
  const disabled = !branchId || loadingSchedule || saving || loadingBranches;

  async function save() {
    if (disabled || validation.length || (!dirty && original)) return;
    const savingBranchId = branchId;
    const savingMode = mode;
    setSaving(true); setError(''); setSuccess('');
    try {
      const json = await readJson(await fetch(endpoint(savingBranchId, savingMode), {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savingMode === 'home' ? {
          weekdayOpen: form.weekdayOpen, weekdayClose: form.weekdayClose,
          saturdayOpen: form.saturdayOpen, saturdayClose: form.saturdayClose,
          slotMinutes: form.slotMinutes, capacity: form.capacity,
          minimumAdvanceDays: form.minimumAdvanceDays,
          requiresConfirmation: form.requiresConfirmation, isActive: form.isActive,
        } : {
          weekdayOpen: form.weekdayOpen, weekdayClose: form.weekdayClose,
          saturdayOpen: form.saturdayOpen, saturdayClose: form.saturdayClose,
          slotMinutes: form.slotMinutes, capacity: form.capacity,
          allowSameDay: form.allowSameDay, isActive: form.isActive,
        }),
      }));
      const saved = normalize(json.data, savingMode);
      setForm(saved); setOriginal(saved);
      setSuccess('Configuración guardada correctamente.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No fue posible guardar la configuración.');
    } finally { setSaving(false); }
  }

  function timeField(label: string, key: 'weekdayOpen' | 'weekdayClose' | 'saturdayOpen' | 'saturdayClose') {
    return <label className="block" key={key}>
      <span className={labelClass}>{label}</span>
      <input type="time" value={form[key]} onChange={event => update(key, event.target.value)} disabled={disabled} className={inputClass} />
    </label>;
  }

  return <div className="space-y-6 text-primary-950">
    <AdminPageHeader
      title="Horarios y disponibilidad"
      description="Configura los horarios de atención en sucursal y las solicitudes a domicilio."
      actions={<>
        <button type="button" onClick={() => void loadSchedule(branchId, mode)} disabled={disabled} className="inline-flex items-center gap-2 rounded-xl border border-primary-100 bg-white px-4 py-3 text-sm font-semibold text-primary-700 shadow-sm disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loadingSchedule ? 'animate-spin' : ''}`} />Actualizar</button>
        <button type="button" onClick={() => void save()} disabled={disabled || validation.length > 0 || (!dirty && !!original)} className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-3 text-sm font-bold text-white shadow-sm hover:brightness-95 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Guardando...' : original ? 'Guardar cambios' : 'Crear configuración'}</button>
      </>}
    />

    {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
    {success && <div role="status" className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"><CheckCircle2 className="h-4 w-4" />{success}</div>}

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <label htmlFor="branch-select" className={labelClass}>Sucursal</label>
      <select id="branch-select" value={branchId} onChange={event => setBranchId(event.target.value)} disabled={loadingBranches || saving} className={inputClass}>
        {!branches.length && <option value="">{loadingBranches ? 'Cargando sucursales...' : 'No hay sucursales registradas'}</option>}
        {branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}{!branch.isActive ? ' (inactiva)' : ''}</option>)}
      </select>
      {selectedBranch && !selectedBranch.isActive && <p className="mt-2 text-sm text-amber-700">La sucursal está inactiva; no ofrecerá citas aunque sus horarios estén habilitados.</p>}
    </section>

    <div role="tablist" aria-label="Tipo de atención" className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
      <button type="button" role="tab" aria-selected={mode === 'branch'} disabled={saving} onClick={() => setMode('branch')} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${mode === 'branch' ? 'bg-white text-primary-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}><MapPin className="h-4 w-4" />En sucursal</button>
      <button type="button" role="tab" aria-selected={mode === 'home'} disabled={saving} onClick={() => setMode('home')} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${mode === 'home' ? 'bg-white text-primary-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}><House className="h-4 w-4" />A domicilio</button>
    </div>

    {!loadingSchedule && branchId && !original && !error && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Esta sucursal aún no tiene una configuración de {mode === 'home' ? 'domicilio' : 'atención en sucursal'}. Revisa los valores iniciales antes de guardarlos.</p>}

    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2"><Clock3 className="h-5 w-5 text-primary-700" /><h2 className="text-lg font-bold">Horarios de {mode === 'home' ? 'visitas a domicilio' : 'atención en sucursal'}</h2></div>
          <div className="space-y-5">
            <div><h3 className="mb-3 text-sm font-semibold">Lunes a viernes</h3><div className="grid gap-4 sm:grid-cols-2">{timeField('Apertura', 'weekdayOpen')}{timeField('Cierre', 'weekdayClose')}</div></div>
            <div className="border-t border-slate-100 pt-5"><h3 className="mb-3 text-sm font-semibold">Sábado</h3><div className="grid gap-4 sm:grid-cols-2">{timeField('Apertura', 'saturdayOpen')}{timeField('Cierre', 'saturdayClose')}</div></div>
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">Domingo cerrado. La API pública actual no ofrece espacios los domingos.</p>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2"><Settings2 className="h-5 w-5 text-primary-700" /><h2 className="text-lg font-bold">Configuración de {mode === 'home' ? 'solicitudes' : 'citas'}</h2></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className={labelClass}>Duración de cada espacio (minutos)</span><input type="number" min={5} max={240} step={5} value={form.slotMinutes} onChange={event => update('slotMinutes', Number(event.target.value))} disabled={disabled} className={inputClass}/></label>
            <label><span className={labelClass}>{mode === 'home' ? 'Solicitudes máximas por horario' : 'Capacidad por horario'}</span><input type="number" min={1} max={1000} step={1} value={form.capacity} onChange={event => update('capacity', Number(event.target.value))} disabled={disabled} className={inputClass}/></label>
            {mode === 'home' && <label><span className={labelClass}>Anticipación mínima (días)</span><input type="number" min={0} max={90} step={1} value={form.minimumAdvanceDays ?? 1} onChange={event => update('minimumAdvanceDays', Number(event.target.value))} disabled={disabled} className={inputClass}/></label>}
          </div>
          <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
            {mode === 'branch' ? <label className="flex items-center justify-between gap-4"><span><span className="block text-sm font-semibold">Permitir citas el mismo día</span><span className="text-xs text-slate-500">Aplica únicamente a la atención en sucursal.</span></span><input type="checkbox" checked={!!form.allowSameDay} onChange={event => update('allowSameDay', event.target.checked)} disabled={disabled} className="h-5 w-5 accent-primary-700" /></label> : <label className="flex items-center justify-between gap-4"><span><span className="block text-sm font-semibold">Requerir confirmación manual</span><span className="text-xs text-slate-500">Recepción confirma personal, dirección y traslado.</span></span><input type="checkbox" checked={!!form.requiresConfirmation} onChange={event => update('requiresConfirmation', event.target.checked)} disabled={disabled} className="h-5 w-5 accent-primary-700" /></label>}
            <label className="flex items-center justify-between gap-4"><span><span className="block text-sm font-semibold">{mode === 'home' ? 'Habilitar solicitudes a domicilio' : 'Disponibilidad habilitada'}</span><span className="text-xs text-slate-500">{mode === 'home' ? 'Controla si se permite solicitar este servicio.' : 'Controla si se ofrecen espacios en sucursal.'}</span></span><input type="checkbox" checked={form.isActive} onChange={event => update('isActive', event.target.checked)} disabled={disabled} className="h-5 w-5 accent-primary-700" /></label>
          </div>
        </section>
      </div>
      <aside className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold">Resumen de configuración</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Lunes a viernes</dt><dd className="font-semibold">{form.weekdayOpen}–{form.weekdayClose}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Sábado</dt><dd className="font-semibold">{form.saturdayOpen}–{form.saturdayClose}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Duración</dt><dd className="font-semibold">{form.slotMinutes} min</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Capacidad</dt><dd className="font-semibold">{form.capacity}</dd></div>
            {mode === 'home' && <div className="flex justify-between gap-2"><dt className="text-slate-500">Anticipación</dt><dd className="font-semibold">{form.minimumAdvanceDays} día(s)</dd></div>}
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Estado</dt><dd className="font-semibold">{form.isActive ? 'Habilitado' : 'Deshabilitado'}</dd></div>
          </dl>
          {validation.length > 0 && <div className="mt-5 rounded-lg bg-red-50 p-3 text-xs text-red-700"><strong>Revisa estos datos:</strong><ul className="mt-2 list-disc space-y-1 pl-4">{validation.map(message => <li key={message}>{message}</li>)}</ul></div>}
          <button type="button" onClick={() => void save()} disabled={disabled || validation.length > 0 || (!dirty && !!original)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Guardando...' : original ? 'Guardar cambios' : 'Crear configuración'}</button>
        </section>
        <p className="px-1 text-xs leading-relaxed text-slate-500">{mode === 'home' ? 'Estas opciones se guardan de forma independiente. Para que afecten los espacios públicos y las reservas, también debes actualizar el endpoint de disponibilidad y el registro de citas.' : 'La configuración de sucursal se conserva independiente del servicio a domicilio.'}</p>
      </aside>
    </div>
  </div>;
}
