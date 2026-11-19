'use client';

import AdminPageHeader from '@/components/admin/AdminPageHeader';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Loader2, Package, PackageCheck, PackageX, Pencil, Plus, RefreshCw, Search, X } from 'lucide-react';

type Service = { id: string; name: string; isActive: boolean; price: string | null };
type PackageItem = { id: string; name: string; slug: string; description: string | null; preparation: string | null; price: string | null; isActive: boolean };
type PackageDetail = PackageItem & { serviceIds: string[] };
type Form = { name: string; description: string; preparation: string; price: string; isActive: boolean; serviceIds: string[] };
const blank = (): Form => ({ name: '', description: '', preparation: '', price: '', isActive: true, serviceIds: [] });
const PAGE_SIZE = 8;
const slugify = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 180).replace(/-+$/g, '');
const money = (value: string | null) => value === null ? 'Sin precio' : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value));
const errorMessage = (json: unknown, fallback: string) => {
  if (!json || typeof json !== 'object') return fallback;
  const record = json as { error?: string | { message?: string }; message?: string };
  return typeof record.error === 'string' ? record.error : record.error?.message || record.message || fallback;
};

export default function AdminPackagesPage() {
  const [items, setItems] = useState<PackageItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSlug, setEditingSlug] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState<Form>(blank);
  const [serviceSearch, setServiceSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const [p, s] = await Promise.all([
        fetch('/api/admin/packages', { cache: 'no-store' }),
        fetch('/api/admin/services', { cache: 'no-store' }),
      ]);
      if (!p.ok || !s.ok) throw new Error(`No se pudieron consultar los catálogos (${p.status}/${s.status}).`);
      const [pj, sj] = await Promise.all([p.json(), s.json()]);
      if (!Array.isArray(pj.data) || !Array.isArray(sj.data)) throw new Error('Formato de respuesta inesperado.');
      setItems(pj.data);
      setServices(sj.data);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error al cargar paquetes.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => items.filter(item =>
    (!search.trim() || [item.name, item.description ?? ''].some(value => value.toLowerCase().includes(search.toLowerCase()))) &&
    (status === 'all' || item.isActive === (status === 'active'))
  ), [items, search, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const visibleServices = services.filter(s => (s.isActive || form.serviceIds.includes(s.id)) && s.name.toLowerCase().includes(serviceSearch.toLowerCase()));

  function newPackage() {
    setEditingId(null); setEditingSlug(''); setForm(blank()); setServiceSearch(''); setFormError(''); setDrawerOpen(true);
  }
  async function editPackage(item: PackageItem) {
    setEditingId(item.id); setEditingSlug(item.slug); setDrawerOpen(true); setDetailLoading(true); setFormError(''); setServiceSearch('');
    try {
      const response = await fetch(`/api/admin/packages/${encodeURIComponent(item.id)}`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok || !json.data || !Array.isArray(json.data.serviceIds)) throw new Error(errorMessage(json, 'No se pudieron consultar los estudios del paquete.'));
      const detail = json.data as PackageDetail;
      setForm({ name: detail.name, description: detail.description ?? '', preparation: detail.preparation ?? '', price: detail.price ?? '', isActive: detail.isActive, serviceIds: detail.serviceIds });
      setEditingSlug(detail.slug);
    } catch (e) { setFormError(e instanceof Error ? e.message : 'No se pudo cargar el paquete.'); }
    finally { setDetailLoading(false); }
  }
  function toggleService(id: string) {
    setForm(prev => ({ ...prev, serviceIds: prev.serviceIds.includes(id) ? prev.serviceIds.filter(v => v !== id) : [...prev.serviceIds, id] }));
  }
  function generatedSlug(name: string) {
    const base = slugify(name);
    const taken = new Set(items.map(item => item.slug));
    if (!taken.has(base)) return base;
    let suffix = 2;
    while (taken.has(`${base.slice(0, 180 - String(suffix).length - 1)}-${suffix}`)) suffix++;
    return `${base.slice(0, 180 - String(suffix).length - 1)}-${suffix}`;
  }
  async function save() {
    if (saving || detailLoading) return;
    setFormError('');
    const name = form.name.trim();
    if (name.length < 2 || name.length > 160) return setFormError('El nombre debe tener entre 2 y 160 caracteres.');
    if (form.description.length > 5000 || form.preparation.length > 5000) return setFormError('La descripción y la preparación admiten máximo 5000 caracteres.');
    if (form.price.trim() && (!Number.isFinite(Number(form.price)) || Number(form.price) < 0 || Number(form.price) > 9999999.99)) return setFormError('Introduce un precio válido.');
    const slug = editingId ? editingSlug : generatedSlug(name);
    if (!slug) return setFormError('El nombre debe contener letras o números para generar un identificador.');
    const payload = {
      name, slug, description: form.description.trim() || null, preparation: form.preparation.trim() || null,
      price: form.price.trim() === '' ? null : Number(form.price), isActive: form.isActive,
      serviceIds: form.serviceIds,
    };
    setSaving(true);
    try {
      const response = await fetch(editingId ? `/api/admin/packages/${encodeURIComponent(editingId)}` : '/api/admin/packages', {
        method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(errorMessage(json, 'No se pudo guardar el paquete.'));
      setDrawerOpen(false); setNotice(editingId ? 'Paquete actualizado correctamente.' : 'Paquete registrado correctamente.');
      await load(true);
    } catch (e) { setFormError(e instanceof Error ? e.message : 'No se pudo guardar el paquete.'); }
    finally { setSaving(false); }
  }
  async function changeStatus(item: PackageItem) {
    if (!window.confirm(`¿${item.isActive ? 'Desactivar' : 'Activar'} el paquete "${item.name}"?`)) return;
    setError(''); setNotice('');
    try {
      const response = await fetch(`/api/admin/packages/${encodeURIComponent(item.id)}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !item.isActive }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(errorMessage(json, 'No se pudo actualizar el estado.'));
      setNotice(`Paquete ${item.isActive ? 'desactivado' : 'activado'} correctamente.`);
      await load(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo actualizar el estado.'); }
  }

  return <div className="space-y-7">
    <AdminPageHeader
        title="Gestión de paquetes"
        description="Administra los paquetes de análisis clínicos y los estudios que incluyen."
        actions={<>
          <button onClick={() => void load(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-primary-100 bg-white px-4 py-3 text-sm font-semibold text-primary-700 shadow-sm disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}/>Actualizar</button>
        <button onClick={newPackage} className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-3 text-sm font-bold text-white shadow-sm hover:brightness-95"><Plus className="h-4 w-4"/>Nuevo paquete</button>
        </>}
      />
    <div className="grid gap-4 sm:grid-cols-3">{[
      { label: 'Total de paquetes', value: items.length, icon: Package, iconBg: 'bg-primary-50', iconColor: 'text-primary-700' },
      { label: 'Activos', value: items.filter(x => x.isActive).length, icon: PackageCheck, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-700' },
      { label: 'Inactivos', value: items.filter(x => !x.isActive).length, icon: PackageX, iconBg: 'bg-amber-50', iconColor: 'text-amber-700' },
    ].map(stat => {
      const Icon = stat.icon;
      return (
        <div key={stat.label} className="flex items-center justify-between gap-4 rounded-2xl border border-primary-100/80 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-primary-950">{loading ? '—' : stat.value}</p>
          </div>
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}>
            <Icon className={`h-6 w-6 ${stat.iconColor}`} aria-hidden="true" />
          </div>
        </div>
      );
    })}</div>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{notice}</p>}
    <section className="overflow-hidden rounded-2xl border border-primary-100/80 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-primary-100/80 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="font-display text-lg font-bold text-primary-950">Paquetes registrados</h2><p className="mt-1 text-xs text-slate-500">Consulta y administra tu catálogo.</p></div>
        <div className="flex flex-col gap-2 sm:flex-row"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/><input value={search} onChange={e => {setSearch(e.target.value);setPage(1);}} placeholder="Buscar paquete..." className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm sm:w-64"/></div>
          <select value={status} onChange={e => {setStatus(e.target.value);setPage(1);}} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="all">Todos los estados</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select></div>
      </div>
      {loading ? <div className="p-8 text-sm text-slate-500">Cargando paquetes...</div> : !visible.length ? <div className="p-12 text-center text-sm text-slate-500">No se encontraron paquetes.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="bg-primary-50/60 text-xs font-bold uppercase text-primary-700"><tr><th className="px-5 py-4">Paquete</th><th className="px-5 py-4">Precio al público</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map(item => <tr key={item.id} className="hover:bg-primary-50/30"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="rounded-xl bg-primary-50 p-2 text-primary-700"><Package className="h-5 w-5"/></div><div><p className="text-sm font-semibold text-primary-950">{item.name}</p>{item.description && <p className="mt-1 max-w-md truncate text-xs text-slate-500">{item.description}</p>}</div></div></td><td className="px-5 py-4 text-sm text-slate-700">{money(item.price)}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{item.isActive ? 'Activo' : 'Inactivo'}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button onClick={() => void editPackage(item)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-50"><Pencil className="h-4 w-4"/>Editar</button><button onClick={() => void changeStatus(item)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">{item.isActive ? 'Desactivar' : 'Activar'}</button></div></td></tr>)}</tbody></table></div>}
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs text-slate-500"><span>{filtered.length} paquetes</span><div className="flex items-center gap-2"><button disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-lg border p-2 disabled:opacity-30" aria-label="Página anterior"><ChevronLeft className="h-4 w-4"/></button>Página {currentPage} de {totalPages}<button disabled={currentPage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="rounded-lg border p-2 disabled:opacity-30" aria-label="Página siguiente"><ChevronRight className="h-4 w-4"/></button></div></div>
    </section>
    {drawerOpen && <div className="fixed inset-0 z-[80]"><button aria-label="Cerrar panel" onClick={() => !saving && setDrawerOpen(false)} className="absolute inset-0 bg-primary-950/50"/><aside role="dialog" aria-modal="true" aria-label={editingId ? 'Editar paquete' : 'Nuevo paquete'} className="absolute inset-y-0 right-0 flex w-full max-w-[580px] flex-col bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-primary-100 px-6 py-5"><div><h2 className="font-display text-xl font-bold text-primary-950">{editingId ? 'Editar paquete' : 'Nuevo paquete'}</h2><p className="mt-1 text-xs text-slate-500">El identificador se genera automáticamente al crear.</p></div><button onClick={() => !saving && setDrawerOpen(false)} aria-label="Cerrar" className="rounded-lg p-2 hover:bg-slate-100"><X className="h-5 w-5"/></button></div>
      {detailLoading ? <div className="flex flex-1 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary-700"/></div> : <><div className="flex-1 space-y-5 overflow-y-auto p-6"><label className="block text-sm font-semibold text-primary-950">Nombre del paquete *<input maxLength={160} value={form.name} onChange={e => setForm(p => ({...p,name:e.target.value}))} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" placeholder="Ej. Perfil tiroideo"/></label><label className="block text-sm font-semibold text-primary-950">Precio al público (MXN)<input type="number" min="0" max="9999999.99" step="0.01" value={form.price} onChange={e => setForm(p => ({...p,price:e.target.value}))} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" placeholder="Sin precio"/></label><label className="block text-sm font-semibold text-primary-950">Descripción<textarea maxLength={5000} rows={3} value={form.description} onChange={e => setForm(p => ({...p,description:e.target.value}))} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal"/></label><label className="block text-sm font-semibold text-primary-950">Indicaciones de preparación<textarea maxLength={5000} rows={3} value={form.preparation} onChange={e => setForm(p => ({...p,preparation:e.target.value}))} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal"/></label>
        <section><div className="flex items-center justify-between"><h3 className="text-sm font-bold text-primary-950">Estudios incluidos</h3><span className="text-xs text-slate-500">{form.serviceIds.length} seleccionados</span></div><div className="relative mt-3"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/><input value={serviceSearch} onChange={e => setServiceSearch(e.target.value)} placeholder="Buscar estudios..." className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm"/></div><div className="mt-3 max-h-56 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">{visibleServices.length ? visibleServices.map(service => <label key={service.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-primary-50"><input type="checkbox" checked={form.serviceIds.includes(service.id)} onChange={() => toggleService(service.id)} className="h-4 w-4 accent-blue-800"/><span className="flex-1 text-sm text-slate-700">{service.name}{!service.isActive && <span className="ml-2 text-xs text-amber-700">(inactivo)</span>}</span><span className="text-xs text-slate-400">{money(service.price)}</span></label>) : <p className="p-3 text-sm text-slate-500">No hay estudios disponibles.</p>}</div><p className="mt-2 text-xs text-slate-500">Los estudios inactivos previamente asociados se conservan y pueden desmarcarse.</p></section>
        <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-primary-950"><input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({...p,isActive:e.target.checked}))} className="h-4 w-4 accent-blue-800"/>Paquete activo</label>
        {formError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</p>}</div><div className="flex justify-end gap-3 border-t border-primary-100 p-5"><button disabled={saving} onClick={() => setDrawerOpen(false)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">Cancelar</button><button disabled={saving || Boolean(formError && editingId && !form.name)} onClick={() => void save()} className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4"/>}{saving ? 'Guardando...' : 'Guardar paquete'}</button></div></>}
      </aside></div>}
  </div>;
}
