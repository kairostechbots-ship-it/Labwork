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
import { AppointmentSlotUnavailableError, assertSlotAvailable } from '@/lib/appointments/availability';
import { sendAppointmentNotifications } from '@/lib/email/appointments';

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
    const [current] = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
    if (!current) return apiError('Cita no encontrada.', 404);
    const nextStatus = input.status ?? current.status;
    const nextType = input.type ?? current.type;
    const nextBranchId = input.branchId !== undefined ? input.branchId : current.branchId;
    const nextDate = input.requestedDate ?? current.requestedDate;
    const nextTime = input.requestedTime ?? current.requestedTime;
    if (nextDate < new Date().toISOString().slice(0, 10)) return apiError('La fecha no puede estar en el pasado.', 422);
    if (nextType === 'branch' && !nextBranchId) return apiError('Selecciona una sucursal.', 422);
    if (nextType === 'home' && !(input.address ?? current.address)) return apiError('La dirección es obligatoria.', 422);
    if (nextStatus === 'confirmed') {
      await assertSlotAvailable(nextDate, nextTime, { type: nextType, branchId: nextType === 'branch' ? nextBranchId : null }, id);
    }
    const { serviceIds, packageIds, note: _note, ...updates } = input;
    const normalizedUpdates = {
      ...updates,
      ...(input.type === 'home' ? { branchId: null } : {}),
      ...(input.type === 'branch' ? { address: null } : {}),
      ...(input.requestedTime ? { requestedTime: input.requestedTime.length === 5 ? `${input.requestedTime}:00` : input.requestedTime } : {}),
      updatedAt: new Date(),
    };
    const [data] = await db.update(appointments).set(normalizedUpdates).where(eq(appointments.id, id)).returning();
    if (serviceIds) {
      await db.delete(appointmentServices).where(eq(appointmentServices.appointmentId, id));
      if (serviceIds.length) await db.insert(appointmentServices).values([...new Set(serviceIds)].map((serviceId) => ({ appointmentId: id, serviceId })));
    }
    if (packageIds) {
      await db.delete(appointmentPackages).where(eq(appointmentPackages.appointmentId, id));
      if (packageIds.length) await db.insert(appointmentPackages).values([...new Set(packageIds)].map((packageId) => ({ appointmentId: id, packageId })));
    }
    if (current.status !== nextStatus) await db.insert(appointmentStatusHistory).values({ appointmentId: id, previousStatus: current.status, newStatus: nextStatus, changedByUserId: access.user.id, note: input.note });

    let calendarSync: Awaited<ReturnType<typeof syncAppointmentWithGoogleCalendar>> | { status: 'error'; message: string } = { status: 'not-needed' };
    if (nextStatus === 'confirmed' || nextStatus === 'cancelled') {
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

    const emailEvent = current.status !== nextStatus ? nextStatus : 'updated';
    const emailNotification = await sendAppointmentNotifications(data, emailEvent);
    return NextResponse.json({ data, calendarSync, emailNotification });
  } catch (error) {
    if (error instanceof AppointmentSlotUnavailableError) return apiError(error.message, 409);
    return handleApiError(error);
  }
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
