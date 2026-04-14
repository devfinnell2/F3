// ─────────────────────────────────────────────
//  F3 — AI Chat API Route
//  POST /api/ai
//  Trainer-only. Streams responses from Groq.
// ─────────────────────────────────────────────
import gemini from '@/lib/ai/gemini';
import CalendarEventModel from '@/lib/db/models/CalendarEvent';
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
      max_tokens:  4096,
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

   // ── Detect update intent and run extraction call ──
    let actionResult: string | null = null;
    let cleanOutput = output;

    // Strip any ACTION_JSON the model still includes (keep output clean)
    const actionIdx = output.lastIndexOf('ACTION_JSON:');
    if (actionIdx !== -1) cleanOutput = output.slice(0, actionIdx).trim();

    // Detect if the trainer is asking to save/push/update something
    const UPDATE_INTENT = /\b(save|push|update|set|add|log|store|put)\b.{0,60}\b(profile|workout|meal|macro|calendar|plan|schedule|supplement)\b/i;
    const hasIntent = UPDATE_INTENT.test(message);

    if (hasIntent) {
     try {
        // ── Second focused call: extract structured data only ──
        const extractionPrompt = `You are a data extraction engine for a fitness app.
The trainer sent this message: "${message}"
The AI responded: "${cleanOutput}"

Based on this conversation, extract the data to save and return ONLY valid JSON, no prose, no markdown.
Use this exact format:
{
  "action": "update_profile" | "update_workout" | "update_meal_targets" | "update_meals" | "log_meal" | "update_calendar",
  "target": "self" | "client",
  "data": { ... }
}

For update_meal_targets: data must have ONLY { calories: number, protein: number, carbs: number, fats: number }
For update_meals: data must have { meals: [{ mealName, mealTime, foods: [{ name, amount, unit, calories, protein, carbs, fats }] }] }
For update_workout: data must have { plan: [{ dayLabel, exercises: [{ name, sets, reps, weight, tempo, rest }] }] }
For update_calendar: data must have { events: [{ date: "YYYY-MM-DD", type: "workout"|"meal"|"rest"|"cardio"|"note", title, notes }] }
For log_meal: data must have { meals: [...], totalMacros: { calories, protein, carbs, fats } }
For update_profile: data must have only valid profile fields.

Today's date: ${new Date().toISOString().split('T')[0]}
Return ONLY the JSON object. No other text.`;

        const extractionRes = await gemini.chat.completions.create({
          model:       'gemini-2.0-flash',
          temperature: 0.1,
          max_tokens:  4096,
          messages: [
            { role: 'system', content: 'You are a JSON extraction engine. Return only valid JSON. No prose. No markdown.' },
            { role: 'user',   content: extractionPrompt },
          ],
        });

        const rawJson = extractionRes.choices[0]?.message?.content
          ?.replace(/```json|```/g, '').trim() ?? '';

        const action = JSON.parse(rawJson);
        const targetId = action.target === 'self'
          ? session.user.id
          : (clientId ?? session.user.id);

        if (action.action === 'update_profile') {
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
          const d = action.data ?? {};
          const calories = d.calories ?? d.target_calories ?? null;
          const protein  = d.protein  ?? null;
          const carbs    = d.carbs    ?? null;
          const fats     = d.fats     ?? null;
          if (calories && protein && carbs && fats) {
            await MealPlanModel.findOneAndUpdate(
              { clientId: targetId },
              {
                $set: {
                  clientId:     targetId,
                  trainerId:    session.user.id,
                  targetMacros: { calories, protein, carbs, fats },
                },
              },
              { upsert: true, new: true }
            );
            actionResult = `✅ Macro targets saved — ${calories}kcal | P:${protein}g C:${carbs}g F:${fats}g`;
          }
        }

        if (action.action === 'update_meals') {
          const meals = action.data?.meals;
          if (Array.isArray(meals) && meals.length) {
            await MealPlanModel.findOneAndUpdate(
              { clientId: targetId },
              {
                $set: {
                  clientId:  targetId,
                  trainerId: session.user.id,
                  meals,
                },
              },
              { upsert: true, new: true }
            );
            actionResult = `✅ Meal plan updated — ${meals.length} meal(s) saved`;
          }
        }

        if (action.action === 'log_meal') {
          const { meals, totalMacros } = action.data ?? {};
          if (Array.isArray(meals) && meals.length) {
            await MealPlanModel.findOneAndUpdate(
              { clientId: targetId },
              {
                $push: {
                  logs: {
                    date: new Date(),
                    meals,
                    totalMacros: totalMacros ?? { calories: 0, protein: 0, carbs: 0, fats: 0 },
                  },
                },
                $setOnInsert: {
                  clientId:     targetId,
                  trainerId:    session.user.id,
                  targetMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 },
                },
              },
              { upsert: true, new: true }
            );
            actionResult = `✅ Meal logged for today — ${meals.length} meal(s)`;
          }
        }

        if (action.action === 'update_calendar') {
          const calEvents = action.data?.events;
          if (Array.isArray(calEvents) && calEvents.length) {
            await Promise.all(
              calEvents.map((ev: { date: string; type: string; title: string; notes?: string }) =>
                CalendarEventModel.create({
                  userId: targetId,
                  date:   ev.date,
                  type:   ev.type ?? 'note',
                  title:  ev.title,
                  notes:  ev.notes,
                }).catch(() => null) // skip duplicates silently
              )
            );
            actionResult = `✅ Calendar updated — ${calEvents.length} event(s) added`;
          }
        }

        if (action.action === 'update_meal_targets') {
          const { calories, protein, carbs, fats } = action.data ?? {};
          if (calories && protein && carbs && fats) {
            await MealPlanModel.findOneAndUpdate(
              { clientId: targetId },
              {
                $set: {
                  clientId:     targetId,
                  trainerId:    session.user.id,
                  targetMacros: { calories, protein, carbs, fats },
                },
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