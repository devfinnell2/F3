import { NextRequest, NextResponse } from 'next/server';
import crypto                        from 'crypto';
import { Resend }                    from 'resend';
import { connectDB }                 from '@/lib/db/mongoose';
import UserModel                     from '@/lib/db/models/User';
import PasswordResetTokenModel       from '@/lib/db/models/PasswordResetToken';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email } = await req.json() as { email: string };

  if (!email?.trim()) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  await connectDB();

  const user = await UserModel.findOne({
    email: email.toLowerCase().trim(),
    status: { $ne: 'deleted' },
  }).lean();

  // Always return success to prevent email enumeration
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  // Delete any existing unused tokens for this user
  await PasswordResetTokenModel.deleteMany({ userId: user._id, used: false });

  // Generate secure token
  const token     = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await PasswordResetTokenModel.create({
    userId: user._id,
    token,
    expiresAt,
    used: false,
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  // Send email
  try {
    await resend.emails.send({
      from:    'F3 <onboarding@resend.dev>',
      to:      email,
      subject: 'F3 — Reset Your Password',
      html: `
        <div style="background:#0a0612;color:#e0d8ff;font-family:'Courier New',monospace;padding:40px;max-width:480px;margin:0 auto;border-radius:12px;">
          <h1 style="color:#d8b4fe;font-size:24px;letter-spacing:4px;margin:0 0 8px;">F3</h1>
          <p style="color:rgba(168,85,247,.5);font-size:11px;letter-spacing:3px;margin:0 0 32px;">FROM FAT TO FIT</p>
          <h2 style="color:#e9d5ff;font-size:16px;letter-spacing:2px;margin:0 0 16px;">PASSWORD RESET</h2>
          <p style="color:rgba(255,255,255,.5);font-size:14px;line-height:1.6;margin:0 0 24px;">
            You requested a password reset. Click the button below to set a new password. This link expires in 1 hour.
          </p>
          <a href="${resetUrl}"
             style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:2px;">
            RESET PASSWORD →
          </a>
          <p style="color:rgba(255,255,255,.25);font-size:11px;margin:24px 0 0;line-height:1.6;">
            If you did not request this, ignore this email. Your password will not change.
          </p>
          <p style="color:rgba(168,85,247,.3);font-size:10px;margin:16px 0 0;letter-spacing:2px;">
            F3 — ISSA CERTIFIED FITNESS PLATFORM
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[forgot-password email error]', err);
    // Don't expose email errors to user
  }

  return NextResponse.json({ ok: true });
}