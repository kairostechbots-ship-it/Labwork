import { asc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api';
import { getDb } from '@/lib/db';
import { services } from '@/lib/db/schema';

export async function GET() {
  try {
    const data = await getDb().select().from(services).where(eq(services.isActive, true)).orderBy(asc(services.name));
    return NextResponse.json({ data });
  } catch (error) { return handleApiError(error); }
}
