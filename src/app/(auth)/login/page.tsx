// ─────────────────────────────────────────────
//  F3 — Login Page
// ─────────────────────────────────────────────

'use client';

import { useState }      from 'react';
import { signIn }        from 'next-auth/react';
import { useRouter }     from 'next/navigation';
import Link              from 'next/link';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';

type RoleKey = 't' | 'c' | 'b' | 'a';

const ROLE_ICONS: Record<RoleKey, React.ReactNode> = {
  t: (
    <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="gPurT" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8b4fe"/><stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
      </defs>
      <polygon points="20,3 34,11 34,29 20,37 6,29 6,11" stroke="#a855f7" strokeWidth="1" fill="rgba(168,85,247,.08)"/>
      <path d="M22 9 L13 22 L19 22 L17 31 L27 17 L21 17 Z" fill="url(#gPurT)" stroke="#c084fc" strokeWidth=".6" strokeLinejoin="round"/>
    </svg>
  ),
  c: (
    <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
      <polygon points="20,3 34,11 34,29 20,37 6,29 6,11" stroke="#00ffc8" strokeWidth="1" fill="rgba(0,255,200,.06)"/>
      <rect x="7"    y="17" width="3"    height="6"  fill="#00ffc8"/>
      <rect x="30"   y="17" width="3"    height="6"  fill="#00ffc8"/>
      <rect x="10"   y="14" width="2.5"  height="12" fill="#6ee7c8"/>
      <rect x="27.5" y="14" width="2.5"  height="12" fill="#6ee7c8"/>
      <rect x="12.5" y="19" width="15"   height="2"  fill="#00ffc8"/>
    </svg>
  ),
  b: (
    <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
      <polygon points="20,3 34,11 34,29 20,37 6,29 6,11" stroke="#a855f7" strokeWidth="1" fill="rgba(168,85,247,.06)"/>
      <circle cx="20" cy="20" r="7"  stroke="#00ffc8" strokeWidth="1" fill="none"/>
      <circle cx="20" cy="20" r="3"  stroke="#c084fc" strokeWidth="1" fill="rgba(168,85,247,.15)"/>
      <circle cx="20" cy="20" r="1"  fill="#00ffc8"/>
      <line x1="20" y1="8"  x2="20" y2="12" stroke="#00ffc8" strokeWidth="1"/>
      <line x1="20" y1="28" x2="20" y2="32" stroke="#00ffc8" strokeWidth="1"/>
      <line x1="8"  y1="20" x2="12" y2="20" stroke="#00ffc8" strokeWidth="1"/>
      <line x1="28" y1="20" x2="32" y2="20" stroke="#00ffc8" strokeWidth="1"/>
    </svg>
  ),
  a: (
    <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
      <polygon points="20,3 34,11 34,29 20,37 6,29 6,11" stroke="#f472b6" strokeWidth="1" fill="rgba(244,114,182,.06)"/>
      <path d="M11 13 L11 10 L14 10 M26 10 L29 10 L29 13 M29 27 L29 30 L26 30 M14 30 L11 30 L11 27" stroke="#f9a8d4" strokeWidth="1" fill="none"/>
      <circle cx="20" cy="20" r="5" stroke="#f472b6" strokeWidth="1" fill="none"/>
      <circle cx="20" cy="20" r="2" fill="#f472b6"/>
    </svg>
  ),
};

const ROLES = [
  { key: 't' as RoleKey, label: 'TRAINER' },
  { key: 'c' as RoleKey, label: 'CLIENT'  },
  { key: 'b' as RoleKey, label: 'BASIC'   },
  { key: 'a' as RoleKey, label: 'ADMIN'   },
];

