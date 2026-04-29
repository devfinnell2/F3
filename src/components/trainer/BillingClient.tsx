// ─────────────────────────────────────────────
//  F3 — Billing Client Component
//  Handles Stripe checkout button clicks
// ─────────────────────────────────────────────

'use client';

import { useState } from 'react';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';

interface BillingClientProps {
  currentTier:  string | null;
  trainerName:  string;
}

const PLANS = [
  {
    tier:        'pro' as const,
    name:        'PRO',
    price:       '$10',
    period:      '/month',
    color:       '#d8b4fe',
    borderColor: 'rgba(168,85,247,.3)',
    bgColor:     'rgba(168,85,247,.07)',
    features: [
      '50 AI queries per month',
      'Basic macro correction',
      'Client management',
      'Workout builder',
      'Meal planning',
      'Progress tracking',
    ],
  },
  {
    tier:        'elite' as const,
    name:        'ELITE',
    price:       '$20',
    period:      '/month',
    color:       '#fbbf24',
    borderColor: 'rgba(251,191,36,.4)',
    bgColor:     'rgba(251,191,36,.07)',
    features: [
      'Unlimited AI queries',
      'Full RAG ISSA knowledge base',
      'AI plan generation',
      'Plateau detection',
      'Smart macro correction',
      'Priority support',
    ],
  },
];

export default function BillingClient({
  currentTier,
  trainerName,
}: BillingClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error,   setError  ] = useState('');

  async function handleSubscribe(tier: 'pro' | 'elite') {
    setLoading(tier);
    setError('');

    try {
      const res = await fetch('/api/stripe/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        return;
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }

    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ fontFamily: 'Courier New, monospace' }}>

      {/* Current plan banner */}
      {currentTier && (
        <div
          className="rounded-lg p-4 mb-8 flex items-center gap-3"
          style={{
            background: 'rgba(0,255,200,.05)',
            border:     '1px solid rgba(0,255,200,.2)',
          }}
        >
          <div
            className="text-xl"
            style={{ color: '#00ffc8' }}
          >
            ✓
          </div>
          <div>
            <div
              className="font-bold tracking-widest"
              style={{ color: '#6ee7c8' }}
            >
              CURRENT PLAN: {currentTier.toUpperCase()}
            </div>
            <div
              className="text-sm mt-0.5"
              style={{ color: 'rgba(255,255,255,.32)' }}
            >
              {trainerName} · Active subscription
            </div>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl">
        {PLANS.map(plan => {
          const isCurrent  = currentTier === plan.tier;
          const isLoading  = loading === plan.tier;

          return (
            <div
              key={plan.tier}
              className="rounded-lg p-6"
              style={{
                background:  isCurrent ? plan.bgColor         : 'rgba(255,255,255,.025)',
                border:      isCurrent ? `2px solid ${plan.borderColor}` : '1px solid rgba(168,85,247,.14)',
              }}
            >
              {/* Plan header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div
                    className="text-xs tracking-widest mb-1"
                    style={{ color: 'rgba(168,85,247,.4)' }}
                  >
                    F3
                  </div>
                  <div
                    className="text-2xl font-bold tracking-widest"
                    style={{ color: plan.color }}
                  >
                    {plan.name}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-3xl font-bold"
                    style={{ color: plan.color }}
                  >
                    {plan.price}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: 'rgba(255,255,255,.32)' }}
                  >
                    {plan.period}
                  </div>
                </div>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2 mb-6">
                {plan.features.map(feature => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: 'rgba(255,255,255,.65)' }}
                  >
                    <span style={{ color: plan.color }}>◆</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              {isCurrent ? (
                <div
                  className="w-full py-3 text-center text-sm font-bold tracking-widest rounded"
                  style={{
                    background: plan.bgColor,
                    border:     `1px solid ${plan.borderColor}`,
                    color:      plan.color,
                  }}
                >
                  ✓ CURRENT PLAN
                </div>
              ) : (
                <LiquidGlassButton
                  onClick={() => handleSubscribe(plan.tier)}
                  disabled={!!loading}
                  variant="primary"
                  size="md"
                  fullWidth
                >
                  {isLoading
                    ? 'REDIRECTING...'
                    : `SUBSCRIBE TO ${plan.name}`}
                </LiquidGlassButton>
              )}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div
          className="mt-4 px-4 py-3 rounded text-sm max-w-3xl"
          style={{
            background: 'rgba(244,114,182,.08)',
            border:     '1px solid rgba(244,114,182,.25)',
            color:      '#f472b6',
          }}
        >
          {error}
        </div>
      )}

      {/* Stripe notice */}
      <div
        className="mt-8 text-xs max-w-3xl"
        style={{ color: 'rgba(255,255,255,.25)', lineHeight: '1.6' }}
      >
        Payments processed securely by Stripe. PCI-DSS Level 1 compliant.
        Cards, Apple Pay, Google Pay accepted. Cancel anytime.
      </div>
    </div>
  );
}