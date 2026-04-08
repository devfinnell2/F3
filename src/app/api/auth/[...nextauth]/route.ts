// ─────────────────────────────────────────────
//  F3 — NextAuth Route Handler
// ─────────────────────────────────────────────

import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';

const { handlers } = NextAuth(authConfig);

export const { GET, POST } = handlers;