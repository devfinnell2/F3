import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }          from 'next-auth';
import { authOptions }               from '@/lib/auth/config';
import { connectDB }                 from '@/lib/db/mongoose';
import NotificationModel             from '@/lib/db/models/Notification';

// GET — fetch my notifications
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  const notifications = await NotificationModel
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  const unread = notifications.filter(n => !n.read).length;

  return NextResponse.json({ notifications, unread });
}

// PATCH — mark all as read
export async function PATCH(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  await NotificationModel.updateMany(
    { userId: session.user.id, read: false },
    { read: true }
  );

  return NextResponse.json({ ok: true });
}