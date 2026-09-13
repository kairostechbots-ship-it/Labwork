import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';

import { handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import {
  buildGoogleAuthorizationUrl,
  GOOGLE_CALENDAR_OAUTH_STATE_COOKIE,
} from '@/lib/google-calendar/client';

export async function GET() {
  try {
    const access = await requireUser(['admin']);
    if ('response' in access) return access.response;

    const state = randomBytes(32).toString('base64url');
    const response = NextResponse.redirect(buildGoogleAuthorizationUrl(state));
    response.cookies.set(GOOGLE_CALENDAR_OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/api/admin/google-calendar/callback',
      maxAge: 10 * 60,
    });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
