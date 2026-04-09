// ─────────────────────────────────────────────
//  F3 — Stripe Checkout Route
//  POST /api/stripe/checkout
//  Creates a Stripe checkout session for
//  trainer subscription (Pro or Elite)
// ─────────────────────────────────────────────

import { NextResponse }     from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth/config';
import stripe               from '@/lib/stripe';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  if (session.user.role !== 'trainer' && session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Only trainers can subscribe.' },
      { status: 403 }
    );
  }

  try {
    const body        = await request.json();
    const { tier }    = body;

    if (tier !== 'pro' && tier !== 'elite') {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "pro" or "elite".' },
        { status: 400 }
      );
    }

    const priceId = tier === 'elite'
      ? process.env.STRIPE_ELITE_PRICE_ID
      : process.env.STRIPE_PRO_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured.' },
        { status: 500 }
      );
    }

    // ── Create Stripe checkout session ─────────
    const checkoutSession = await stripe.checkout.sessions.create({
      mode:                'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price:    priceId,
          quantity: 1,
        },
      ],
      // Pass trainer info for webhook
      metadata: {
        userId: session.user.id,
        tier,
      },
      customer_email:  session.user.email ?? undefined,
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/trainer/billing?success=true`,
      cancel_url:  `${process.env.NEXTAUTH_URL}/dashboard/trainer/billing?cancelled=true`,
      // Auto payment collection
      subscription_data: {
        metadata: {
          userId: session.user.id,
          tier,
        },
      },
    });

    return NextResponse.json(
      { url: checkoutSession.url },
      { status: 200 }
    );

  } catch (error) {
    console.error('[POST /api/stripe/checkout] error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}