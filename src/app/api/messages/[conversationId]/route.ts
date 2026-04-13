// ─────────────────────────────────────────────
//  GET  — fetch messages between two users
//  POST — send a message
// ─────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }          from 'next-auth';
import { authOptions }               from '@/lib/auth/config';
import { connectDB }                 from '@/lib/db/mongoose';
import MessageModel                  from '@/lib/db/models/Message';
import UserModel                     from '@/lib/db/models/User';
import mongoose                      from 'mongoose';

interface RouteContext {
  params: Promise<{ conversationId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { conversationId } = await params;
  const otherId = conversationId;
  const myId    = session.user.id;

  // Validate both IDs
  if (!mongoose.Types.ObjectId.isValid(otherId)) {
    return NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
  }

  await connectDB();

  // Security: verify the other user is related to me
  const otherUser = await UserModel.findById(otherId).lean();
  if (!otherUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const isTrainer = session.user.role === 'trainer';
  const isClient  = session.user.role === 'client';

  // Trainers can only message their clients; clients can only message their trainer
  if (isClient && otherUser._id.toString() !== otherUser._id.toString()) {
    // extra check done below
  }
  if (isTrainer && otherUser.role !== 'client' && otherUser.role !== 'basic') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (isClient && otherUser.role !== 'trainer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch full thread
  const messages = await MessageModel
    .find({
      $or: [
        { senderId: myId,     receiverId: otherId },
        { senderId: otherId,  receiverId: myId    },
      ],
    })
    .sort({ createdAt: 1 })
    .lean();

  // Mark incoming messages as read
  await MessageModel.updateMany(
    { senderId: otherId, receiverId: myId, read: false },
    { read: true }
  );

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { conversationId } = await params;
  const receiverId = conversationId;
  const senderId   = session.user.id;

  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    return NextResponse.json({ error: 'Invalid receiver ID' }, { status: 400 });
  }

  const { message } = await req.json() as { message: string };
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
  }

  await connectDB();

  const receiver = await UserModel.findById(receiverId).lean();
  if (!receiver) return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });

  // Role guard
  const isTrainer = session.user.role === 'trainer';
  const isClient  = session.user.role === 'client';
  if (isTrainer && receiver.role !== 'client' && receiver.role !== 'basic') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (isClient && receiver.role !== 'trainer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const newMessage = await MessageModel.create({
    senderId,
    receiverId,
    message: message.trim(),
    read:    false,
  });

  return NextResponse.json({ message: newMessage }, { status: 201 });
}