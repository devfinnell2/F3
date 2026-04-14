// ─────────────────────────────────────────────
//  F3 — Workouts API — Per Client
//  Next.js 15 — params is a Promise
// ─────────────────────────────────────────────

import { NextResponse }      from 'next/server';
import { getServerSession }  from 'next-auth';
import { authOptions }       from '@/lib/auth/config';
import { connectDB }         from '@/lib/db/mongoose';
import WorkoutModel          from '@/lib/db/models/Workout';

interface RouteParams {
  params: Promise<{ clientId: string }>;
}

// ── GET ──────────────────────────────────────
export async function GET(_req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { clientId } = await params;

  if (
    session.user.role === 'client' &&
    session.user.id !== clientId
  ) {
    return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
  }

  try {
    await connectDB();

    const workout = await WorkoutModel.findOne({ clientId }).lean();

    if (!workout) {
      return NextResponse.json({ workout: null }, { status: 200 });
    }

    return NextResponse.json({ workout }, { status: 200 });

  } catch (error) {
    console.error('[GET /api/workouts/:clientId] error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// ── PUT ──────────────────────────────────────
export async function PUT(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  if (session.user.role !== 'trainer' && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Trainer access required.' }, { status: 403 });
  }

  const { clientId } = await params;

  try {
    const body     = await request.json();
    const { plan } = body;

    if (!plan || !Array.isArray(plan)) {
      return NextResponse.json(
        { error: 'plan array is required.' },
        { status: 400 }
      );
    }

    await connectDB();

   // Allow trainers to update their own workout (self-plan) or their clients'
    const workout = await WorkoutModel.findOneAndUpdate(
      {
        clientId,
        $or: [
          { trainerId: session.user.id },
          { clientId:  session.user.id }, // self-workout
        ],
      },
      { $set: { plan, trainerId: session.user.id } },
      { new: true, upsert: true }
    );

    return NextResponse.json(
      { message: 'Plan updated.', workout },
      { status: 200 }
    );

  } catch (error) {
    console.error('[PUT /api/workouts/:clientId] error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
// ── DELETE ────────────────────────────────────
export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  if (session.user.role !== 'trainer' && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Trainer access required.' }, { status: 403 });
  }

  const { clientId } = await params;

  try {
    await connectDB();
    await WorkoutModel.findOneAndDelete({
      clientId,
      $or: [
        { trainerId: session.user.id },
        { clientId:  session.user.id },
      ],
    });
    return NextResponse.json({ message: 'Workout deleted.' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/workouts/:clientId] error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}