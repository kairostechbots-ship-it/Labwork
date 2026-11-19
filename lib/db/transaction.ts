import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import WebSocket from 'ws';

import { getDatabaseUrl } from '@/lib/env';
import * as schema from './schema';

neonConfig.webSocketConstructor = WebSocket;

export function createTransactionDb() {
  const pool = new Pool({
    connectionString: getDatabaseUrl(),
    max: 2,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000,
  });

  return {
    pool,
    db: drizzle(pool, { schema }),
  };
}