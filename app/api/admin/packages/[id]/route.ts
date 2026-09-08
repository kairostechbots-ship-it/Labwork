import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { apiError, handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { packages, packageServices } from '@/lib/db/schema';
import { packageInputSchema } from '@/lib/validators';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const access = await requireUser(['admin', 'editor']); if ('response' in access) return access.response;
    const { id } = await params;
    const parsed = packageInputSchema.partial().parse(await request.json());
    const { serviceIds, ...input } = parsed;
    const db = getDb();
    const exists = await db.select({ id: packages.id }).from(packages).where(eq(packages.id, id)).limit(1);
    if (!exists.length) return apiError('Paquete no encontrado.', 404);
    const updatePackage = db.update(packages).set({ ...input, price: input.price?.toString(), updatedAt: new Date() }).where(eq(packages.id, id)).returning();
    let data: typeof packages.$inferSelect;
    if (serviceIds) {
      const clearServices = db.delete(packageServices).where(eq(packageServices.packageId, id));
      if (serviceIds.length) {
        const addServices = db.insert(packageServices).values([...new Set(serviceIds)].map((serviceId) => ({ packageId: id, serviceId })));
        const [rows] = await db.batch([updatePackage, clearServices, addServices]);
        [data] = rows;
      } else {
        const [rows] = await db.batch([updatePackage, clearServices]);
        [data] = rows;
      }
    } else {
      [data] = await updatePackage;
    }
    return NextResponse.json({ data: { ...data, ...(serviceIds ? { serviceIds } : {}) } });
  } catch (error) { return handleApiError(error); }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const access = await requireUser(['admin']); if ('response' in access) return access.response;
    const { id } = await params;
    const [data] = await getDb().delete(packages).where(eq(packages.id, id)).returning({ id: packages.id });
    return data ? NextResponse.json({ data }) : apiError('Paquete no encontrado.', 404);
  } catch (error) { return handleApiError(error); }
}
