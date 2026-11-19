import { requirePageUser } from '@/lib/auth/guard';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requirePageUser(['admin']);

  return <AdminShell userName={user.name} userEmail={user.email}>{children}</AdminShell>;
}
