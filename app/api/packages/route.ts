import { asc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api';
import { getDb } from '@/lib/db';
import { packages } from '@/lib/db/schema';

export async function GET() {
  try {
    const data = await getDb().select().from(packages).where(eq(packages.isActive, true)).orderBy(asc(packages.name));
    return NextResponse.json({ data });
  } catch (error) { return handleApiError(error); }
}
