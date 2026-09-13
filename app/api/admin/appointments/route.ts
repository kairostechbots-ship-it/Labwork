import { and, desc, eq, type SQL } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiError, handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { appointments } from '@/lib/db/schema';

export async function GET(request: Request) {
  try {
    const access = await requireUser(['admin', 'receptionist']); if ('response' in access) return access.response;
    const searchParams = new URL(request.url).searchParams;
    const query = z.object({
      status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
      type: z.enum(['branch', 'home']).optional(),
      branchId: z.string().uuid().optional(),
    }).safeParse({
      status: searchParams.get('status') || undefined,
      type: searchParams.get('type') || undefined,
      branchId: searchParams.get('branchId') || undefined,
    });
    if (!query.success) return apiError('Los filtros no son válidos.', 422, query.error.flatten());

    const filters: SQL[] = [];
    if (query.data.status) filters.push(eq(appointments.status, query.data.status));
    if (query.data.type) filters.push(eq(appointments.type, query.data.type));
    if (query.data.branchId) filters.push(eq(appointments.branchId, query.data.branchId));

    const data = await getDb()
      .select()
      .from(appointments)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(appointments.createdAt));
    return NextResponse.json({ data });
  } catch (error) { return handleApiError(error); }
}
