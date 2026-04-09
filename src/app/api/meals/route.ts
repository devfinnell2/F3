// ─────────────────────────────────────────────
//  F3 — Meals API
//  GET  /api/meals   trainer: all client meal plans
//  POST /api/meals   trainer: create/update meal plan
// ─────────────────────────────────────────────

import { NextResponse }     from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth/config';
import { connectDB }        from '@/lib/db/mongoose';
import MealPlanModel        from '@/lib/db/models/MealPlan';
import UserModel            from '@/lib/db/models/User';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  if (session.user.role !== 'trainer' && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Trainer access required.' }, { status: 403 });
  }

  try {
    await connectDB();

    const mealPlans = await MealPlanModel.find({
      trainerId: session.user.id,
    }).lean();

    return NextResponse.json({ mealPlans }, { status: 200 });

  } catch (error) {
    console.error('[GET /api/meals] error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  if (session.user.role !== 'trainer' && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Trainer access required.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { clientId, meals, targetMacros } = body;

    if (!clientId || !meals || !Array.isArray(meals)) {
      return NextResponse.json(
        { error: 'clientId and meals array are required.' },
        { status: 400 }
      );
    }

    await connectDB();

    // ── Verify client belongs to this trainer ──
    const client = await UserModel.findOne({
      _id:       clientId,
      trainerId: session.user.id,
      role:      'client',
    }).lean();

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found or not assigned to you.' },
        { status: 404 }
      );
    }

    const mealPlan = await MealPlanModel.findOneAndUpdate(
      { clientId, trainerId: session.user.id },
      {
        $set: {
          clientId,
          trainerId: session.user.id,
          meals,
          targetMacros: targetMacros ?? {
            calories: 0,
            protein:  0,
            carbs:    0,
            fats:     0,
          },
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      { message: 'Meal plan saved.', mealPlan },
      { status: 201 }
    );

  } catch (error) {
    console.error('[POST /api/meals] error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}