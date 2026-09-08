import { eq } from 'drizzle-orm';

import { auth } from '@/auth';
import { apiError } from '@/lib/api';
import { getDb } from '@/lib/db';
import { users, userRoleEnum } from '@/lib/db/schema';

export type UserRole = (typeof userRoleEnum.enumValues)[number];

export async function requireUser(allowedRoles?: UserRole[]) {
  const session = await auth();
  if (!session?.user?.id) return { response: apiError('No autenticado.', 401) };

  const [user] = await getDb()
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, isActive: users.isActive })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user?.isActive) return { response: apiError('La cuenta no está activa.', 401) };
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return { response: apiError('No tienes permisos para esta operación.', 403) };
  }

  return { user };
}
