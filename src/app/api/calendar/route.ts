import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }          from 'next-auth';
import { authOptions }               from '@/lib/auth/config';
import { connectDB }                 from '@/lib/db/mongoose';
import CalendarEventModel            from '@/lib/db/models/CalendarEvent';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') ?? session.user.id;
  const month  = searchParams.get('month'); // YYYY-MM

  await connectDB();

  const query: Record<string, unknown> = { userId };
  if (month) query.date = { $regex: `^${month}` };

  const events = await CalendarEventModel.find(query).sort({ date: 1 }).lean();
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { date, type, title, notes, userId: targetUserId } = await req.json() as {
    date:      string;
    type:      string;
    title:     string;
    notes?:    string;
    userId?:   string;
  };

  const userId = targetUserId ?? session.user.id;
  if (!date || !title) return NextResponse.json({ error: 'date and title required' }, { status: 400 });

  await connectDB();

  const event = await CalendarEventModel.create({ userId, date, type: type ?? 'note', title, notes });
  return NextResponse.json({ event }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json() as { id: string };
  await connectDB();
  await CalendarEventModel.findOneAndDelete({ _id: id, userId: session.user.id });
  return NextResponse.json({ ok: true });
}