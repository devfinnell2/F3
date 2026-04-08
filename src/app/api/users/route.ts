// ─────────────────────────────────────────────
//  F3 — Register API Route
//  POST /api/users
//  Creates a new user account
// ─────────────────────────────────────────────

import { NextResponse }  from 'next/server';
import bcrypt            from 'bcryptjs';
import { connectDB }     from '@/lib/db/mongoose';
import UserModel         from '@/lib/db/models/User';
import type { UserRole } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, issaCertId } = body;

    // ── Validate required fields ─────────────
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    // ── Validate role ────────────────────────
    const allowedRoles: UserRole[] = ['trainer', 'client', 'basic'];
    const assignedRole: UserRole   = allowedRoles.includes(role) ? role : 'client';

    // ── Trainers must provide ISSA cert ID ───
    if (assignedRole === 'trainer' && !issaCertId) {
      return NextResponse.json(
        { error: 'ISSA certification ID is required for trainer accounts.' },
        { status: 400 }
      );
    }

    await connectDB();

    // ── Check for duplicate email ────────────
    const existing = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // ── Hash password ────────────────────────
    const passwordHash = await bcrypt.hash(password, 12);

    // ── Build avatar initials ────────────────
    const initials = name
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);

    // ── Create user ──────────────────────────
    const user = await UserModel.create({
      name:           name.trim(),
      email:          email.toLowerCase().trim(),
      passwordHash,
      role:           assignedRole,
      status:         assignedRole === 'trainer' ? 'pending' : 'active',
      issaCertId:     issaCertId?.trim() || undefined,
      issaVerified:   false,
      avatarInitials: initials,
    });

    // ── Return safe user object ──────────────
    // Never return passwordHash to the client
    return NextResponse.json(
      {
        message: assignedRole === 'trainer'
          ? 'Trainer account created. Pending ISSA verification.'
          : 'Account created successfully.',
        user: {
          id:     user._id.toString(),
          name:   user.name,
          email:  user.email,
          role:   user.role,
          status: user.status,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('[POST /api/users] error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}