import { hash } from 'bcryptjs';
import { asc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { userCreateSchema } from '@/lib/validators';

export async function GET() {
  try {
    const access = await requireUser(['admin']); if ('response' in access) return access.response;
    const data = await getDb().select({ id: users.id, name: users.name, email: users.email, role: users.role, isActive: users.isActive, createdAt: users.createdAt, updatedAt: users.updatedAt }).from(users).orderBy(asc(users.name));
    return NextResponse.json({ data });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: Request) {
  try {
    const access = await requireUser(['admin']); if ('response' in access) return access.response;
    const { password, ...input } = userCreateSchema.parse(await request.json());
    const [data] = await getDb().insert(users).values({ ...input, passwordHash: await hash(password, 12) }).returning({ id: users.id, name: users.name, email: users.email, role: users.role, isActive: users.isActive });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
