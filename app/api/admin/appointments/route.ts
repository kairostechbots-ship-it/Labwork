import { and, count, desc, eq, gte, ilike, lte, or, type SQL } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiError, handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { appointmentPackages, appointments, appointmentServices, branches, packages, services } from '@/lib/db/schema';
import { appointmentInputSchema } from '@/lib/validators';
import { inArray } from 'drizzle-orm';
import { AppointmentSlotUnavailableError, assertSlotAvailable } from '@/lib/appointments/availability';
import { sendAppointmentNotifications } from '@/lib/email/appointments';
import { syncAppointmentWithGoogleCalendar } from '@/lib/google-calendar/appointments';

export async function GET(request: Request) {
  try {
    const access = await requireUser(['admin', 'receptionist']); if ('response' in access) return access.response;
    const searchParams = new URL(request.url).searchParams;
    const query = z.object({
      status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
      type: z.enum(['branch', 'home']).optional(),
      branchId: z.string().uuid().optional(),
      search: z.string().trim().max(160).optional(),
      dateFrom: z.iso.date().optional(),
      dateTo: z.iso.date().optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    }).safeParse({
      status: searchParams.get('status') || undefined,
      type: searchParams.get('type') || undefined,
      branchId: searchParams.get('branchId') || undefined,
      search: searchParams.get('search') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    });
    if (!query.success) return apiError('Los filtros no son válidos.', 422, query.error.flatten());

    const filters: SQL[] = [];
    if (query.data.status) filters.push(eq(appointments.status, query.data.status));
    if (query.data.type) filters.push(eq(appointments.type, query.data.type));
    if (query.data.branchId) filters.push(eq(appointments.branchId, query.data.branchId));
    if (query.data.search) filters.push(or(ilike(appointments.patientName, `%${query.data.search}%`), ilike(appointments.phone, `%${query.data.search}%`))!);
    if (query.data.dateFrom) filters.push(gte(appointments.requestedDate, query.data.dateFrom));
    if (query.data.dateTo) filters.push(lte(appointments.requestedDate, query.data.dateTo));

    const where = filters.length ? and(...filters) : undefined;
    const db = getDb();
    const [data, [total]] = await Promise.all([
      db.select().from(appointments).where(where).orderBy(desc(appointments.requestedDate), desc(appointments.requestedTime)).limit(query.data.limit).offset((query.data.page - 1) * query.data.limit),
      db.select({ value: count() }).from(appointments).where(where),
    ]);
    return NextResponse.json({ data, meta: { page: query.data.page, limit: query.data.limit, total: total.value, pages: Math.ceil(total.value / query.data.limit) } });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: Request) {
  try {
    const access = await requireUser(['admin', 'receptionist']); if ('response' in access) return access.response;
    const body = await request.json();
    const input = appointmentInputSchema.parse(body);
    const status = z.enum(['pending', 'confirmed']).default('confirmed').parse(body.status);
    const db = getDb();
    if (input.branchId) {
      const found = await db.select({ id: branches.id }).from(branches).where(and(eq(branches.id, input.branchId), eq(branches.isActive, true))).limit(1);
      if (!found.length) return apiError('La sucursal no existe o no está activa.', 422);
    }
    if (input.serviceIds.length) {
      const found = await db.select({ id: services.id }).from(services).where(and(inArray(services.id, input.serviceIds), eq(services.isActive, true)));
      if (found.length !== new Set(input.serviceIds).size) return apiError('Uno o más estudios no son válidos.', 422);
    }
    if (input.packageIds.length) {
      const found = await db.select({ id: packages.id }).from(packages).where(and(inArray(packages.id, input.packageIds), eq(packages.isActive, true)));
      if (found.length !== new Set(input.packageIds).size) return apiError('Uno o más paquetes no son válidos.', 422);
    }
    if (status === 'confirmed') await assertSlotAvailable(input.requestedDate, input.requestedTime, { type: input.type, branchId: input.type === 'branch' ? input.branchId ?? null : null });
    const { serviceIds, packageIds, ...values } = input;
    const appointmentId = crypto.randomUUID();
    const [data] = await db.insert(appointments).values({ id: appointmentId, ...values, status, createdByUserId: access.user.id, requestedTime: values.requestedTime.length === 5 ? `${values.requestedTime}:00` : values.requestedTime }).returning();
    if (serviceIds.length) await db.insert(appointmentServices).values([...new Set(serviceIds)].map((serviceId) => ({ appointmentId, serviceId })));
    if (packageIds.length) await db.insert(appointmentPackages).values([...new Set(packageIds)].map((packageId) => ({ appointmentId, packageId })));
    let calendarSync: { status: string; message?: string } = { status: 'not-needed' };
    if (status === 'confirmed') {
      try { calendarSync = await syncAppointmentWithGoogleCalendar(appointmentId); }
      catch (error) { console.error('Google Calendar sync failed', error); calendarSync = { status: 'error', message: 'No se pudo sincronizar con Google Calendar.' }; }
    }
    const emailNotification = await sendAppointmentNotifications(data, status);
    return NextResponse.json({ data, calendarSync, emailNotification }, { status: 201 });
  } catch (error) {
    if (error instanceof AppointmentSlotUnavailableError) return apiError(error.message, 409);
    return handleApiError(error);
  }
}
