// ─────────────────────────────────────────────
//  F3 — Register Page
//  New account creation with role selection
// ─────────────────────────────────────────────

'use client';

import { useState }  from 'react';
import { useRouter } from 'next/navigation';
import Link          from 'next/link';

type RegisterRole = 'client' | 'trainer' | 'basic';

export default function RegisterPage() {
  const router = useRouter();

  const [role,       setRole      ] = useState<RegisterRole>('client');
  const [name,       setName      ] = useState('');
  const [email,      setEmail     ] = useState('');
  const [password,   setPassword  ] = useState('');
  const [confirm,    setConfirm   ] = useState('');
  const [issaCertId, setIssaCertId] = useState('');
  const [error,      setError     ] = useState('');
  const [loading,    setLoading   ] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (role === 'trainer' && !issaCertId.trim()) {
      setError('ISSA certification ID is required for trainer accounts.');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/users', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, password, role, issaCertId }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Something went wrong.');
      return;
    }

    // Success — send to login
    router.push('/login?registered=true');
  }

  const inputStyle = {
    background: 'rgba(0,0,0,.45)',
    border:     '1px solid rgba(168,85,247,.2)',
    color:      '#e0d8ff',
    fontFamily: 'Courier New, monospace',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg,#060612 0%,#0d0820 40%,#140a2e 70%,#0a0a1a 100%)' }}
    >
      <div
        className="w-full max-w-md p-8 rounded-lg"
        style={{ background: 'rgba(0,0,0,.55)', border: '1px solid rgba(168,85,247,.14)' }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="text-4xl font-bold tracking-widest mb-1" style={{ color: '#c084fc' }}>F3</div>
          <div className="text-xs tracking-[0.4em] mb-4" style={{ color: 'rgba(168,85,247,.4)' }}>FROM FAT TO FIT</div>
          <div className="text-xl font-bold" style={{ color: '#f0e8ff', fontFamily: 'Courier New, monospace' }}>
            CREATE ACCOUNT
          </div>
        </div>

        {/* Role selector */}
        <div className="mb-6">
          <div className="text-xs tracking-widest mb-3" style={{ color: 'rgba(168,85,247,.4)', fontFamily: 'Courier New, monospace' }}>
            I AM A...
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['client', 'trainer', 'basic'] as RegisterRole[]).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className="py-2 text-sm font-bold tracking-wide rounded transition-all"
                style={{
                  border:     role === r ? '1px solid #a855f7' : '1px solid rgba(168,85,247,.2)',
                  background: role === r ? 'rgba(168,85,247,.15)' : 'transparent',
                  color:      role === r ? '#e9d5ff' : 'rgba(192,132,252,.55)',
                  fontFamily: 'Courier New, monospace',
                  cursor:     'pointer',
                }}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 text-base rounded outline-none"
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-base rounded outline-none"
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-base rounded outline-none"
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="w-full px-3 py-2 text-base rounded outline-none"
            style={inputStyle}
          />

          {/* ISSA cert field — trainers only */}
          {role === 'trainer' && (
            <input
              type="text"
              placeholder="ISSA Certification ID (numeric)"
              value={issaCertId}
              onChange={e => setIssaCertId(e.target.value)}
              className="w-full px-3 py-2 text-base rounded outline-none"
              style={{ ...inputStyle, border: '1px solid rgba(251,191,36,.3)' }}
            />
          )}

          {/* Trainer pending notice */}
          {role === 'trainer' && (
            <div className="text-xs px-3 py-2 rounded" style={{ background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.2)', color: 'rgba(251,191,36,.7)', fontFamily: 'Courier New, monospace' }}>
              Trainer accounts require ISSA verification before activation.
            </div>
          )}

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
              background: loading ? 'rgba(168,85,247,.1)' : 'rgba(168,85,247,.15)',
              border:     '1px solid rgba(168,85,247,.4)',
              color:      loading ? 'rgba(192,132,252,.4)' : '#e9d5ff',
              fontFamily: 'Courier New, monospace',
              cursor:     loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT →'}
          </button>
        </form>

        <div className="mt-4 text-sm text-center" style={{ color: 'rgba(168,85,247,.4)', fontFamily: 'Courier New, monospace' }}>
          Already have an account?{' '}
          <Link href="/login" className="underline hover:text-purple-400 transition-colors">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}