import { eq } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { appointments, branches, googleCalendarMappings } from '@/lib/db/schema';
import { getGoogleCalendarEnvironment } from '@/lib/env';
import {
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  GoogleCalendarApiError,
  type GoogleCalendarEventInput,
  updateGoogleCalendarEvent,
} from '@/lib/google-calendar/client';
import { getGoogleCalendarAccessToken } from '@/lib/google-calendar/connection';

export class GoogleCalendarMappingNotFoundError extends Error {
  constructor() {
    super('No hay un calendario configurado para esta sucursal o para las citas a domicilio.');
    this.name = 'GoogleCalendarMappingNotFoundError';
  }
}

export function getGoogleCalendarMappingKey(branchId: string | null) {
  return branchId ? `branch:${branchId}` : 'home';
}

export async function deleteAppointmentGoogleCalendarEvent(appointmentId: string) {
  const db = getDb();
  const [appointment] = await db
    .select({
      eventId: appointments.googleCalendarEventId,
      calendarId: appointments.googleCalendarId,
    })
    .from(appointments)
    .where(eq(appointments.id, appointmentId))
    .limit(1);

  if (!appointment) throw new Error('Cita no encontrada.');
  if (!appointment.eventId || !appointment.calendarId) return { status: 'not-needed' as const };

  const { accessToken } = await getGoogleCalendarAccessToken();
  await deleteGoogleCalendarEvent(accessToken, appointment.calendarId, appointment.eventId);
  return { status: 'deleted' as const };
}

function addMinutes(date: string, time: string, minutes: number) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute, second = 0] = time.split(':').map(Number);
  const value = new Date(Date.UTC(year, month - 1, day, hour, minute + minutes, second));
  const iso = value.toISOString();
  return iso.slice(0, 19);
}

function toLocalDateTime(date: string, time: string) {
  return `${date}T${time.length === 5 ? `${time}:00` : time}`;
}

export async function syncAppointmentWithGoogleCalendar(appointmentId: string) {
  const db = getDb();
  const [appointment] = await db
    .select({
      id: appointments.id,
      patientName: appointments.patientName,
      phone: appointments.phone,
      email: appointments.email,
      type: appointments.type,
      branchId: appointments.branchId,
      address: appointments.address,
      requestedDate: appointments.requestedDate,
      requestedTime: appointments.requestedTime,
      status: appointments.status,
      googleCalendarEventId: appointments.googleCalendarEventId,
      googleCalendarId: appointments.googleCalendarId,
      branchName: branches.name,
      branchAddress: branches.address,
    })
    .from(appointments)
    .leftJoin(branches, eq(appointments.branchId, branches.id))
    .where(eq(appointments.id, appointmentId))
    .limit(1);

  if (!appointment) throw new Error('Cita no encontrada.');

  if (appointment.status === 'cancelled') {
    if (!appointment.googleCalendarEventId || !appointment.googleCalendarId) {
      return { status: 'not-needed' as const };
    }

    const { accessToken } = await getGoogleCalendarAccessToken();
    await deleteGoogleCalendarEvent(
      accessToken,
      appointment.googleCalendarId,
      appointment.googleCalendarEventId,
    );
    await db
      .update(appointments)
      .set({ googleCalendarEventId: null, googleCalendarId: null, updatedAt: new Date() })
      .where(eq(appointments.id, appointment.id));
    return { status: 'deleted' as const };
  }

  if (appointment.status !== 'confirmed') return { status: 'not-needed' as const };

  const mappingKey = getGoogleCalendarMappingKey(appointment.type === 'branch' ? appointment.branchId : null);
  const [mapping] = await db
    .select()
    .from(googleCalendarMappings)
    .where(eq(googleCalendarMappings.key, mappingKey))
    .limit(1);
  if (!mapping) throw new GoogleCalendarMappingNotFoundError();

  const { accessToken } = await getGoogleCalendarAccessToken();
  const environment = getGoogleCalendarEnvironment();
  const location = appointment.type === 'home' ? appointment.address : appointment.branchAddress;
  const event: GoogleCalendarEventInput = {
    summary: `${appointment.type === 'home' ? 'Domicilio' : appointment.branchName ?? 'Sucursal'} · ${appointment.patientName}`,
    description: [
      `Paciente: ${appointment.patientName}`,
      `Teléfono: ${appointment.phone}`,
      appointment.email ? `Correo: ${appointment.email}` : null,
      `Cita Labwork: ${appointment.id}`,
    ].filter(Boolean).join('\n'),
    location: location ?? undefined,
    start: {
      dateTime: toLocalDateTime(appointment.requestedDate, appointment.requestedTime),
      timeZone: environment.GOOGLE_CALENDAR_TIME_ZONE,
    },
    end: {
      dateTime: addMinutes(
        appointment.requestedDate,
        appointment.requestedTime,
        environment.GOOGLE_CALENDAR_APPOINTMENT_DURATION_MINUTES,
      ),
      timeZone: environment.GOOGLE_CALENDAR_TIME_ZONE,
    },
    extendedProperties: {
      private: {
        labworkAppointmentId: appointment.id,
        labworkAppointmentType: appointment.type,
        ...(appointment.branchId ? { labworkBranchId: appointment.branchId } : {}),
      },
    },
  };

  if (appointment.googleCalendarEventId && appointment.googleCalendarId === mapping.calendarId) {
    try {
      const updated = await updateGoogleCalendarEvent(
        accessToken,
        mapping.calendarId,
        appointment.googleCalendarEventId,
        event,
      );
      return { status: 'updated' as const, eventId: updated.id, htmlLink: updated.htmlLink };
    } catch (error) {
      if (!(error instanceof GoogleCalendarApiError) || (error.status !== 404 && error.status !== 410)) {
        throw error;
      }
    }
  }

  if (appointment.googleCalendarEventId && appointment.googleCalendarId) {
    await deleteGoogleCalendarEvent(
      accessToken,
      appointment.googleCalendarId,
      appointment.googleCalendarEventId,
    );
  }

  const created = await createGoogleCalendarEvent(accessToken, mapping.calendarId, event);
  await db
    .update(appointments)
    .set({
      googleCalendarEventId: created.id,
      googleCalendarId: mapping.calendarId,
      updatedAt: new Date(),
    })
    .where(eq(appointments.id, appointment.id));

  return { status: 'created' as const, eventId: created.id, htmlLink: created.htmlLink };
}
