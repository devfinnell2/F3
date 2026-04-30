// ─────────────────────────────────────────────
//  F3 — Trainer Profile Page
// ─────────────────────────────────────────────
import { getServerSession }  from 'next-auth';
import { authOptions }       from '@/lib/auth/config';
import { redirect }          from 'next/navigation';
import { connectDB }         from '@/lib/db/mongoose';
import ClientProfileModel    from '@/lib/db/models/ClientProfile';
import TrainerSidebar        from '@/components/trainer/TrainerSidebar';
import TrainerPhotoUploader  from '@/components/trainer/TrainerPhotoUploader';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default async function TrainerProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'trainer' && session.user.role !== 'admin') {
    redirect('/dashboard/client');
  }

  await connectDB();

  // Trainers store their own photos in a ClientProfile with themselves as both userId and trainerId
  let profile = await ClientProfileModel.findOne({
    userId: session.user.id,
  }).lean();

  // Create a self-profile if it doesn't exist
  if (!profile) {
    profile = await ClientProfileModel.create({
      userId:    session.user.id,
      trainerId: session.user.id,
    });
  }

  const trainer = {
    name:           session.user.name  ?? 'Trainer',
    email:          session.user.email ?? '',
    tier:           session.user.tier  ?? 'pro',
    avatarInitials: (session.user.name ?? 'T')
      .split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2),
  };

  const photos = {
    before:     (profile as any)?.beforePhoto     ?? null,
    after:      (profile as any)?.afterPhoto      ?? null,
    beforeDate: (profile as any)?.beforePhotoDate ?? null,
    afterDate:  (profile as any)?.afterPhotoDate  ?? null,
  };


  const sidebar = (
    <TrainerSidebar trainer={trainer} activeItem="profile" />
  );
  return (
    <DashboardLayout sidebar={sidebar} accentColor="#a855f7">
      

      <main
        className="flex-1 p-6 overflow-y-auto"
        style={{ color: '#e0d8ff', fontFamily: 'Courier New, monospace' }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shrink-0"
            style={{
              background: 'rgba(168,85,247,.14)',
              border:     '2px solid rgba(168,85,247,.32)',
              color:      '#d8b4fe',
            }}
          >
            {trainer.avatarInitials}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-widest" style={{ color: '#d8b4fe' }}>
              {trainer.name.toUpperCase()}
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,.35)' }}>
              {trainer.email} · ISSA CERTIFIED TRAINER
            </p>
          </div>
          <div className="ml-auto">
            <span
              className="text-xs font-bold px-3 py-1.5 rounded"
              style={{
                background: trainer.tier === 'elite' ? 'rgba(251,191,36,.1)' : 'rgba(168,85,247,.14)',
                border:     trainer.tier === 'elite' ? '1px solid rgba(251,191,36,.28)' : '1px solid rgba(168,85,247,.28)',
                color:      trainer.tier === 'elite' ? '#fbbf24' : '#d8b4fe',
              }}
            >
              {trainer.tier === 'elite' ? 'ELITE — UNLIMITED AI' : 'PRO — LIMITED AI'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Progress Photos ── */}
          <div
            className="lg:col-span-2 rounded-lg p-5"
            style={{
              background: 'rgba(255,255,255,.025)',
              border:     '1px solid rgba(244,114,182,.14)',
            }}
          >
            <div className="text-xs tracking-widest mb-4" style={{ color: 'rgba(244,114,182,.48)' }}>
              MY PROGRESS PHOTOS
            </div>
            <TrainerPhotoUploader photos={photos} />
          </div>

          {/* ── Coming soon panels ── */}
          {[
            { label: 'MY WORKOUT PLAN',  color: 'rgba(168,85,247,.13)', accent: '#a855f7', icon: '💪' },
            { label: 'MY MEAL PLAN',     color: 'rgba(0,255,200,.06)',  accent: '#00ffc8', icon: '🍽️' },
          ].map(panel => (
            <div
              key={panel.label}
              className="rounded-lg p-5"
              style={{
                background: panel.color,
                border:     `1px solid ${panel.accent}22`,
              }}
            >
              <div className="text-xs tracking-widest mb-3" style={{ color: `${panel.accent}88` }}>
                {panel.label}
              </div>
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>{panel.icon}</p>
                <p style={{ color: `${panel.accent}55`, fontSize: '0.75rem', letterSpacing: '0.1em', margin: 0 }}>
                  COMING SOON
                </p>
              </div>
            </div>
          ))}

        </div>
      </main>
    </DashboardLayout>
  );
}