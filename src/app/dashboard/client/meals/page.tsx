// ─────────────────────────────────────────────
//  F3 — Client Meals Page
// ─────────────────────────────────────────────

import { getServerSession }  from 'next-auth';
import { authOptions }       from '@/lib/auth/config';
import { redirect }          from 'next/navigation';
import { connectDB }         from '@/lib/db/mongoose';
import MealPlanModel         from '@/lib/db/models/MealPlan';
import ClientProfileModel    from '@/lib/db/models/ClientProfile';
import UserModel             from '@/lib/db/models/User';
import ClientSidebar         from '@/components/client/ClientSidebar';
import MealLogger            from '@/components/shared/MealLogger';
import type { IDailyMacros } from '@/types';

export default async function ClientMealsPage() {
  const session = await getServerSession(authOptions);
  if (!session)                redirect('/login');
  if (session.user.role === 'trainer') redirect('/dashboard/trainer');

  await connectDB();

  const mealPlan = await MealPlanModel.findOne({
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

  const targetMacros: IDailyMacros = mealPlan?.targetMacros
    ? (mealPlan.targetMacros as IDailyMacros)
    : { calories: 0, protein: 0, carbs: 0, fats: 0 };

  const clientData = {
    name:           session.user.name  ?? 'Client',
    email:          session.user.email ?? '',
    avatarInitials: (session.user.name ?? 'C')
      .split(' ')
      .map((p: string) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
    currentLevel:  profile?.currentLevel  ?? 0,
    expPoints:     profile?.expPoints     ?? 0,
    willPower:     0,
    strength:      0,
    vitality:      0,
    goalType:      profile?.goalType      ?? 'general_fitness',
    waistStart:    profile?.waistStart    ?? null,
    waistGoal:     profile?.waistGoal     ?? null,
    waistCurrent:  profile?.waistCurrent  ?? null,
    weightHistory: profile?.weightHistory ?? [],
  };

  const trainerData = trainer
    ? {
        name:           (trainer as any).name,
        avatarInitials: (trainer as any).avatarInitials ?? '??',
        tier:           (trainer as any).tier ?? 'pro',
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
        activeItem="meals"
        unreadCount={0}
      />

      <main
        className="flex-1 p-6 overflow-y-auto"
        style={{ color: '#e0d8ff', fontFamily: 'Courier New, monospace' }}
      >
        <h1
          className="text-2xl font-bold tracking-widest mb-2"
          style={{ color: '#d8b4fe' }}
        >
          LOG MY MEALS
        </h1>
       <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,.32)' }}>
          Log your meals with precise measurements. AI analyzes your macros after logging.
        </p>

        {/* Assigned meal plan reference */}
        {mealPlan && mealPlan.meals.length > 0 && (
          <div
            className="rounded-lg p-4 mb-6"
            style={{
              background: 'rgba(251,191,36,.04)',
              border:     '1px solid rgba(251,191,36,.15)',
            }}
          >
            <div
              className="text-xs tracking-widest mb-3"
              style={{ color: 'rgba(251,191,36,.5)' }}
            >
              MY MEAL PLAN — REFERENCE
            </div>
            <div className="flex flex-col gap-2">
              {mealPlan.meals.map((meal, i) => (
                <div
                  key={i}
                  className="text-sm p-3 rounded"
                  style={{
                    background: 'rgba(0,0,0,.25)',
                    borderLeft: '2px solid rgba(251,191,36,.3)',
                  }}
                >
                  <div
                    className="font-bold mb-1"
                    style={{ color: '#fbbf24', fontSize: '12px' }}
                  >
                    🍽 {meal.mealName} — {meal.mealTime}
                  </div>
                  <div style={{ color: '#e0d8ff' }}>
                    {meal.foods.map((f, fi) => (
                      <span key={fi} style={{ color: 'rgba(255,255,255,.7)' }}>
                        {f.name} {f.amount}{f.unit}
                        {fi < meal.foods.length - 1 ? ' · ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Log today's meals */}
        <div
          className="rounded-lg p-4"
          style={{
            background: 'rgba(255,255,255,.035)',
            border:     '1px solid rgba(168,85,247,.16)',
          }}
        >
          <div
            className="text-xs tracking-widest mb-4"
            style={{ color: 'rgba(0,255,200,.48)' }}
          >
            LOG TODAY'S MEALS
          </div>
          <MealLogger
            clientId={session.user.id}
            targetMacros={targetMacros}
          />
        </div>
      </main>
    </div>
  );
}