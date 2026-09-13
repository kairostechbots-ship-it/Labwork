import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { apiError, handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { appointmentPackages, appointments, appointmentServices, appointmentStatusHistory } from '@/lib/db/schema';
import { appointmentUpdateSchema } from '@/lib/validators';
import {
  deleteAppointmentGoogleCalendarEvent,
  GoogleCalendarMappingNotFoundError,
  syncAppointmentWithGoogleCalendar,
} from '@/lib/google-calendar/appointments';
import { GoogleCalendarNotConnectedError } from '@/lib/google-calendar/connection';
import { GoogleCalendarApiError } from '@/lib/google-calendar/client';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const access = await requireUser(['admin', 'receptionist']); if ('response' in access) return access.response;
    const { id } = await params;
    const db = getDb();
    const [item] = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
    if (!item) return apiError('Cita no encontrada.', 404);
    const [serviceRows, packageRows, history] = await Promise.all([
      db.select({ serviceId: appointmentServices.serviceId }).from(appointmentServices).where(eq(appointmentServices.appointmentId, id)),
      db.select({ packageId: appointmentPackages.packageId }).from(appointmentPackages).where(eq(appointmentPackages.appointmentId, id)),
      db.select().from(appointmentStatusHistory).where(eq(appointmentStatusHistory.appointmentId, id)),
    ]);
    return NextResponse.json({ data: { ...item, serviceIds: serviceRows.map((x) => x.serviceId), packageIds: packageRows.map((x) => x.packageId), history } });
  } catch (error) { return handleApiError(error); }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const access = await requireUser(['admin', 'receptionist']); if ('response' in access) return access.response;
    const { id } = await params;
    const input = appointmentUpdateSchema.parse(await request.json());
    const db = getDb();
    const [current] = await db.select({ status: appointments.status }).from(appointments).where(eq(appointments.id, id)).limit(1);
    if (!current) return apiError('Cita no encontrada.', 404);
    const [data] = await db.update(appointments).set({ status: input.status, updatedAt: new Date() }).where(eq(appointments.id, id)).returning();
    if (current.status !== input.status) await db.insert(appointmentStatusHistory).values({ appointmentId: id, previousStatus: current.status, newStatus: input.status, changedByUserId: access.user.id, note: input.note });

    let calendarSync: Awaited<ReturnType<typeof syncAppointmentWithGoogleCalendar>> | { status: 'error'; message: string } = { status: 'not-needed' };
    if (input.status === 'confirmed' || input.status === 'cancelled') {
      try {
        calendarSync = await syncAppointmentWithGoogleCalendar(id);
      } catch (error) {
        console.error('Google Calendar sync failed', error);
        const expectedError = error instanceof GoogleCalendarNotConnectedError || error instanceof GoogleCalendarMappingNotFoundError;
        calendarSync = {
          status: 'error',
          message: expectedError ? error.message : 'No se pudo sincronizar con Google Calendar.',
        };
      }
    }

    return NextResponse.json({ data, calendarSync });
  } catch (error) { return handleApiError(error); }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const access = await requireUser(['admin']); if ('response' in access) return access.response;
    const { id } = await params;
    const existing = await getDb().select({ id: appointments.id }).from(appointments).where(eq(appointments.id, id)).limit(1);
    if (!existing.length) return apiError('Cita no encontrada.', 404);
    await deleteAppointmentGoogleCalendarEvent(id);
    const [data] = await getDb().delete(appointments).where(eq(appointments.id, id)).returning({ id: appointments.id });
    return data ? NextResponse.json({ data }) : apiError('Cita no encontrada.', 404);
  } catch (error) {
    if (error instanceof GoogleCalendarNotConnectedError) return apiError(error.message, 409);
    if (error instanceof GoogleCalendarApiError) {
      console.error('Google Calendar deletion failed', error);
      return apiError('No se pudo eliminar el evento de Google Calendar.', 502);
    }
    return handleApiError(error);
  }
}
