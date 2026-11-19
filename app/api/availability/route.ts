import { and, eq, inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { handleApiError } from '@/lib/api';
import { getDb } from '@/lib/db';
import {
  appointments,
  branches,
  branchHomeScheduleSettings,
  branchScheduleSettings,
} from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

const TIME_ZONE = 'America/Mexico_City';
type AppointmentType = 'branch' | 'home';

function localParts() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? '';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function toTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

// Difference between two YYYY-MM-DD dates, calculated in UTC to avoid DST issues.
function daysBetween(from: string, to: string) {
  const fromMs = Date.parse(`${from}T12:00:00Z`);
  const toMs = Date.parse(`${to}T12:00:00Z`);
  return Math.round((toMs - fromMs) / 86_400_000);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const date = searchParams.get('date');
    const type = searchParams.get('type') ?? 'branch';

    if (type !== 'branch' && type !== 'home') {
      return NextResponse.json({ error: 'El tipo de atención no es válido.' }, { status: 400 });
    }
    if (!branchId || !date) {
      return NextResponse.json({ error: 'La sucursal y la fecha son obligatorias.' }, { status: 400 });
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(branchId)) {
      return NextResponse.json({ error: 'Identificador de sucursal inválido.' }, { status: 400 });
    }
    if (!validDate(date)) {
      return NextResponse.json({ error: 'La fecha no es válida.' }, { status: 400 });
    }

    const now = localParts();
    if (date < now.date) {
      return NextResponse.json({ error: 'No puedes consultar fechas anteriores.' }, { status: 422 });
    }

    const db = getDb();
    const [branch] = await db.select({ id: branches.id, name: branches.name })
      .from(branches)
      .where(and(eq(branches.id, branchId), eq(branches.isActive, true)))
      .limit(1);

    if (!branch) {
      return NextResponse.json({ error: 'Sucursal no disponible.' }, { status: 404 });
    }

    // Each modality reads only its own schedule settings.
    const config = type === 'home'
      ? (await db.select().from(branchHomeScheduleSettings)
          .where(and(eq(branchHomeScheduleSettings.branchId, branchId), eq(branchHomeScheduleSettings.isActive, true)))
          .limit(1))[0]
      : (await db.select().from(branchScheduleSettings)
          .where(and(eq(branchScheduleSettings.branchId, branchId), eq(branchScheduleSettings.isActive, true)))
          .limit(1))[0];

    if (!config) {
      return NextResponse.json({ error: `La atención ${type === 'home' ? 'a domicilio' : 'en sucursal'} no tiene disponibilidad habilitada.` }, { status: 404 });
    }

    const slotMinutes = config.slotMinutes;
    const capacity = config.capacity;
    const requiresConfirmation = 'requiresConfirmation' in config ? config.requiresConfirmation : false;
    const minimumAdvanceDays = 'minimumAdvanceDays' in config
      ? config.minimumAdvanceDays
      : (config.allowSameDay ? 0 : 1);

    const response = (closed: boolean, slots: { time: string; available: boolean; remaining: number }[]) =>
      NextResponse.json({
        data: {
          branchId: branch.id,
          branchName: branch.name,
          date,
          type: type as AppointmentType,
          closed,
          slotMinutes,
          capacity,
          requiresConfirmation,
          slots,
        },
      }, { headers: { 'Cache-Control': 'no-store' } });

    if (daysBetween(now.date, date) < minimumAdvanceDays) return response(true, []);

    const day = new Date(`${date}T12:00:00Z`).getUTCDay();
    if (day === 0) return response(true, []);

    const open = day === 6 ? config.saturdayOpen : config.weekdayOpen;
    const close = day === 6 ? config.saturdayClose : config.weekdayClose;
    const start = toMinutes(open);
    const end = toMinutes(close);

    if (!Number.isInteger(slotMinutes) || slotMinutes <= 0 ||
        !Number.isInteger(capacity) || capacity <= 0 ||
        !Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
      return NextResponse.json({ error: 'La configuración de horarios no es válida.' }, { status: 500 });
    }

    const existing = await db.select({ requestedTime: appointments.requestedTime })
      .from(appointments)
      .where(and(
        eq(appointments.branchId, branchId),
        eq(appointments.requestedDate, date),
        eq(appointments.type, type),
        inArray(appointments.status, ['pending', 'confirmed']),
      ));

    const counts = new Map<string, number>();
    for (const appointment of existing) {
      const time = appointment.requestedTime.slice(0, 5);
      counts.set(time, (counts.get(time) ?? 0) + 1);
    }

    const slots: { time: string; available: boolean; remaining: number }[] = [];
    for (let minute = start; minute + slotMinutes <= end; minute += slotMinutes) {
      const time = toTime(minute);
      const reserved = counts.get(time) ?? 0;
      const isPast = date === now.date && minute <= now.minutes;
      const available = !isPast && reserved < capacity;
      slots.push({ time, available, remaining: available ? capacity - reserved : 0 });
    }

    return response(false, slots);
  } catch (error) {
    return handleApiError(error);
  }
}
