// ─────────────────────────────────────────────
//  F3 — Admin Dashboard
// ─────────────────────────────────────────────
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth/config';
import { redirect }         from 'next/navigation';
import AdminDashboard       from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'admin') redirect('/dashboard/trainer');

  return <AdminDashboard adminName={session.user.name ?? 'Admin'} />;
}