export default function LoginPage() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<RoleKey | null>(null);
  const [email,        setEmail]         = useState('');
  const [password,     setPassword]      = useState('');
  const [error,        setError]         = useState('');
  const [loading,      setLoading]       = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    setError('');
    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (result?.error) { setError('Invalid email or password.'); return; }
    const res     = await fetch('/api/auth/session');
    const session = await res.json();
    const role    = session?.user?.role;
    if      (role === 'admin')   router.push('/dashboard/admin');
    else if (role === 'trainer') router.push('/dashboard/trainer');
    else                         router.push('/dashboard/client');
  }

  return (
    <div
      style={{
        position:   'relative',
        minHeight:  '100vh',
        width:      '100%',
        overflow:   'hidden',
        display:    'flex',
        fontFamily: 'var(--font-chakra, Courier New, monospace)',
        background: 'linear-gradient(135deg,#060612 0%,#0d0820 40%,#140a2e 70%,#0a0a1a 100%)',
      }}
    >
      {/* Purple ambient orb */}
      <div aria-hidden style={{
        position:'absolute', top:'20%', left:'25%',
        width:'500px', height:'500px', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(109,40,217,.25) 0%, transparent 70%)',
        filter:'blur(60px)', pointerEvents:'none',
      }}/>

      {/* ── LEFT — branding ── */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative" style={{ zIndex:1 }}>
        <div
          className="text-9xl font-bold tracking-widest leading-none mb-2"
          style={{ color:'#c084fc', textShadow:'0 0 20px #a855f7, 0 0 48px #7c3aed' }}
        >
          F3
        </div>
        <div className="text-sm tracking-[0.4em] mb-8" style={{ color:'rgba(168,85,247,.42)' }}>
          FROM FAT TO FIT
        </div>
        <div className="text-4xl font-bold leading-tight mb-4" style={{ color:'#f0e8ff' }}>
          YOUR TRANSFORMATION<br/>
          <span style={{ color:'#00ffc8' }}>STARTS HERE.</span>
        </div>
        <div className="text-lg leading-relaxed max-w-sm" style={{ color:'rgba(255,255,255,.36)' }}>
          Professional fitness tracking. AI coaching for ISSA-certified trainers. RPG EXP Level System.
        </div>
      </div>

      {/* ── RIGHT — login form ── */}
      <div
        className="w-full lg:w-105 shrink-0 flex flex-col justify-center px-8 py-12"
        style={{
          zIndex:     1,
          background: 'rgba(0,0,0,.45)',
          borderLeft: '1px solid rgba(168,85,247,.14)',
        }}
      >
        <div className="text-sm tracking-widest mb-6" style={{ color:'rgba(168,85,247,.4)' }}>
          SECURE LOGIN
        </div>

        {/* Role selector */}
        <div className="mb-6">
          <div className="text-xs tracking-widest mb-3" style={{ color:'rgba(168,85,247,.4)' }}>
            SELECT ROLE
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map(role => (
             <LiquidGlassButton
                key={role.key}
                variant={selectedRole === role.key ? 'primary' : 'ghost'}
                size="sm"
                fullWidth
                onClick={() => setSelectedRole(role.key)}
                style={selectedRole === role.key ? {
                  border: '1px solid rgba(168,85,247,.8)',
                  boxShadow: '0 0 18px rgba(168,85,247,.5), inset 0 1px 0 rgba(255,255,255,.4)',
                } : undefined}
              >
                <span style={{ display:'flex', alignItems:'center', gap:'8px', justifyContent:'center' }}>
                  {ROLE_ICONS[role.key]}
                  {role.label}
                </span>
              </LiquidGlassButton>
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
            className="w-full px-3 py-2 text-base rounded outline-none"
            style={{
              background: 'rgba(0,0,0,.45)',
              border:     '1px solid rgba(168,85,247,.22)',
              color:      '#e0d8ff',
              fontFamily: 'Courier New, monospace',
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-base rounded outline-none"
            style={{
              background: 'rgba(0,0,0,.45)',
              border:     '1px solid rgba(168,85,247,.22)',
              color:      '#e0d8ff',
              fontFamily: 'Courier New, monospace',
            }}
          />

          {error && (
            <div className="text-sm px-3 py-2 rounded" style={{
              background: 'rgba(244,114,182,.08)',
              border:     '1px solid rgba(244,114,182,.25)',
              color:      '#f472b6',
              fontFamily: 'Courier New, monospace',
            }}>
              {error}
            </div>
          )}

          <LiquidGlassButton
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            disabled={loading}
          >
            {loading ? 'LOGGING IN...' : 'LOGIN →'}
          </LiquidGlassButton>
        </form>

        {/* Footer links */}
        <div className="flex justify-between mt-4 text-sm" style={{ color:'rgba(168,85,247,.4)', fontFamily:'Courier New, monospace' }}>
          <Link href="/forgot-password" className="underline hover:text-purple-400 transition-colors">
            Forgot password?
          </Link>
          <Link href="/register" className="underline hover:text-purple-400 transition-colors">
            Create account
          </Link>
        </div>

        <div className="mt-8 pt-6" style={{ borderTop:'1px solid rgba(168,85,247,.1)' }}>
          <div className="text-xs tracking-widest mb-2" style={{ color:'rgba(168,85,247,.28)' }}>
            ISSA CERTIFIED TRAINERS
          </div>
          <div className="text-sm leading-relaxed" style={{ color:'rgba(255,255,255,.3)', fontFamily:'Courier New, monospace' }}>
            Trainer credentials re-verified on every session.
          </div>
          <Link href="/support" className="block mt-3 text-sm underline" style={{ color:'rgba(168,85,247,.35)', fontFamily:'Courier New, monospace' }}>
            Need support? Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}