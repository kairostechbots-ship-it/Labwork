import { timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { apiError, handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { googleCalendarConnections } from '@/lib/db/schema';
import {
  exchangeGoogleAuthorizationCode,
  getGoogleAccountEmail,
  GOOGLE_CALENDAR_OAUTH_STATE_COOKIE,
  GOOGLE_CALENDAR_SCOPES,
} from '@/lib/google-calendar/client';
import { GOOGLE_CALENDAR_CONNECTION_ID } from '@/lib/google-calendar/connection';
import { encryptGoogleRefreshToken } from '@/lib/google-calendar/crypto';

function statesMatch(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function GET(request: Request) {
  try {
    const access = await requireUser(['admin']);
    if ('response' in access) return access.response;

    const url = new URL(request.url);
    const error = url.searchParams.get('error');
    if (error) return apiError(`Google rechazó la autorización: ${error}`, 400);

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const cookieStore = await cookies();
    const expectedState = cookieStore.get(GOOGLE_CALENDAR_OAUTH_STATE_COOKIE)?.value;

    if (!code || !state || !expectedState || !statesMatch(expectedState, state)) {
      return apiError('La respuesta de Google no superó la validación de seguridad.', 400);
    }

    const credentials = await exchangeGoogleAuthorizationCode(code);
    if (!credentials.refresh_token) {
      return apiError('Google no devolvió un refresh token. Revoca el acceso de la aplicación e inténtalo de nuevo.', 409);
    }

    const grantedScopes = new Set((credentials.scope ?? '').split(' '));
    const requiredCalendarScopes = GOOGLE_CALENDAR_SCOPES.filter((scope) => scope.startsWith('https://'));
    if (requiredCalendarScopes.some((scope) => !grantedScopes.has(scope))) {
      return apiError('Debes autorizar todos los permisos de Google Calendar para continuar.', 403);
    }

    const googleEmail = await getGoogleAccountEmail(credentials.access_token);
    const now = new Date();
    await getDb()
      .insert(googleCalendarConnections)
      .values({
        id: GOOGLE_CALENDAR_CONNECTION_ID,
        googleEmail,
        encryptedRefreshToken: encryptGoogleRefreshToken(credentials.refresh_token),
        scopes: credentials.scope ?? GOOGLE_CALENDAR_SCOPES.join(' '),
        connectedByUserId: access.user.id,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: googleCalendarConnections.id,
        set: {
          googleEmail,
          encryptedRefreshToken: encryptGoogleRefreshToken(credentials.refresh_token),
          scopes: credentials.scope ?? GOOGLE_CALENDAR_SCOPES.join(' '),
          connectedByUserId: access.user.id,
          updatedAt: now,
        },
      });

    const response = NextResponse.redirect(new URL('/admin?googleCalendar=connected', request.url));
    response.cookies.set(GOOGLE_CALENDAR_OAUTH_STATE_COOKIE, '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/api/admin/google-calendar/callback',
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
