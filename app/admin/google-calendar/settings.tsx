'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Link2, Loader2, Unplug } from 'lucide-react';

type Connection = {
  connected: boolean;
  googleEmail: string | null;
  connectedAt: string | null;
  mappingCount: number;
};

type Branch = { id: string; name: string };
type Calendar = { id: string; summary: string; primary?: boolean; timeZone?: string };
type Mapping = { key?: string; branchId: string | null; calendarId: string };

async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message ?? 'La solicitud no pudo completarse.');
  return body.data as T;
}

export default function GoogleCalendarSettings() {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentConnection = await apiRequest<Connection>('/api/admin/google-calendar');
      setConnection(currentConnection);
      const [branchRows, mappingRows] = await Promise.all([
        apiRequest<Branch[]>('/api/admin/branches'),
        apiRequest<Mapping[]>('/api/admin/google-calendar/mappings'),
      ]);
      setBranches(branchRows);
      setMappings(mappingRows);

      if (currentConnection.connected) {
        setCalendars(await apiRequest<Calendar[]>('/api/admin/google-calendar/calendars'));
      } else {
        setCalendars([]);
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'No se pudo cargar la configuración.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  function selectedCalendar(branchId: string | null) {
    return mappings.find((mapping) => mapping.branchId === branchId)?.calendarId ?? '';
  }

  async function updateMapping(branchId: string | null, calendarId: string) {
    const key = branchId ?? 'home';
    setSavingKey(key);
    setError(null);
    try {
      if (calendarId) {
        await apiRequest('/api/admin/google-calendar/mappings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ branchId, calendarId }),
        });
      } else {
        const query = branchId ? `branchId=${encodeURIComponent(branchId)}` : 'target=home';
        const response = await fetch(`/api/admin/google-calendar/mappings?${query}`, { method: 'DELETE' });
        if (!response.ok && response.status !== 404) {
          const body = await response.json();
          throw new Error(body.error?.message ?? 'No se pudo quitar la asignación.');
        }
      }
      await loadSettings();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'No se pudo guardar la asignación.');
    } finally {
      setSavingKey(null);
    }
  }

  async function disconnect() {
    if (!window.confirm('¿Quieres desconectar la cuenta de Google Calendar?')) return;
    setError(null);
    try {
      await apiRequest('/api/admin/google-calendar', { method: 'DELETE' });
      await loadSettings();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'No se pudo desconectar la cuenta.');
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary-600">Administración</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Google Calendar</h1>
            <p className="mt-2 text-slate-600">Asigna un calendario diferente a cada sucursal.</p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-slate-600 hover:text-primary-600">
            Volver a la agenda
          </Link>
        </div>

        {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="flex items-center gap-3 text-slate-600"><Loader2 className="h-5 w-5 animate-spin" /> Cargando configuración…</div>
          ) : connection?.connected ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-6 w-6 text-green-600" />
                <div>
                  <h2 className="font-bold text-slate-900">Cuenta conectada</h2>
                  <p className="text-sm text-slate-600">{connection.googleEmail}</p>
                </div>
              </div>
              <button onClick={disconnect} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                <Unplug className="h-4 w-4" /> Desconectar
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-1 h-6 w-6 text-primary-600" />
                <div>
                  <h2 className="font-bold text-slate-900">Conecta la cuenta institucional</h2>
                  <p className="text-sm text-slate-600">Google pedirá permiso para administrar eventos.</p>
                </div>
              </div>
              <a href="/api/admin/google-calendar/connect" className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                <Link2 className="h-4 w-4" /> Conectar Google
              </a>
            </div>
          )}
        </section>

        {connection?.connected && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Calendarios por sucursal</h2>
            <p className="mt-1 text-sm text-slate-600">Cada calendario solo puede asignarse una vez para conservar el filtro por sucursal.</p>

            <div className="mt-6 divide-y divide-slate-100">
              {[...branches.map((branch) => ({ ...branch, branchId: branch.id })), { id: 'home', name: 'Tomas a domicilio', branchId: null }].map((target) => (
                <label key={target.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_2fr] sm:items-center">
                  <span className="font-medium text-slate-800">{target.name}</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedCalendar(target.branchId)}
                      disabled={savingKey === (target.branchId ?? 'home')}
                      onChange={(event) => void updateMapping(target.branchId, event.target.value)}
                      className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800"
                    >
                      <option value="">Sin asignar</option>
                      {calendars.map((calendar) => (
                        <option key={calendar.id} value={calendar.id}>{calendar.summary}{calendar.primary ? ' (principal)' : ''}</option>
                      ))}
                    </select>
                    {savingKey === (target.branchId ?? 'home') && <Loader2 className="h-4 w-4 animate-spin text-primary-600" />}
                  </div>
                </label>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
