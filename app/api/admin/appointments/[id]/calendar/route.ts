import { NextResponse } from 'next/server';

import { apiError, handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import {
  GoogleCalendarMappingNotFoundError,
  syncAppointmentWithGoogleCalendar,
} from '@/lib/google-calendar/appointments';
import {
  GoogleCalendarNotConnectedError,
} from '@/lib/google-calendar/connection';
import { GoogleCalendarApiError } from '@/lib/google-calendar/client';

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Context) {
  try {
    const access = await requireUser(['admin', 'receptionist']);
    if ('response' in access) return access.response;

    const { id } = await params;
    const result = await syncAppointmentWithGoogleCalendar(id);
    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof GoogleCalendarNotConnectedError || error instanceof GoogleCalendarMappingNotFoundError) {
      return apiError(error.message, 409);
    }
    if (error instanceof GoogleCalendarApiError) {
      console.error('Google Calendar sync failed', error);
      return apiError('Google Calendar rechazó la sincronización.', 502);
    }
    return handleApiError(error);
  }
}
