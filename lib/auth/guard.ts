
import {and, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import type { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { apiError } from '@/lib/api';
import { getDb } from '@/lib/db';
import { users, userRoleEnum, userBranches } from '@/lib/db/schema';


export type UserRole =
  (typeof userRoleEnum.enumValues)[number];

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  birthDate: string | null;
};

type AccessResult =
  | {
      user: CurrentUser;
      response?: never;
    }
  | {
      response: NextResponse;
      user?: never;
    };

async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const [user] = await getDb()
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      birthDate: users.birthDate,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return user ?? null;
}

export async function requireUser(
  allowedRoles?: UserRole[],
): Promise<AccessResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      response: apiError('No autenticado.', 401),
    };
  }

  if (!user.isActive) {
    return {
      response: apiError(
        'La cuenta no está activa.',
        401,
      ),
    };
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return {
      response: apiError(
        'No tienes permisos para esta operación.',
        403,
      ),
    };
  }

  return { user };
}

export async function requirePageUser(
  allowedRoles?: UserRole[],
): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user?.isActive) {
    redirect('/iniciar-sesion');
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    redirect(
      user.role === 'patient'
        ? '/mi-cuenta'
        : '/admin',
    );
  }

  return user;
}

export async function requireAppointmentBranchAccess(
  branchId: string,
): Promise<AccessResult> {
  const access = await requireUser([
    'admin',
    'receptionist',
  ]);

  if (access.response) {
    return access;
  }

  const user = access.user;

  // El administrador general puede acceder
  // a todas las sucursales.
  if (user.role === 'admin') {
    return { user };
  }

  // El recepcionista necesita una asignación
  // explícita a la sucursal solicitada.
  const [assignment] = await getDb()
    .select({
      userId: userBranches.userId,
    })
    .from(userBranches)
    .where(
      and(
        eq(userBranches.userId, user.id),
        eq(userBranches.branchId, branchId),
      ),
    )
    .limit(1);

  if (!assignment) {
    return {
      response: apiError(
        'No tienes permisos para administrar esta sucursal.',
        403,
      ),
    };
  }

  return { user };
}
