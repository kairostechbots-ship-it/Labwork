import { asc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { services } from '@/lib/db/schema';
import { serviceInputSchema } from '@/lib/validators';

export async function GET() {
  try {
    const access = await requireUser(['admin', 'editor']); if ('response' in access) return access.response;
    return NextResponse.json({ data: await getDb().select().from(services).orderBy(asc(services.name)) });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: Request) {
  try {
    const access = await requireUser(['admin', 'editor']); if ('response' in access) return access.response;
    const input = serviceInputSchema.parse(await request.json());
    const [data] = await getDb().insert(services).values({ ...input, price: input.price?.toString() }).returning();
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
