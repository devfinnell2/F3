// ─────────────────────────────────────────────
//  F3 — Meals API — Per Client
//  GET  /api/meals/[clientId]   get meal plan + logs
//  POST /api/meals/[clientId]   log a meal entry
// ─────────────────────────────────────────────

import { NextResponse }     from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth/config';
import { connectDB }        from '@/lib/db/mongoose';
import MealPlanModel        from '@/lib/db/models/MealPlan';

interface RouteParams {
  params: Promise<{ clientId: string }>;
}

// ── GET — fetch meal plan + today's logs ──────
export async function GET(_req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { clientId } = await params;

  // Client can only fetch their own meals
  if (
    session.user.role === 'client' &&
    session.user.id !== clientId
  ) {
    return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
  }

  try {
    await connectDB();

    const mealPlan = await MealPlanModel.findOne({ clientId }).lean();

    if (!mealPlan) {
      return NextResponse.json({ mealPlan: null }, { status: 200 });
    }

    return NextResponse.json({ mealPlan }, { status: 200 });

  } catch (error) {
    console.error('[GET /api/meals/:clientId] error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// ── POST — log a meal for today ───────────────
export async function POST(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { clientId } = await params;

  // Only the client themselves or their trainer can log meals
  if (
    session.user.role === 'client' &&
    session.user.id !== clientId
  ) {
    return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { meals, totalMacros } = body;

    if (!meals || !Array.isArray(meals)) {
      return NextResponse.json(
        { error: 'meals array is required.' },
        { status: 400 }
      );
    }

    await connectDB();

    // ── Push today's log entry ─────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mealPlan = await MealPlanModel.findOneAndUpdate(
      { clientId },
      {
        $push: {
          logs: {
            date:        new Date(),
            meals,
            totalMacros: totalMacros ?? {
              calories: 0,
              protein:  0,
              carbs:    0,
              fats:     0,
            },
          },
        },
      },
      { new: true }
    );

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'No meal plan found. Ask your trainer to create one first.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Meal logged.', mealPlan },
      { status: 201 }
    );

  } catch (error) {
    console.error('[POST /api/meals/:clientId] error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}