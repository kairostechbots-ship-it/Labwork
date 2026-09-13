import { z } from 'zod';

const databaseEnvironmentSchema = z.object({
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
});

const googleCalendarEnvironmentSchema = z.object({
  GOOGLE_CALENDAR_CLIENT_ID: z.string().min(1),
  GOOGLE_CALENDAR_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALENDAR_REDIRECT_URI: z.string().url(),
  GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY: z.string().min(1),
  GOOGLE_CALENDAR_TIME_ZONE: z.string().min(1).default('America/Mexico_City'),
  GOOGLE_CALENDAR_APPOINTMENT_DURATION_MINUTES: z.coerce.number().int().min(15).max(480).default(60),
});

export function getDatabaseUrl() {
  const result = databaseEnvironmentSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
  });

  if (!result.success) {
    throw new Error(
      'Invalid or missing DATABASE_URL. Configure the Neon PostgreSQL connection string.',
    );
  }

  return result.data.DATABASE_URL;
}

export function getGoogleCalendarEnvironment() {
  const result = googleCalendarEnvironmentSchema.safeParse({
    GOOGLE_CALENDAR_CLIENT_ID: process.env.GOOGLE_CALENDAR_CLIENT_ID,
    GOOGLE_CALENDAR_CLIENT_SECRET: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    GOOGLE_CALENDAR_REDIRECT_URI: process.env.GOOGLE_CALENDAR_REDIRECT_URI,
    GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY: process.env.GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY,
    GOOGLE_CALENDAR_TIME_ZONE: process.env.GOOGLE_CALENDAR_TIME_ZONE,
    GOOGLE_CALENDAR_APPOINTMENT_DURATION_MINUTES: process.env.GOOGLE_CALENDAR_APPOINTMENT_DURATION_MINUTES,
  });

  if (!result.success) {
    throw new Error('Google Calendar is not configured. Check the GOOGLE_CALENDAR_* environment variables.');
  }

  return result.data;
}
