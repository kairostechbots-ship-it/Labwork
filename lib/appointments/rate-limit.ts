import { createHash } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { appointmentRateLimits } from '@/lib/db/schema';

const WINDOW_MINUTES = 15;
const MAX_REQUESTS = 5;

export async function consumeAppointmentRateLimit(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const identifier = forwarded || request.headers.get('x-real-ip') || 'unknown';
  const identifierHash = createHash('sha256').update(identifier).digest('hex');
  const now = new Date();
  now.setUTCSeconds(0, 0);
  now.setUTCMinutes(Math.floor(now.getUTCMinutes() / WINDOW_MINUTES) * WINDOW_MINUTES);
  const [row] = await getDb().insert(appointmentRateLimits)
    .values({ identifierHash, bucketStart: now, requestCount: 1 })
    .onConflictDoUpdate({
      target: [appointmentRateLimits.identifierHash, appointmentRateLimits.bucketStart],
      set: { requestCount: sql`${appointmentRateLimits.requestCount} + 1` },
    })
    .returning({ requestCount: appointmentRateLimits.requestCount });
  return { allowed: row.requestCount <= MAX_REQUESTS, limit: MAX_REQUESTS, remaining: Math.max(0, MAX_REQUESTS - row.requestCount) };
}
