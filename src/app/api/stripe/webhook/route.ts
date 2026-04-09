// ─────────────────────────────────────────────
//  F3 — Stripe Webhook Handler
//  POST /api/stripe/webhook
//  Handles subscription lifecycle events
// ─────────────────────────────────────────────

import { NextResponse }  from 'next/server';
import { headers }       from 'next/headers';
import stripe            from '@/lib/stripe';
import { connectDB }     from '@/lib/db/mongoose';
import UserModel         from '@/lib/db/models/User';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body      = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header.' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('[Webhook] signature verification failed:', error);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  await connectDB();

  try {
    switch (event.type) {

      // ── Checkout completed ──────────────────
      case 'checkout.session.completed': {
        const session  = event.data.object as Stripe.Checkout.Session;
        const userId   = session.metadata?.userId;
        const tier     = session.metadata?.tier as 'pro' | 'elite' | undefined;

        if (userId && tier) {
          await UserModel.findByIdAndUpdate(userId, {
            $set: {
              tier,
              status: 'active',
            },
          });
          console.log(`[Webhook] Trainer ${userId} upgraded to ${tier}`);
        }
        break;
      }

      // ── Subscription updated ────────────────
      case 'customer.subscription.updated': {
        const sub    = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        const tier   = sub.metadata?.tier as 'pro' | 'elite' | undefined;

        if (userId && tier) {
          await UserModel.findByIdAndUpdate(userId, {
            $set: { tier },
          });
          console.log(`[Webhook] Trainer ${userId} subscription updated to ${tier}`);
        }
        break;
      }

      // ── Subscription cancelled ──────────────
      case 'customer.subscription.deleted': {
        const sub    = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;

        if (userId) {
          await UserModel.findByIdAndUpdate(userId, {
            $set: { tier: undefined },
          });
          console.log(`[Webhook] Trainer ${userId} subscription cancelled`);
        }
        break;
      }

      // ── Payment failed ──────────────────────
      case 'invoice.payment_failed': {
        const invoice  = event.data.object as Stripe.Invoice;
        const custId   = invoice.customer as string;

        // Find user by Stripe customer ID — Phase 2 we'll store this
        console.warn(`[Webhook] Payment failed for customer ${custId}`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('[Webhook] handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
  }
}