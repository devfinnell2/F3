// ─────────────────────────────────────────────
//  F3 — Client Workout View Page
//  Client sees their assigned workout plan
// ─────────────────────────────────────────────

import { getServerSession }  from 'next-auth';
import { authOptions }       from '@/lib/auth/config';
import { redirect }          from 'next/navigation';
import { connectDB }         from '@/lib/db/mongoose';
import WorkoutModel          from '@/lib/db/models/Workout';
import ClientProfileModel    from '@/lib/db/models/ClientProfile';
import UserModel             from '@/lib/db/models/User';
import ClientSidebar         from '@/components/client/ClientSidebar';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default async function ClientWorkoutPage() {
  const session = await getServerSession(authOptions);
  if (!session)                redirect('/login');
  if (session.user.role === 'trainer') redirect('/dashboard/trainer');

  await connectDB();

  const workout = await WorkoutModel.findOne({
    clientId: session.user.id,
  }).lean();

  const profile = await ClientProfileModel.findOne({
    userId: session.user.id,
  }).lean();

  const trainer = profile?.trainerId
    ? await UserModel.findById(profile.trainerId)
        .select('name avatarInitials tier')
        .lean()
    : null;

  const clientData = {
    name:           session.user.name  ?? 'Client',
    email:          session.user.email ?? '',
    avatarInitials: (session.user.name ?? 'C')
      .split(' ')
      .map((p: string) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
    currentLevel:  profile?.currentLevel ?? 0,
    expPoints:     profile?.expPoints    ?? 0,
    willPower:     0,
    strength:      0,
    vitality:      0,
    goalType:      profile?.goalType     ?? 'general_fitness',
    waistStart:    profile?.waistStart   ?? null,
    waistGoal:     profile?.waistGoal    ?? null,
    waistCurrent:  profile?.waistCurrent ?? null,
    weightHistory: profile?.weightHistory ?? [],
  };

  const trainerData = trainer
    ? {
        name:           (trainer as any).name,
        avatarInitials: (trainer as any).avatarInitials ?? '??',
        tier:           (trainer as any).tier ?? 'pro',
      }
    : null;


  const sidebar = (
    <ClientSidebar
        client={clientData}
        trainer={trainerData}
        activeItem="workout"
        unreadCount={0}
      />
  );
  return (
    <DashboardLayout sidebar={sidebar} accentColor="#00ffc8">
      

      <main
        className="flex-1 p-6 overflow-y-auto"
        style={{ color: '#e0d8ff', fontFamily: 'Courier New, monospace' }}
      >
        <h1
          className="text-2xl font-bold tracking-widest mb-2"
          style={{ color: '#d8b4fe' }}
        >
          MY WORKOUT PLAN
        </h1>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,.32)' }}>
          Assigned by your trainer. Complete each session and log your sets.
        </p>

        {!workout || workout.plan.length === 0 ? (
          <div
            className="rounded-lg p-8 text-center"
            style={{
              background: 'rgba(255,255,255,.035)',
              border:     '1px solid rgba(168,85,247,.16)',
            }}
          >
            <div className="text-lg mb-2" style={{ color: 'rgba(168,85,247,.5)' }}>
              NO WORKOUT ASSIGNED YET
            </div>
            <div className="text-sm" style={{ color: 'rgba(255,255,255,.28)' }}>
              Your trainer will assign your plan soon.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {workout.plan.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className="rounded-lg overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,.025)',
                  border:     '1px solid rgba(168,85,247,.14)',
                }}
              >
                {/* Day header */}
                <div
                  className="px-4 py-3"
                  style={{ background: 'rgba(168,85,247,.06)' }}
                >
                  <div
                    className="font-bold tracking-widest text-sm"
                    style={{ color: '#d8b4fe' }}
                  >
                    {day.dayLabel.toUpperCase()}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(168,85,247,.4)' }}>
                    {day.exercises.length} exercises
                  </div>
                </div>

                {/* Exercises */}
                <div className="p-4">
                  {day.exercises.length === 0 ? (
                    <div
                      className="text-sm"
                      style={{ color: 'rgba(255,255,255,.28)' }}
                    >
                      Rest day.
                    </div>
                  ) : (
                    <>
                      {/* Header row */}
                      <div
                        className="grid gap-3 mb-2 text-xs tracking-wide uppercase pb-2"
                        style={{
                          gridTemplateColumns: '1fr 70px 80px 90px 70px',
                          color:        'rgba(168,85,247,.4)',
                          borderBottom: '1px solid rgba(168,85,247,.08)',
                        }}
                      >
                        <span>Exercise</span>
                        <span>Sets × Reps</span>
                        <span>Weight</span>
                        <span>Tempo</span>
                        <span>Rest</span>
                      </div>

                      {/* Exercise rows */}
                      {day.exercises.map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          className="grid gap-3 py-2 items-center"
                          style={{
                            gridTemplateColumns: '1fr 70px 80px 90px 70px',
                            borderBottom: exIdx < day.exercises.length - 1
                              ? '1px solid rgba(168,85,247,.07)'
                              : 'none',
                          }}
                        >
                          <span
                            className="font-bold"
                            style={{ color: '#e0d8ff', fontSize: '15px' }}
                          >
                            {ex.name}
                          </span>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded text-center"
                            style={{
                              background: 'rgba(168,85,247,.1)',
                              border:     '1px solid rgba(168,85,247,.3)',
                              color:      '#d8b4fe',
                            }}
                          >
                            {ex.sets}×{ex.reps}
                          </span>
                          <span
                            className="text-sm font-bold"
                            style={{ color: '#fbbf24' }}
                          >
                            {ex.weight || '—'}
                          </span>
                          <span
                            className="text-sm"
                            style={{ color: 'rgba(255,255,255,.45)' }}
                          >
                            {ex.tempo || '—'}
                          </span>
                          <span
                            className="text-sm"
                            style={{ color: 'rgba(255,255,255,.45)' }}
                          >
                            {ex.rest || '—'}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Log workout button */}
            <button
              className="self-start px-4 py-2 text-sm font-bold tracking-widest rounded transition-all"
              style={{
                background: 'rgba(0,255,200,.07)',
                border:     '1px solid rgba(0,255,200,.32)',
                color:      '#6ee7c8',
                fontFamily: 'Courier New, monospace',
                cursor:     'pointer',
              }}
            >
              LOG TODAY'S WORKOUT
            </button>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}