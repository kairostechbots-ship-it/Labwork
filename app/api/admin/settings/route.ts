import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';
import { siteSettingsInputSchema } from '@/lib/validators';
export async function GET() {
  try {
    const access = await requireUser(['admin', 'editor']); if ('response' in access) return access.response;
    const [data] = await getDb().select().from(siteSettings).where(eq(siteSettings.id, 'primary')).limit(1);
    return NextResponse.json({ data: data ?? null });
  } catch (error) { return handleApiError(error); }
}
export async function PUT(request: Request) {
  try {
    const access = await requireUser(['admin', 'editor']); if ('response' in access) return access.response;
    const input = siteSettingsInputSchema.parse(await request.json());
    const [data] = await getDb().insert(siteSettings).values({ id: 'primary', ...input, updatedAt: new Date() }).onConflictDoUpdate({ target: siteSettings.id, set: { ...input, updatedAt: new Date() } }).returning();
    return NextResponse.json({ data });
  } catch (error) { return handleApiError(error); }
}
