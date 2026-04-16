import { NextRequest, NextResponse } from 'next/server';
import bcrypt                        from 'bcryptjs';
import { connectDB }                 from '@/lib/db/mongoose';
import UserModel                     from '@/lib/db/models/User';
import PasswordResetTokenModel       from '@/lib/db/models/PasswordResetToken';

// GET — validate token
export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token required.' }, { status: 400 });

  await connectDB();

  const record = await PasswordResetTokenModel.findOne({
    token,
    used:      false,
    expiresAt: { $gt: new Date() },
  }).lean();

  if (!record) {
    return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

// POST — reset the password
export async function POST(req: NextRequest) {
  const { token, password } = await req.json() as { token: string; password: string };

  if (!token || !password) {
    return NextResponse.json({ error: 'Token and password are required.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  await connectDB();

  const record = await PasswordResetTokenModel.findOne({
    token,
    used:      false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 });
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(password, 12);

  // Update user password
  await UserModel.findByIdAndUpdate(record.userId, { passwordHash });

  // Mark token as used
  record.used = true;
  await record.save();

  return NextResponse.json({ ok: true });
}