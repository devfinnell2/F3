// ─────────────────────────────────────────────
//  F3 — Trainer Dashboard Page
// ─────────────────────────────────────────────

import { getServerSession }  from 'next-auth';
import { authOptions }       from '@/lib/auth/config';
import { redirect }          from 'next/navigation';
import { connectDB }         from '@/lib/db/mongoose';
import UserModel             from '@/lib/db/models/User';
import ClientProfileModel    from '@/lib/db/models/ClientProfile';
import TrainerSidebar        from '@/components/trainer/TrainerSidebar';
import ClientCard            from '@/components/trainer/ClientCard';
import SmartAdjustments from '@/components/trainer/SmartAdjustments';

export default async function TrainerDashboard() {
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
    .select('-passwordHash')
    .lean();

  const clientIds = clients.map(c => c._id);

  const profiles = await ClientProfileModel.find({
    userId: { $in: clientIds },
  }).lean();

  const clientsWithProfiles = clients.map(client => {
    const profile = profiles.find(
      p => p.userId.toString() === client._id.toString()
    );
    return {
      id:             client._id.toString(),
      name:           client.name,
      email:          client.email,
      avatarInitials: client.avatarInitials ?? '??',
      status:         client.status,
      currentLevel:   profile?.currentLevel ?? 0,
      expPoints:      profile?.expPoints    ?? 0,
      goalType:       profile?.goalType     ?? 'general_fitness',
      willPower:      0,
      strength:       0,
      vitality:       0,
    };
  });

  const stats = {
    active:   clients.length,
    checkins: 0,
    goalsMet: 0,
    avgLevel: clientsWithProfiles.length
      ? Math.round(
          clientsWithProfiles.reduce((sum, c) => sum + c.currentLevel, 0) /
          clientsWithProfiles.length
        )
      : 0,
  };

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
      <TrainerSidebar trainer={trainer} activeItem="clients" />

      <main
        className="flex-1 p-6 overflow-y-auto"
        style={{ color: '#e0d8ff', fontFamily: 'Courier New, monospace' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1
              className="text-2xl font-bold tracking-widest"
              style={{ color: '#d8b4fe' }}
            >
              MY CLIENTS
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,.32)' }}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year:    'numeric',
                month:   'long',
                day:     'numeric',
              })}
            </p>
          </div>
          
            <a href="/dashboard/trainer/enroll"
            className="px-4 py-2 text-sm font-bold tracking-widest rounded transition-all"
            style={{
              background:     'rgba(168,85,247,.09)',
              border:         '1px solid rgba(168,85,247,.38)',
              color:          '#c084fc',
              fontFamily:     'Courier New, monospace',
              textDecoration: 'none',
            }}
          >
            + ENROLL CLIENT
          </a>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Active',    value: stats.active,   color: '#e9d5ff'  },
            { label: 'Check-ins', value: stats.checkins, color: '#e9d5ff'  },
            { label: 'Goals Met', value: stats.goalsMet, color: '#e9d5ff'  },
            { label: 'Avg Level', value: stats.avgLevel, color: '#00ffc8'  },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-lg p-3"
              style={{
                background: 'rgba(168,85,247,.05)',
                border:     '1px solid rgba(168,85,247,.13)',
              }}
            >
              <div
                className="text-xs tracking-widest mb-1"
                style={{ color: 'rgba(192,132,252,.48)' }}
              >
                {stat.label.toUpperCase()}
              </div>
              <div
                className="text-3xl font-bold"
                style={{ color: stat.color, fontFamily: 'Courier New, monospace' }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Client list */}
        {clientsWithProfiles.length === 0 ? (
          <div
            className="rounded-lg p-8 text-center"
            style={{
              background: 'rgba(255,255,255,.035)',
              border:     '1px solid rgba(168,85,247,.16)',
            }}
          >
            <div className="text-lg mb-2" style={{ color: 'rgba(168,85,247,.5)' }}>
              NO CLIENTS YET
            </div>
            <div className="text-sm" style={{ color: 'rgba(255,255,255,.28)' }}>
              Enroll your first client to get started.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {clientsWithProfiles.map(client => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
        <SmartAdjustments />
      </main>
    </div>
  );
}