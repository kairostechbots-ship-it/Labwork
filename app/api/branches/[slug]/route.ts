import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { apiError, handleApiError } from '@/lib/api';
import { getDb } from '@/lib/db';
import { branches } from '@/lib/db/schema';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const [data] = await getDb().select().from(branches).where(and(eq(branches.slug, slug), eq(branches.isActive, true))).limit(1);
    return data ? NextResponse.json({ data }) : apiError('Sucursal no encontrada.', 404);
  } catch (error) { return handleApiError(error); }
}
