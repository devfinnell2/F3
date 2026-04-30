import { getServerSession }  from 'next-auth';
import { authOptions }       from '@/lib/auth/config';
import { redirect }          from 'next/navigation';
import { connectDB }         from '@/lib/db/mongoose';
import UserModel             from '@/lib/db/models/User';
import ClientProfileModel    from '@/lib/db/models/ClientProfile';
import MessageModel          from '@/lib/db/models/Message';
import ClientSidebar         from '@/components/client/ClientSidebar';
import DashboardLayout from '@/components/layout/DashboardLayout';

const GOAL_LABELS: Record<string, string> = {
  fat_loss: 'Fat Loss', muscle_gain: 'Muscle Gain', endurance: 'Endurance',
  recomposition: 'Body Recomposition', general_fitness: 'General Fitness',
};

export default async function ClientGoalsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role === 'trainer') redirect('/dashboard/trainer');

  await connectDB();
  const profile = await ClientProfileModel.findOne({ userId: session.user.id }).lean();
  const trainer = profile?.trainerId
    ? await UserModel.findById(profile.trainerId).select('name avatarInitials tier').lean()
    : null;
  const unreadCount = await MessageModel.countDocuments({ receiverId: session.user.id, read: false });

  const clientData = {
    name:           session.user.name ?? 'Client',
    email:          session.user.email ?? '',
    avatarInitials: (session.user.name ?? 'C').split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2),
    currentLevel:   profile?.currentLevel ?? 0,
    expPoints:      profile?.expPoints    ?? 0,
  };
  const trainerData = trainer ? {
    name:           (trainer as any).name,
    avatarInitials: (trainer as any).avatarInitials ?? '??',
    tier:           (trainer as any).tier ?? 'pro',
  } : null;

  const goalType     = profile?.goalType    ?? 'general_fitness';
  const goalWeight   = profile?.goalWeight  ?? null;
  const waistGoal    = profile?.waistGoal   ?? null;
  const waistCurrent = profile?.waistCurrent ?? null;
  const waistStart   = profile?.waistStart  ?? null;


  const sidebar = (
    <ClientSidebar client={clientData} trainer={trainerData} activeItem="goals" unreadCount={unreadCount} />
  );
  return (
    <DashboardLayout sidebar={sidebar} accentColor="#00ffc8">
      
      <main className="flex-1 p-6 overflow-y-auto" style={{ color: '#e0d8ff', fontFamily: 'Courier New, monospace' }}>
        <h1 className="text-2xl font-bold tracking-widest mb-2" style={{ color: '#6ee7c8' }}>MY GOALS</h1>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,.32)' }}>Your targets set with your trainer.</p>

        <div className="flex flex-col gap-4">
          {/* Primary goal */}
          <div className="rounded-lg p-5" style={{ background: 'rgba(0,255,200,.04)', border: '1px solid rgba(0,255,200,.14)' }}>
            <div className="text-xs tracking-widest mb-2" style={{ color: 'rgba(0,255,200,.5)' }}>PRIMARY GOAL</div>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#00ffc8' }}>
              🎯 {GOAL_LABELS[goalType]}
            </p>
          </div>

          {/* Measurements */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { label: 'GOAL WEIGHT',   value: goalWeight   ? `${goalWeight} lbs`  : '—', color: '#a855f7' },
              { label: 'WAIST START',   value: waistStart   ? `${waistStart}"`     : '—', color: '#f472b6' },
              { label: 'WAIST GOAL',    value: waistGoal    ? `${waistGoal}"`      : '—', color: '#00ffc8' },
            ].map(g => (
              <div key={g.label} className="rounded-lg p-4 text-center"
                style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${g.color}22` }}>
                <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: `${g.color}88`, marginBottom: '8px' }}>
                  {g.label}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: g.color }}>
                  {g.value}
                </div>
              </div>
            ))}
          </div>

          {/* Waist progress bar */}
          {waistStart && waistGoal && waistCurrent && (
            <div className="rounded-lg p-4" style={{ background: 'rgba(168,85,247,.05)', border: '1px solid rgba(168,85,247,.13)' }}>
              <div className="text-xs tracking-widest mb-3" style={{ color: 'rgba(168,85,247,.5)' }}>WAIST PROGRESS</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,.4)', marginBottom: '6px' }}>
                <span>Start: {waistStart}"</span>
                <span>Current: {waistCurrent}"</span>
                <span>Goal: {waistGoal}"</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.05)' }}>
                <div className="h-full rounded-full" style={{
                  width: `${Math.min(Math.max(((waistStart - waistCurrent) / (waistStart - waistGoal)) * 100, 0), 100)}%`,
                  background: 'linear-gradient(90deg,#a855f7,#00ffc8)',
                }} />
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: 'rgba(0,255,200,.5)', textAlign: 'right' }}>
                {Math.round(((waistStart - waistCurrent) / (waistStart - waistGoal)) * 100)}% to goal
              </p>
            </div>
          )}

          {/* Level goal */}
          <div className="rounded-lg p-4" style={{ background: 'rgba(251,191,36,.05)', border: '1px solid rgba(251,191,36,.15)' }}>
            <div className="text-xs tracking-widest mb-3" style={{ color: 'rgba(251,191,36,.5)' }}>LEVEL GOAL</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,.3)', marginBottom: '4px' }}>CURRENT</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{clientData.currentLevel}</div>
              </div>
              <div style={{ flex: 1, height: '2px', background: 'rgba(251,191,36,.2)', borderRadius: '1px' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,.3)', marginBottom: '4px' }}>TARGET</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>100</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}