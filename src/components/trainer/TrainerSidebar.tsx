// ─────────────────────────────────────────────
//  F3 — Trainer Sidebar
// ─────────────────────────────────────────────

'use client';

import UnreadBadge from '@/components/shared/UnreadBadge';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import type { PlanTier } from '@/types';
import NotificationBell from '@/components/shared/NotificationBell';

interface TrainerSidebarProps {
  trainer: {
    name: string;
    email: string;
    tier: PlanTier | string;
    avatarInitials: string;
  };
  activeItem: string;
}

const navItems = [
  { id: 'clients', label: 'My Clients', href: '/dashboard/trainer' },
  { id: 'ai', label: 'F3 AI Coach', href: '/dashboard/trainer/ai' },
  { id: 'meals', label: 'Meal Plans', href: '/dashboard/trainer/meals' },
  { id: 'workouts', label: 'Workouts', href: '/dashboard/trainer/workouts' },
  { id: '1rm', label: '1RM Tracker', href: '/dashboard/trainer/1rm' },
  { id: 'bmi', label: 'BMI Calc', href: '/dashboard/trainer/bmi' },
  { id: 'calendar', label: 'Calendar', href: '/dashboard/trainer/calendar' },
  { id: 'messages', label: 'Messages', href: '/dashboard/trainer/messages' },
  { id: 'profile', label: 'My Profile', href: '/dashboard/trainer/profile' },
  { id: 'billing', label: 'Billing', href: '/dashboard/trainer/billing' },
];

export default function TrainerSidebar({
  trainer,
  activeItem,
}: TrainerSidebarProps) {
  const isElite = trainer.tier === 'elite';

  return (
    <aside
      className="w-56 shrink-0 flex flex-col overflow-y-auto"
      style={{
        background: 'rgba(0,0,0,.45)',
        borderRight: '1px solid rgba(168,85,247,.1)',
        minHeight: '100vh',
        fontFamily: 'Courier New, monospace',
      }}
    >
      <div className="p-3">
        {/* Trainer info card */}
        <div
          className="flex items-center gap-2 p-3 rounded-lg mb-3"
          style={{
            background: 'rgba(168,85,247,.08)',
            border: '1px solid rgba(168,85,247,.18)',
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold shrink-0"
            style={{
              background: 'rgba(168,85,247,.14)',
              border: '1px solid rgba(168,85,247,.32)',
              color: '#d8b4fe',
            }}
          >
            {trainer.avatarInitials}
          </div>

          <div className="flex-1 min-w-0">
            <div
              className="font-bold truncate"
              style={{ color: '#d8b4fe', fontSize: '15px' }}
            >
              {trainer.name.toUpperCase()}
            </div>
            <div className="mt-1">
              {isElite ? (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{
                    background: 'rgba(251,191,36,.1)',
                    border: '1px solid rgba(251,191,36,.28)',
                    color: '#fbbf24',
                  }}
                >
                  ELITE — UNLIMITED AI
                </span>
              ) : (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{
                    background: 'rgba(168,85,247,.14)',
                    border: '1px solid rgba(168,85,247,.28)',
                    color: '#d8b4fe',
                  }}
                >
                  PRO — LIMITED AI
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section label */}
        <div
          className="text-xs tracking-widest mb-2 ml-1"
          style={{ color: 'rgba(168,85,247,.38)' }}
        >
          TRAINER MENU
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5">
          {navItems.map(item => {
            const isActive = activeItem === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-r transition-all text-sm tracking-wide uppercase"
                style={{
                  color: isActive ? '#e9d5ff' : 'rgba(192,132,252,.42)',
                  background: isActive ? 'rgba(168,85,247,.1)' : 'transparent',
                  borderLeft: isActive ? '2px solid #a855f7' : '2px solid transparent',
                  textDecoration: 'none',
                }}
              >
                <span
                  className="w-1 h-1 rotate-45 shrink-0"
                  style={{ border: '1px solid currentColor' }}
                />
                {item.label}
                {item.id === 'messages' && <UnreadBadge />}
              </Link>
            );
          })}
        </nav>

        <div
          className="my-3"
          style={{ borderTop: '1px solid rgba(168,85,247,.08)' }}
        />

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full text-left px-3 py-2 text-sm tracking-wide uppercase rounded transition-all"
          style={{
            color: 'rgba(244,114,182,.55)',
            fontFamily: 'Courier New, monospace',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ← SIGN OUT
        </button>
        <div className="mt-3 flex justify-end pr-1">
          <NotificationBell accentColor="#a855f7" />
        </div>

        {/* Scope note */}
        <div
          className="mt-3 text-xs leading-relaxed px-1"
          style={{ color: 'rgba(168,85,247,.26)' }}
        >
          Scope: assigned clients only. All data isolated at query level.
        </div>
      </div>
    </aside>
  );
}