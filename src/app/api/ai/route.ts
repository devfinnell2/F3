// ─────────────────────────────────────────────
//  F3 — AI Chat API Route
//  POST /api/ai
//  Trainer-only. Streams responses from Groq.
// ─────────────────────────────────────────────

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
      max_tokens:  1024,
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

    return NextResponse.json({ output }, { status: 200 });

  } catch (error) {
    console.error('[POST /api/ai] error:', error);
    return NextResponse.json(
      { error: 'AI request failed. Please try again.' },
      { status: 500 }
    );
  }
}