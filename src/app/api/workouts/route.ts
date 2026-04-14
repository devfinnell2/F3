// ─────────────────────────────────────────────
//  F3 — Workouts API
//  GET  /api/workouts        trainer: list all client workouts
//  POST /api/workouts        trainer: create workout plan
// ─────────────────────────────────────────────

import { NextResponse }      from 'next/server';
import { getServerSession }  from 'next-auth';
import { authOptions }       from '@/lib/auth/config';
import { connectDB }         from '@/lib/db/mongoose';
import WorkoutModel          from '@/lib/db/models/Workout';
import UserModel             from '@/lib/db/models/User';

// ── GET — trainer fetches all their clients' workouts ──
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

    const workouts = await WorkoutModel.find({
      trainerId: session.user.id,
    }).lean();

    return NextResponse.json({ workouts }, { status: 200 });

  } catch (error) {
    console.error('[GET /api/workouts] error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// ── POST — trainer creates a workout plan for a client ──
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
    const { clientId, plan } = body;

    if (!clientId || !plan || !Array.isArray(plan)) {
      return NextResponse.json(
        { error: 'clientId and plan array are required.' },
        { status: 400 }
      );
    }

    await connectDB();

   // ── Allow trainer to save their own workout (self-plan) ──
    const isSelf = clientId === session.user.id;

    if (!isSelf) {
      const client = await UserModel.findOne({
        _id:       clientId,
        trainerId: session.user.id,
        role:      { $in: ['client', 'basic'] },
      }).lean();
      if (!client) {
        return NextResponse.json(
          { error: 'Client not found or not assigned to you.' },
          { status: 404 }
        );
      }
    }

    // ── Upsert — replace plan if one exists ──
    const workout = await WorkoutModel.findOneAndUpdate(
      { clientId, trainerId: session.user.id },
      {
        $set: {
          clientId,
          trainerId: session.user.id,
          plan,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      { message: 'Workout plan saved.', workout },
      { status: 201 }
    );

  } catch (error) {
    console.error('[POST /api/workouts] error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}