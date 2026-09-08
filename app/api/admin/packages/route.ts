import { asc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { packages, packageServices } from '@/lib/db/schema';
import { packageInputSchema } from '@/lib/validators';

export async function GET() {
  try {
    const access = await requireUser(['admin', 'editor']); if ('response' in access) return access.response;
    return NextResponse.json({ data: await getDb().select().from(packages).orderBy(asc(packages.name)) });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: Request) {
  try {
    const access = await requireUser(['admin', 'editor']); if ('response' in access) return access.response;
    const { serviceIds, ...input } = packageInputSchema.parse(await request.json());
    const db = getDb();
    const [data] = await db.insert(packages).values({ ...input, price: input.price?.toString() }).returning();
    if (serviceIds.length) await db.insert(packageServices).values([...new Set(serviceIds)].map((serviceId) => ({ packageId: data.id, serviceId })));
    return NextResponse.json({ data: { ...data, serviceIds } }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
