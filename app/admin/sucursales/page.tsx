'use client';

import AdminPageHeader from '@/components/admin/AdminPageHeader';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Building2, CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, Loader2, MapPin, Pencil, Plus, RefreshCw, Search, X, XCircle } from 'lucide-react';

type Branch = {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  whatsapp: string | null;
  mapUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  businessHours: string | null;
  isActive: boolean;
};

type FormData = {
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  mapUrl: string;
  latitude: string;
  longitude: string;
  businessHours: string;
  isActive: boolean;
};

const blankForm = (): FormData => ({ name: '', address: '', phone: '', whatsapp: '', mapUrl: '', latitude: '', longitude: '', businessHours: '', isActive: true });

function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 140).replace(/-+$/g, '');
}

async function readResponse(response: Response) {
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || body?.message || `Error HTTP ${response.status}`);
  return body;
}

function inputClass() {
  return 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
}

export default function AdminSucursalesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState<FormData>(blankForm());
  const pageSize = 10;

  const loadBranches = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const body = await readResponse(await fetch('/api/admin/branches', { cache: 'no-store' }));
      if (!Array.isArray(body.data)) throw new Error('La API no devolvió una lista de sucursales.');
      setBranches(body.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar las sucursales.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadBranches(); }, [loadBranches]);
  useEffect(() => { setPage(1); }, [search, status]);

  const filtered = useMemo(() => branches.filter((branch) => {
    const matchesText = `${branch.name} ${branch.address} ${branch.phone}`.toLowerCase().includes(search.trim().toLowerCase());
    const matchesStatus = status === 'all' || (status === 'active' ? branch.isActive : !branch.isActive);
    return matchesText && matchesStatus;
  }), [branches, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const active = branches.filter((branch) => branch.isActive).length;

  function openCreate() {
    setEditing(null);
    setForm(blankForm());
    setFormError('');
    setDrawer(true);
  }

  function openEdit(branch: Branch) {
    setEditing(branch);
    setForm({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      whatsapp: branch.whatsapp ?? '',
      mapUrl: branch.mapUrl ?? '',
      latitude: branch.latitude == null ? '' : String(branch.latitude),
      longitude: branch.longitude == null ? '' : String(branch.longitude),
      businessHours: branch.businessHours ?? '',
      isActive: branch.isActive,
    });
    setFormError('');
    setDrawer(true);
  }

  function change<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    const name = form.name.trim();
    const address = form.address.trim();
    const phone = form.phone.trim();
    if (name.length < 2 || name.length > 120) return setFormError('El nombre debe tener entre 2 y 120 caracteres.');
    if (address.length < 5 || address.length > 1000) return setFormError('La dirección debe tener entre 5 y 1000 caracteres.');
    if (phone.length < 7 || phone.length > 30) return setFormError('El teléfono debe tener entre 7 y 30 caracteres.');
    const slug = slugify(name);
    if (!editing && !slug) return setFormError('El nombre no permite generar un identificador válido.');
    if (!editing && branches.some((branch) => branch.slug === slug)) return setFormError('Ya existe una sucursal con ese nombre o identificador.');
    if (form.mapUrl.trim()) {
      try {
        const url = new URL(form.mapUrl.trim());
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid');
      } catch { return setFormError('Ingresa una URL válida de Google Maps (https://...).'); }
    }
    const lat = form.latitude.trim() === '' ? null : Number(form.latitude);
    const lng = form.longitude.trim() === '' ? null : Number(form.longitude);
    if ((lat === null) !== (lng === null)) return setFormError('Captura ambas coordenadas o deja ambas vacías.');
    if (lat !== null && (!Number.isFinite(lat) || lat < -90 || lat > 90)) return setFormError('La latitud debe estar entre -90 y 90.');
    if (lng !== null && (!Number.isFinite(lng) || lng < -180 || lng > 180)) return setFormError('La longitud debe estar entre -180 y 180.');

    const payload = {
      name,
      ...(!editing ? { slug } : {}),
      address,
      phone,
      whatsapp: form.whatsapp.trim() || null,
      mapUrl: form.mapUrl.trim() || null,
      businessHours: form.businessHours.trim() || null,
      latitude: lat,
      longitude: lng,
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      await readResponse(await fetch(editing ? `/api/admin/branches/${editing.id}` : '/api/admin/branches', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }));
      setDrawer(false);
      await loadBranches();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar la sucursal.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(branch: Branch) {
    if (!window.confirm(`¿Deseas ${branch.isActive ? 'desactivar' : 'activar'} la sucursal “${branch.name}”?`)) return;
    setError('');
    try {
      await readResponse(await fetch(`/api/admin/branches/${branch.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !branch.isActive }),
      }));
      await loadBranches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el estado.');
    }
  }

  return (
    <main className="text-primary-950">
      <div className="space-y-6">
        <AdminPageHeader
        title="Gestión de sucursales"
        description="Administra las sedes, sus datos de contacto y su ubicación."
        actions={<>
          <button type="button" onClick={() => void loadBranches()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-primary-100 bg-white px-4 py-3 text-sm font-semibold text-primary-700 shadow-sm disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar</button>
            <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-3 text-sm font-bold text-white shadow-sm hover:brightness-95"><Plus className="h-4 w-4" /> Nueva sucursal</button>
        </>}
      />

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: 'Total de sucursales', count: branches.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
            { title: 'Sucursales activas', count: active, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { title: 'Sucursales inactivas', count: branches.length - active, icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-100' },
          ].map((item) => <div key={item.title} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div><p className="text-sm text-slate-500">{item.title}</p><p className="mt-2 text-3xl font-bold">{loading ? '—' : item.count}</p></div>
            <span className={`rounded-xl p-3 ${item.bg} ${item.color}`}><item.icon size={22} /></span>
          </div>)}
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 sm:p-5">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input aria-label="Buscar sucursales" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, dirección o teléfono..." className={`${inputClass()} pl-10`} />
            </div>
            <div className="flex items-center gap-2">
              <select aria-label="Filtrar por estado" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={inputClass()}>
                <option value="all">Todos los estados</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
              </select>
            </div>
          </div>
          {error && <div role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
                <th className="px-5 py-4 font-semibold">Sucursal</th><th className="px-5 py-4 font-semibold">Contacto</th><th className="px-5 py-4 font-semibold">Horario</th><th className="px-5 py-4 font-semibold">Estado</th><th className="px-5 py-4 text-right font-semibold">Acciones</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan={5} className="py-16 text-center text-slate-500"><Loader2 className="mx-auto mb-2 animate-spin" /> Cargando sucursales...</td></tr> :
                  visible.length === 0 ? <tr><td colSpan={5} className="py-16 text-center text-slate-500">No se encontraron sucursales.</td></tr> :
                  visible.map((branch) => <tr key={branch.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4"><div className="font-semibold text-slate-800">{branch.name}</div><div className="mt-1 max-w-xs text-xs text-slate-500">{branch.address}</div>{branch.mapUrl && <a href={branch.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"><MapPin size={12} /> Ver mapa <ExternalLink size={11} /></a>}</td>
                    <td className="px-5 py-4"><div>{branch.phone}</div>{branch.whatsapp && <div className="mt-1 text-xs text-slate-500">WhatsApp: {branch.whatsapp}</div>}</td>
                    <td className="max-w-[220px] whitespace-pre-line px-5 py-4 text-xs text-slate-600">{branch.businessHours || 'Sin horario registrado'}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${branch.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{branch.isActive ? 'Activa' : 'Inactiva'}</span></td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-2"><button onClick={() => openEdit(branch)} className="rounded-lg border border-slate-200 p-2 text-blue-700 hover:bg-blue-50" title="Editar sucursal"><Pencil size={16} /></button><button onClick={() => void toggleStatus(branch)} className={`rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold ${branch.isActive ? 'text-amber-700 hover:bg-amber-50' : 'text-emerald-700 hover:bg-emerald-50'}`}>{branch.isActive ? 'Desactivar' : 'Activar'}</button></div></td>
                  </tr>)}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
            <span>{filtered.length} resultado{filtered.length === 1 ? '' : 's'} · Página {page} de {totalPages}</span>
            <div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"><ChevronLeft size={16} /></button><button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"><ChevronRight size={16} /></button></div>
          </div>
        </section>
      </div>

      {drawer && <div className="fixed inset-0 z-50 flex justify-end">
        <button type="button" aria-label="Cerrar formulario" className="absolute inset-0 bg-slate-950/50" onClick={() => !saving && setDrawer(false)} />
        <aside role="dialog" aria-modal="true" aria-label={editing ? 'Editar sucursal' : 'Nueva sucursal'} className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-7"><div><h2 className="text-xl font-bold">{editing ? 'Editar sucursal' : 'Nueva sucursal'}</h2><p className="mt-1 text-sm text-slate-500">Información general y ubicación de la sede.</p></div><button disabled={saving} onClick={() => setDrawer(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button></div>
          <form id="branch-form" onSubmit={(e) => void save(e)} className="flex-1 space-y-4 overflow-y-auto px-5 py-6 sm:px-7">
            <div><label className="mb-1.5 block text-sm font-medium">Nombre de la sucursal *</label><input required minLength={2} maxLength={120} value={form.name} onChange={(e) => change('name', e.target.value)} className={inputClass()} placeholder="Ej. Sucursal Centro" /></div>
            <div><label className="mb-1.5 block text-sm font-medium">Dirección *</label><textarea required minLength={5} maxLength={1000} rows={3} value={form.address} onChange={(e) => change('address', e.target.value)} className={inputClass()} placeholder="Calle, número, colonia, municipio..." /></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-sm font-medium">Teléfono *</label><input required minLength={7} maxLength={30} value={form.phone} onChange={(e) => change('phone', e.target.value)} className={inputClass()} /></div><div><label className="mb-1.5 block text-sm font-medium">WhatsApp</label><input maxLength={30} value={form.whatsapp} onChange={(e) => change('whatsapp', e.target.value)} className={inputClass()} /></div></div>
            <div><label className="mb-1.5 block text-sm font-medium">Enlace de Google Maps</label><input type="url" value={form.mapUrl} onChange={(e) => change('mapUrl', e.target.value)} className={inputClass()} placeholder="https://maps.google.com/..." /></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-sm font-medium">Latitud</label><input type="number" step="any" min={-90} max={90} value={form.latitude} onChange={(e) => change('latitude', e.target.value)} className={inputClass()} placeholder="20.6767" /></div><div><label className="mb-1.5 block text-sm font-medium">Longitud</label><input type="number" step="any" min={-180} max={180} value={form.longitude} onChange={(e) => change('longitude', e.target.value)} className={inputClass()} placeholder="-103.3475" /></div></div>
            <p className="text-xs text-slate-500">Las coordenadas son opcionales, pero deben capturarse juntas. No se obtienen automáticamente del enlace.</p>
            <div><label className="mb-1.5 block text-sm font-medium">Horario de atención (informativo)</label><textarea maxLength={1000} rows={3} value={form.businessHours} onChange={(e) => change('businessHours', e.target.value)} className={inputClass()} placeholder={'Lunes a viernes: 7:00 a 15:00\nSábados: 7:00 a 13:00'} /><p className="mt-1 text-xs text-slate-500">Este texto no modifica los horarios disponibles para agendar citas.</p></div>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4"><span><span className="block text-sm font-semibold">Sucursal activa</span><span className="block text-xs text-slate-500">Permitir que la sucursal aparezca como disponible.</span></span><input type="checkbox" checked={form.isActive} onChange={(e) => change('isActive', e.target.checked)} className="h-5 w-5 accent-blue-700" /></label>
            {formError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</div>}
          </form>
          <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4 sm:px-7"><button type="button" disabled={saving} onClick={() => setDrawer(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancelar</button><button form="branch-form" type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-lime-300 disabled:opacity-60">{saving && <Loader2 size={16} className="animate-spin" />}{editing ? 'Guardar cambios' : 'Crear sucursal'}</button></div>
        </aside>
      </div>}
    </main>
  );
}
