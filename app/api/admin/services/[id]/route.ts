import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { apiError, handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { services } from '@/lib/db/schema';
import { serviceInputSchema } from '@/lib/validators';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const access = await requireUser(['admin', 'editor']); if ('response' in access) return access.response;
    const { id } = await params;
    const input = serviceInputSchema.partial().parse(await request.json());
    const [data] = await getDb().update(services).set({ ...input, price: input.price?.toString(), updatedAt: new Date() }).where(eq(services.id, id)).returning();
    return data ? NextResponse.json({ data }) : apiError('Estudio no encontrado.', 404);
  } catch (error) { return handleApiError(error); }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const access = await requireUser(['admin']); if ('response' in access) return access.response;
    const { id } = await params;
    const [data] = await getDb().delete(services).where(eq(services.id, id)).returning({ id: services.id });
    return data ? NextResponse.json({ data }) : apiError('Estudio no encontrado.', 404);
  } catch (error) { return handleApiError(error); }
}
