// ─────────────────────────────────────────────
//  F3 — Clients API
//  GET  /api/clients   trainer: list own clients
//  POST /api/clients   trainer: enroll a client
// ─────────────────────────────────────────────

import { NextResponse }     from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth/config';
import { connectDB }        from '@/lib/db/mongoose';
import UserModel            from '@/lib/db/models/User';
import ClientProfileModel   from '@/lib/db/models/ClientProfile';
import { calcStartingLevel } from '@/lib/exp/calculator';

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

    const clients = await UserModel.find({
      role:      'client',
      trainerId: session.user.id,
      status:    'active',
    })
      .select('-passwordHash')
      .lean();

    return NextResponse.json({ clients }, { status: 200 });

  } catch (error) {
    console.error('[GET /api/clients] error:', error);
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
    const {
      clientEmail,
      goalType    = 'general_fitness',
      dietType,
      height,
      age,
      injuries,
      waistStart,
      waistGoal,
      yearsTraining = 0,
      dietQuality   = 5,
      bmi           = 25,
    } = body;

    if (!clientEmail) {
      return NextResponse.json(
        { error: 'Client email is required.' },
        { status: 400 }
      );
    }

    await connectDB();

    // ── Find client by email ────────────────────
    const client = await UserModel.findOne({
      email: clientEmail.toLowerCase().trim(),
      role:  'client',
    }).lean();

    if (!client) {
      return NextResponse.json(
        { error: 'No client account found with that email. Ask them to register first.' },
        { status: 404 }
      );
    }

    // ── Check not already assigned ──────────────
    if (client.trainerId) {
      return NextResponse.json(
        { error: 'This client is already assigned to a trainer.' },
        { status: 409 }
      );
    }

    // ── Assign trainer to client ────────────────
    await UserModel.findByIdAndUpdate(client._id, {
      $set: { trainerId: session.user.id },
    });

    // ── Calculate starting level ────────────────
    const startingLevel = calcStartingLevel({
      bmi,
      yearsTraining,
      dietQuality,
      hasInjuries: !!injuries,
    });

    // ── Create client profile ───────────────────
    await ClientProfileModel.findOneAndUpdate(
      { userId: client._id },
      {
        $setOnInsert: {
          userId:        client._id,
          trainerId:     session.user.id,
          goalType,
          dietType:      dietType   ?? undefined,
          height:        height     ?? undefined,
          age:           age        ?? undefined,
          injuries:      injuries   ?? undefined,
          waistStart:    waistStart ?? undefined,
          waistGoal:     waistGoal  ?? undefined,
          startingLevel,
          currentLevel:  startingLevel,
          expPoints:     startingLevel * 1000,
          weightHistory: [],
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      {
        message:       `${client.name} enrolled successfully. Starting level: ${startingLevel}`,
        clientId:      client._id.toString(),
        clientName:    client.name,
        startingLevel,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('[POST /api/clients] error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}