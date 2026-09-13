import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { apiError, handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { branches, googleCalendarMappings } from '@/lib/db/schema';
import { listWritableGoogleCalendars } from '@/lib/google-calendar/client';
import {
  getGoogleCalendarAccessToken,
  GoogleCalendarNotConnectedError,
} from '@/lib/google-calendar/connection';
import { getGoogleCalendarMappingKey } from '@/lib/google-calendar/appointments';

const mappingInputSchema = z.object({
  branchId: z.string().uuid().nullable().default(null),
  calendarId: z.string().min(1).max(2000),
});

export async function GET() {
  try {
    const access = await requireUser(['admin']);
    if ('response' in access) return access.response;

    const data = await getDb()
      .select({
        key: googleCalendarMappings.key,
        branchId: googleCalendarMappings.branchId,
        branchName: branches.name,
        calendarId: googleCalendarMappings.calendarId,
        calendarName: googleCalendarMappings.calendarName,
        updatedAt: googleCalendarMappings.updatedAt,
      })
      .from(googleCalendarMappings)
      .leftJoin(branches, eq(googleCalendarMappings.branchId, branches.id));
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const access = await requireUser(['admin']);
    if ('response' in access) return access.response;

    const input = mappingInputSchema.parse(await request.json());
    const db = getDb();
    if (input.branchId) {
      const branch = await db.select({ id: branches.id }).from(branches).where(eq(branches.id, input.branchId)).limit(1);
      if (!branch.length) return apiError('La sucursal no existe.', 404);
    }

    const { accessToken } = await getGoogleCalendarAccessToken();
    const calendars = await listWritableGoogleCalendars(accessToken);
    const selectedCalendar = calendars.find((calendar) => calendar.id === input.calendarId);
    if (!selectedCalendar) return apiError('No tienes permiso de escritura sobre ese calendario.', 422);

    const key = getGoogleCalendarMappingKey(input.branchId);
    const now = new Date();
    const [data] = await db
      .insert(googleCalendarMappings)
      .values({
        key,
        branchId: input.branchId,
        calendarId: selectedCalendar.id,
        calendarName: selectedCalendar.summary,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: googleCalendarMappings.key,
        set: {
          branchId: input.branchId,
          calendarId: selectedCalendar.id,
          calendarName: selectedCalendar.summary,
          updatedAt: now,
        },
      })
      .returning();
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof GoogleCalendarNotConnectedError) return apiError(error.message, 409);
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const access = await requireUser(['admin']);
    if ('response' in access) return access.response;

    const url = new URL(request.url);
    const branchId = url.searchParams.get('branchId');
    const target = url.searchParams.get('target');
    if (target !== 'home' && !z.string().uuid().safeParse(branchId).success) {
      return apiError('Envía target=home o un branchId válido.', 422);
    }

    const key = target === 'home' ? 'home' : getGoogleCalendarMappingKey(branchId);
    const [data] = await getDb()
      .delete(googleCalendarMappings)
      .where(eq(googleCalendarMappings.key, key))
      .returning({ key: googleCalendarMappings.key });
    return data ? NextResponse.json({ data }) : apiError('La asignación no existe.', 404);
  } catch (error) {
    return handleApiError(error);
  }
}
