import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { apiError, handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { userUpdateSchema } from '@/lib/validators';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const access = await requireUser(['admin']); if ('response' in access) return access.response;
    const { id } = await params;
    const { password, ...input } = userUpdateSchema.parse(await request.json());
    if (id === access.user.id && (input.isActive === false || (input.role && input.role !== 'admin'))) {
      return apiError('No puedes desactivar ni quitar el rol administrador de tu propia cuenta.', 422);
    }
    const [data] = await getDb().update(users).set({ ...input, ...(password ? { passwordHash: await hash(password, 12) } : {}), updatedAt: new Date() }).where(eq(users.id, id)).returning({ id: users.id, name: users.name, email: users.email, role: users.role, isActive: users.isActive });
    return data ? NextResponse.json({ data }) : apiError('Usuario no encontrado.', 404);
  } catch (error) { return handleApiError(error); }
}
