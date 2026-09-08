import { asc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api';
import { getDb } from '@/lib/db';
import { branches } from '@/lib/db/schema';

export async function GET() {
  try {
    const data = await getDb().select().from(branches).where(eq(branches.isActive, true)).orderBy(asc(branches.name));
    return NextResponse.json({ data });
  } catch (error) { return handleApiError(error); }
}
