import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { handleApiError } from '@/lib/api';
import { getDb } from '@/lib/db';
import { branches, packages, services, siteSettings } from '@/lib/db/schema';

export async function GET() {
  try {
    const db = getDb();
    const [branchRows, serviceRows, packageRows, [settings]] = await Promise.all([
      db.select().from(branches).where(eq(branches.isActive, true)),
      db.select().from(services).where(eq(services.isActive, true)),
      db.select().from(packages).where(eq(packages.isActive, true)),
      db.select().from(siteSettings).where(eq(siteSettings.id, 'primary')).limit(1),
    ]);
    return NextResponse.json({ data: { branches: branchRows, services: serviceRows, packages: packageRows, settings: settings ?? null, appointmentTypes: ['branch', 'home'] } });
  } catch (error) { return handleApiError(error); }
}
