
import { and, eq, inArray, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { apiError, handleApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth/guard';
import { createTransactionDb } from '@/lib/db/transaction';
import {
  appointments,
  appointmentPackages,
  appointmentServices,
  branches,
  branchScheduleSettings,
  branchHomeScheduleSettings,
  packages,
  services,
} from '@/lib/db/schema';
import { appointmentInputSchema } from '@/lib/validators';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TIME_ZONE = 'America/Mexico_City';

type BookingType = 'branch' | 'home';

type ScheduleConfig = {
  weekdayOpen: string;
  weekdayClose: string;
  saturdayOpen: string;
  saturdayClose: string;
  slotMinutes: number;
  capacity: number;
  allowSameDay: boolean;
  minimumAdvanceDays: number;
};

class BookingError extends Error {
  constructor(
    message: string,
    public statusCode = 422
  ) {
    super(message);
    this.name = 'BookingError';
  }
}

function localParts() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes:
      Number(get('hour')) * 60 +
      Number(get('minute')),
  };
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function daysBetween(from: string, to: string) {
  const start = Date.parse(`${from}T12:00:00Z`);
  const end = Date.parse(`${to}T12:00:00Z`);

  return Math.round((end - start) / 86_400_000);
}

function validateSlot(
  type: BookingType,
  date: string,
  time: string,
  config: ScheduleConfig
) {
  const now = localParts();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new BookingError('La fecha no es válida.');
  }

  const parsedDate = new Date(`${date}T12:00:00Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    throw new BookingError('La fecha no es válida.');
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d:00$/.test(time)) {
    throw new BookingError('El horario no es válido.');
  }

  if (date < now.date) {
    throw new BookingError(
      'La fecha solicitada no puede estar en el pasado.'
    );
  }

  const advanceDays = daysBetween(now.date, date);

  if (
    type === 'home' &&
    advanceDays < config.minimumAdvanceDays
  ) {
    throw new BookingError(
      `Las citas a domicilio requieren al menos ${config.minimumAdvanceDays} día(s) de anticipación.`
    );
  }

  if (
    type === 'branch' &&
    advanceDays === 0 &&
    !config.allowSameDay
  ) {
    throw new BookingError(
      'Esta sucursal no permite citas para el mismo día.'
    );
  }

  const day = parsedDate.getUTCDay();

  if (day === 0) {
    throw new BookingError(
      'No hay atención disponible los domingos.'
    );
  }

  const open =
    day === 6 ? config.saturdayOpen : config.weekdayOpen;

  const close =
    day === 6 ? config.saturdayClose : config.weekdayClose;

  const start = toMinutes(open);
  const end = toMinutes(close);
  const requestedMinutes = toMinutes(time.slice(0, 5));
  const interval = config.slotMinutes;

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    !Number.isInteger(interval) ||
    interval <= 0 ||
    start >= end ||
    !Number.isInteger(config.capacity) ||
    config.capacity <= 0
  ) {
    throw new BookingError(
      'La configuración de horarios no es válida.',
      500
    );
  }

  if (
    requestedMinutes < start ||
    requestedMinutes + interval > end ||
    (requestedMinutes - start) % interval !== 0
  ) {
    throw new BookingError(
      'El horario seleccionado no está disponible.'
    );
  }

  if (
    date === now.date &&
    requestedMinutes <= now.minutes
  ) {
    throw new BookingError(
      'No puedes reservar un horario que ya pasó.'
    );
  }
}

export async function POST(request: Request) {
  let pool:
    | ReturnType<typeof createTransactionDb>['pool']
    | undefined;

  try {
    const access = await requireUser(['patient']);

    if (access.response) return access.response;

    const patient = access.user;

    if (!patient) {
      return apiError('No autenticado.', 401);
    }

    if (!patient.birthDate) {
      return apiError(
        'Completa tu fecha de nacimiento antes de agendar.',
        422
      );
    }

    const patientBirthDate: string = patient.birthDate;
    const input = appointmentInputSchema.parse(
      await request.json()
    );

    const now = localParts();

    if (input.requestedDate < now.date) {
      return apiError(
        'La fecha solicitada no puede estar en el pasado.',
        422
      );
    }

    if (patientBirthDate > now.date) {
      return apiError(
        'La fecha de nacimiento no puede ser futura.',
        422
      );
    }

    const serviceIds = [...new Set(input.serviceIds)];
    const packageIds = [...new Set(input.packageIds)];

    if (
      serviceIds.length === 0 &&
      packageIds.length === 0
    ) {
      return apiError(
        'Selecciona al menos un estudio o paquete.',
        422
      );
    }

    if (!input.branchId) {
      return apiError(
        'Selecciona una sucursal responsable.',
        422
      );
    }

    if (
      input.type === 'home' &&
      !input.address?.trim()
    ) {
      return apiError(
        'La dirección para la toma a domicilio es obligatoria.',
        422
      );
    }

    const branchId = input.branchId;

    const requestedTime =
      input.requestedTime.length === 5
        ? `${input.requestedTime}:00`
        : input.requestedTime;

    const { db, pool: connectionPool } =
      createTransactionDb();

    pool = connectionPool;

    const created = await db.transaction(async (tx) => {
      if (serviceIds.length > 0) {
        const found = await tx
          .select({ id: services.id })
          .from(services)
          .where(
            and(
              inArray(services.id, serviceIds),
              eq(services.isActive, true)
            )
          );

        if (found.length !== serviceIds.length) {
          throw new BookingError(
            'Uno o más estudios no existen o no están activos.'
          );
        }
      }

      if (packageIds.length > 0) {
        const found = await tx
          .select({ id: packages.id })
          .from(packages)
          .where(
            and(
              inArray(packages.id, packageIds),
              eq(packages.isActive, true)
            )
          );

        if (found.length !== packageIds.length) {
          throw new BookingError(
            'Uno o más paquetes no existen o no están activos.'
          );
        }
      }

      // Bloqueo por sucursal y fecha.
      // Serializa las reservas concurrentes de ese día.
      const lockKey =
        `labwork:booking:${branchId}:${input.requestedDate}`;

      await tx.execute(sql`
        SELECT pg_advisory_xact_lock(
          hashtextextended(${lockKey}, 0)
        )
      `);

      // Verificar que la sucursal responsable esté activa.
      const [branch] = await tx
        .select({ id: branches.id })
        .from(branches)
        .where(
          and(
            eq(branches.id, branchId),
            eq(branches.isActive, true)
          )
        )
        .limit(1);

      if (!branch) {
        throw new BookingError(
          'La sucursal no existe o está inactiva.'
        );
      }

      let config: ScheduleConfig;

      if (input.type === 'home') {
        // Configuración exclusiva de domicilio.
        const [homeSchedule] = await tx
          .select()
          .from(branchHomeScheduleSettings)
          .where(
            and(
              eq(branchHomeScheduleSettings.branchId, branchId),
              eq(branchHomeScheduleSettings.isActive, true)
            )
          )
          .limit(1);

        if (!homeSchedule) {
          throw new BookingError(
            'El servicio a domicilio no está disponible.'
          );
        }

        config = {
          weekdayOpen: homeSchedule.weekdayOpen,
          weekdayClose: homeSchedule.weekdayClose,
          saturdayOpen: homeSchedule.saturdayOpen,
          saturdayClose: homeSchedule.saturdayClose,
          slotMinutes: homeSchedule.slotMinutes,
          capacity: homeSchedule.capacity,
          allowSameDay: false,
          minimumAdvanceDays:
            homeSchedule.minimumAdvanceDays,
        };
      } else {
        // Configuración exclusiva de sucursal.
        const [branchSchedule] = await tx
          .select()
          .from(branchScheduleSettings)
          .where(
            and(
              eq(branchScheduleSettings.branchId, branchId),
              eq(branchScheduleSettings.isActive, true)
            )
          )
          .limit(1);

        if (!branchSchedule) {
          throw new BookingError(
            'La sucursal no tiene horarios activos.'
          );
        }

        config = {
          weekdayOpen: branchSchedule.weekdayOpen,
          weekdayClose: branchSchedule.weekdayClose,
          saturdayOpen: branchSchedule.saturdayOpen,
          saturdayClose: branchSchedule.saturdayClose,
          slotMinutes: branchSchedule.slotMinutes,
          capacity: branchSchedule.capacity,
          allowSameDay: branchSchedule.allowSameDay,
          minimumAdvanceDays: 0,
        };
      }

      validateSlot(
        input.type,
        input.requestedDate,
        requestedTime,
        config
      );

      // Contar únicamente las reservas de la misma modalidad.
      // Pending y confirmed ocupan capacidad.
      const existing = await tx
        .select({ id: appointments.id })
        .from(appointments)
        .where(
          and(
            eq(appointments.branchId, branchId),
            eq(
              appointments.requestedDate,
              input.requestedDate
            ),
            eq(appointments.requestedTime, requestedTime),
            eq(appointments.type, input.type),
            inArray(appointments.status, [
              'pending',
              'confirmed',
            ])
          )
        );

      if (existing.length >= config.capacity) {
        throw new BookingError(
          'Este horario acaba de llenarse. Selecciona otro disponible.',
          409
        );
      }

      const {
        serviceIds: _serviceIds,
        packageIds: _packageIds,
        ...values
      } = input;

      const appointmentId = crypto.randomUUID();

      const [appointment] = await tx
        .insert(appointments)
        .values({
          ...values,
          id: appointmentId,
          userId: patient.id,
          patientName: patient.name,
          email: patient.email,
          birthDate: patientBirthDate,
          branchId,
          requestedTime,
          status: 'pending',
        })
        .returning();

      if (serviceIds.length > 0) {
        await tx.insert(appointmentServices).values(
          serviceIds.map((serviceId) => ({
            appointmentId,
            serviceId,
          }))
        );
      }

      if (packageIds.length > 0) {
        await tx.insert(appointmentPackages).values(
          packageIds.map((packageId) => ({
            appointmentId,
            packageId,
          }))
        );
      }

      return appointment;
    });

    return NextResponse.json(
      {
        data: {
          id: created.id,
          folio: created.folio,
          status: created.status,
          type: created.type,
          branchId: created.branchId,
          requestedDate: created.requestedDate,
          requestedTime: created.requestedTime,
        },
      },
      {
        status: 201,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  } catch (error) {
    if (error instanceof BookingError) {
      return apiError(error.message, error.statusCode);
    }

    return handleApiError(error);
  } finally {
    if (pool) await pool.end();
  }
}
