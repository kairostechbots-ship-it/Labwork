import { NextResponse } from 'next/server';
import { z } from 'zod';

import { apiError, handleApiError } from '@/lib/api';
import { getAvailability } from '@/lib/appointments/availability';
import { getDb } from '@/lib/db';
import { branches } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

const querySchema = z.object({
  date: z.iso.date(),
  type: z.enum(['branch', 'home']),
  branchId: z.string().uuid().nullable().default(null),
}).superRefine((value, ctx) => {
  if (value.type === 'branch' && !value.branchId) ctx.addIssue({ code: 'custom', path: ['branchId'], message: 'Selecciona una sucursal.' });
  if (value.type === 'home' && value.branchId) ctx.addIssue({ code: 'custom', path: ['branchId'], message: 'Domicilio no utiliza sucursal.' });
});

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const query = querySchema.parse({ date: params.get('date'), type: params.get('type'), branchId: params.get('branchId') });
    if (query.date < new Date().toISOString().slice(0, 10)) return apiError('La fecha no puede estar en el pasado.', 422);
    if (query.branchId) {
      const found = await getDb().select({ id: branches.id }).from(branches).where(and(eq(branches.id, query.branchId), eq(branches.isActive, true))).limit(1);
      if (!found.length) return apiError('La sucursal no existe o no está activa.', 404);
    }
    return NextResponse.json({ data: await getAvailability(query.date, query) });
  } catch (error) { return handleApiError(error); }
}
