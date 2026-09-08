import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { apiError, handleApiError } from '@/lib/api';
import { getDb } from '@/lib/db';
import { services } from '@/lib/db/schema';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const [data] = await getDb().select().from(services).where(and(eq(services.slug, slug), eq(services.isActive, true))).limit(1);
    return data ? NextResponse.json({ data }) : apiError('Estudio no encontrado.', 404);
  } catch (error) { return handleApiError(error); }
}
