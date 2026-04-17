'use client';
import { useState }  from 'react';
import Link          from 'next/link';

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) { setError('Email is required.'); return; }
    setLoading(true);
    setError('');
    const res  = await fetch('/api/auth/forgot-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) setSent(true);
    else setError('Something went wrong. Please try again.');
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
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#d8b4fe', letterSpacing: '0.2em', margin: 0 }}>
            F3
          </h1>
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
          {!sent ? (
            <>
              <h2 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 700, color: '#e9d5ff', letterSpacing: '0.12em' }}>
                RESET PASSWORD
              </h2>
              <p style={{ margin: '0 0 24px', fontSize: '0.78rem', color: 'rgba(255,255,255,.35)', lineHeight: 1.6 }}>
                Enter your email address and we'll send you a link to reset your password.
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.1em', color: 'rgba(168,85,247,.6)', marginBottom: '6px' }}>
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="your@email.com"
                  style={inputStyle}
                  autoFocus
                />
              </div>

              <button
                onClick={handleSubmit}
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
                {loading ? 'SENDING...' : 'SEND RESET LINK →'}
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2.5rem', margin: '0 0 16px' }}>📧</p>
              <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: '#86efac', letterSpacing: '0.12em' }}>
                EMAIL SENT
              </h2>
              <p style={{ margin: '0 0 24px', fontSize: '0.8rem', color: 'rgba(255,255,255,.4)', lineHeight: 1.7 }}>
                If an account exists for <strong style={{ color: '#e9d5ff' }}>{email}</strong>, you'll receive a reset link shortly. Check your spam folder if you don't see it.
              </p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,.25)' }}>
                Link expires in 1 hour.
              </p>
            </div>
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