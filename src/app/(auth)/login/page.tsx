// ─────────────────────────────────────────────
//  F3 — Login Page
//  Role-aware login with cyberpunk design
// ─────────────────────────────────────────────

'use client';

import { useState }      from 'react';
import { signIn } from 'next-auth/react';
import { useRouter }     from 'next/navigation';
import Link              from 'next/link';

type RoleKey = 't' | 'c' | 'b' | 'a';

interface RoleTile {
  key:   RoleKey;
  label: string;
  emoji: string;
  color: string;
  border: string;
}

const ROLES: RoleTile[] = [
  { key: 't', label: 'TRAINER', emoji: '🧑‍🏫', color: 'rgba(192,132,252,.55)', border: '#a855f7'  },
  { key: 'c', label: 'CLIENT',  emoji: '🧍',   color: 'rgba(192,132,252,.55)', border: '#a855f7'  },
  { key: 'b', label: 'BASIC',   emoji: '⚡',   color: 'rgba(192,132,252,.55)', border: '#a855f7'  },
  { key: 'a', label: 'ADMIN',   emoji: '🔐',   color: 'rgba(244,114,182,.55)', border: '#f472b6'  },
];

export default function LoginPage() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<RoleKey | null>(null);
  const [email,        setEmail        ] = useState('');
  const [password,     setPassword     ] = useState('');
  const [error,        setError        ] = useState('');
  const [loading,      setLoading      ] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password.');
      return;
    }

    // Fetch session to get role then route accordingly
    const res     = await fetch('/api/auth/session');
    const session = await res.json();
    const role    = session?.user?.role;

    if      (role === 'admin')   router.push('/dashboard/admin');
    else if (role === 'trainer') router.push('/dashboard/trainer');
    else                         router.push('/dashboard/client');
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg,#060612 0%,#0d0820 40%,#140a2e 70%,#0a0a1a 100%)' }}>

      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative overflow-hidden">
        <div
          className="text-9xl font-bold tracking-widest leading-none mb-2"
          style={{ color: '#c084fc', textShadow: '0 0 20px #a855f7, 0 0 48px #7c3aed' }}
        >
          F3
        </div>
        <div className="text-sm tracking-[0.4em] mb-8" style={{ color: 'rgba(168,85,247,.42)' }}>
          FROM FAT TO FIT
        </div>
        <div className="text-4xl font-bold leading-tight mb-4" style={{ color: '#f0e8ff' }}>
          YOUR TRANSFORMATION<br />
          <span style={{ color: '#00ffc8' }}>STARTS HERE.</span>
        </div>
        <div className="text-lg leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,.36)' }}>
          Professional fitness tracking. AI coaching for ISSA-certified trainers. RPG EXP Level System.
        </div>
      </div>

      {/* ── Right panel — login form ── */}
      <div
        className="w-full lg:w-[420px] flex-shrink-0 flex flex-col justify-center px-8 py-12"
        style={{ background: 'rgba(0,0,0,.55)', borderLeft: '1px solid rgba(168,85,247,.14)' }}
      >
        <div className="text-sm tracking-widest mb-6" style={{ color: 'rgba(168,85,247,.4)' }}>
          SECURE LOGIN
        </div>

        {/* Role selector */}
        <div className="mb-6">
          <div className="text-xs tracking-widest mb-3" style={{ color: 'rgba(168,85,247,.4)' }}>
            SELECT ROLE
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map(role => (
              <button
                key={role.key}
                type="button"
                onClick={() => setSelectedRole(role.key)}
                className="py-3 px-2 text-sm font-bold tracking-wide rounded transition-all duration-150 text-center"
                style={{
                  border:     selectedRole === role.key ? `1px solid ${role.border}` : '1px solid rgba(168,85,247,.2)',
                  background: selectedRole === role.key ? `${role.border}20`         : 'transparent',
                  color:      selectedRole === role.key ? '#e9d5ff'                  : role.color,
                  fontFamily: 'Courier New, monospace',
                }}
              >
                {role.emoji} {role.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-base rounded outline-none transition-all"
            style={{
              background:  'rgba(0,0,0,.45)',
              border:      '1px solid rgba(168,85,247,.2)',
              color:       '#e0d8ff',
              fontFamily:  'Courier New, monospace',
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-base rounded outline-none transition-all"
            style={{
              background:  'rgba(0,0,0,.45)',
              border:      '1px solid rgba(168,85,247,.2)',
              color:       '#e0d8ff',
              fontFamily:  'Courier New, monospace',
            }}
          />

          {/* Error */}
          {error && (
            <div className="text-sm px-3 py-2 rounded" style={{ background: 'rgba(244,114,182,.08)', border: '1px solid rgba(244,114,182,.25)', color: '#f472b6', fontFamily: 'Courier New, monospace' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-bold tracking-widest rounded transition-all mt-1"
            style={{
              background:  loading ? 'rgba(168,85,247,.1)' : 'rgba(168,85,247,.15)',
              border:      '1px solid rgba(168,85,247,.4)',
              color:       loading ? 'rgba(192,132,252,.4)' : '#e9d5ff',
              fontFamily:  'Courier New, monospace',
              cursor:      loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'LOGGING IN...' : 'LOGIN →'}
          </button>
        </form>

        {/* Footer links */}
        <div className="flex justify-between mt-4 text-sm" style={{ color: 'rgba(168,85,247,.4)', fontFamily: 'Courier New, monospace' }}>
          <Link href="/forgot-password" className="underline hover:text-purple-400 transition-colors">
            Forgot password?
          </Link>
          <Link href="/register" className="underline hover:text-purple-400 transition-colors">
            Create account
          </Link>
        </div>

        {/* ISSA note */}
        <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(168,85,247,.1)' }}>
          <div className="text-xs tracking-widest mb-2" style={{ color: 'rgba(168,85,247,.28)' }}>
            ISSA CERTIFIED TRAINERS
          </div>
          <div className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.3)', fontFamily: 'Courier New, monospace' }}>
            Trainer credentials re-verified on every session.
          </div>
          <Link href="/support" className="block mt-3 text-sm underline" style={{ color: 'rgba(168,85,247,.35)', fontFamily: 'Courier New, monospace' }}>
            Need support? Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}