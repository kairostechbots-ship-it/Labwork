import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';

export const runtime = 'nodejs';

const registerSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.email().trim().toLowerCase().max(254),
  password: z.string().min(12).max(72),
  birthDate: z.iso.date(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Revisa los datos del formulario.' },
        { status: 400 },
      );
    }

    const { name, email, password, birthDate } = parsed.data;

    const db = getDb();

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: 'No fue posible registrar la cuenta con ese correo.' },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, 12);

    await db.insert(users).values({
      name,
      email,
      passwordHash,
      birthDate,
      role: 'patient',
      isActive: false,
    });

    return NextResponse.json(
      {
        message: 'Cuenta creada. Pendiente de verificar el correo electrónico.',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error al registrar paciente:', error);

    return NextResponse.json(
      { error: 'No fue posible completar el registro.' },
      { status: 500 },
    );
  }
}