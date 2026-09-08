import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is required. Add it to .env.local before running a database command.',
  );
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
