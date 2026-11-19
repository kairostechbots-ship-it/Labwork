import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiError, handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { branches, branchHomeScheduleSettings } from '@/lib/db/schema';

type Context = { params: Promise<{ id: string }> };

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Usa el formato HH:mm.');
const schema = z.object({
  weekdayOpen: timeSchema,
  weekdayClose: timeSchema,
  saturdayOpen: timeSchema,
  saturdayClose: timeSchema,
  slotMinutes: z.number().int().min(5).max(240),
  capacity: z.number().int().min(1).max(1000),
  minimumAdvanceDays: z.number().int().min(0).max(90),
  requiresConfirmation: z.boolean(),
  isActive: z.boolean(),
}).strict().superRefine((value, ctx) => {
  const toMinutes = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  for (const [start, end] of [['weekdayOpen', 'weekdayClose'], ['saturdayOpen', 'saturdayClose']] as const) {
    const length = toMinutes(value[end]) - toMinutes(value[start]);
    if (length <= 0) ctx.addIssue({ code: 'custom', path: [end], message: 'El cierre debe ser posterior a la apertura.' });
    else if (length < value.slotMinutes) ctx.addIssue({ code: 'custom', path: [end], message: 'El horario debe permitir al menos un espacio.' });
  }
});

export async function GET(_request: Request, { params }: Context) {
  try {
    const access = await requireUser(['admin', 'editor']);
    if ('response' in access) return access.response;
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return apiError('Identificador inválido.', 400);
    const db = getDb();
    const [branch] = await db.select({ id: branches.id, name: branches.name }).from(branches).where(eq(branches.id, id)).limit(1);
    if (!branch) return apiError('Sucursal no encontrada.', 404);
    const [schedule] = await db.select().from(branchHomeScheduleSettings).where(eq(branchHomeScheduleSettings.branchId, id)).limit(1);
    return NextResponse.json({ data: { branch, schedule: schedule ?? null } }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return handleApiError(error); }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const access = await requireUser(['admin', 'editor']);
    if ('response' in access) return access.response;
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return apiError('Identificador inválido.', 400);
    const input = schema.parse(await request.json());
    const db = getDb();
    const [branch] = await db.select({ id: branches.id }).from(branches).where(eq(branches.id, id)).limit(1);
    if (!branch) return apiError('Sucursal no encontrada.', 404);
    const [data] = await db.insert(branchHomeScheduleSettings).values({ branchId: id, ...input })
      .onConflictDoUpdate({ target: branchHomeScheduleSettings.branchId, set: { ...input, updatedAt: new Date() } }).returning();
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return handleApiError(error); }
}
