// ─────────────────────────────────────────────
//  F3 — Trainer Dashboard Page
// ─────────────────────────────────────────────

import MobileSidebarWrapper from '@/components/ui/MobileSidebarWrapper';
import GlassLink from '@/components/ui/GlassLink';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
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
    <div style={{ background: 'linear-gradient(135deg,#060612 0%,#0d0820 40%,#140a2e 70%,#0a0a1a 100%)', minHeight: '100vh' }}>
      <MobileSidebarWrapper
        sidebar={<TrainerSidebar trainer={trainer} activeItem="clients" />}
        accentColor="#a855f7"
      >
        <div
          className="p-4 lg:p-6"
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
          
           <GlassLink href="/dashboard/trainer/enroll" variant="primary" size="md">
            + ENROLL CLIENT
          </GlassLink>
        </div>

      {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Active Clients', value: stats.active,   color: '#c084fc', glow: 'rgba(168,85,247,.5)' },
            { label: 'Check-ins',      value: stats.checkins, color: '#e9d5ff', glow: 'rgba(255,255,255,.3)' },
            { label: 'Goals Met',      value: stats.goalsMet, color: '#fbbf24', glow: 'rgba(251,191,36,.5)'  },
            { label: 'Avg Level',      value: stats.avgLevel, color: '#00ffc8', glow: 'rgba(0,255,200,.5)'   },
          ].map(stat => (
            <div
              key={stat.label}
              className="f3-card rounded-lg p-3"
              style={{ borderLeft: `2px solid ${stat.glow}` }}
            >
              <div className="text-xs tracking-widest mb-1" style={{ color: 'rgba(192,132,252,.48)' }}>
                {stat.label.toUpperCase()}
              </div>
              <div
                className="text-3xl font-bold"
                style={{ color: stat.color, fontFamily: 'Courier New, monospace', textShadow: `0 0 12px ${stat.glow}` }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
        {/* Client list */}
        {clientsWithProfiles.length === 0 ? (
         <div className="f3-card rounded-lg p-8 text-center">
            <div className="text-lg mb-2" style={{ color: 'rgba(168,85,247,.5)' }}>
              NO CLIENTS YET
            </div>
            <div className="text-sm mb-4" style={{ color: 'rgba(255,255,255,.28)' }}>
              Enroll your first client to get started.
            </div>
            
              <GlassLink href="/dashboard/trainer/enroll" variant="primary" size="md">
              + ENROLL YOUR FIRST CLIENT
            </GlassLink>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {clientsWithProfiles.map(client => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
        <SmartAdjustments />
     </div>
      </MobileSidebarWrapper>
    </div>
  );
}