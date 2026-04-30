// ─────────────────────────────────────────────
//  F3 — Enroll Client Page
// ─────────────────────────────────────────────

import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth/config';
import { redirect }         from 'next/navigation';
import TrainerSidebar       from '@/components/trainer/TrainerSidebar';
import EnrollForm           from '@/components/trainer/EnrollForm';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default async function EnrollPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'trainer' && session.user.role !== 'admin') {
    redirect('/dashboard/client');
  }

  const trainer = {
    name:           session.user.name  ?? 'Trainer',
    email:          session.user.email ?? '',
    tier:           session.user.tier  ?? 'pro',
    avatarInitials: (session.user.name ?? 'T')
      .split(' ')
      .map((p: string) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
  };


  const sidebar = (
    <TrainerSidebar trainer={trainer} activeItem="clients" />
  );
  return (
    <DashboardLayout sidebar={sidebar} accentColor="#a855f7">
      

      <main
        className="flex-1 p-6 overflow-y-auto"
        style={{ color: '#e0d8ff', fontFamily: 'Courier New, monospace' }}
      >
        <div className="max-w-xl">
          <h1
            className="text-2xl font-bold tracking-widest mb-2"
            style={{ color: '#d8b4fe' }}
          >
            ENROLL CLIENT
          </h1>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,.32)' }}>
            Enter the client's email address. They must have already created
            an F3 account. Their starting level will be calculated automatically.
          </p>
          <EnrollForm />
        </div>
      </main>
    </DashboardLayout>
  );
}