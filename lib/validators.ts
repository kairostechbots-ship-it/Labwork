import { z } from 'zod';

const optionalText = (max: number) => z.string().trim().max(max).nullish();
const price = z.coerce.number().min(0).max(9_999_999.99).nullish();

export const branchInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(140),
  address: z.string().trim().min(5).max(1000),
  phone: z.string().trim().min(7).max(30),
  whatsapp: optionalText(30),
  mapUrl: z.string().url().max(2000).nullish(),
  businessHours: optionalText(1000),
  isActive: z.boolean().optional(),
});

export const serviceInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
  category: optionalText(100),
  description: optionalText(5000),
  preparation: optionalText(5000),
  price,
  isActive: z.boolean().optional(),
});

export const packageInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
  description: optionalText(5000),
  preparation: optionalText(5000),
  price,
  isActive: z.boolean().optional(),
  serviceIds: z.array(z.string().uuid()).max(100).default([]),
});

export const appointmentInputSchema = z.object({
  patientName: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().toLowerCase().email().max(254).nullish(),
  type: z.enum(['branch', 'home']),
  branchId: z.string().uuid().nullish(),
  address: optionalText(1000),
  requestedDate: z.iso.date(),
  requestedTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/),
  studies: optionalText(5000),
  notes: optionalText(5000),
  serviceIds: z.array(z.string().uuid()).max(100).default([]),
  packageIds: z.array(z.string().uuid()).max(100).default([]),
}).superRefine((value, ctx) => {
  if (value.type === 'branch' && !value.branchId) ctx.addIssue({ code: 'custom', path: ['branchId'], message: 'Selecciona una sucursal.' });
  if (value.type === 'home' && !value.address) ctx.addIssue({ code: 'custom', path: ['address'], message: 'La dirección es obligatoria.' });
});

export const appointmentUpdateSchema = z.object({
  patientName: z.string().trim().min(2).max(160).optional(),
  phone: z.string().trim().min(7).max(30).optional(),
  email: z.string().trim().toLowerCase().email().max(254).nullable().optional(),
  type: z.enum(['branch', 'home']).optional(),
  branchId: z.string().uuid().nullable().optional(),
  address: z.string().trim().max(1000).nullable().optional(),
  requestedDate: z.iso.date().optional(),
  requestedTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/).optional(),
  studies: z.string().trim().max(5000).nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
  serviceIds: z.array(z.string().uuid()).max(100).optional(),
  packageIds: z.array(z.string().uuid()).max(100).optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  note: optionalText(2000),
}).refine((value) => Object.keys(value).some((key) => key !== 'note'), 'Envía al menos un campo para actualizar.');

const scheduleTargetSchema = z.object({
  type: z.enum(['branch', 'home']),
  branchId: z.string().uuid().nullable().default(null),
}).superRefine((value, ctx) => {
  if (value.type === 'branch' && !value.branchId) ctx.addIssue({ code: 'custom', path: ['branchId'], message: 'Selecciona una sucursal.' });
  if (value.type === 'home' && value.branchId) ctx.addIssue({ code: 'custom', path: ['branchId'], message: 'Domicilio no utiliza sucursal.' });
});

export const scheduleRuleInputSchema = z.intersection(scheduleTargetSchema, z.object({
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  slotDurationMinutes: z.number().int().min(15).max(480),
  capacity: z.number().int().min(1).max(100).default(1),
  isActive: z.boolean().default(true),
})).refine((value) => value.startTime < value.endTime, { path: ['endTime'], message: 'La hora final debe ser posterior a la inicial.' });

export const scheduleBlockInputSchema = z.intersection(scheduleTargetSchema, z.object({
  blockedDate: z.iso.date(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().default(null),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().default(null),
  reason: optionalText(500),
})).superRefine((value, ctx) => {
  if ((value.startTime === null) !== (value.endTime === null)) ctx.addIssue({ code: 'custom', path: ['endTime'], message: 'Envía ambas horas o ninguna para bloquear todo el día.' });
  if (value.startTime && value.endTime && value.startTime >= value.endTime) ctx.addIssue({ code: 'custom', path: ['endTime'], message: 'La hora final debe ser posterior a la inicial.' });
});

export const siteSettingsInputSchema = z.object({
  laboratoryName: z.string().trim().min(2).max(160),
  email: z.string().trim().toLowerCase().email().max(254).nullable().optional(),
  phone: z.string().trim().min(7).max(30).nullable().optional(),
  whatsapp: z.string().trim().min(7).max(30).nullable().optional(),
  facebookUrl: z.string().url().max(2000).nullable().optional(),
  instagramUrl: z.string().url().max(2000).nullable().optional(),
  appointmentNotice: z.string().trim().max(5000).nullable().optional(),
});

export const userCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(12).max(200),
  role: z.enum(['admin', 'receptionist', 'editor']),
  isActive: z.boolean().optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  email: z.string().trim().toLowerCase().email().max(254).optional(),
  password: z.string().min(12).max(200).optional(),
  role: z.enum(['admin', 'receptionist', 'editor']).optional(),
  isActive: z.boolean().optional(),
});
