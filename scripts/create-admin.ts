import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { getDb } from '../lib/db';
import { users } from '../lib/db/schema';

const input = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(12),
}).parse({ name: process.env.ADMIN_NAME, email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });

const db = getDb();
const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1);
if (existing.length) throw new Error('Ya existe un usuario con ese correo.');

await db.insert(users).values({
  name: input.name,
  email: input.email,
  passwordHash: await hash(input.password, 12),
  role: 'admin',
});

console.log(`Administrador creado: ${input.email}`);
