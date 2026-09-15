import { and, eq, isNull, ne } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { appointments, scheduleBlocks, scheduleRules } from '@/lib/db/schema';

export type ScheduleTarget = { type: 'branch' | 'home'; branchId: string | null };

function targetCondition<T extends typeof scheduleRules | typeof scheduleBlocks>(table: T, target: ScheduleTarget) {
  return and(
    eq(table.type, target.type),
    target.type === 'branch' && target.branchId
      ? eq(table.branchId, target.branchId)
      : isNull(table.branchId),
  );
}

function minutes(value: string) {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

function clock(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

export async function getAvailability(date: string, target: ScheduleTarget, excludeAppointmentId?: string) {
  const db = getDb();
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  const [rules, blocks, confirmed] = await Promise.all([
    db.select().from(scheduleRules).where(and(targetCondition(scheduleRules, target), eq(scheduleRules.weekday, weekday), eq(scheduleRules.isActive, true))),
    db.select().from(scheduleBlocks).where(and(targetCondition(scheduleBlocks, target), eq(scheduleBlocks.blockedDate, date))),
    db.select({ time: appointments.requestedTime }).from(appointments).where(and(
      eq(appointments.type, target.type),
      target.type === 'branch' && target.branchId ? eq(appointments.branchId, target.branchId) : isNull(appointments.branchId),
      eq(appointments.requestedDate, date),
      eq(appointments.status, 'confirmed'),
      excludeAppointmentId ? ne(appointments.id, excludeAppointmentId) : undefined,
    )),
  ]);

  const counts = new Map<string, number>();
  for (const item of confirmed) {
    const key = item.time.slice(0, 5);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const slots = rules.flatMap((rule) => {
    const result = [];
    const start = minutes(rule.startTime);
    const end = minutes(rule.endTime);
    for (let value = start; value + rule.slotDurationMinutes <= end; value += rule.slotDurationMinutes) {
      const time = clock(value);
      const blocked = blocks.some((block) => !block.startTime || !block.endTime || (
        value < minutes(block.endTime) && value + rule.slotDurationMinutes > minutes(block.startTime)
      ));
      const reserved = counts.get(time) ?? 0;
      result.push({
        time,
        durationMinutes: rule.slotDurationMinutes,
        capacity: rule.capacity,
        reserved,
        available: !blocked && reserved < rule.capacity,
        reason: blocked ? 'blocked' : reserved >= rule.capacity ? 'full' : null,
      });
    }
    return result;
  });

  return { date, type: target.type, branchId: target.branchId, slots };
}

export async function assertSlotAvailable(date: string, time: string, target: ScheduleTarget, excludeAppointmentId?: string) {
  const availability = await getAvailability(date, target, excludeAppointmentId);
  const slot = availability.slots.find((item) => item.time === time.slice(0, 5));
  if (!slot?.available) throw new AppointmentSlotUnavailableError();
  return slot;
}

export class AppointmentSlotUnavailableError extends Error {
  constructor() {
    super('El horario seleccionado ya no está disponible.');
    this.name = 'AppointmentSlotUnavailableError';
  }
}
