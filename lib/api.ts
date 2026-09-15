import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: { message, details } }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return apiError('Los datos enviados no son válidos.', 422, error.flatten());
  }

  if (error instanceof SyntaxError) return apiError('El cuerpo JSON no es válido.', 400);

  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code)
    : undefined;
  if (code === '23505') return apiError('Ya existe un registro con ese valor único.', 409);
  if (code === '23503') return apiError('La operación viola una relación existente.', 409);
  if (code === '23514') return apiError('El horario seleccionado ya no está disponible.', 409);
  if (code === '22P02') return apiError('El identificador no es válido.', 422);

  console.error(error);
  return apiError('Ocurrió un error interno.', 500);
}
