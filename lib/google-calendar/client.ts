import { getGoogleCalendarEnvironment } from '@/lib/env';

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USER_INFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';
const GOOGLE_CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3';

export const GOOGLE_CALENDAR_OAUTH_STATE_COOKIE = 'labwork_google_calendar_oauth_state';

export const GOOGLE_CALENDAR_SCOPES = [
  'openid',
  'email',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
];

type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type: string;
};

export type GoogleCalendarListItem = {
  id: string;
  summary: string;
  accessRole: 'freeBusyReader' | 'reader' | 'writer' | 'owner';
  primary?: boolean;
  selected?: boolean;
  timeZone?: string;
};

export type GoogleCalendarEventInput = {
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  extendedProperties?: { private: Record<string, string> };
};

type GoogleCalendarEvent = {
  id: string;
  htmlLink?: string;
  status?: string;
};

export class GoogleCalendarApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'GoogleCalendarApiError';
  }
}

async function googleRequest<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const bodyText = await response.text();

  if (!response.ok) {
    let message = `Google API request failed with status ${response.status}.`;
    try {
      const body = JSON.parse(bodyText) as { error?: { message?: string } | string };
      if (typeof body.error === 'string') message = body.error;
      else if (body.error?.message) message = body.error.message;
    } catch {
      if (bodyText) message = bodyText;
    }
    throw new GoogleCalendarApiError(response.status, message);
  }

  return (bodyText ? JSON.parse(bodyText) : undefined) as T;
}

export function buildGoogleAuthorizationUrl(state: string) {
  const environment = getGoogleCalendarEnvironment();
  const url = new URL(GOOGLE_AUTHORIZATION_URL);
  url.searchParams.set('client_id', environment.GOOGLE_CALENDAR_CLIENT_ID);
  url.searchParams.set('redirect_uri', environment.GOOGLE_CALENDAR_REDIRECT_URI);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('include_granted_scopes', 'true');
  url.searchParams.set('scope', GOOGLE_CALENDAR_SCOPES.join(' '));
  url.searchParams.set('state', state);
  return url;
}

export async function exchangeGoogleAuthorizationCode(code: string) {
  const environment = getGoogleCalendarEnvironment();
  return googleRequest<GoogleTokenResponse>(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: environment.GOOGLE_CALENDAR_CLIENT_ID,
      client_secret: environment.GOOGLE_CALENDAR_CLIENT_SECRET,
      redirect_uri: environment.GOOGLE_CALENDAR_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });
}

export async function refreshGoogleAccessToken(refreshToken: string) {
  const environment = getGoogleCalendarEnvironment();
  return googleRequest<GoogleTokenResponse>(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: environment.GOOGLE_CALENDAR_CLIENT_ID,
      client_secret: environment.GOOGLE_CALENDAR_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  });
}

export async function getGoogleAccountEmail(accessToken: string) {
  const profile = await googleRequest<{ email?: string }>(GOOGLE_USER_INFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!profile.email) throw new Error('Google did not return an email address for the connected account.');
  return profile.email;
}

export async function listWritableGoogleCalendars(accessToken: string) {
  const url = new URL(`${GOOGLE_CALENDAR_API_URL}/users/me/calendarList`);
  url.searchParams.set('minAccessRole', 'writer');
  url.searchParams.set('showHidden', 'false');
  url.searchParams.set('maxResults', '250');

  const result = await googleRequest<{ items?: GoogleCalendarListItem[] }>(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return result.items ?? [];
}

export async function createGoogleCalendarEvent(
  accessToken: string,
  calendarId: string,
  event: GoogleCalendarEventInput,
) {
  return googleRequest<GoogleCalendarEvent>(
    `${GOOGLE_CALENDAR_API_URL}/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    },
  );
}

export async function updateGoogleCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  event: GoogleCalendarEventInput,
) {
  return googleRequest<GoogleCalendarEvent>(
    `${GOOGLE_CALENDAR_API_URL}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    },
  );
}

export async function deleteGoogleCalendarEvent(accessToken: string, calendarId: string, eventId: string) {
  try {
    await googleRequest<void>(
      `${GOOGLE_CALENDAR_API_URL}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
  } catch (error) {
    if (error instanceof GoogleCalendarApiError && (error.status === 404 || error.status === 410)) return;
    throw error;
  }
}
