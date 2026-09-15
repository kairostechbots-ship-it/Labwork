import { and, eq, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { scheduleRules } from '@/lib/db/schema';
import { scheduleRuleInputSchema } from '@/lib/validators';

export async function GET(request: Request) {
  try {
    const access = await requireUser(['admin']); if ('response' in access) return access.response;
    const params = new URL(request.url).searchParams;
    const type = params.get('type');
    const branchId = params.get('branchId');
    const filters = [];
    if (type === 'branch' || type === 'home') filters.push(eq(scheduleRules.type, type));
    if (branchId) filters.push(eq(scheduleRules.branchId, branchId));
    if (type === 'home') filters.push(isNull(scheduleRules.branchId));
    const data = await getDb().select().from(scheduleRules).where(filters.length ? and(...filters) : undefined);
    return NextResponse.json({ data });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: Request) {
  try {
    const access = await requireUser(['admin']); if ('response' in access) return access.response;
    const input = scheduleRuleInputSchema.parse(await request.json());
    const [data] = await getDb().insert(scheduleRules).values({ ...input, startTime: `${input.startTime}:00`, endTime: `${input.endTime}:00` }).returning();
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
