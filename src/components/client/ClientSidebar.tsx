// ─────────────────────────────────────────────
//  F3 — Client Sidebar
// ─────────────────────────────────────────────

'use client';

import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
import UnreadBadge from '@/components/shared/UnreadBadge';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import NotificationBell from '@/components/shared/NotificationBell';

interface ClientSidebarProps {
  client: {
    name: string;
    avatarInitials: string;
    currentLevel: number;
    expPoints: number;
  };
  trainer: {
    name: string;
    avatarInitials: string;
    tier: string;
  } | null;
  activeItem: string;
  unreadCount: number;
}

const navItems = [
  { id: 'status', label: 'My Status', href: '/dashboard/client' },
  { id: 'messages', label: 'Messages', href: '/dashboard/client/messages' },
  { id: 'meals', label: 'Log My Meals', href: '/dashboard/client/meals' },
  { id: 'workout', label: 'Workout Plan', href: '/dashboard/client/workout' },
  { id: 'calendar', label: 'Calendar', href: '/dashboard/client/calendar' },
  { id: '1rm', label: 'My 1RM', href: '/dashboard/client/1rm' },
  { id: 'supplements', label: 'Supplement Plan', href: '/dashboard/client/supplements' },
  { id: 'goals', label: 'Goals', href: '/dashboard/client/goals' },
  { id: 'photos', label: 'Progress Photos', href: '/dashboard/client/photos' },
  { id: 'find', label: 'Find a Trainer', href: '/find-trainer' },
];

export default function ClientSidebar({
  client,
  trainer,
  activeItem,
  unreadCount,
}: ClientSidebarProps) {
  return (
    <aside
      className="w-56 shrink-0 flex flex-col overflow-y-auto"
      style={{
        background: 'rgba(0,0,0,.45)',
        borderRight: '1px solid rgba(0,255,200,.1)',
        minHeight: '100vh',
        fontFamily: 'Courier New, monospace',
      }}
    >
      <div className="p-3">
        {/* Client info card */}
        <div
          className="flex items-center gap-2 p-3 rounded-lg mb-3"
          style={{
            background: 'rgba(0,255,200,.06)',
            border: '1px solid rgba(0,255,200,.18)',
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold shrink-0"
            style={{
              background: 'rgba(0,255,200,.09)',
              border: '1px solid rgba(0,255,200,.28)',
              color: '#6ee7c8',
            }}
          >
            {client.avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="font-bold truncate"
              style={{ color: '#6ee7c8', fontSize: '15px' }}
            >
              {client.name.toUpperCase()}
            </div>
            <div
              className="font-bold mt-0.5"
              style={{ color: '#00ffc8', fontSize: '13px' }}
            >
              LVL {client.currentLevel} / 100
            </div>
            {/* EXP bar */}
            <div
              className="h-2 rounded-full overflow-hidden mt-1"
              style={{ background: 'rgba(255,255,255,.05)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min((client.expPoints % 10000) / 100, 100)}%`,
                  background: 'linear-gradient(90deg, #6d28d9, #a855f7, #00ffc8)',
                }}
              />
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: 'rgba(0,255,200,.4)' }}
            >
              {client.expPoints.toLocaleString()} EXP
            </div>
          </div>
        </div>

        {/* Nav label */}
        <div
          className="text-xs tracking-widest mb-2 ml-1"
          style={{ color: 'rgba(0,255,200,.38)' }}
        >
          MY MENU
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-0.5">
          {navItems.map(item => {
            const isActive = activeItem === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-r text-sm tracking-wide uppercase"
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  transition: 'all .18s ease',
                  color: isActive ? '#ffffff' : 'rgba(110,231,200,.42)',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(0,255,200,.28) 0%, rgba(0,255,200,.08) 60%, transparent 100%)'
                    : 'transparent',
                  borderLeft: isActive ? '2px solid #00ffc8' : '2px solid transparent',
                  boxShadow: isActive
                    ? 'inset 0 0 14px rgba(0,255,200,.3), -2px 0 12px rgba(0,255,200,.6), -4px 0 22px rgba(0,255,200,.35)'
                    : 'none',
                  textShadow: isActive
                    ? '0 0 8px rgba(110,231,200,.9), 0 0 18px rgba(0,255,200,.6)'
                    : 'none',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rotate-45 shrink-0"
                  style={{
                    border: '1px solid currentColor',
                    background: isActive ? '#00ffc8' : 'transparent',
                    boxShadow: isActive ? '0 0 6px #00ffc8, 0 0 12px rgba(0,255,200,.9)' : 'none',
                    transition: 'all .18s ease',
                  }}
                />
                {item.label}
                {item.id === 'messages' && <UnreadBadge />}
              </Link>
            );
          })}
        </nav>

        <div
          className="my-3"
          style={{ borderTop: '1px solid rgba(0,255,200,.08)' }}
        />

        {/* Trainer info */}
        {trainer && (
          <>
            <div
              className="text-xs tracking-widest mb-2 ml-1"
              style={{ color: 'rgba(0,255,200,.38)' }}
            >
              MY TRAINER
            </div>
            <div
              className="flex items-center gap-2 p-2 rounded-lg mb-3"
              style={{
                background: 'rgba(168,85,247,.05)',
                border: '1px solid rgba(168,85,247,.12)',
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: 'rgba(168,85,247,.1)',
                  border: '1px solid rgba(168,85,247,.28)',
                  color: '#c084fc',
                }}
              >
                {trainer.avatarInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="font-bold truncate"
                  style={{ color: '#c084fc', fontSize: '13px' }}
                >
                  {trainer.name.toUpperCase()}
                </div>
                <div style={{ color: 'rgba(168,85,247,.42)', fontSize: '12px' }}>
                  ISSA · {trainer.tier.toUpperCase()}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Client scope notice */}
        <div
          className="text-xs p-2 rounded"
          style={{
            background: 'rgba(244,114,182,.06)',
            border: '1px solid rgba(244,114,182,.16)',
            color: 'rgba(244,114,182,.65)',
            lineHeight: '1.6',
          }}
        >
          ⚠ Notice — AI managed by your trainer only.
        </div>

        <div
          className="my-3"
          style={{ borderTop: '1px solid rgba(0,255,200,.08)' }}
        />

        {/* Sign out */}
       <LiquidGlassButton
          onClick={() => signOut({ callbackUrl: '/login' })}
          variant="admin"
          size="sm"
          fullWidth
        >
          ← SIGN OUT
        </LiquidGlassButton>
        <div className="mt-3 flex justify-end pr-1">
          <NotificationBell accentColor="#00ffc8" />
        </div>
      </div>
    </aside>
  );
}