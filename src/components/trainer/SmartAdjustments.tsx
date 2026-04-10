'use client';

import { useEffect, useState, useCallback } from 'react';

type ProposalType =
  | 'plateau_detected'
  | 'low_adherence'
  | 'macro_drift'
  | 'overtraining'
  | 'goal_ahead';

interface Proposal {
  _id:        string;
  clientName: string;
  type:       ProposalType;
  summary:    string;
  detail:     string;
  action:     string;
  createdAt:  string;
}

const TYPE_META: Record<ProposalType, { label: string; color: string; icon: string }> = {
  plateau_detected: { label: 'Plateau',       color: '#f59e0b', icon: '📉' },
  low_adherence:    { label: 'Low Adherence',  color: '#ef4444', icon: '⚠️' },
  macro_drift:      { label: 'Macro Drift',    color: '#8b5cf6', icon: '🍽️' },
  overtraining:     { label: 'Overtraining',   color: '#f97316', icon: '🔥' },
  goal_ahead:       { label: 'On Track',       color: '#22c55e', icon: '🏆' },
};

export default function SmartAdjustments() {
  const [proposals, setProposals]   = useState<Proposal[]>([]);
  const [scanning,  setScanning]    = useState(false);
  const [loading,   setLoading]     = useState(true);
  const [expanded,  setExpanded]    = useState<string | null>(null);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    const res  = await fetch('/api/ai/proposals?status=pending');
    const data = await res.json();
    setProposals(data.proposals ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProposals(); }, [fetchProposals]);

  const runScan = async () => {
    setScanning(true);
    await fetch('/api/ai/analyze', { method: 'POST' });
    await fetchProposals();
    setScanning(false);
  };

  const resolve = async (id: string, status: 'approved' | 'dismissed') => {
    await fetch('/api/ai/proposals', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, status }),
    });
    setProposals(prev => prev.filter(p => p._id !== id));
    if (expanded === id) setExpanded(null);
  };

  return (
    <div style={{
      background:   'rgba(255,255,255,0.04)',
      border:       '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding:      '24px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0' }}>
            🧠 Smart Adjustments
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
            AI monitors your clients and flags issues automatically
          </p>
        </div>
        <button
          onClick={runScan}
          disabled={scanning}
          style={{
            padding:       '10px 20px',
            borderRadius:  '10px',
            border:        '1px solid rgba(139,92,246,0.5)',
            background:    scanning ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.2)',
            color:         '#a78bfa',
            fontWeight:    600,
            fontSize:      '0.85rem',
            cursor:        scanning ? 'not-allowed' : 'pointer',
            transition:    'all 0.2s',
            whiteSpace:    'nowrap',
          }}
          onMouseEnter={e => { if (!scanning) (e.target as HTMLButtonElement).style.background = 'rgba(139,92,246,0.35)'; }}
          onMouseLeave={e => { if (!scanning) (e.target as HTMLButtonElement).style.background = 'rgba(139,92,246,0.2)'; }}
        >
          {scanning ? '⏳ Scanning...' : '🔍 Run Scan'}
        </button>
      </div>

      {/* Proposals list */}
      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', textAlign: 'center', padding: '32px 0' }}>
          Loading proposals...
        </p>
      ) : proposals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>✅</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', margin: 0 }}>
            All clients look healthy. Run a scan to check for new issues.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {proposals.map(p => {
            const meta  = TYPE_META[p.type] ?? TYPE_META.low_adherence;
            const isExp = expanded === p._id;
            return (
              <div
                key={p._id}
                style={{
                  background:   'rgba(255,255,255,0.03)',
                  border:       `1px solid ${meta.color}44`,
                  borderLeft:   `3px solid ${meta.color}`,
                  borderRadius: '12px',
                  padding:      '16px',
                  cursor:       'pointer',
                  transition:   'background 0.2s',
                }}
                onClick={() => setExpanded(isExp ? null : p._id)}
                onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)')}
              >
                {/* Row 1 — client name + badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{meta.icon}</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: '#e2e8f0', fontSize: '0.95rem' }}>
                        {p.clientName}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                        {p.summary}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    padding:      '3px 10px',
                    borderRadius: '20px',
                    background:   `${meta.color}22`,
                    color:        meta.color,
                    fontSize:     '0.72rem',
                    fontWeight:   600,
                  }}>
                    {meta.label}
                  </span>
                </div>

                {/* Expanded detail */}
                {isExp && (
                  <div
                    style={{ marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <p style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                      {p.detail}
                    </p>
                    <div style={{
                      background:   'rgba(139,92,246,0.08)',
                      border:       '1px solid rgba(139,92,246,0.2)',
                      borderRadius: '8px',
                      padding:      '10px 14px',
                      marginBottom: '14px',
                    }}>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#a78bfa', fontWeight: 600 }}>
                        💡 Recommended Action
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
                        {p.action}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => resolve(p._id, 'approved')}
                        style={{
                          flex:         1,
                          padding:      '10px',
                          borderRadius: '8px',
                          border:       '1px solid rgba(34,197,94,0.4)',
                          background:   'rgba(34,197,94,0.12)',
                          color:        '#86efac',
                          fontWeight:   600,
                          fontSize:     '0.85rem',
                          cursor:       'pointer',
                          transition:   'background 0.2s',
                        }}
                        onMouseEnter={e => ((e.target as HTMLButtonElement).style.background = 'rgba(34,197,94,0.25)')}
                        onMouseLeave={e => ((e.target as HTMLButtonElement).style.background = 'rgba(34,197,94,0.12)')}
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => resolve(p._id, 'dismissed')}
                        style={{
                          flex:         1,
                          padding:      '10px',
                          borderRadius: '8px',
                          border:       '1px solid rgba(239,68,68,0.3)',
                          background:   'rgba(239,68,68,0.08)',
                          color:        '#fca5a5',
                          fontWeight:   600,
                          fontSize:     '0.85rem',
                          cursor:       'pointer',
                          transition:   'background 0.2s',
                        }}
                        onMouseEnter={e => ((e.target as HTMLButtonElement).style.background = 'rgba(239,68,68,0.2)')}
                        onMouseLeave={e => ((e.target as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)')}
                      >
                        ✕ Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pending count badge */}
      {proposals.length > 0 && (
        <p style={{ margin: '16px 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>
          {proposals.length} pending proposal{proposals.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}