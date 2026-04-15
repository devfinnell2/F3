// ─────────────────────────────────────────────
//  GET  — list all users with filters
//  PATCH — update user status/tier/role
// ─────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }          from 'next-auth';
import { authOptions }               from '@/lib/auth/config';
import { connectDB }                 from '@/lib/db/mongoose';
import UserModel                     from '@/lib/db/models/User';
import ClientProfileModel            from '@/lib/db/models/ClientProfile';

function isAdmin(session: any) {
  return session?.user?.role === 'admin';
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectDB();

  const { searchParams } = new URL(req.url);
  const role   = searchParams.get('role');
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  const query: Record<string, unknown> = {};
  if (role)   query.role   = role;
  if (status) query.status = status;
  if (search) query.$or = [
    { name:  { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const users = await UserModel.find(query)
    .select('-passwordHash')
    .sort({ createdAt: -1 })
    .lean();

  // Attach client counts for trainers
  const enriched = await Promise.all(users.map(async u => {
    let clientCount = 0;
    if (u.role === 'trainer') {
      clientCount = await UserModel.countDocuments({
        trainerId: u._id.toString(),
        role:      { $in: ['client', 'basic'] },
      });
    }
    return { ...u, clientCount };
  }));

  return NextResponse.json({ users: enriched });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectDB();

  const { id, status, tier, role, issaVerified } =
    await req.json() as {
      id:           string;
      status?:      string;
      tier?:        string;
      role?:        string;
      issaVerified?: boolean;
    };

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (status      !== undefined) update.status      = status;
  if (tier        !== undefined) update.tier        = tier;
  if (role        !== undefined) update.role        = role;
  if (issaVerified !== undefined) update.issaVerified = issaVerified;

  const user = await UserModel.findByIdAndUpdate(id, update, { new: true })
    .select('-passwordHash').lean();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({ user });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectDB();

  const { id } = await req.json() as { id: string };
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await UserModel.findByIdAndUpdate(id, { status: 'deleted' });
  return NextResponse.json({ ok: true });
}