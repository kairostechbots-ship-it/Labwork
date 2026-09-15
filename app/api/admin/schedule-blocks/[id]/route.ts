import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { apiError, handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { scheduleBlocks } from '@/lib/db/schema';
type Context = { params: Promise<{ id: string }> };
export async function DELETE(_request: Request, { params }: Context) {
  try {
    const access = await requireUser(['admin']); if ('response' in access) return access.response;
    const { id } = await params;
    const [data] = await getDb().delete(scheduleBlocks).where(eq(scheduleBlocks.id, id)).returning({ id: scheduleBlocks.id });
    return data ? NextResponse.json({ data }) : apiError('El bloqueo no existe.', 404);
  } catch (error) { return handleApiError(error); }
}
