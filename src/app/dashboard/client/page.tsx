// ─────────────────────────────────────────────
//  F3 — Client Dashboard Page
//  Server component — fetches own profile data
// ─────────────────────────────────────────────

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
    <div
      className="flex min-h-screen"
      style={{
        background: 'linear-gradient(135deg,#060612 0%,#0d0820 40%,#140a2e 70%,#0a0a1a 100%)',
      }}
    >
      <ClientSidebar
        client={clientData}
        trainer={trainerData}
        activeItem="status"
        unreadCount={unreadCount}
      />

      {/* ── Main content ── */}
      <main
        className="flex-1 p-6 overflow-y-auto"
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

        {/* Level / EXP card */}
        <div
          className="rounded-lg p-4 mb-4"
          style={{
            background: 'rgba(0,255,200,.04)',
            border: '1px solid rgba(0,255,200,.14)',
          }}
        >
          <div
            className="text-xs tracking-widest mb-3"
            style={{ color: 'rgba(0,255,200,.48)' }}
          >
            MY LEVEL — RPG STATS
          </div>

          <div className="flex items-center gap-4 mb-4">
            {/* Level circle */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center font-bold shrink-0 text-2xl"
              style={{
                background: 'rgba(0,255,200,.08)',
                border: '2px solid rgba(0,255,200,.3)',
                color: '#00ffc8',
              }}
            >
              {clientData.currentLevel}
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(0,255,200,.5)' }}>
                <span>LVL {clientData.currentLevel}</span>
                <span>{clientData.expPoints.toLocaleString()} EXP</span>
              </div>
              {/* EXP bar */}
              <div
                className="h-3 rounded-full overflow-hidden mb-3"
                style={{ background: 'rgba(255,255,255,.05)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min((clientData.expPoints % 10000) / 100, 100)}%`,
                    background: 'linear-gradient(90deg, #6d28d9, #a855f7, #00ffc8)',
                  }}
                />
              </div>
              {/* Stat bars */}
              <div className="flex flex-col gap-2">
                {[
                  { label: '⚡ Will', value: clientData.willPower, from: '#a855f7', to: '#c084fc' },
                  { label: '💪 Strength', value: clientData.strength, from: '#00ffc8', to: '#6ee7c8' },
                  { label: '❤️ Vitality', value: clientData.vitality, from: '#f472b6', to: '#f9a8d4' },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="grid items-center gap-2"
                    style={{ gridTemplateColumns: '90px 1fr 32px' }}
                  >
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,.45)' }}>
                      {stat.label}
                    </span>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,.05)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(stat.value, 2)}%`,
                          background: `linear-gradient(90deg, ${stat.from}, ${stat.to})`,
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold text-right"
                      style={{ color: stat.to }}
                    >
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-xs" style={{ color: 'rgba(0,255,200,.4)' }}>
            EXP formula: 40% Will · 40% Strength · 20% Vitality
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Workouts', value: '0', sub: 'this month' },
            { label: 'Streak', value: '🔥 0', sub: 'days' },
            { label: 'Waist', value: clientData.waistCurrent ? `${clientData.waistCurrent}"` : '—', sub: 'current' },
            { label: 'Goal', value: clientData.waistGoal ? `${clientData.waistGoal}"` : '—', sub: 'target' },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-lg p-3"
              style={{
                background: 'rgba(168,85,247,.05)',
                border: '1px solid rgba(168,85,247,.13)',
              }}
            >
              <div
                className="text-xs tracking-widest mb-1"
                style={{ color: 'rgba(192,132,252,.48)' }}
              >
                {stat.label.toUpperCase()}
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: '#e9d5ff', fontFamily: 'Courier New, monospace' }}
              >
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
            <a href="/dashboard/client/meals" style={{
              fontSize: '0.68rem', fontWeight: 700, color: '#6ee7c8',
              textDecoration: 'none', letterSpacing: '0.08em',
            }}>
              LOG MEALS →
            </a>
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
            <button
              className="mt-3 px-4 py-2 text-xs font-bold tracking-widest rounded transition-all"
              style={{
                background: 'rgba(0,255,200,.07)',
                border: '1px solid rgba(0,255,200,.32)',
                color: '#6ee7c8',
                fontFamily: 'Courier New, monospace',
                cursor: 'pointer',
              }}
            >
              LOG WORKOUT
            </button>
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

            <a href="/dashboard/client/photos"
              className="text-xs font-bold tracking-widest"
              style={{ color: '#f472b6', textDecoration: 'none' }}
            >
              MANAGE →
            </a>
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
                    <p style={{ fontSize: '1.5rem', margin: '0 0 4px' }}>📷</p>
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
              🏆 TRANSFORMATION IN PROGRESS
            </p>
          )}
          {!clientData.beforePhoto && !clientData.afterPhoto && (

            <a href="/dashboard/client/photos"
              className="mt-3 block text-center px-4 py-2 text-xs font-bold tracking-widest rounded"
              style={{
                background: 'rgba(244,114,182,.07)',
                border: '1px solid rgba(244,114,182,.32)',
                color: '#f472b6',
                textDecoration: 'none',
              }}
            >
              + UPLOAD YOUR FIRST PHOTO
            </a>
          )}
        </div>
      </main>
    </div>
  );
}