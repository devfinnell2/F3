// ─────────────────────────────────────────────
//  F3 — Route Proxy (formerly middleware)
//  Runs on every request before the page renders
//  Enforces role-based access at the edge
// ─────────────────────────────────────────────

import { NextResponse }     from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken }         from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Public routes — always allow ────────────
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/support'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // ── Get JWT token ────────────────────────────
  const token = await getToken({
    req:    request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ── Not logged in — redirect to login ────────
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string;

  // ── Admin dashboard — admin only ─────────────
  if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard/client', request.url));
  }

  // ── Trainer dashboard — trainer or admin ─────
  if (
    pathname.startsWith('/dashboard/trainer') &&
    role !== 'trainer' &&
    role !== 'admin'
  ) {
    return NextResponse.redirect(new URL('/dashboard/client', request.url));
  }

  // ── AI API routes — trainer or admin only ────
  if (
    pathname.startsWith('/api/ai') &&
    role !== 'trainer' &&
    role !== 'admin'
  ) {
    return NextResponse.json(
      { error: 'Access denied. Trainer or Admin role required.' },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};