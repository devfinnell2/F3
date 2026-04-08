// ─────────────────────────────────────────────
//  F3 — NextAuth Configuration
//  Compatible with next-auth v5 beta + Next.js 15
// ─────────────────────────────────────────────

import type { NextAuthConfig } from 'next-auth';
import Credentials             from 'next-auth/providers/credentials';
import bcrypt                  from 'bcryptjs';
import { connectDB }           from '@/lib/db/mongoose';
import UserModel               from '@/lib/db/models/User';
import type { UserRole, PlanTier, AccountStatus } from '@/types';

export const authConfig: NextAuthConfig = {

  // ── Pages ──────────────────────────────────
  pages: {
    signIn: '/login',
    error:  '/login',
  },

  // ── Session ────────────────────────────────
  session: {
    strategy: 'jwt',
    maxAge:   60 * 60 * 24 * 7, // 7 days
  },

  // ── Providers ──────────────────────────────
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();

          const user = await UserModel.findOne({
            email: (credentials.email as string).toLowerCase().trim(),
          }).lean();

          if (!user) return null;

          if (user.status === 'suspended' || user.status === 'deleted') {
            return null;
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!passwordMatch) return null;

          return {
            id:     user._id.toString(),
            name:   user.name,
            email:  user.email,
            role:   user.role   as UserRole,
            tier:   user.tier   as PlanTier | undefined,
            status: user.status as AccountStatus,
          };

        } catch (error) {
          console.error('[NextAuth] authorize error:', error);
          return null;
        }
      },
    }),
  ],

  // ── Callbacks ──────────────────────────────
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id     = user.id;
        token.role   = user.role;
        token.tier   = user.tier;
        token.status = user.status;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id     = token.id     as string;
        session.user.role   = token.role   as UserRole;
        session.user.tier   = token.tier   as PlanTier | undefined;
        session.user.status = token.status as AccountStatus;
      }
      return session;
    },
  },

  // ── Trust the host in development ──────────
  trustHost: true,
};