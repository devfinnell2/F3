// ─────────────────────────────────────────────
//  F3 — Client Card Component
// ─────────────────────────────────────────────

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GlitchButton from '@/components/ui/GlitchButton';

interface ClientData {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  status: string;
  currentLevel: number;
  expPoints: number;
  goalType: string;
  willPower: number;
  strength: number;
  vitality: number;
}

interface ClientCardProps {
  client: ClientData;
}

interface StatBarProps {
  label: string;
  value: number;
  gradientFrom: string;
  gradientTo: string;
}

const GOAL_LABELS: Record<string, string> = {
  fat_loss: 'Fat Loss',
  muscle_gain: 'Muscle Gain',
  endurance: 'Endurance',
  recomposition: 'Recomposition',
  general_fitness: 'General Fitness',
};

function StatBar({ label, value, gradientFrom, gradientTo }: StatBarProps) {
  return (
    <div
      className="grid items-center gap-2"
      style={{ gridTemplateColumns: '70px 1fr 32px' }}
    >
      <span
        className="text-xs uppercase tracking-wide"
        style={{ color: 'rgba(255,255,255,.45)' }}
      >
        {label}
      </span>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,.05)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.max(value, 2)}%`,
            background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
          }}
        />
      </div>
      <span
        className="text-xs font-bold text-right"
        style={{ color: gradientTo, fontFamily: 'Courier New, monospace' }}
      >
        {value}
      </span>
    </div>
  );
}

export default function ClientCard({ client }: ClientCardProps) {
  const router = useRouter();
  return (
    <div
      className="rounded-r-lg p-4 transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,.025)',
        border: '1px solid rgba(168,85,247,.14)',
        borderLeft: '2px solid rgba(168,85,247,.3)',
        fontFamily: 'Courier New, monospace',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#a855f7';
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(168,85,247,.06)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(168,85,247,.14)';
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,.025)';
      }}
    >
      {/* Top row */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0"
          style={{
            background: 'rgba(0,255,200,.09)',
            border: '1px solid rgba(0,255,200,.28)',
            color: '#6ee7c8',
            fontSize: '15px',
          }}
        >
          {client.avatarInitials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold" style={{ color: '#e0d8ff', fontSize: '16px' }}>
              {client.name.toUpperCase()}
            </span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{
                background: 'rgba(0,255,200,.08)',
                border: '1px solid rgba(0,255,200,.25)',
                color: '#6ee7c8',
              }}
            >
              ACTIVE
            </span>
          </div>
          <div className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,.32)' }}>
            {GOAL_LABELS[client.goalType] ?? 'General Fitness'}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="font-bold" style={{ color: '#00ffc8', fontSize: '15px' }}>
            LVL {client.currentLevel}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(0,255,200,.4)' }}>
            {client.expPoints.toLocaleString()} EXP
          </div>
        </div>
      </div>

      {/* Two-column: stats + before/after photos */}
      <div className="flex gap-3 mb-3">

        {/* Left — stat bars */}
        <div className="flex flex-col gap-2 flex-1">
          <StatBar label="Will" value={client.willPower} gradientFrom="#a855f7" gradientTo="#c084fc" />
          <StatBar label="Strength" value={client.strength} gradientFrom="#00ffc8" gradientTo="#6ee7c8" />
          <StatBar label="Vitality" value={client.vitality} gradientFrom="#f472b6" gradientTo="#f9a8d4" />
        </div>

        {/* Right — before/after silhouettes */}
        <div className="flex gap-1.5 shrink-0">
          {/* BEFORE */}
          <div
            className="relative rounded-md overflow-hidden flex items-end justify-center"
            style={{
              width: '52px', aspectRatio: '3/4',
              background: 'linear-gradient(180deg, rgba(168,85,247,.22) 0%, rgba(168,85,247,.04) 100%)',
              border: '1px solid rgba(168,85,247,.32)',
            }}
          >
            <span style={{ position: 'absolute', top: 4, left: 4, fontSize: '7px', fontWeight: 700, letterSpacing: '0.15em', color: '#c084fc', background: 'rgba(0,0,0,.55)', padding: '1px 4px', borderRadius: 2, border: '1px solid rgba(192,132,252,.4)' }}>BEFORE</span>
            <svg viewBox="0 0 60 80" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} fill="none">
              <defs>
                <linearGradient id={`silPur-${client.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity=".55" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity=".85" />
                </linearGradient>
              </defs>
              <circle cx="30" cy="18" r="7" fill={`url(#silPur-${client.id})`} />
              <path d="M18 28 Q30 24 42 28 L45 55 Q45 60 40 62 L20 62 Q15 60 15 55 Z" fill={`url(#silPur-${client.id})`} />
              <path d="M18 30 Q12 38 13 52 L17 52 Q17 40 21 34 Z" fill={`url(#silPur-${client.id})`} />
              <path d="M42 30 Q48 38 47 52 L43 52 Q43 40 39 34 Z" fill={`url(#silPur-${client.id})`} />
              <path d="M22 62 L21 80 L28 80 L29 62 Z" fill={`url(#silPur-${client.id})`} />
              <path d="M31 62 L32 80 L39 80 L38 62 Z" fill={`url(#silPur-${client.id})`} />
            </svg>
          </div>

          {/* AFTER */}
          <div
            className="relative rounded-md overflow-hidden flex items-end justify-center"
            style={{
              width: '52px', aspectRatio: '3/4',
              background: 'linear-gradient(180deg, rgba(0,255,200,.22) 0%, rgba(0,255,200,.04) 100%)',
              border: '1px solid rgba(0,255,200,.35)',
            }}
          >
            <span style={{ position: 'absolute', top: 4, left: 4, fontSize: '7px', fontWeight: 700, letterSpacing: '0.15em', color: '#6ee7c8', background: 'rgba(0,0,0,.55)', padding: '1px 4px', borderRadius: 2, border: '1px solid rgba(0,255,200,.4)' }}>AFTER</span>
            <svg viewBox="0 0 60 80" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} fill="none">
              <defs>
                <linearGradient id={`silCy-${client.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ffc8" stopOpacity=".85" />
                  <stop offset="100%" stopColor="#0ea5a0" stopOpacity=".95" />
                </linearGradient>
              </defs>
              <circle cx="30" cy="18" r="6.5" fill={`url(#silCy-${client.id})`} />
              <path d="M20 28 Q30 26 40 28 L43 40 Q44 46 42 52 L40 62 Q40 63 38 63 L22 63 Q20 63 20 62 L18 52 Q16 46 17 40 Z" fill={`url(#silCy-${client.id})`} />
              <path d="M20 30 Q14 36 14 46 Q14 52 16 56 L19 56 Q19 48 21 42 L22 34 Z" fill={`url(#silCy-${client.id})`} />
              <path d="M40 30 Q46 36 46 46 Q46 52 44 56 L41 56 Q41 48 39 42 L38 34 Z" fill={`url(#silCy-${client.id})`} />
              <path d="M24 63 L23 80 L28 80 L29 63 Z" fill={`url(#silCy-${client.id})`} />
              <path d="M31 63 L32 80 L37 80 L36 63 Z" fill={`url(#silCy-${client.id})`} />
            </svg>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <GlitchButton
          variant="client"
          size="sm"
          onClick={() => router.push(`/dashboard/trainer/clients/${client.id}`)}
        >
          VIEW PROFILE
        </GlitchButton>
        <GlitchButton
          variant="primary"
          size="sm"
          onClick={() => router.push(`/dashboard/trainer/ai?clientId=${client.id}`)}
        >
          ASK AI
        </GlitchButton>
      </div>
    </div>
  );
}