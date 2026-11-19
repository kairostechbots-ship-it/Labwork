
import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';

export async function GET() {
  const access = await requireUser(['patient']);

  if (access.response) {
    return access.response;
  }

  const { id, name, email, birthDate } = access.user;

  return NextResponse.json({
    data: {
      id,
      name,
      email,
      birthDate,
    },
  });
}
