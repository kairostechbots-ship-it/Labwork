import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { appointments } from '@/lib/db/schema';

export async function GET(request: Request) {
  try {
    const access = await requireUser(['admin', 'receptionist']); if ('response' in access) return access.response;
    const status = new URL(request.url).searchParams.get('status');
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'] as const;
    const base = getDb().select().from(appointments);
    const data = validStatuses.includes(status as typeof validStatuses[number])
      ? await base.where(eq(appointments.status, status as typeof validStatuses[number])).orderBy(desc(appointments.createdAt))
      : await base.orderBy(desc(appointments.createdAt));
    return NextResponse.json({ data });
  } catch (error) { return handleApiError(error); }
}
