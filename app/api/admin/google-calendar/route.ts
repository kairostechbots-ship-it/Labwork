import { count, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { googleCalendarConnections, googleCalendarMappings } from '@/lib/db/schema';
import {
  getGoogleCalendarConnection,
  GOOGLE_CALENDAR_CONNECTION_ID,
} from '@/lib/google-calendar/connection';

export async function GET() {
  try {
    const access = await requireUser(['admin']);
    if ('response' in access) return access.response;

    const [connection, [mappingCount]] = await Promise.all([
      getGoogleCalendarConnection(),
      getDb().select({ value: count() }).from(googleCalendarMappings),
    ]);

    return NextResponse.json({
      data: {
        connected: Boolean(connection),
        googleEmail: connection?.googleEmail ?? null,
        connectedAt: connection?.updatedAt ?? null,
        mappingCount: mappingCount.value,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const access = await requireUser(['admin']);
    if ('response' in access) return access.response;

    await getDb()
      .delete(googleCalendarConnections)
      .where(eq(googleCalendarConnections.id, GOOGLE_CALENDAR_CONNECTION_ID));

    return NextResponse.json({ data: { connected: false } });
  } catch (error) {
    return handleApiError(error);
  }
}
