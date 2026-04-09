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

    const workout = await WorkoutModel.findOneAndUpdate(
      { clientId, trainerId: session.user.id },
      { $set: { plan } },
      { new: true }
    );

    if (!workout) {
      return NextResponse.json(
        { error: 'Workout not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Plan updated.', workout },
      { status: 200 }
    );

  } catch (error) {
    console.error('[PUT /api/workouts/:clientId] error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}