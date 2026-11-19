
import { asc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db';
import { branches } from '@/lib/db/schema';
import { branchInputSchema } from '@/lib/validators';

// =============================================
// GET - Obtener todas las sucursales
// =============================================
export async function GET() {
  try {
    const access = await requireUser([
      'admin',
      'editor',
      'receptionist',
    ]);

    if ('response' in access) {
      return access.response;
    }

    const data = await getDb()
      .select()
      .from(branches)
      .orderBy(asc(branches.name));

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

// =============================================
// POST - Registrar una nueva sucursal
// =============================================
export async function POST(request: Request) {
  try {
    const access = await requireUser([
      'admin',
      'editor',
    ]);

    if ('response' in access) {
      return access.response;
    }

    const input = branchInputSchema.parse(
      await request.json(),
    );

    const [data] = await getDb()
      .insert(branches)
      .values(input)
      .returning();

    return NextResponse.json(
      { data },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
