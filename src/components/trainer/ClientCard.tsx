// ─────────────────────────────────────────────
//  F3 — Client Card Component
// ─────────────────────────────────────────────

'use client';

import Link from 'next/link';

interface ClientData {
  id:             string;
  name:           string;
  email:          string;
  avatarInitials: string;
  status:         string;
  currentLevel:   number;
  expPoints:      number;
  goalType:       string;
  willPower:      number;
  strength:       number;
  vitality:       number;
}

interface ClientCardProps {
  client: ClientData;
}

interface StatBarProps {
  label:        string;
  value:        number;
  gradientFrom: string;
  gradientTo:   string;
}

const GOAL_LABELS: Record<string, string> = {
  fat_loss:        'Fat Loss',
  muscle_gain:     'Muscle Gain',
  endurance:       'Endurance',
  recomposition:   'Recomposition',
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
            width:      `${Math.max(value, 2)}%`,
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
  return (
    <div
      className="rounded-r-lg p-4 transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,.025)',
        border:     '1px solid rgba(168,85,247,.14)',
        borderLeft: '2px solid rgba(168,85,247,.3)',
        fontFamily: 'Courier New, monospace',
        cursor:     'default',
      }}
    >
      {/* Top row */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0"
          style={{
            background: 'rgba(0,255,200,.09)',
            border:     '1px solid rgba(0,255,200,.28)',
            color:      '#6ee7c8',
            fontSize:   '15px',
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
                border:     '1px solid rgba(0,255,200,.25)',
                color:      '#6ee7c8',
              }}
            >
              ACTIVE
            </span>
          </div>
          <div className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,.32)' }}>
            {GOAL_LABELS[client.goalType] ?? 'General Fitness'}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="font-bold" style={{ color: '#00ffc8', fontSize: '15px' }}>
            LVL {client.currentLevel}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(0,255,200,.4)' }}>
            {client.expPoints.toLocaleString()} EXP
          </div>
        </div>
      </div>

      {/* Stat bars */}
      <div className="flex flex-col gap-2 mb-3">
        <StatBar
          label="Will"
          value={client.willPower}
          gradientFrom="#a855f7"
          gradientTo="#c084fc"
        />
        <StatBar
          label="Strength"
          value={client.strength}
          gradientFrom="#00ffc8"
          gradientTo="#6ee7c8"
        />
        <StatBar
          label="Vitality"
          value={client.vitality}
          gradientFrom="#f472b6"
          gradientTo="#f9a8d4"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Link
          href={`/dashboard/trainer/clients/${client.id}`}
          className="px-3 py-1.5 text-xs font-bold tracking-widest rounded transition-all"
          style={{
            background:     'rgba(0,255,200,.07)',
            border:         '1px solid rgba(0,255,200,.32)',
            color:          '#6ee7c8',
            textDecoration: 'none',
          }}
        >
          VIEW PROFILE
        </Link>
        <Link
          href={`/dashboard/trainer/ai?clientId=${client.id}`}
          className="px-3 py-1.5 text-xs font-bold tracking-widest rounded transition-all"
          style={{
            background:     'rgba(168,85,247,.09)',
            border:         '1px solid rgba(168,85,247,.38)',
            color:          '#c084fc',
            textDecoration: 'none',
          }}
        >
          ASK AI
        </Link>
      </div>
    </div>
  );
}