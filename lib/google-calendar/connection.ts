import { eq } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { googleCalendarConnections } from '@/lib/db/schema';
import { decryptGoogleRefreshToken } from '@/lib/google-calendar/crypto';
import { refreshGoogleAccessToken } from '@/lib/google-calendar/client';

export const GOOGLE_CALENDAR_CONNECTION_ID = 'primary';

export class GoogleCalendarNotConnectedError extends Error {
  constructor() {
    super('Google Calendar no está conectado.');
    this.name = 'GoogleCalendarNotConnectedError';
  }
}

export async function getGoogleCalendarConnection() {
  const [connection] = await getDb()
    .select()
    .from(googleCalendarConnections)
    .where(eq(googleCalendarConnections.id, GOOGLE_CALENDAR_CONNECTION_ID))
    .limit(1);
  return connection;
}

export async function getGoogleCalendarAccessToken() {
  const connection = await getGoogleCalendarConnection();
  if (!connection) throw new GoogleCalendarNotConnectedError();

  const refreshToken = decryptGoogleRefreshToken(connection.encryptedRefreshToken);
  const credentials = await refreshGoogleAccessToken(refreshToken);
  return { accessToken: credentials.access_token, connection };
}
