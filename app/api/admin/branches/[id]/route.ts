import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { apiError, handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { branches } from '@/lib/db/schema';
import { branchInputSchema } from '@/lib/validators';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const access = await requireUser(['admin', 'editor']); if ('response' in access) return access.response;
    const { id } = await params;
    const input = branchInputSchema.partial().parse(await request.json());
    const [data] = await getDb().update(branches).set({ ...input, updatedAt: new Date() }).where(eq(branches.id, id)).returning();
    return data ? NextResponse.json({ data }) : apiError('Sucursal no encontrada.', 404);
  } catch (error) { return handleApiError(error); }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const access = await requireUser(['admin']); if ('response' in access) return access.response;
    const { id } = await params;
    const [data] = await getDb().delete(branches).where(eq(branches.id, id)).returning({ id: branches.id });
    return data ? NextResponse.json({ data }) : apiError('Sucursal no encontrada.', 404);
  } catch (error) { return handleApiError(error); }
}
