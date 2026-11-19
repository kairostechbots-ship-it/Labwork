'use client';

import AdminPageHeader from '@/components/admin/AdminPageHeader';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check, ChevronLeft, ChevronRight, CircleAlert, FlaskConical,
  Loader2, Pencil, Plus, RefreshCw, Search, SlidersHorizontal, X,
} from 'lucide-react';

type Service = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  preparation: string | null;
  price: string | number | null;
  isActive: boolean;
  createdAt?: string;
};

type FormState = {
  name: string;
  slug: string;
  category: string;
  description: string;
  preparation: string;
  price: string;
  isActive: boolean;
};

const PAGE_SIZE = 10;
const emptyForm: FormState = {
  name: '', slug: '', category: '', description: '', preparation: '', price: '', isActive: true,
};

function toSlug(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function money(value: Service['price']) {
  if (value === null || value === undefined || value === '') return 'Sin precio';
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(parsed)
    : 'Sin precio';
}

function getErrorMessage(json: unknown, fallback: string) {
  if (!json || typeof json !== 'object') return fallback;
  const body = json as Record<string, unknown>;
  if (typeof body.message === 'string') return body.message;
  if (typeof body.error === 'string') return body.error;
  if (body.error && typeof body.error === 'object') {
    const error = body.error as Record<string, unknown>;
    if (typeof error.message === 'string') return error.message;
  }
  return fallback;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Service | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadServices = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch('/api/admin/services', { cache: 'no-store' });
      const json = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getErrorMessage(json, `No se pudieron cargar los estudios (${response.status}).`));
      if (!json || !Array.isArray(json.data)) throw new Error('La API devolvió un formato inesperado.');
      setServices(json.data as Service[]);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar los estudios.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void loadServices(); }, [loadServices]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen, saving]);

  const categories = useMemo(() => Array.from(new Set(services.map(s => s.category?.trim()).filter((x): x is string => Boolean(x)))).sort((a, b) => a.localeCompare(b, 'es')), [services]);
  const stats = useMemo(() => ({
    total: services.length,
    active: services.filter(s => s.isActive).length,
    inactive: services.filter(s => !s.isActive).length,
  }), [services]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('es');
    return services.filter(service => {
      const matchesText = !q || [service.name, service.slug, service.category, service.description]
        .some(value => (value ?? '').toLocaleLowerCase('es').includes(q));
      return matchesText &&
        (statusFilter === 'all' || (statusFilter === 'active' ? service.isActive : !service.isActive)) &&
        (categoryFilter === 'all' || service.category === categoryFilter);
    });
  }, [services, query, statusFilter, categoryFilter]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function openNew() {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormError(null);
    setDrawerOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setForm({
      name: service.name,
      slug: service.slug,
      category: service.category ?? '',
      description: service.description ?? '',
      preparation: service.preparation ?? '',
      price: service.price == null ? '' : String(service.price),
      isActive: service.isActive,
    });
    setFormError(null);
    setDrawerOpen(true);
  }

  function updateName(value: string) {
    setForm(prev => ({ ...prev, name: value }));
  }

  async function saveService(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setFormError(null);
    const name = form.name.trim();
    // Conserva los enlaces de estudios existentes. Para uno nuevo, genera
    // un identificador único frente a los registros actualmente cargados.
    const baseSlug = toSlug(name).slice(0, 180).replace(/-+$/, '');
    const occupied = new Set(services.map(service => service.slug));
    let slug = editing ? editing.slug : baseSlug;
    if (!editing && slug) {
      let suffix = 2;
      while (occupied.has(slug)) {
        const ending = `-${suffix++}`;
        slug = `${baseSlug.slice(0, 180 - ending.length).replace(/-+$/, '')}${ending}`;
      }
    }
    if (name.length < 2 || name.length > 160) return setFormError('El nombre debe tener entre 2 y 160 caracteres.');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 180) return setFormError('No se pudo generar un identificador válido. Revisa el nombre del estudio.');
    if (form.category.trim().length > 100) return setFormError('La categoría no puede superar los 100 caracteres.');
    if (form.description.trim().length > 5000 || form.preparation.trim().length > 5000) return setFormError('La descripción y preparación no pueden superar los 5000 caracteres.');
    const normalizedPrice = form.price.trim().replace(',', '.');
    if (normalizedPrice && (!/^\d+(?:\.\d{1,2})?$/.test(normalizedPrice) || Number(normalizedPrice) > 9999999.99)) {
      return setFormError('Escribe un precio válido, mayor o igual a 0, con máximo dos decimales.');
    }
    const payload = {
      name, slug,
      category: form.category.trim() || null,
      description: form.description.trim() || null,
      preparation: form.preparation.trim() || null,
      price: normalizedPrice === '' ? null : Number(normalizedPrice),
      isActive: form.isActive,
    };
    setSaving(true);
    try {
      const response = await fetch(editing ? `/api/admin/services/${editing.id}` : '/api/admin/services', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) throw new Error(response.status === 409 ? 'El identificador del estudio ya existe. Actualiza el catálogo e inténtalo de nuevo.' : getErrorMessage(json, `No se pudo guardar el estudio (${response.status}).`));
      if (!json?.data) throw new Error('El servidor no confirmó que se guardó el estudio.');
      setDrawerOpen(false);
      setNotice(editing ? 'El estudio se actualizó correctamente.' : 'El estudio se registró correctamente.');
      await loadServices(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar el estudio.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(service: Service) {
    if (togglingId) return;
    setTogglingId(service.id);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !service.isActive }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getErrorMessage(json, `No se pudo cambiar el estado (${response.status}).`));
      if (!json?.data) throw new Error('El servidor no confirmó el cambio de estado.');
      setServices(prev => prev.map(item => item.id === service.id ? { ...item, isActive: !service.isActive } : item));
      setNotice(`Estudio ${service.isActive ? 'desactivado' : 'activado'} correctamente.`);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'No se pudo cambiar el estado.');
    } finally {
      setTogglingId(null);
    }
  }

  const fieldClass = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100';
  const labelClass = 'block text-sm font-semibold text-primary-950';

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Gestión de estudios"
        description="Consulta y administra el catálogo de análisis clínicos."
        actions={<>
          <button type="button" onClick={() => void loadServices(true)} disabled={loading || refreshing} className="inline-flex items-center gap-2 rounded-xl border border-primary-100 bg-white px-4 py-3 text-sm font-semibold text-primary-700 shadow-sm disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Actualizar</button>
          <button type="button" onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-3 text-sm font-bold text-white shadow-sm hover:brightness-95"><Plus className="h-4 w-4" /> Nuevo estudio</button>
        </>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total de estudios', value: stats.total, className: 'bg-blue-50 text-blue-700' },
          { label: 'Activos', value: stats.active, className: 'bg-green-50 text-green-700' },
          { label: 'Inactivos', value: stats.inactive, className: 'bg-amber-50 text-amber-700' },
        ].map(card => <div key={card.label} className="rounded-2xl border border-primary-100/80 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-2"><div><p className="text-sm text-slate-500">{card.label}</p><p className="mt-2 font-display text-3xl font-bold text-primary-950">{loading ? '—' : card.value}</p></div><span className={`rounded-xl p-3 ${card.className}`}><FlaskConical className="h-5 w-5" /></span></div></div>)}
      </div>

      {loadError && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{loadError}</div>}
      {notice && <div role="status" className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"><span className="inline-flex items-center gap-2"><Check className="h-4 w-4" />{notice}</span><button type="button" onClick={() => setNotice(null)} aria-label="Cerrar aviso"><X className="h-4 w-4" /></button></div>}

      <section className="overflow-hidden rounded-2xl border border-primary-100/80 bg-white shadow-sm">
        <div className="border-b border-primary-100/80 p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-primary-950">Catálogo de estudios</h2>
          <p className="mt-1 text-xs text-slate-500">Busca por nombre, categoría o identificador y administra su disponibilidad.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_200px_180px_auto]">
            <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="Buscar estudio..." aria-label="Buscar estudios" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-primary-400" /></div>
            <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} aria-label="Filtrar categoría" className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"><option value="all">Todas las categorías</option>{categories.map(category => <option key={category} value={category}>{category}</option>)}</select>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} aria-label="Filtrar estado" className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"><option value="all">Todos los estados</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select>
            <button type="button" onClick={() => { setQuery(''); setStatusFilter('all'); setCategoryFilter('all'); setPage(1); }} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm text-slate-600 hover:bg-slate-50"><SlidersHorizontal className="h-4 w-4" /> Limpiar</button>
          </div>
        </div>
        {loading ? <div className="space-y-3 p-6">{[1, 2, 3, 4].map(i => <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}</div> : filtered.length === 0 ? <div className="px-6 py-16 text-center"><FlaskConical className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 text-sm font-semibold text-primary-950">No se encontraron estudios</p><p className="mt-1 text-xs text-slate-500">Prueba otros filtros o registra un estudio nuevo.</p></div> : <>
          <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left"><thead className="bg-primary-50/60"><tr className="text-[11px] font-bold uppercase tracking-wide text-primary-700"><th className="px-5 py-4">Estudio</th><th className="px-5 py-4">Categoría</th><th className="px-5 py-4">Precio</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4 text-right">Acciones</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{visible.map(service => <tr key={service.id} className="hover:bg-primary-50/40"><td className="px-5 py-4"><p className="max-w-[320px] text-sm font-semibold text-primary-950">{service.name}</p></td><td className="px-5 py-4 text-sm text-slate-600">{service.category || 'Sin categoría'}</td><td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-primary-950">{money(service.price)}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${service.isActive ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>{service.isActive ? 'Activo' : 'Inactivo'}</span></td><td className="px-5 py-4"><div className="flex items-center justify-end gap-2"><button type="button" onClick={() => openEdit(service)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-primary-700 hover:bg-primary-50"><Pencil className="h-3.5 w-3.5" /> Editar</button><button type="button" disabled={togglingId !== null} onClick={() => void toggleActive(service)} className={`rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-40 ${service.isActive ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}>{togglingId === service.id ? 'Guardando...' : service.isActive ? 'Desactivar' : 'Activar'}</button></div></td></tr>)}</tbody></table></div>
          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-slate-500">Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length} estudios</p><div className="flex items-center gap-2"><button type="button" disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))} aria-label="Página anterior" className="rounded-lg border border-slate-200 p-2 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><span className="px-2 text-xs">Página {currentPage} de {pages}</span><button type="button" disabled={currentPage === pages} onClick={() => setPage(p => Math.min(pages, p + 1))} aria-label="Página siguiente" className="rounded-lg border border-slate-200 p-2 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button></div></div>
        </>}
      </section>

      {drawerOpen && <div className="fixed inset-0 z-[80]"><button type="button" aria-label="Cerrar formulario" onClick={() => { if (!saving) setDrawerOpen(false); }} className="absolute inset-0 bg-primary-950/50 backdrop-blur-[2px]" /><aside role="dialog" aria-modal="true" aria-label={editing ? 'Editar estudio' : 'Nuevo estudio'} className="absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-primary-100 px-5 py-5 sm:px-7"><div><h2 className="font-display text-xl font-bold text-primary-950">{editing ? 'Editar estudio' : 'Nuevo estudio'}</h2><p className="mt-1 text-xs text-slate-500">{editing ? 'Actualiza la información del catálogo.' : 'Registra un nuevo análisis clínico.'}</p></div><button type="button" disabled={saving} onClick={() => setDrawerOpen(false)} aria-label="Cerrar" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40"><X className="h-5 w-5" /></button></div>
        <form onSubmit={event => void saveService(event)} className="flex min-h-0 flex-1 flex-col"><div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-7">
          <div><label htmlFor="service-name" className={labelClass}>Nombre del estudio *</label><input id="service-name" required minLength={2} maxLength={160} value={form.name} onChange={e => updateName(e.target.value)} className={fieldClass} placeholder="Ej. Biometría hemática" /></div>
          <div><label htmlFor="service-category" className={labelClass}>Categoría</label><input id="service-category" maxLength={100} list="service-categories" value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} className={fieldClass} placeholder="Ej. Hematología" /><datalist id="service-categories">{categories.map(category => <option key={category} value={category} />)}</datalist></div>
          <div><label htmlFor="service-price" className={labelClass}>Precio al público (MXN)</label><input id="service-price" type="text" inputMode="decimal" value={form.price} onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))} className={fieldClass} placeholder="Ej. 350.00 (opcional)" /><p className="mt-1.5 text-xs text-slate-500">Deja vacío si aún no hay precio. El valor 0 significa que el estudio es gratuito.</p></div>
          <div><label htmlFor="service-description" className={labelClass}>Descripción</label><textarea id="service-description" rows={4} maxLength={5000} value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} className={`${fieldClass} resize-y`} placeholder="Información general del estudio..." /></div>
          <div><label htmlFor="service-preparation" className={labelClass}>Indicaciones de preparación</label><textarea id="service-preparation" rows={4} maxLength={5000} value={form.preparation} onChange={e => setForm(prev => ({ ...prev, preparation: e.target.value }))} className={`${fieldClass} resize-y`} placeholder="Indicaciones proporcionadas por el laboratorio..." /><p className="mt-1.5 text-xs text-slate-500">No inventes indicaciones clínicas; captura únicamente las autorizadas por el laboratorio.</p></div>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"><span><span className="block text-sm font-semibold text-primary-950">Estudio activo</span><span className="mt-1 block text-xs text-slate-500">Controla si el estudio está habilitado en el catálogo.</span></span><input type="checkbox" checked={form.isActive} onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))} className="h-5 w-5 accent-green-600" /></label>
          {formError && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{formError}</div>}
        </div><div className="flex justify-end gap-3 border-t border-primary-100 bg-white p-5 sm:p-6"><button type="button" disabled={saving} onClick={() => setDrawerOpen(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 disabled:opacity-50">Cancelar</button><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-bold text-white hover:brightness-95 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Registrar estudio'}</button></div></form></aside></div>}
    </div>
  );
}
