// ─────────────────────────────────────────────
//  F3 — Clients API — Per Client
//  GET    /api/clients/[clientId]  get profile
//  PATCH  /api/clients/[clientId]  update profile
//  DELETE /api/clients/[clientId]  remove from trainer
// ─────────────────────────────────────────────

import { NextResponse }     from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth/config';
import { connectDB }        from '@/lib/db/mongoose';
import UserModel            from '@/lib/db/models/User';
import ClientProfileModel   from '@/lib/db/models/ClientProfile';

interface RouteParams {
  params: Promise<{ clientId: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { clientId } = await params;

  // Client can only see their own profile
  if (
    session.user.role === 'client' &&
    session.user.id !== clientId
  ) {
    return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
  }

  try {
    await connectDB();

    const [user, profile] = await Promise.all([
      UserModel.findById(clientId).select('-passwordHash').lean(),
      ClientProfileModel.findOne({ userId: clientId }).lean(),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
    }

    return NextResponse.json({ user, profile }, { status: 200 });

  } catch (error) {
    console.error('[GET /api/clients/:id] error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  if (session.user.role !== 'trainer' && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Trainer access required.' }, { status: 403 });
  }

  const { clientId } = await params;

  try {
    const body = await request.json();

    await connectDB();

    const profile = await ClientProfileModel.findOneAndUpdate(
      { userId: clientId, trainerId: session.user.id },
      { $set: body },
      { new: true }
    );

    if (!profile) {
      return NextResponse.json({ error: 'Client profile not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated.', profile }, { status: 200 });

  } catch (error) {
    console.error('[PATCH /api/clients/:id] error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

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

    // ── Verify client belongs to this trainer ───
    const client = await UserModel.findOne({
      _id:       clientId,
      trainerId: session.user.id,
    }).lean();

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found or not assigned to you.' },
        { status: 404 }
      );
    }

    // ── Remove trainer assignment ────────────────
    await UserModel.findByIdAndUpdate(clientId, {
      $unset: { trainerId: 1 },
    });

    return NextResponse.json(
      { message: 'Client removed from your roster.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('[DELETE /api/clients/:id] error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}