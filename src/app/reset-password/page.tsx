'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter }    from 'next/navigation';
import Link                              from 'next/link';

function ResetForm() {
  const params   = useSearchParams();
  const router   = useRouter();
  const token    = params.get('token') ?? '';

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [validating,setValidating]= useState(true);
  const [valid,     setValid]     = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState('');

  // Validate token on load
  useEffect(() => {
    if (!token) { setValidating(false); return; }
    fetch(`/api/auth/reset-password?token=${token}`)
      .then(r => r.json())
      .then(d => { setValid(!!d.ok); setValidating(false); })
      .catch(() => { setValid(false); setValidating(false); });
  }, [token]);

  const handleReset = async () => {
    if (!password.trim())        { setError('Password is required.'); return; }
    if (password.length < 8)     { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm)    { setError('Passwords do not match.'); return; }

    setLoading(true);
    setError('');

    const res  = await fetch('/api/auth/reset-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push('/login'), 3000);
    } else {
      setError(data.error ?? 'Reset failed. Please try again.');
    }
  };

  const inputStyle = {
    width:        '100%',
    background:   'rgba(168,85,247,.08)',
    border:       '1px solid rgba(168,85,247,.25)',
    borderRadius: '8px',
    color:        '#e9d5ff',
    padding:      '12px 14px',
    fontSize:     '0.9rem',
    outline:      'none',
    fontFamily:   'Courier New, monospace',
    boxSizing:    'border-box' as const,
  };

  return (
    <div style={{
      minHeight:      '100vh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      background:     'linear-gradient(135deg,#060612 0%,#0d0820 40%,#140a2e 70%,#0a0a1a 100%)',
      padding:        '24px',
      fontFamily:     'Courier New, monospace',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#d8b4fe', letterSpacing: '0.2em', margin: 0 }}>F3</h1>
          <p style={{ color: 'rgba(168,85,247,.45)', fontSize: '0.7rem', letterSpacing: '0.2em', margin: '4px 0 0' }}>
            FROM FAT TO FIT
          </p>
        </div>

        <div style={{
          background:   'rgba(255,255,255,.03)',
          border:       '1px solid rgba(168,85,247,.2)',
          borderRadius: '16px',
          padding:      '32px',
        }}>
          {validating ? (
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', letterSpacing: '0.1em' }}>
              VALIDATING TOKEN...
            </p>
          ) : !valid ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', margin: '0 0 12px' }}>⚠️</p>
              <h2 style={{ margin: '0 0 12px', color: '#fca5a5', fontSize: '0.95rem', letterSpacing: '0.1em' }}>
                INVALID OR EXPIRED LINK
              </h2>
              <p style={{ color: 'rgba(255,255,255,.35)', fontSize: '0.78rem', margin: '0 0 20px', lineHeight: 1.6 }}>
                This reset link is invalid or has expired. Please request a new one.
              </p>
              <Link href="/forgot-password" style={{
                display: 'inline-block', padding: '10px 20px', borderRadius: '8px',
                background: 'rgba(168,85,247,.12)', border: '1px solid rgba(168,85,247,.3)',
                color: '#c084fc', fontSize: '0.78rem', fontWeight: 700,
                letterSpacing: '0.1em', textDecoration: 'none',
              }}>
                REQUEST NEW LINK →
              </Link>
            </div>
          ) : done ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2.5rem', margin: '0 0 16px' }}>✅</p>
              <h2 style={{ margin: '0 0 12px', color: '#86efac', fontSize: '1rem', letterSpacing: '0.12em' }}>
                PASSWORD UPDATED
              </h2>
              <p style={{ color: 'rgba(255,255,255,.35)', fontSize: '0.8rem', lineHeight: 1.6 }}>
                Your password has been reset. Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 700, color: '#e9d5ff', letterSpacing: '0.12em' }}>
                SET NEW PASSWORD
              </h2>
              <p style={{ margin: '0 0 24px', fontSize: '0.78rem', color: 'rgba(255,255,255,.35)', lineHeight: 1.6 }}>
                Choose a strong password — at least 8 characters.
              </p>

              {error && (
                <div style={{
                  background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
                  borderRadius: '8px', padding: '10px 12px', marginBottom: '16px',
                  color: '#fca5a5', fontSize: '0.8rem',
                }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.1em', color: 'rgba(168,85,247,.6)', marginBottom: '6px' }}>
                  NEW PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  style={inputStyle}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.1em', color: 'rgba(168,85,247,.6)', marginBottom: '6px' }}>
                  CONFIRM PASSWORD
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                  placeholder="Repeat password"
                  style={inputStyle}
                />
              </div>

              <button
                onClick={handleReset}
                disabled={loading}
                style={{
                  width:        '100%',
                  padding:      '12px',
                  borderRadius: '8px',
                  border:       '1px solid rgba(168,85,247,.5)',
                  background:   loading ? 'rgba(168,85,247,.08)' : 'linear-gradient(135deg,#7c3aed,#a855f7)',
                  color:        loading ? 'rgba(192,132,252,.4)' : '#fff',
                  fontWeight:   700,
                  fontSize:     '0.85rem',
                  letterSpacing:'0.12em',
                  cursor:       loading ? 'not-allowed' : 'pointer',
                  fontFamily:   'Courier New, monospace',
                  transition:   'all 0.2s',
                }}
              >
                {loading ? 'UPDATING...' : 'UPDATE PASSWORD →'}
              </button>
            </>
          )}

          <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid rgba(168,85,247,.1)', paddingTop: '20px' }}>
            <Link href="/login" style={{
              color: 'rgba(192,132,252,.55)', fontSize: '0.78rem',
              textDecoration: 'none', letterSpacing: '0.08em',
            }}>
              ← BACK TO LOGIN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg,#060612 0%,#0d0820 40%,#140a2e 70%,#0a0a1a 100%)',
        color: 'rgba(255,255,255,.3)', fontFamily: 'Courier New, monospace', letterSpacing: '0.1em',
      }}>
        LOADING...
      </div>
    }>
      <ResetForm />
    </Suspense>
  );
}