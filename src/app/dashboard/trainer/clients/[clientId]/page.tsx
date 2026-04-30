// ─────────────────────────────────────────────
//  F3 — Trainer: Client Profile Page
// ─────────────────────────────────────────────
import { getServerSession }  from 'next-auth';
import { authOptions }       from '@/lib/auth/config';
import { redirect, notFound } from 'next/navigation';
import Link                  from 'next/link';
import { connectDB }         from '@/lib/db/mongoose';
import UserModel             from '@/lib/db/models/User';
import ClientProfileModel    from '@/lib/db/models/ClientProfile';
import WorkoutModel          from '@/lib/db/models/Workout';
import MealPlanModel         from '@/lib/db/models/MealPlan';
import TrainerSidebar        from '@/components/trainer/TrainerSidebar';
import ClientPhotos          from '@/components/trainer/ClientPhotos';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface PageProps {
  params: Promise<{ clientId: string }>;
}

const GOAL_LABELS: Record<string, string> = {
  fat_loss:        'Fat Loss',
  muscle_gain:     'Muscle Gain',
  endurance:       'Endurance',
  recomposition:   'Recomposition',
  general_fitness: 'General Fitness',
};

export default async function ClientProfilePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'trainer' && session.user.role !== 'admin') {
    redirect('/dashboard/client');
  }

  const { clientId } = await params;

  await connectDB();

  // ── Fetch client user ──────────────────────
  const clientUser = await UserModel.findOne({
    _id:       clientId,
    trainerId: session.user.id,
    role:      { $in: ['client', 'basic'] },
  }).select('-passwordHash').lean();

  if (!clientUser) notFound();

  // ── Fetch extended profile ─────────────────
  const profile = await ClientProfileModel.findOne({
    userId: clientId,
  }).lean();

  // ── Fetch workout plan ─────────────────────
  const workout = await WorkoutModel.findOne({ clientId }).lean();

  // ── Fetch meal plan ────────────────────────
  const mealPlan = await MealPlanModel.findOne({ clientId }).lean();

  // ── Trainer sidebar data ───────────────────
  const trainer = {
    name:           session.user.name  ?? 'Trainer',
    email:          session.user.email ?? '',
    tier:           session.user.tier  ?? 'pro',
    avatarInitials: (session.user.name ?? 'T')
      .split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2),
  };

  const avatarInitials = (clientUser.avatarInitials as string)
    ?? clientUser.name.slice(0, 2).toUpperCase();


  const sidebar = (
    <TrainerSidebar trainer={trainer} activeItem="clients" />
  );
  return (
    <DashboardLayout sidebar={sidebar} accentColor="#a855f7">
      

      <main
        className="flex-1 p-6 overflow-y-auto"
        style={{ color: '#e0d8ff', fontFamily: 'Courier New, monospace' }}
      >
        {/* ── Back button ── */}
        <Link
          href="/dashboard/trainer"
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            '6px',
            color:          'rgba(192,132,252,.5)',
            textDecoration: 'none',
            fontSize:       '0.75rem',
            letterSpacing:  '0.1em',
            marginBottom:   '20px',
          }}
        >
          ← BACK TO CLIENTS
        </Link>

        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shrink-0"
            style={{
              background: 'rgba(0,255,200,.09)',
              border:     '2px solid rgba(0,255,200,.28)',
              color:      '#6ee7c8',
            }}
          >
            {avatarInitials}
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-widest"
              style={{ color: '#e9d5ff' }}
            >
              {clientUser.name.toUpperCase()}
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,.35)' }}>
              {clientUser.email} · {GOAL_LABELS[profile?.goalType ?? ''] ?? 'General Fitness'}
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <Link
              href={`/dashboard/trainer/ai?clientId=${clientId}`}
              className="px-4 py-2 text-xs font-bold tracking-widest rounded transition-all"
              style={{
                background:     'rgba(168,85,247,.09)',
                border:         '1px solid rgba(168,85,247,.38)',
                color:          '#c084fc',
                textDecoration: 'none',
              }}
            >
              🧠 ASK AI
            </Link>
            <Link
              href={`/dashboard/trainer/messages?clientId=${clientId}`}
              className="px-4 py-2 text-xs font-bold tracking-widest rounded transition-all"
              style={{
                background:     'rgba(0,255,200,.07)',
                border:         '1px solid rgba(0,255,200,.32)',
                color:          '#6ee7c8',
                textDecoration: 'none',
              }}
            >
              💬 MESSAGE
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Stats card ── */}
          <div
            className="rounded-lg p-4"
            style={{
              background: 'rgba(168,85,247,.05)',
              border:     '1px solid rgba(168,85,247,.13)',
            }}
          >
            <div
              className="text-xs tracking-widest mb-3"
              style={{ color: 'rgba(168,85,247,.5)' }}
            >
              CLIENT STATS
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Level',       value: profile?.currentLevel ?? 0,    color: '#00ffc8' },
                { label: 'EXP',         value: (profile?.expPoints ?? 0).toLocaleString(), color: '#a855f7' },
                { label: 'Waist Start', value: profile?.waistStart   ? `${profile.waistStart}"` : '—', color: '#e9d5ff' },
                { label: 'Waist Goal',  value: profile?.waistGoal    ? `${profile.waistGoal}"` : '—',  color: '#f472b6' },
                { label: 'Age',         value: profile?.age          ?? '—',  color: '#e9d5ff' },
                { label: 'Height',      value: profile?.height       ?? '—',  color: '#e9d5ff' },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="rounded p-2"
                  style={{
                    background: 'rgba(255,255,255,.03)',
                    border:     '1px solid rgba(255,255,255,.06)',
                  }}
                >
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,.35)', letterSpacing: '0.1em' }}>
                    {stat.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: stat.color, marginTop: '2px' }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Weight history */}
            {(profile?.weightHistory?.length ?? 0) > 0 && (
              <div className="mt-3">
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,.3)', letterSpacing: '0.1em', marginBottom: '6px' }}>
                  WEIGHT HISTORY (LAST 5)
                </div>
                <div className="flex gap-2 flex-wrap">
                  {profile!.weightHistory.slice(-5).map((w, i) => (
                    <span
                      key={i}
                      style={{
                        background: 'rgba(0,255,200,.08)',
                        border:     '1px solid rgba(0,255,200,.2)',
                        borderRadius: '6px',
                        padding:    '2px 8px',
                        fontSize:   '0.75rem',
                        color:      '#6ee7c8',
                      }}
                    >
                      {w.weight} lbs
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Plan summary ── */}
          <div
            className="rounded-lg p-4"
            style={{
              background: 'rgba(0,255,200,.03)',
              border:     '1px solid rgba(0,255,200,.1)',
            }}
          >
            <div
              className="text-xs tracking-widest mb-3"
              style={{ color: 'rgba(0,255,200,.5)' }}
            >
              ASSIGNED PLANS
            </div>

            {/* Workout plan */}
            <div className="mb-3">
              <div style={{ fontSize: '0.7rem', color: 'rgba(168,85,247,.6)', letterSpacing: '0.08em', marginBottom: '4px' }}>
                WORKOUT PLAN
              </div>
              {workout?.plan?.length ? (
                <div className="flex flex-col gap-1">
                  {workout.plan.slice(0, 4).map((day, i) => (
                    <div
                      key={i}
                      style={{
                        display:    'flex',
                        justifyContent: 'space-between',
                        padding:    '4px 8px',
                        background: 'rgba(168,85,247,.05)',
                        borderRadius: '4px',
                        fontSize:   '0.78rem',
                      }}
                    >
                      <span style={{ color: '#e0d8ff' }}>{day.dayLabel}</span>
                      <span style={{ color: 'rgba(255,255,255,.3)' }}>
                        {day.exercises.length} exercises
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'rgba(255,255,255,.25)', fontSize: '0.78rem', margin: 0 }}>
                  No workout plan assigned yet
                </p>
              )}
            </div>

            {/* Macro targets */}
            <div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(0,255,200,.6)', letterSpacing: '0.08em', marginBottom: '4px' }}>
                MACRO TARGETS
              </div>
              {mealPlan?.targetMacros ? (
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'CAL',     value: mealPlan.targetMacros.calories },
                    { label: 'PRO',     value: `${mealPlan.targetMacros.protein}g` },
                    { label: 'CARBS',   value: `${mealPlan.targetMacros.carbs}g` },
                    { label: 'FAT',     value: `${mealPlan.targetMacros.fats}g` },
                  ].map(m => (
                    <div
                      key={m.label}
                      style={{
                        background: 'rgba(0,255,200,.05)',
                        border:     '1px solid rgba(0,255,200,.15)',
                        borderRadius: '6px',
                        padding:    '4px 6px',
                        textAlign:  'center',
                      }}
                    >
                      <div style={{ fontSize: '0.6rem', color: 'rgba(0,255,200,.45)' }}>{m.label}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6ee7c8' }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'rgba(255,255,255,.25)', fontSize: '0.78rem', margin: 0 }}>
                  No meal plan assigned yet
                </p>
              )}
            </div>
          </div>

          {/* ── Progress photos — full width ── */}
          <div
            className="lg:col-span-2 rounded-lg p-4"
            style={{
              background: 'rgba(255,255,255,.025)',
              border:     '1px solid rgba(244,114,182,.12)',
            }}
          >
            <ClientPhotos
              beforePhoto={     (profile as any)?.beforePhoto      ?? null}
              afterPhoto={      (profile as any)?.afterPhoto       ?? null}
              beforePhotoDate={ (profile as any)?.beforePhotoDate  ?? null}
              afterPhotoDate={  (profile as any)?.afterPhotoDate   ?? null}
              clientName={clientUser.name}
            />
          </div>

        </div>
      </main>
    </DashboardLayout>
  );
}