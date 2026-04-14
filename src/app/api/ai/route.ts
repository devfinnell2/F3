// ─────────────────────────────────────────────
//  F3 — AI Chat API Route
//  POST /api/ai
//  Trainer-only. Streams responses from Groq.
// ─────────────────────────────────────────────
import WorkoutModel    from '@/lib/db/models/Workout';
import MealPlanModel   from '@/lib/db/models/MealPlan';
import UserModel       from '@/lib/db/models/User';
import { NextResponse }     from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth/config';
import { connectDB }        from '@/lib/db/mongoose';
import groq, { GROQ_MODELS } from '@/lib/ai/groq';
import { buildChatMessages } from '@/lib/ai/prompt';
import AILogModel            from '@/lib/db/models/AILog';
import ClientProfileModel    from '@/lib/db/models/ClientProfile';
import type { ClientContext } from '@/lib/ai/prompt';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  if (session.user.role !== 'trainer' && session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'AI access is restricted to certified trainers.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const {
      message,
      clientId,
      conversationHistory = [],
    } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required.' },
        { status: 400 }
      );
    }

    await connectDB();

    // ── Fetch client context if clientId provided ──
    let clientContext: ClientContext | null = null;

    if (clientId) {
      const profile = await ClientProfileModel.findOne({
        userId:    clientId,
        trainerId: session.user.id,
      }).lean();

      if (profile) {
        clientContext = {
          name:         clientId,
          currentLevel: profile.currentLevel ?? 0,
          expPoints:    profile.expPoints     ?? 0,
          goalType:     profile.goalType      ?? 'general_fitness',
          willPower:    0,
          strength:     0,
          vitality:     0,
          injuries:     profile.injuries     ?? undefined,
          dietType:     profile.dietType     ?? undefined,
          waistStart:   profile.waistStart   ?? null,
          waistGoal:    profile.waistGoal    ?? null,
        };
      }
    }

    // ── Build messages ──────────────────────────
    const messages = buildChatMessages({
      message,
      clientContext,
      conversationHistory,
    });

    // ── Call Groq ───────────────────────────────
    const completion = await groq.chat.completions.create({
      model:       GROQ_MODELS.coach,
      messages,
      temperature: 0.7,
      max_tokens:  1024,
    });

    const output = completion.choices[0]?.message?.content ?? '';

    // ── Log to database ─────────────────────────
    await AILogModel.create({
      trainerId: session.user.id,
      clientId:  clientId ?? undefined,
      input:     message,
      output,
      tokensUsed: completion.usage?.total_tokens ?? 0,
    });

    // ── Detect and execute ACTION_JSON ──────────
    let actionResult: string | null = null;
    let cleanOutput = output;

    const actionMatch = output.match(/ACTION_JSON:\s*(\{[\s\S]*?\})\s*$/);
    if (actionMatch) {
      // Strip action from visible output
      cleanOutput = output.replace(/ACTION_JSON:\s*\{[\s\S]*?\}\s*$/, '').trim();
      try {
        const action = JSON.parse(actionMatch[1]);
        const targetId = action.target === 'self'
          ? session.user.id
          : (clientId ?? session.user.id);

        if (action.action === 'update_profile') {
          // Map data fields to ClientProfile fields
          const allowed = [
            'goalType','goalWeight','goalDate','injuries','dietType',
            'waistStart','waistGoal','waistCurrent','height','age',
          ];
          const update: Record<string, unknown> = {};
          for (const key of allowed) {
            if (action.data[key] !== undefined) update[key] = action.data[key];
          }
          if (Object.keys(update).length) {
            await ClientProfileModel.findOneAndUpdate(
              { userId: targetId },
              update,
              { upsert: true, new: true }
            );
            actionResult = `✅ Profile updated: ${Object.keys(update).join(', ')}`;
          }
        }

        if (action.action === 'update_workout') {
          if (action.data?.plan?.length) {
            await WorkoutModel.findOneAndUpdate(
              { clientId: targetId },
              { clientId: targetId, trainerId: session.user.id, plan: action.data.plan },
              { upsert: true, new: true }
            );
            actionResult = `✅ Workout plan saved — ${action.data.plan.length} day(s)`;
          }
        }

        if (action.action === 'update_meal_targets') {
          const { calories, protein, carbs, fats } = action.data ?? {};
          if (calories && protein && carbs && fats) {
            await MealPlanModel.findOneAndUpdate(
              { clientId: targetId },
              {
                clientId:     targetId,
                trainerId:    session.user.id,
                targetMacros: { calories, protein, carbs, fats },
              },
              { upsert: true, new: true }
            );
            actionResult = `✅ Macro targets saved — ${calories}kcal | P:${protein}g C:${carbs}g F:${fats}g`;
          }
        }

      } catch (err) {
        console.error('[AI action parse error]', err);
        actionResult = '⚠️ Action detected but could not be executed.';
      }
    }

    return NextResponse.json({ output: cleanOutput, actionResult }, { status: 200 });

  } catch (error) {
    console.error('[POST /api/ai] error:', error);
    return NextResponse.json(
      { error: 'AI request failed. Please try again.' },
      { status: 500 }
    );
  }
}