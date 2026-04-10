// ─────────────────────────────────────────────
//  F3 — AI Macro Correction Route
//  POST /api/ai/macros
//  Both trainers and clients can call this.
//  Analyzes logged meals vs targets and
//  suggests corrections for remaining meals.
// ─────────────────────────────────────────────

import { NextResponse }      from 'next/server';
import { getServerSession }  from 'next-auth';
import { authOptions }       from '@/lib/auth/config';
import { connectDB }         from '@/lib/db/mongoose';
import groq, { GROQ_MODELS } from '@/lib/ai/groq';
import { buildMacroPrompt }  from '@/lib/ai/prompt';
import MealPlanModel         from '@/lib/db/models/MealPlan';
import UserModel             from '@/lib/db/models/User';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { clientId, loggedMeals } = body;

    if (!clientId || !loggedMeals) {
      return NextResponse.json(
        { error: 'clientId and loggedMeals are required.' },
        { status: 400 }
      );
    }

    // ── Access control ──────────────────────────
    // Client can only correct their own macros
    // Trainer can correct any assigned client
    if (
      session.user.role === 'client' &&
      session.user.id !== clientId
    ) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    await connectDB();

    // ── Get meal plan targets ───────────────────
    const mealPlan = await MealPlanModel.findOne({ clientId }).lean();

    const targets = mealPlan?.targetMacros ?? {
      calories: 2000,
      protein:  150,
      carbs:    200,
      fats:     65,
    };

    // ── Calculate logged totals ─────────────────
    const logged = loggedMeals.reduce(
      (acc: { calories: number; protein: number; carbs: number; fats: number }, meal: any) => {
        acc.calories += meal.calories ?? 0;
        acc.protein  += meal.protein  ?? 0;
        acc.carbs    += meal.carbs    ?? 0;
        acc.fats     += meal.fats     ?? 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    // ── Calculate remaining ─────────────────────
    const remaining = {
      calories: Math.max(targets.calories - logged.calories, 0),
      protein:  Math.max(targets.protein  - logged.protein,  0),
      carbs:    Math.max(targets.carbs    - logged.carbs,    0),
      fats:     Math.max(targets.fats     - logged.fats,     0),
    };

    // ── Get client name ─────────────────────────
    const client = await UserModel.findById(clientId).select('name').lean();
    const clientName = (client as any)?.name ?? 'Client';

    // ── Build prompt ────────────────────────────
    const messages = buildMacroPrompt({
      loggedMeals,
      targets,
      remaining,
      clientName,
    });

    // ── Call Groq ───────────────────────────────
    const completion = await groq.chat.completions.create({
      model:       GROQ_MODELS.fast,
      messages,
      temperature: 0.5,
      max_tokens:  512,
    });

    const suggestion = completion.choices[0]?.message?.content ?? '';

    return NextResponse.json(
      {
        suggestion,
        logged,
        targets,
        remaining,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[POST /api/ai/macros] error:', error);
    return NextResponse.json(
      { error: 'Macro correction failed.' },
      { status: 500 }
    );
  }
}