// ─────────────────────────────────────────────
//  POST /api/notifications/triggers
//  Called by cron (Vercel cron or manual) daily
//  Checks all clients for missed workouts,
//  low macros, and level-up events
// ─────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { connectDB }                 from '@/lib/db/mongoose';
import UserModel                     from '@/lib/db/models/User';
import WorkoutModel                  from '@/lib/db/models/Workout';
import MealPlanModel                 from '@/lib/db/models/MealPlan';
import ClientProfileModel            from '@/lib/db/models/ClientProfile';
import { sendNotification }          from '@/lib/notifications/push';

// Protect with a secret so only your cron can call it
const CRON_SECRET = process.env.CRON_SECRET ?? 'f3-cron-secret';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('x-cron-secret');
  if (auth !== CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const clients = await UserModel.find({ role: 'client', status: 'active' }).lean();
  const results: string[] = [];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  for (const client of clients) {
    const clientId = client._id.toString();

    // ── 1. Missed workout check ──────────────
    const workout = await WorkoutModel.findOne({ clientId }).lean();
    if (workout?.plan?.length) {
      const loggedYesterday = workout.logs?.some((log: any) => {
        const logDate = new Date(log.date);
        return logDate.toDateString() === yesterday.toDateString();
      });
      if (!loggedYesterday) {
        await sendNotification(clientId, 'missed_workout', {
          title: '⚠️ Missed Workout',
          body:  'You didn\'t log a workout yesterday. Get back on track today — your trainer is watching! 💪',
          url:   '/dashboard/client/workout',
        });
        results.push(`missed_workout → ${client.name}`);
      }
    }

    // ── 2. Low macro compliance check ────────
    const mealPlan = await MealPlanModel.findOne({ clientId }).lean();
    if (mealPlan?.targetMacros?.calories && mealPlan.logs?.length) {
      const latestLog = mealPlan.logs[mealPlan.logs.length - 1] as any;
      const logDate   = new Date(latestLog.date);
      const isYesterday = logDate.toDateString() === yesterday.toDateString();

      if (isYesterday) {
        const ratio = latestLog.totalMacros.calories / mealPlan.targetMacros.calories;
        if (ratio < 0.6) {
          await sendNotification(clientId, 'low_macros', {
            title: '🍽️ Low Calorie Intake',
            body:  `You only hit ${Math.round(ratio * 100)}% of your calorie target yesterday. Fuel your body properly!`,
            url:   '/dashboard/client/meals',
          });
          results.push(`low_macros → ${client.name}`);
        }
      }
    }

    // ── 3. Level-up check ────────────────────
    const profile = await ClientProfileModel.findOne({ userId: clientId }).lean();
    if (profile) {
      const expectedLevel = Math.floor((profile.expPoints ?? 0) / 10000);
      if (expectedLevel > (profile.currentLevel ?? 0)) {
        await ClientProfileModel.findOneAndUpdate(
          { userId: clientId },
          { currentLevel: expectedLevel }
        );
        await sendNotification(clientId, 'level_up', {
          title: `🏆 LEVEL UP! You're now Level ${expectedLevel}`,
          body:  'Your hard work is paying off. Keep pushing — your trainer is proud of you!',
          url:   '/dashboard/client',
        });
        results.push(`level_up → ${client.name}`);
      }
    }
  }

  return NextResponse.json({ triggered: results.length, results });
}