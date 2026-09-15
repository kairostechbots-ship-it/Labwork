import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api';
import { getDb } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';
export async function GET() {
  try {
    const [data] = await getDb().select().from(siteSettings).where(eq(siteSettings.id, 'primary')).limit(1);
    return NextResponse.json({ data: data ?? null });
  } catch (error) { return handleApiError(error); }
}
