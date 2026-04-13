// ─────────────────────────────────────────────
//  GET — list conversations with unread counts
// ─────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }          from 'next-auth';
import { authOptions }               from '@/lib/auth/config';
import { connectDB }                 from '@/lib/db/mongoose';
import MessageModel                  from '@/lib/db/models/Message';
import UserModel                     from '@/lib/db/models/User';
import ClientProfileModel            from '@/lib/db/models/ClientProfile';

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  const myId    = session.user.id;
  const isTrainer = session.user.role === 'trainer';

  if (isTrainer) {
    // Trainer: list all enrolled clients
    const profiles = await ClientProfileModel
      .find({ trainerId: myId })
      .lean();

    const conversations = await Promise.all(
      profiles.map(async (profile) => {
        const user = await UserModel.findById(profile.userId).lean();
        if (!user) return null;

        const unread = await MessageModel.countDocuments({
          senderId:   profile.userId,
          receiverId: myId,
          read:       false,
        });

        const latest = await MessageModel
          .findOne({
            $or: [
              { senderId: myId,           receiverId: profile.userId },
              { senderId: profile.userId, receiverId: myId           },
            ],
          })
          .sort({ createdAt: -1 })
          .lean();

        return {
          userId:         user._id.toString(),
          name:           user.name,
          avatarInitials: user.avatarInitials ?? user.name.slice(0, 2).toUpperCase(),
          unread,
          latestMessage:  latest?.message ?? null,
          latestAt:       latest?.createdAt ?? null,
        };
      })
    );

    return NextResponse.json({
      conversations: conversations.filter(Boolean),
    });
  } else {
    // Client: single conversation with their trainer
    const user = await UserModel.findById(myId).lean();
    if (!user?.trainerId) {
      return NextResponse.json({ conversations: [] });
    }

    const trainer = await UserModel.findById(user.trainerId).lean();
    if (!trainer) return NextResponse.json({ conversations: [] });

    const unread = await MessageModel.countDocuments({
      senderId:   user.trainerId,
      receiverId: myId,
      read:       false,
    });

    const latest = await MessageModel
      .findOne({
        $or: [
          { senderId: myId,           receiverId: user.trainerId },
          { senderId: user.trainerId, receiverId: myId           },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      conversations: [{
        userId:         trainer._id.toString(),
        name:           trainer.name,
        avatarInitials: trainer.avatarInitials ?? trainer.name.slice(0, 2).toUpperCase(),
        unread,
        latestMessage:  latest?.message ?? null,
        latestAt:       latest?.createdAt ?? null,
      }],
    });
  }
}