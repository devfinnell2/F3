// ─────────────────────────────────────────────
//  F3 — AI Coach Page (Trainer Only)
// ─────────────────────────────────────────────

import { getServerSession }  from 'next-auth';
import { authOptions }       from '@/lib/auth/config';
import { redirect }          from 'next/navigation';
import { connectDB }         from '@/lib/db/mongoose';
import UserModel             from '@/lib/db/models/User';
import TrainerSidebar        from '@/components/trainer/TrainerSidebar';
import AICoach               from '@/components/trainer/AICoach';

export default async function AICoachPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'trainer' && session.user.role !== 'admin') {
    redirect('/dashboard/client');
  }

  await connectDB();

  const clients = await UserModel.find({
    role:      'client',
    trainerId: session.user.id,
    status:    'active',
  })
    .select('name avatarInitials')
    .lean();

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

  const clientList = clients.map(c => ({
    id:             c._id.toString(),
    name:           c.name,
    avatarInitials: c.avatarInitials ?? '??',
  }));

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: 'linear-gradient(135deg,#060612 0%,#0d0820 40%,#140a2e 70%,#0a0a1a 100%)',
      }}
    >
      <TrainerSidebar trainer={trainer} activeItem="ai" />

      <main
        className="flex-1 flex flex-col overflow-hidden"
        style={{ color: '#e0d8ff', fontFamily: 'Courier New, monospace' }}
      >
        <AICoach
          clients={clientList}
          trainerTier={session.user.tier ?? 'pro'}
        />
      </main>
    </div>
  );
}