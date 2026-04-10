// ─────────────────────────────────────────────
//  F3 — AI Workout Generation Route
//  POST /api/ai/workout
//  Trainer-only. Generates a workout plan
//  for a client. Trainer reviews before pushing.
// ─────────────────────────────────────────────

import { NextResponse }        from 'next/server';
import { getServerSession }    from 'next-auth';
import { authOptions }         from '@/lib/auth/config';
import { connectDB }           from '@/lib/db/mongoose';
import groq, { GROQ_MODELS }   from '@/lib/ai/groq';
import { buildWorkoutPrompt }  from '@/lib/ai/prompt';
import ClientProfileModel      from '@/lib/db/models/ClientProfile';
import UserModel               from '@/lib/db/models/User';
import type { IWorkoutDay }    from '@/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  if (session.user.role !== 'trainer' && session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Trainer access required.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const {
      clientId,
      daysPerWeek = 4,
      sessionMins = 60,
    } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required.' },
        { status: 400 }
      );
    }

    await connectDB();

    // ── Verify client belongs to trainer ────────
    const client = await UserModel.findOne({
      _id:       clientId,
      trainerId: session.user.id,
      role:      'client',
    }).select('name').lean();

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found or not assigned to you.' },
        { status: 404 }
      );
    }

    const profile = await ClientProfileModel.findOne({
      userId: clientId,
    }).lean();

    // ── Build prompt ────────────────────────────
    const messages = buildWorkoutPrompt({
      clientName:  (client as any).name,
      goalType:    profile?.goalType   ?? 'general_fitness',
      level:       profile?.currentLevel ?? 0,
      injuries:    profile?.injuries   ?? undefined,
      daysPerWeek,
      sessionMins,
    });

    // ── Call Groq ───────────────────────────────
    const completion = await groq.chat.completions.create({
      model:       GROQ_MODELS.rag,
      messages,
      temperature: 0.4,
      max_tokens:  2048,
    });

    const raw = completion.choices[0]?.message?.content ?? '';

    // ── Parse JSON response ─────────────────────
    let plan: IWorkoutDay[] = [];

    try {
      // Strip markdown code fences if present
      const cleaned = raw
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleaned);
      plan = parsed.plan ?? [];
    } catch {
      console.error('[AI Workout] JSON parse failed. Raw:', raw);
      return NextResponse.json(
        { error: 'AI returned invalid plan format. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        plan,
        message: 'AI workout generated. Review and save to push to client.',
        raw,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[POST /api/ai/workout] error:', error);
    return NextResponse.json(
      { error: 'Workout generation failed.' },
      { status: 500 }
    );
  }
}