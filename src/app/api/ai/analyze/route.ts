import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }          from 'next-auth';
import { authOptions }               from '@/lib/auth/config';
import { connectDB }                 from '@/lib/db/mongoose';
import ClientModel                   from '@/lib/db/models/ClientProfile';
import WorkoutModel                  from '@/lib/db/models/Workout';
import MealPlanModel                 from '@/lib/db/models/MealPlan';
import AIProposalModel               from '@/lib/db/models/AIProposal';
import UserModel                     from '@/lib/db/models/User';

// ── Groq AI client (same as Phase 2) ────────────────────────────────────────
async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      Authorization:   `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model:       'llama3-70b-8192',
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'trainer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const trainerId = session.user.id;

  // ── Fetch all clients for this trainer ──────────────────────────────────
  const clients = await ClientModel.find({ trainerId }).lean();
  if (!clients.length) {
    return NextResponse.json({ proposals: [] });
  }

  const newProposals: object[] = [];

  for (const client of clients) {
    const user = await UserModel.findById(client.userId).lean();
    if (!user) continue;

    const clientName = user.name;
    const clientId   = client.userId.toString();

    // ── Skip if a pending proposal already exists for this client ──────────
    const existingPending = await AIProposalModel.findOne({
      clientId,
      status: 'pending',
    });
    if (existingPending) continue;

    // ── Gather data ────────────────────────────────────────────────────────
    const workout  = await WorkoutModel.findOne({ clientId }).lean();
    const mealPlan = await MealPlanModel.findOne({ clientId }).lean();

    const weightHistory = client.weightHistory ?? [];
    const recentLogs    = workout?.logs?.slice(-14) ?? [];
    const recentMeals   = mealPlan?.logs?.slice(-7)  ?? [];

    // ── Build context snapshot ─────────────────────────────────────────────
    const snapshot = {
     client: {
        name:        clientName,
        goal:        client.goalType,
        weight:      weightHistory.at(-1)?.weight ?? 'unknown',
        weightTrend: weightHistory.slice(-4).map((w: { weight: number }) => w.weight),
        waistStart:  client.waistStart,
        waistGoal:   client.waistGoal,
      },
      workoutAdherence: {
        scheduledDays:  workout?.plan?.length ?? 0,
        loggedLast14:   recentLogs.length,
      },
      macroAdherence: {
        targetCalories: mealPlan?.targetMacros?.calories ?? 0,
        avgCaloriesLast7: recentMeals.length
          ? Math.round(
              recentMeals.reduce((s: number, l: {totalMacros?: {calories?: number}}) =>
                s + (l.totalMacros?.calories ?? 0), 0) / recentMeals.length
            )
          : 0,
      },
    };

    // ── Ask AI to analyze ──────────────────────────────────────────────────
    const systemPrompt = `You are an ISSA-certified AI fitness coach assistant.
Analyze the client snapshot and return ONLY a valid JSON object — no markdown, no preamble.

Return this exact shape:
{
  "type": "plateau_detected" | "low_adherence" | "macro_drift" | "overtraining" | "goal_ahead" | "none",
  "summary": "one sentence (max 12 words)",
  "detail": "2-3 sentences explaining the issue clearly",
  "action": "specific, actionable recommendation for the trainer (1-2 sentences)"
}

If everything looks healthy, return { "type": "none" }.
Be kind, direct, and focused on health — never body-shame.`;

    const userPrompt = `Client snapshot:\n${JSON.stringify(snapshot, null, 2)}`;

    try {
      const raw    = await callGroq(systemPrompt, userPrompt);
      const clean  = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      if (parsed.type === 'none') continue;

      const proposal = await AIProposalModel.create({
        trainerId,
        clientId,
        clientName,
        type:    parsed.type,
        summary: parsed.summary,
        detail:  parsed.detail,
        action:  parsed.action,
        status:  'pending',
      });

      newProposals.push(proposal);
    } catch {
      // skip bad AI responses silently
      continue;
    }
  }

  return NextResponse.json({ proposals: newProposals, count: newProposals.length });
}