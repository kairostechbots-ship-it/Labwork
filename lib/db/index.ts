import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';

import { getDatabaseUrl } from '@/lib/env';
import * as schema from './schema';

let database: NeonHttpDatabase<typeof schema> | undefined;

export function getDb() {
  if (!database) {
    const client = neon(getDatabaseUrl());
    database = drizzle(client, { schema });
  }

  return database;
}

export type Database = ReturnType<typeof getDb>;
