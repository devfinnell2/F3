// ─────────────────────────────────────────────
//  F3 — Trainer Messages Page
// ─────────────────────────────────────────────

import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth/config';
import { redirect }         from 'next/navigation';
import TrainerSidebar       from '@/components/trainer/TrainerSidebar';
import TrainerChat          from '@/components/trainer/TrainerChat';

export default async function TrainerMessagesPage() {
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

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: 'linear-gradient(135deg,#060612 0%,#0d0820 40%,#140a2e 70%,#0a0a1a 100%)',
      }}
    >
      <TrainerSidebar trainer={trainer} activeItem="messages" />

      <main
        className="flex-1 overflow-hidden"
        style={{ color: '#e0d8ff', fontFamily: 'Courier New, monospace' }}
      >
        <TrainerChat myId={session.user.id} />
      </main>
    </div>
  );
}