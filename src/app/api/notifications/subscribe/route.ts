import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }          from 'next-auth';
import { authOptions }               from '@/lib/auth/config';
import { connectDB }                 from '@/lib/db/mongoose';
import PushSubscriptionModel         from '@/lib/db/models/PushSubscription';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { subscription } = await req.json() as {
    subscription: {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };
  };

  if (!subscription?.endpoint || !subscription?.keys) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }

  await connectDB();

  // Upsert — same endpoint = same device, just update
  await PushSubscriptionModel.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    {
      userId:   session.user.id,
      endpoint: subscription.endpoint,
      keys:     subscription.keys,
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { endpoint } = await req.json() as { endpoint: string };

  await connectDB();
  await PushSubscriptionModel.deleteOne({ endpoint, userId: session.user.id });

  return NextResponse.json({ ok: true });
}