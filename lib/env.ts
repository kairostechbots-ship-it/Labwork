import { z } from 'zod';

const databaseEnvironmentSchema = z.object({
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
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
