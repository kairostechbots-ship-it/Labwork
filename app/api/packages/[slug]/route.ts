import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { apiError, handleApiError } from '@/lib/api';
import { getDb } from '@/lib/db';
import { packages, packageServices, services } from '@/lib/db/schema';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const [item] = await getDb().select().from(packages).where(and(eq(packages.slug, slug), eq(packages.isActive, true))).limit(1);
    if (!item) return apiError('Paquete no encontrado.', 404);
    const includedServices = await getDb().select({ id: services.id, name: services.name, slug: services.slug }).from(packageServices).innerJoin(services, eq(packageServices.serviceId, services.id)).where(and(eq(packageServices.packageId, item.id), eq(services.isActive, true)));
    return NextResponse.json({ data: { ...item, services: includedServices } });
  } catch (error) { return handleApiError(error); }
}
