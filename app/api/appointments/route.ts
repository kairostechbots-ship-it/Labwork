import { and, eq, inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { apiError, handleApiError } from '@/lib/api';
import { getDb } from '@/lib/db';
import { appointmentPackages, appointments, appointmentServices, branches, packages, services } from '@/lib/db/schema';
import { appointmentInputSchema } from '@/lib/validators';
import { AppointmentSlotUnavailableError, assertSlotAvailable } from '@/lib/appointments/availability';
import { sendAppointmentNotifications } from '@/lib/email/appointments';
import { consumeAppointmentRateLimit } from '@/lib/appointments/rate-limit';

export async function POST(request: Request) {
  try {
    const rateLimit = await consumeAppointmentRateLimit(request);
    if (!rateLimit.allowed) return apiError('Demasiadas solicitudes. Inténtalo nuevamente en unos minutos.', 429);
    const input = appointmentInputSchema.parse(await request.json());
    const today = new Date().toISOString().slice(0, 10);
    if (input.requestedDate < today) return apiError('La fecha solicitada no puede estar en el pasado.', 422);

    const db = getDb();
    if (input.branchId) {
      const found = await db.select({ id: branches.id }).from(branches).where(and(eq(branches.id, input.branchId), eq(branches.isActive, true))).limit(1);
      if (!found.length) return apiError('La sucursal no existe o no está activa.', 422);
    }
    if (input.serviceIds.length) {
      const found = await db.select({ id: services.id }).from(services).where(and(inArray(services.id, input.serviceIds), eq(services.isActive, true)));
      if (found.length !== new Set(input.serviceIds).size) return apiError('Uno o más estudios no existen o no están activos.', 422);
    }
    if (input.packageIds.length) {
      const found = await db.select({ id: packages.id }).from(packages).where(and(inArray(packages.id, input.packageIds), eq(packages.isActive, true)));
      if (found.length !== new Set(input.packageIds).size) return apiError('Uno o más paquetes no existen o no están activos.', 422);
    }
    await assertSlotAvailable(input.requestedDate, input.requestedTime, { type: input.type, branchId: input.type === 'branch' ? input.branchId ?? null : null });

    const { serviceIds, packageIds, ...values } = input;
    const appointmentId = crypto.randomUUID();
    const insertAppointment = db.insert(appointments).values({ id: appointmentId, ...values, requestedTime: values.requestedTime.length === 5 ? `${values.requestedTime}:00` : values.requestedTime }).returning();
    const insertServices = db.insert(appointmentServices).values([...new Set(serviceIds)].map((serviceId) => ({ appointmentId, serviceId })));
    const insertPackages = db.insert(appointmentPackages).values([...new Set(packageIds)].map((packageId) => ({ appointmentId, packageId })));

    let created: typeof appointments.$inferSelect;
    if (serviceIds.length && packageIds.length) {
      const [rows] = await db.batch([insertAppointment, insertServices, insertPackages]);
      [created] = rows;
    } else if (serviceIds.length) {
      const [rows] = await db.batch([insertAppointment, insertServices]);
      [created] = rows;
    } else if (packageIds.length) {
      const [rows] = await db.batch([insertAppointment, insertPackages]);
      [created] = rows;
    } else {
      const [rows] = await db.batch([insertAppointment]);
      [created] = rows;
    }

    const emailNotification = await sendAppointmentNotifications(created, 'pending');
    return NextResponse.json({ data: created, emailNotification }, { status: 201 });
  } catch (error) {
    if (error instanceof AppointmentSlotUnavailableError) return apiError(error.message, 409);
    return handleApiError(error);
  }
}
