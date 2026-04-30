// ─────────────────────────────────────────────
//  F3 — Client Dashboard Page
//  Server component — fetches own profile data
// ─────────────────────────────────────────────

import MobileSidebarWrapper from '@/components/ui/MobileSidebarWrapper';
import GlassLink from '@/components/ui/GlassLink';
import FlameIcon from '@/components/ui/FlameIcon';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db/mongoose';
import UserModel from '@/lib/db/models/User';
import ClientProfileModel from '@/lib/db/models/ClientProfile';
import WorkoutModel from '@/lib/db/models/Workout';
import MessageModel from '@/lib/db/models/Message';
import ClientSidebar from '@/components/client/ClientSidebar';
import TodaysMeals from '@/components/shared/TodaysMeals';

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/login');
  if (session.user.role === 'trainer') redirect('/dashboard/trainer');
  if (session.user.role === 'admin') redirect('/dashboard/admin');

  await connectDB();

  // ── Fetch client's own profile ──────────────
  const profile = await ClientProfileModel.findOne({
    userId: session.user.id,
  }).lean();

  // ── Fetch trainer info if assigned ──────────
  const trainer = profile?.trainerId
    ? await UserModel.findById(profile.trainerId)
      .select('name avatarInitials tier')
      .lean()
    : null;

  // ── Fetch today's workout ───────────────────
  const workout = await WorkoutModel.findOne({
    clientId: session.user.id,
  }).lean();

  const todayWorkout = workout?.plan?.[0] ?? null;

  // ── Fetch unread message count ──────────────
  const unreadCount = await MessageModel.countDocuments({
    receiverId: session.user.id,
    read: false,
  });

  // ── Build client data object ────────────────
  const clientData = {
    name: session.user.name ?? 'Client',
    email: session.user.email ?? '',
    avatarInitials: (session.user.name ?? 'C')
      .split(' ')
      .map((p: string) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
    currentLevel: profile?.currentLevel ?? 0,
    expPoints: profile?.expPoints ?? 0,
    willPower: 0,
    strength: 0,
    vitality: 0,
    goalType: profile?.goalType ?? 'general_fitness',
    waistStart: profile?.waistStart ?? null,
    waistGoal: profile?.waistGoal ?? null,
    waistCurrent: profile?.waistCurrent ?? null,
    weightHistory: profile?.weightHistory ?? [],
    beforePhoto: (profile as any)?.beforePhoto ?? null,
    afterPhoto: (profile as any)?.afterPhoto ?? null,
    beforePhotoDate: (profile as any)?.beforePhotoDate ?? null,
    afterPhotoDate: (profile as any)?.afterPhotoDate ?? null,
  };

  const trainerData = trainer
    ? {
      name: (trainer as any).name,
      avatarInitials: (trainer as any).avatarInitials ?? '??',
      tier: (trainer as any).tier ?? 'pro',
    }
    : null;

  return (
    <div style={{ background: 'linear-gradient(135deg,#060612 0%,#0d0820 40%,#140a2e 70%,#0a0a1a 100%)', minHeight: '100vh' }}>
      <MobileSidebarWrapper
        sidebar={
          <ClientSidebar
            client={clientData}
            trainer={trainerData}
            activeItem="status"
            unreadCount={unreadCount}
          />
        }
        accentColor="#00ffc8"
      >
        <div
          className="p-4 lg:p-6"
          style={{ color: '#e0d8ff', fontFamily: 'Courier New, monospace' }}
        >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1
              className="text-2xl font-bold tracking-widest"
              style={{ color: '#6ee7c8' }}
            >
              MY PROGRESS
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,.32)' }}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          {todayWorkout && (
            <div className="text-right">
              <div className="text-xs tracking-widest mb-1" style={{ color: 'rgba(0,255,200,.45)' }}>
                NEXT WORKOUT
              </div>
              <div className="font-bold" style={{ color: '#00ffc8', fontSize: '15px' }}>
                {todayWorkout.dayLabel}
              </div>
            </div>
          )}
        </div>

      {/* Level / EXP card — RPG Radar */}
        <div className="f3-card-cyan rounded-lg p-4 mb-4">
          <div className="text-xs tracking-widest mb-3" style={{ color: 'rgba(0,255,200,.48)' }}>
            MY LEVEL — RPG STATS
          </div>

          <div className="flex gap-4 flex-wrap">
            {/* Left — radar wheel */}
            <div className="shrink-0">
              <svg width="160" height="160" viewBox="0 0 160 160" style={{ display:'block' }}>
                {/* Grid rings */}
                <polygon points="80,20 136,55 136,105 80,140 24,105 24,55" fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="1"/>
                <polygon points="80,38 122,61 122,99 80,122 38,99 38,61"   fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="1"/>
                <polygon points="80,56 108,67 108,93 80,104 52,93 52,67"   fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="1"/>
                {/* Axis lines */}
                <line x1="80" y1="80" x2="80"  y2="20"  stroke="rgba(255,255,255,.05)" strokeWidth="1"/>
                <line x1="80" y1="80" x2="136" y2="55"  stroke="rgba(255,255,255,.05)" strokeWidth="1"/>
                <line x1="80" y1="80" x2="136" y2="105" stroke="rgba(255,255,255,.05)" strokeWidth="1"/>
                <line x1="80" y1="80" x2="80"  y2="140" stroke="rgba(255,255,255,.05)" strokeWidth="1"/>
                <line x1="80" y1="80" x2="24"  y2="105" stroke="rgba(255,255,255,.05)" strokeWidth="1"/>
                <line x1="80" y1="80" x2="24"  y2="55"  stroke="rgba(255,255,255,.05)" strokeWidth="1"/>
                {/* Stat polygon */}
                <polygon
                  points={[
                    `80,${80 - (clientData.willPower / 100) * 60}`,
                    `${80 + (clientData.strength / 100) * 56},${80 - (clientData.strength / 100) * 25}`,
                    `${80 + (clientData.vitality / 100) * 56},${80 + (clientData.vitality / 100) * 25}`,
                    `80,${80 + (clientData.willPower / 100) * 60}`,
                    `${80 - (clientData.strength / 100) * 56},${80 + (clientData.strength / 100) * 25}`,
                    `${80 - (clientData.vitality / 100) * 56},${80 - (clientData.vitality / 100) * 25}`,
                  ].join(' ')}
                  fill="rgba(0,255,200,.1)" stroke="#00ffc8" strokeWidth="1.5" strokeLinejoin="round"
                />
                {/* Labels */}
                <text x="80"  y="15"  textAnchor="middle" fontFamily="Courier New" fontSize="9" fontWeight="700" fill="#c084fc">WILL</text>
                <text x="143" y="57"  textAnchor="start"  fontFamily="Courier New" fontSize="9" fontWeight="700" fill="#00ffc8">STR</text>
                <text x="143" y="112" textAnchor="start"  fontFamily="Courier New" fontSize="9" fontWeight="700" fill="#f472b6">VIT</text>
                <text x="80"  y="153" textAnchor="middle" fontFamily="Courier New" fontSize="9" fontWeight="700" fill="#00ffc8">END</text>
                <text x="3"   y="112" textAnchor="start"  fontFamily="Courier New" fontSize="9" fontWeight="700" fill="#fbbf24">SKL</text>
                <text x="3"   y="57"  textAnchor="start"  fontFamily="Courier New" fontSize="9" fontWeight="700" fill="#a855f7">REC</text>
                {/* Center badge */}
                <circle cx="80" cy="80" r="18" fill="rgba(0,0,0,.6)" stroke="rgba(0,255,200,.3)" strokeWidth="1"/>
                <text x="80" y="77" textAnchor="middle" fontFamily="Courier New" fontSize="9"  fill="rgba(0,255,200,.6)">LVL</text>
                <text x="80" y="89" textAnchor="middle" fontFamily="Courier New" fontSize="14" fontWeight="700" fill="#00ffc8">{clientData.currentLevel}</text>
              </svg>
            </div>

            {/* Right — stat bars + EXP */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              {/* EXP bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(0,255,200,.5)' }}>
                  <span>LVL {clientData.currentLevel}</span>
                  <span>{clientData.expPoints.toLocaleString()} EXP</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.05)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min((clientData.expPoints % 10000) / 100, 100)}%`,
                      background: 'linear-gradient(90deg, #6d28d9, #a855f7, #00ffc8)',
                    }}
                  />
                </div>
              </div>

              {/* Stat bars */}
              <div className="flex flex-col gap-2">
              {[
                  { label: 'WILL',     icon: <svg width="14" height="14" viewBox="0 0 40 40" fill="none"><polygon points="20,3 34,11 34,29 20,37 6,29 6,11" stroke="#a855f7" strokeWidth="1" fill="rgba(168,85,247,.08)"/><path d="M22 9 L13 22 L19 22 L17 31 L27 17 L21 17 Z" fill="#c084fc" strokeWidth=".6"/></svg>, value: clientData.willPower, from: '#a855f7', to: '#c084fc' },
                  { label: 'STR',      icon: <svg width="14" height="14" viewBox="0 0 40 40" fill="none"><polygon points="20,3 34,11 34,29 20,37 6,29 6,11" stroke="#00ffc8" strokeWidth="1" fill="rgba(0,255,200,.06)"/><rect x="7" y="17" width="3" height="6" fill="#00ffc8"/><rect x="30" y="17" width="3" height="6" fill="#00ffc8"/><rect x="10" y="14" width="2.5" height="12" fill="#6ee7c8"/><rect x="27.5" y="14" width="2.5" height="12" fill="#6ee7c8"/><rect x="12.5" y="19" width="15" height="2" fill="#00ffc8"/></svg>, value: clientData.strength,  from: '#00ffc8', to: '#6ee7c8' },
                  { label: 'VIT',      icon: <svg width="14" height="14" viewBox="0 0 40 40" fill="none"><polygon points="20,3 34,11 34,29 20,37 6,29 6,11" stroke="#f472b6" strokeWidth="1" fill="rgba(244,114,182,.06)"/><path d="M7 20 L13 20 L15 14 L18 26 L22 10 L25 22 L27 20 L33 20" stroke="#f472b6" strokeWidth="1.6" fill="none" strokeLinecap="square"/></svg>, value: clientData.vitality,  from: '#f472b6', to: '#f9a8d4' },
                ].map(stat => (
                  <div key={stat.label} className="grid items-center gap-2" style={{ gridTemplateColumns: '90px 1fr 32px' }}>
                   <span className="text-xs flex items-center gap-1" style={{ color: 'rgba(255,255,255,.45)' }}>{stat.icon}{stat.label}</span>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.05)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(stat.value, 2)}%`,
                          background: `linear-gradient(90deg, ${stat.from}, ${stat.to})`,
                          boxShadow: `0 0 6px ${stat.to}`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-right" style={{ color: stat.to }}>{stat.value}</span>
                  </div>
                ))}
              </div>

              <div className="text-xs mt-2" style={{ color: 'rgba(0,255,200,.4)' }}>
                EXP formula: 40% Will · 40% Strength · 20% Vitality
              </div>
            </div>
          </div>
        </div>
       
{/* Health Score */}
        <div className="f3-card rounded-lg p-4 mb-4" style={{ borderLeft: '2px solid rgba(0,255,200,.5)' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs tracking-widest mb-1" style={{ color: 'rgba(0,255,200,.48)' }}>
                CLIENT HEALTH SCORE
              </div>
              <div className="text-5xl font-bold" style={{ color: '#00ffc8', textShadow: '0 0 20px rgba(0,255,200,.6), 0 0 40px rgba(0,255,200,.3)', fontFamily: 'Courier New, monospace' }}>
                {Math.round((clientData.willPower * 0.4) + (clientData.strength * 0.4) + (clientData.vitality * 0.2))}
                <span className="text-lg font-normal ml-1" style={{ color: 'rgba(0,255,200,.4)' }}>/100</span>
              </div>
              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,.32)' }}>
                Adherence · Progress · Recovery
              </div>
            </div>
            {/* Score ring */}
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="6"/>
              <circle cx="40" cy="40" r="34" fill="none" stroke="#00ffc8" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 34 * Math.round((clientData.willPower * 0.4) + (clientData.strength * 0.4) + (clientData.vitality * 0.2)) / 100} ${2 * Math.PI * 34}`}
                strokeDashoffset={2 * Math.PI * 34 * 0.25}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,200,.8))' }}
              />
              <text x="40" y="45" textAnchor="middle" fontFamily="Courier New" fontSize="11" fontWeight="700" fill="#00ffc8">
                {Math.round((clientData.willPower * 0.4) + (clientData.strength * 0.4) + (clientData.vitality * 0.2))}
              </text>
            </svg>
          </div>
        </div>

       {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Workouts', value: '0',    sub: 'this month', color: '#c084fc', glow: 'rgba(168,85,247,.4)'  },
            { label: 'Streak',   value: '0',    sub: 'days',       color: '#fbbf24', glow: 'rgba(251,191,36,.4)', streak: true  },
            { label: 'Waist',    value: clientData.waistCurrent ? `${clientData.waistCurrent}"` : '—', sub: 'current', color: '#6ee7c8', glow: 'rgba(0,255,200,.4)' },
            { label: 'Goal',     value: clientData.waistGoal    ? `${clientData.waistGoal}"` : '—',    sub: 'target',  color: '#f472b6', glow: 'rgba(244,114,182,.4)' },
          ].map(stat => (
            <div
              key={stat.label}
              className="f3-card rounded-lg p-3"
              style={{ borderLeft: `2px solid ${stat.glow}` }}
            >
              <div className="text-xs tracking-widest mb-1" style={{ color: 'rgba(192,132,252,.48)' }}>
                {stat.label.toUpperCase()}
              </div>
              <div className="text-2xl font-bold flex items-center gap-2" style={{ color: stat.color, textShadow: `0 0 12px ${stat.glow}` }}>
              {(stat as any).streak && <FlameIcon size={36} />}
                {stat.value}
              </div>
              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,.28)' }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
        {/* Today's nutrition */}
        <div className="rounded-lg p-4 mb-4"
          style={{ background: 'rgba(0,255,200,.03)', border: '1px solid rgba(0,255,200,.1)' }}>
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs tracking-widest" style={{ color: 'rgba(0,255,200,.48)' }}>
              TODAY'S NUTRITION
            </div>
            <GlassLink href="/dashboard/client/meals" variant="client" size="sm">LOG MEALS →</GlassLink>
          </div>
          <TodaysMeals clientId={session.user.id} accentColor="#00ffc8" />
        </div>


        {/* Today's workout preview */}
        {todayWorkout ? (
          <div
            className="rounded-lg p-4 mb-4"
            style={{
              background: 'rgba(255,255,255,.035)',
              border: '1px solid rgba(168,85,247,.16)',
            }}
          >
            <div
              className="text-xs tracking-widest mb-3"
              style={{ color: 'rgba(168,85,247,.5)' }}
            >
              TODAY — {todayWorkout.dayLabel.toUpperCase()}
            </div>
            <div className="flex flex-col gap-2">
              {todayWorkout.exercises.slice(0, 4).map((ex, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2"
                  style={{ borderBottom: '1px solid rgba(168,85,247,.07)' }}
                >
                  <span className="flex-1" style={{ color: '#e0d8ff', fontSize: '15px' }}>
                    {ex.name}
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{
                      background: 'rgba(168,85,247,.1)',
                      border: '1px solid rgba(168,85,247,.3)',
                      color: '#d8b4fe',
                    }}
                  >
                    {ex.sets}×{ex.reps}
                  </span>
                  {ex.weight && (
                    <span
                      className="text-xs font-bold"
                      style={{ color: '#fbbf24', minWidth: '55px', textAlign: 'right' }}
                    >
                      {ex.weight}
                    </span>
                  )}
                </div>
              ))}
            </div>
           <LiquidGlassButton variant="client" size="sm" style={{ marginTop: '12px' }}>
              LOG WORKOUT
            </LiquidGlassButton>
          </div>
        ) : (
          <div
            className="rounded-lg p-6 text-center mb-4"
            style={{
              background: 'rgba(255,255,255,.035)',
              border: '1px solid rgba(168,85,247,.16)',
            }}
          >
            <div className="text-sm mb-1" style={{ color: 'rgba(168,85,247,.5)' }}>
              NO WORKOUT ASSIGNED YET
            </div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,.28)' }}>
              Your trainer will assign your plan soon.
            </div>
          </div>
        )}

        {/* Progress photos */}
        <div
          className="rounded-lg p-4"
          style={{
            background: 'rgba(255,255,255,.035)',
            border: '1px solid rgba(244,114,182,.14)',
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs tracking-widest" style={{ color: 'rgba(244,114,182,.48)' }}>
              PROGRESS PHOTOS
            </div>

           <GlassLink href="/dashboard/client/photos" variant="admin" size="sm">MANAGE →</GlassLink>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'BEFORE', url: clientData.beforePhoto, accent: '#a855f7' },
              { label: 'AFTER', url: clientData.afterPhoto, accent: '#00ffc8' },
            ].map(({ label, url, accent }) => (
              <div
                key={label}
                style={{
                  aspectRatio: '2/3',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: `1px solid ${accent}33`,
                  background: `${accent}08`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {url ? (
                  <img
                    src={url}
                    alt={`${label} photo`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" style={{ margin: '0 auto 4px' }}>
                      <polygon points="20,3 34,11 34,29 20,37 6,29 6,11" stroke="#f472b6" strokeWidth="1" fill="rgba(244,114,182,.06)"/>
                      <path d="M11 13 L11 10 L14 10 M26 10 L29 10 L29 13 M29 27 L29 30 L26 30 M14 30 L11 30 L11 27" stroke="#f9a8d4" strokeWidth="1" fill="none"/>
                      <circle cx="20" cy="20" r="5" stroke="#f472b6" strokeWidth="1" fill="none"/>
                      <circle cx="20" cy="20" r="2" fill="#f472b6"/>
                    </svg>
                    <p style={{ color: `${accent}88`, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', margin: 0 }}>
                      {label} PHOTO
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {clientData.beforePhoto && clientData.afterPhoto && (
            <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: '0.72rem', color: '#6ee7c8' }}>
               TRANSFORMATION IN PROGRESS
            </p>
          )}
          {!clientData.beforePhoto && !clientData.afterPhoto && (

            <GlassLink href="/dashboard/client/photos" variant="admin" size="sm" fullWidth>
              + UPLOAD YOUR FIRST PHOTO
            </GlassLink>
          )}
        </div>
     </div>
      </MobileSidebarWrapper>
    </div>
  );
}