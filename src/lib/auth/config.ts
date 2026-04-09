// ─────────────────────────────────────────────
//  F3 — NextAuth v4 Configuration
// ─────────────────────────────────────────────

import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider      from 'next-auth/providers/credentials';
import bcrypt                   from 'bcryptjs';
import { connectDB }            from '@/lib/db/mongoose';
import UserModel                from '@/lib/db/models/User';

export const authOptions: NextAuthOptions = {

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge:   60 * 60 * 24 * 7,
  },

  providers: [
    CredentialsProvider({
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
            email: credentials.email.toLowerCase().trim(),
          }).lean();

          if (!user) return null;

          if (user.status === 'suspended' || user.status === 'deleted') {
            return null;
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!passwordMatch) return null;

          return {
            id:     user._id.toString(),
            name:   user.name,
            email:  user.email,
            role:   user.role,
            tier:   user.tier,
            status: user.status,
          };

        } catch (error) {
          console.error('[NextAuth] authorize error:', error);
          return null;
        }
      },
    }),
  ],

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
      if (token) {
        session.user.id     = token.id;
        session.user.role   = token.role;
        session.user.tier   = token.tier;
        session.user.status = token.status;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};