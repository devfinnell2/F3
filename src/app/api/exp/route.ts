// ─────────────────────────────────────────────
//  F3 — EXP Calculation API Route
//  POST /api/exp
//  Calculates and saves updated level/EXP
//  for a client based on their logs.
//  Called by trainers or on a schedule.
// ─────────────────────────────────────────────

import { NextResponse }      from 'next/server';
import { getServerSession }  from 'next-auth';
import { authOptions }       from '@/lib/auth/config';
import { connectDB }         from '@/lib/db/mongoose';
import ClientProfileModel    from '@/lib/db/models/ClientProfile';
import WorkoutModel          from '@/lib/db/models/Workout';
import MealPlanModel         from '@/lib/db/models/MealPlan';
import { calculateLevel }    from '@/lib/exp/calculator';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  if (session.user.role !== 'trainer' && session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Trainer access required.' },
      { status: 403 }
    );
  }

  try {
    const body       = await request.json();
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required.' },
        { status: 400 }
      );
    }

    await connectDB();

    // ── Fetch all data needed ───────────────────
    const [profile, workout, mealPlan] = await Promise.all([
      ClientProfileModel.findOne({ userId: clientId }).lean(),
      WorkoutModel.findOne({ clientId }).lean(),
      MealPlanModel.findOne({ clientId }).lean(),
    ]);

    if (!profile) {
      return NextResponse.json(
        { error: 'Client profile not found.' },
        { status: 404 }
      );
    }

    // ── Build workout adherence ─────────────────
    const workoutsAssigned  = (workout?.plan?.length ?? 0) * 4; // 4 weeks
    const workoutsCompleted = workout?.logs?.length ?? 0;
    const lastLog           = workout?.logs?.[workout.logs.length - 1];
    const lastWorkoutDate   = lastLog?.date ? new Date(lastLog.date) : null;

    // ── Build meal adherence ────────────────────
    const mealsAssigned  = (mealPlan?.meals?.length ?? 0) * 28; // 4 weeks
    const mealsLogged    = mealPlan?.logs?.length ?? 0;

    // ── Build progress data ─────────────────────
    const weightHistory  = profile.weightHistory ?? [];
    const startingWeight = weightHistory[0]?.weight                    ?? null;
    const currentWeight  = weightHistory[weightHistory.length - 1]?.weight ?? null;

    // ── Calculate ───────────────────────────────
    const result = calculateLevel({
      workout: {
        workoutsAssigned,
        workoutsCompleted,
        lastWorkoutDate,
      },
      meals: {
        mealsAssigned,
        mealsLogged,
        avgProteinPct: 70, // Phase 3 — calculate from actual logs
      },
      progress: {
        startingWeight,
        currentWeight,
        goalWeight:    profile.goalWeight    ?? null,
        waistStart:    profile.waistStart    ?? null,
        waistCurrent:  profile.waistCurrent  ?? null,
        waistGoal:     profile.waistGoal     ?? null,
        liftsImproved: 0, // Phase 3 — calculate from 1RM logs
      },
      recovery: {
        restDaysCompleted: 4, // Phase 3 — calculate from calendar
        restDaysAssigned:  4,
        fatigueFlagsCount: 0,
      },
      role:         'client',
      currentLevel: profile.currentLevel ?? 0,
      currentExp:   profile.expPoints    ?? 0,
    });

    // ── Save updated profile ────────────────────
    await ClientProfileModel.findOneAndUpdate(
      { userId: clientId },
      {
        $set: {
          currentLevel: result.newLevel,
          expPoints:    result.totalExp,
        },
      }
    );

    return NextResponse.json(
      {
        ...result,
        message: result.leveledUp
          ? `🎉 ${profile.goalType} — Level Up! Now LVL ${result.newLevel}`
          : `EXP updated. LVL ${result.newLevel}`,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[POST /api/exp] error:', error);
    return NextResponse.json(
      { error: 'EXP calculation failed.' },
      { status: 500 }
    );
  }
}