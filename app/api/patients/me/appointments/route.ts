import { desc, eq, inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { appointments, appointmentPackages, appointmentServices, branches, packages, services } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  const access = await requireUser(['patient']);
  if (access.response) return access.response;

  try {
    const db = getDb();
    const rows = await db.select({
      id: appointments.id,
      folio: appointments.folio,
      type: appointments.type,
      requestedDate: appointments.requestedDate,
      requestedTime: appointments.requestedTime,
      status: appointments.status,
      address: appointments.address,
      phone: appointments.phone,
      patientName: appointments.patientName,
      email: appointments.email,
      birthDate: appointments.birthDate,
      studies: appointments.studies,
      notes: appointments.notes,
      createdAt: appointments.createdAt,
      branchName: branches.name,
      branchAddress: branches.address,
      branchPhone: branches.phone,
      branchMapUrl: branches.mapUrl,
      branchLatitude: branches.latitude,
      branchLongitude: branches.longitude,
    }).from(appointments)
      .leftJoin(branches, eq(appointments.branchId, branches.id))
      .where(eq(appointments.userId, access.user.id))
      .orderBy(desc(appointments.requestedDate), desc(appointments.requestedTime));

    const ids = rows.map(row => row.id);
    if (!ids.length) return NextResponse.json({ data: [] }, { headers: { 'Cache-Control': 'private, no-store' } });

    const [studyRows, packageRows] = await Promise.all([
      db.select({ appointmentId: appointmentServices.appointmentId, name: services.name })
        .from(appointmentServices).innerJoin(services, eq(appointmentServices.serviceId, services.id))
        .where(inArray(appointmentServices.appointmentId, ids)),
      db.select({ appointmentId: appointmentPackages.appointmentId, name: packages.name })
        .from(appointmentPackages).innerJoin(packages, eq(appointmentPackages.packageId, packages.id))
        .where(inArray(appointmentPackages.appointmentId, ids)),
    ]);

    const studyMap = new Map<string, string[]>();
    for (const row of studyRows) studyMap.set(row.appointmentId, [...(studyMap.get(row.appointmentId) ?? []), row.name]);
    const packageMap = new Map<string, string[]>();
    for (const row of packageRows) packageMap.set(row.appointmentId, [...(packageMap.get(row.appointmentId) ?? []), row.name]);

    const data = rows.map(row => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      services: studyMap.get(row.id) ?? [],
      packages: packageMap.get(row.id) ?? [],
    }));
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Error al consultar las citas del paciente:', error);
    return NextResponse.json({ error: 'No fue posible consultar tus citas.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
