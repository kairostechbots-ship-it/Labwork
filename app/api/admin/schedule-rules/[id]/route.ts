import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { apiError, handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { scheduleRules } from '@/lib/db/schema';
import { scheduleRuleInputSchema } from '@/lib/validators';

type Context = { params: Promise<{ id: string }> };
export async function PUT(request: Request, { params }: Context) {
  try {
    const access = await requireUser(['admin']); if ('response' in access) return access.response;
    const { id } = await params;
    const input = scheduleRuleInputSchema.parse(await request.json());
    const [data] = await getDb().update(scheduleRules).set({ ...input, startTime: `${input.startTime}:00`, endTime: `${input.endTime}:00`, updatedAt: new Date() }).where(eq(scheduleRules.id, id)).returning();
    return data ? NextResponse.json({ data }) : apiError('La regla no existe.', 404);
  } catch (error) { return handleApiError(error); }
}
export async function DELETE(_request: Request, { params }: Context) {
  try {
    const access = await requireUser(['admin']); if ('response' in access) return access.response;
    const { id } = await params;
    const [data] = await getDb().delete(scheduleRules).where(eq(scheduleRules.id, id)).returning({ id: scheduleRules.id });
    return data ? NextResponse.json({ data }) : apiError('La regla no existe.', 404);
  } catch (error) { return handleApiError(error); }
}
