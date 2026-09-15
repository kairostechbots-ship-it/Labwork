import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const appointmentTypeEnum = pgEnum('appointment_type', [
  'branch',
  'home',
]);

export const appointmentStatusEnum = pgEnum('appointment_status', [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
]);

export const userRoleEnum = pgEnum('user_role', [
  'admin',
  'receptionist',
  'editor',
]);

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 160 }).notNull(),
    email: varchar('email', { length: 254 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    role: userRoleEnum('role').default('receptionist').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('users_email_unique').on(table.email)],
);

export const branches = pgTable(
  'branches',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    slug: varchar('slug', { length: 140 }).notNull(),
    address: text('address').notNull(),
    phone: varchar('phone', { length: 30 }).notNull(),
    whatsapp: varchar('whatsapp', { length: 30 }),
    mapUrl: text('map_url'),
    businessHours: text('business_hours'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex('branches_slug_unique').on(table.slug)],
);

export const googleCalendarConnections = pgTable('google_calendar_connections', {
  id: varchar('id', { length: 32 }).primaryKey(),
  googleEmail: varchar('google_email', { length: 254 }).notNull(),
  encryptedRefreshToken: text('encrypted_refresh_token').notNull(),
  scopes: text('scopes').notNull(),
  connectedByUserId: uuid('connected_by_user_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const googleCalendarMappings = pgTable(
  'google_calendar_mappings',
  {
    key: varchar('key', { length: 200 }).primaryKey(),
    branchId: uuid('branch_id').references(() => branches.id, {
      onDelete: 'cascade',
    }),
    calendarId: text('calendar_id').notNull(),
    calendarName: varchar('calendar_name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('google_calendar_mappings_branch_unique').on(table.branchId),
    uniqueIndex('google_calendar_mappings_calendar_unique').on(table.calendarId),
  ],
);

export const services = pgTable(
  'services',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 160 }).notNull(),
    slug: varchar('slug', { length: 180 }).notNull(),
    category: varchar('category', { length: 100 }),
    description: text('description'),
    preparation: text('preparation'),
    price: numeric('price', { precision: 10, scale: 2 }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex('services_slug_unique').on(table.slug)],
);

export const packages = pgTable(
  'packages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 160 }).notNull(),
    slug: varchar('slug', { length: 180 }).notNull(),
    description: text('description'),
    preparation: text('preparation'),
    price: numeric('price', { precision: 10, scale: 2 }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex('packages_slug_unique').on(table.slug)],
);

export const packageServices = pgTable(
  'package_services',
  {
    packageId: uuid('package_id')
      .notNull()
      .references(() => packages.id, { onDelete: 'cascade' }),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'restrict' }),
  },
  (table) => [primaryKey({ columns: [table.packageId, table.serviceId] })],
);

export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientName: varchar('patient_name', { length: 160 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  email: varchar('email', { length: 254 }),
  type: appointmentTypeEnum('type').notNull(),
  branchId: uuid('branch_id').references(() => branches.id, {
    onDelete: 'restrict',
  }),
  address: text('address'),
  requestedDate: date('requested_date').notNull(),
  requestedTime: time('requested_time').notNull(),
  studies: text('studies'),
  notes: text('notes'),
  status: appointmentStatusEnum('status').default('pending').notNull(),
  googleCalendarEventId: varchar('google_calendar_event_id', { length: 255 }),
  googleCalendarId: text('google_calendar_id'),
  createdByUserId: uuid('created_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => [
  index('appointments_status_idx').on(table.status),
  index('appointments_requested_date_idx').on(table.requestedDate),
  index('appointments_branch_id_idx').on(table.branchId),
]);

export const appointmentServices = pgTable(
  'appointment_services',
  {
    appointmentId: uuid('appointment_id').notNull().references(() => appointments.id, { onDelete: 'cascade' }),
    serviceId: uuid('service_id').notNull().references(() => services.id, { onDelete: 'restrict' }),
  },
  (table) => [
    primaryKey({ columns: [table.appointmentId, table.serviceId] }),
    index('appointment_services_service_id_idx').on(table.serviceId),
  ],
);

export const appointmentPackages = pgTable(
  'appointment_packages',
  {
    appointmentId: uuid('appointment_id').notNull().references(() => appointments.id, { onDelete: 'cascade' }),
    packageId: uuid('package_id').notNull().references(() => packages.id, { onDelete: 'restrict' }),
  },
  (table) => [
    primaryKey({ columns: [table.appointmentId, table.packageId] }),
    index('appointment_packages_package_id_idx').on(table.packageId),
  ],
);

export const appointmentStatusHistory = pgTable('appointment_status_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  appointmentId: uuid('appointment_id').notNull().references(() => appointments.id, { onDelete: 'cascade' }),
  previousStatus: appointmentStatusEnum('previous_status'),
  newStatus: appointmentStatusEnum('new_status').notNull(),
  changedByUserId: uuid('changed_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index('appointment_status_history_appointment_id_idx').on(table.appointmentId)]);

export const scheduleRules = pgTable('schedule_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: appointmentTypeEnum('type').notNull(),
  branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'cascade' }),
  weekday: integer('weekday').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  slotDurationMinutes: integer('slot_duration_minutes').default(60).notNull(),
  capacity: integer('capacity').default(1).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index('schedule_rules_target_day_idx').on(table.type, table.branchId, table.weekday)]);

export const scheduleBlocks = pgTable('schedule_blocks', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: appointmentTypeEnum('type').notNull(),
  branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'cascade' }),
  blockedDate: date('blocked_date').notNull(),
  startTime: time('start_time'),
  endTime: time('end_time'),
  reason: varchar('reason', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index('schedule_blocks_target_date_idx').on(table.type, table.branchId, table.blockedDate)]);

export const siteSettings = pgTable('site_settings', {
  id: varchar('id', { length: 32 }).primaryKey(),
  laboratoryName: varchar('laboratory_name', { length: 160 }).notNull(),
  email: varchar('email', { length: 254 }),
  phone: varchar('phone', { length: 30 }),
  whatsapp: varchar('whatsapp', { length: 30 }),
  facebookUrl: text('facebook_url'),
  instagramUrl: text('instagram_url'),
  appointmentNotice: text('appointment_notice'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const appointmentRateLimits = pgTable('appointment_rate_limits', {
  identifierHash: varchar('identifier_hash', { length: 64 }).notNull(),
  bucketStart: timestamp('bucket_start', { withTimezone: true }).notNull(),
  requestCount: integer('request_count').default(1).notNull(),
}, (table) => [primaryKey({ columns: [table.identifierHash, table.bucketStart] })]);
