import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await getDb().execute(sql`select 1`);

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
    });
  } catch (error) {
    console.error('Database health check failed', error);

    return NextResponse.json(
      {
        status: 'error',
        database: 'unavailable',
      },
      { status: 503 },
    );
  }
}
