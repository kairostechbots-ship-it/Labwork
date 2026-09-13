import { NextResponse } from 'next/server';

import { apiError, handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { listWritableGoogleCalendars } from '@/lib/google-calendar/client';
import {
  getGoogleCalendarAccessToken,
  GoogleCalendarNotConnectedError,
} from '@/lib/google-calendar/connection';

export async function GET() {
  try {
    const access = await requireUser(['admin']);
    if ('response' in access) return access.response;

    const { accessToken } = await getGoogleCalendarAccessToken();
    const calendars = await listWritableGoogleCalendars(accessToken);
    return NextResponse.json({ data: calendars });
  } catch (error) {
    if (error instanceof GoogleCalendarNotConnectedError) return apiError(error.message, 409);
    return handleApiError(error);
  }
}
