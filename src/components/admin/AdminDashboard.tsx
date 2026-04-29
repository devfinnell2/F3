'use client';

import { useEffect, useState, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';

interface User {
  _id:          string;
  name:         string;
  email:        string;
  role:         string;
  status:       string;
  tier?:        string;
  issaVerified?: boolean;
  issaCertId?:  string;
  clientCount:  number;
  createdAt:    string;
}

interface Stats {
  totalUsers:      number;
  totalTrainers:   number;
  totalClients:    number;
  pendingTrainers: number;
  activeUsers:     number;
  suspendedUsers:  number;
  totalMessages:   number;
  totalAIRequests: number;
  eliteTrainers:   number;
  proTrainers:     number;
}

const STATUS_COLOR: Record<string, string> = {
  active:    '#22c55e',
  pending:   '#fbbf24',
  suspended: '#ef4444',
  deleted:   '#6b7280',
};

const ROLE_COLOR: Record<string, string> = {
  admin:   '#f472b6',
  trainer: '#a855f7',
  client:  '#00ffc8',
  basic:   '#60a5fa',
};

export default function AdminDashboard({ adminName }: { adminName: string }) {
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [users,    setUsers]    = useState<User[]>([]);
  const [filter,   setFilter]   = useState({ role: '', status: '', search: '' });
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<'overview' | 'users' | 'pending'>('overview');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    const res  = await fetch('/api/admin/stats');
    const data = await res.json();
    setStats(data);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.role)   params.set('role',   filter.role);
    if (filter.status) params.set('status', filter.status);
    if (filter.search) params.set('search', filter.search);
    const res  = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateUser = async (id: string, update: Record<string, unknown>) => {
    setUpdating(id);
    await fetch('/api/admin/users', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, ...update }),
    });
    await fetchUsers();
    await fetchStats();
    setUpdating(null);
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Mark "${name}" as deleted? This cannot be undone.`)) return;
    setUpdating(id);
    await fetch('/api/admin/users', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id }),
    });
    await fetchUsers();
    await fetchStats();
    setUpdating(null);
  };

  const pendingTrainers = users.filter(u => u.role === 'trainer' && u.status === 'pending');

  const s = { fontFamily: 'Courier New, monospace', color: '#e0d8ff' };

  return (
    <div style={{
      minHeight:  '100vh',
      background: 'linear-gradient(135deg,#060612 0%,#0d0820 40%,#140a2e 70%,#0a0a1a 100%)',
      ...s,
    }}>
      {/* ── Top bar ── */}
      <div style={{
        background:   'rgba(0,0,0,.5)',
        borderBottom: '1px solid rgba(244,114,182,.15)',
        padding:      '0 24px',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'space-between',
        height:       '56px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f472b6', letterSpacing: '0.2em' }}>
            F3
          </span>
          <span style={{ fontSize: '0.72rem', color: 'rgba(244,114,182,.5)', letterSpacing: '0.15em' }}>
            ADMIN CONSOLE
          </span>
          {stats?.pendingTrainers ? (
            <span style={{
              background: '#f59e0b', color: '#000', borderRadius: '10px',
              padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700,
            }}>
              {stats.pendingTrainers} PENDING
            </span>
          ) : null}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,.35)' }}>
            {adminName.toUpperCase()}
          </span>
          <LiquidGlassButton onClick={() => signOut({ callbackUrl: '/login' })} variant="admin" size="sm">SIGN OUT</LiquidGlassButton>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
          {([
            { id: 'overview', label: 'OVERVIEW'        },
            { id: 'users',    label: 'ALL USERS'       },
            { id: 'pending',  label: `PENDING APPROVAL${stats?.pendingTrainers ? ` (${stats.pendingTrainers})` : ''}` },
          ] as const).map(t => (
           <LiquidGlassButton key={t.id} onClick={() => setTab(t.id)} variant={tab === t.id ? 'admin' : 'ghost'} size="sm">
              {t.label}
            </LiquidGlassButton>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && stats && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {[
                { label: 'Total Users',     value: stats.totalUsers,      color: '#e9d5ff' },
                { label: 'Trainers',        value: stats.totalTrainers,   color: '#a855f7' },
                { label: 'Clients',         value: stats.totalClients,    color: '#00ffc8' },
                { label: 'Active',          value: stats.activeUsers,     color: '#22c55e' },
                { label: 'Pending Review',  value: stats.pendingTrainers, color: '#f59e0b' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background:   'rgba(255,255,255,.03)',
                  border:       `1px solid ${stat.color}22`,
                  borderRadius: '12px',
                  padding:      '16px',
                }}>
                  <div style={{ fontSize: '0.62rem', letterSpacing: '0.12em', color: `${stat.color}66`, marginBottom: '8px' }}>
                    {stat.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Subscription breakdown */}
              <div style={{
                background: 'rgba(168,85,247,.05)', border: '1px solid rgba(168,85,247,.13)',
                borderRadius: '12px', padding: '20px',
              }}>
                <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'rgba(168,85,247,.6)', marginBottom: '16px' }}>
                  SUBSCRIPTION BREAKDOWN
                </div>
                {[
                  { label: 'Elite Trainers', value: stats.eliteTrainers, color: '#fbbf24', pct: stats.totalTrainers ? Math.round(stats.eliteTrainers / stats.totalTrainers * 100) : 0 },
                  { label: 'Pro Trainers',   value: stats.proTrainers,   color: '#a855f7', pct: stats.totalTrainers ? Math.round(stats.proTrainers   / stats.totalTrainers * 100) : 0 },
                  { label: 'Suspended',      value: stats.suspendedUsers, color: '#ef4444', pct: stats.totalUsers ? Math.round(stats.suspendedUsers / stats.totalUsers * 100) : 0 },
                ].map(s => (
                  <div key={s.label} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,.55)' }}>{s.label}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: s.color }}>{s.value}</span>
                    </div>
                    <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,.05)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s.pct}%`, background: s.color, borderRadius: '2px', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Platform activity */}
              <div style={{
                background: 'rgba(0,255,200,.03)', border: '1px solid rgba(0,255,200,.1)',
                borderRadius: '12px', padding: '20px',
              }}>
                <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'rgba(0,255,200,.5)', marginBottom: '16px' }}>
                  PLATFORM ACTIVITY
                </div>
                {[
                  { label: 'Total Messages',    value: stats.totalMessages,   icon: '💬', color: '#a855f7' },
                  { label: 'AI Requests',       value: stats.totalAIRequests, icon: '🧠', color: '#00ffc8' },
                ].map(s => (
                  <div key={s.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.05)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
                      <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,.5)' }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: s.color }}>{s.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <input
                value={filter.search}
                onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
                placeholder="Search name or email..."
                style={{
                  flex: 1, minWidth: '200px', background: 'rgba(255,255,255,.05)',
                  border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px',
                  color: '#e9d5ff', padding: '8px 12px', fontSize: '0.85rem',
                  outline: 'none', fontFamily: 'Courier New, monospace',
                }}
              />
              {[
                { key: 'role',   options: ['', 'trainer', 'client', 'basic', 'admin'],            label: 'All Roles'     },
                { key: 'status', options: ['', 'active', 'pending', 'suspended', 'deleted'],      label: 'All Statuses'  },
              ].map(f => (
                <select key={f.key} value={(filter as any)[f.key]}
                  onChange={e => setFilter(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={{
                    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                    borderRadius: '8px', color: '#e9d5ff', padding: '8px 12px',
                    fontSize: '0.82rem', outline: 'none', fontFamily: 'Courier New, monospace', cursor: 'pointer',
                  }}
                >
                  <option value="" style={{ background: '#0d0820' }}>{f.label}</option>
                  {f.options.filter(o => o).map(o => (
                    <option key={o} value={o} style={{ background: '#0d0820' }}>{o.toUpperCase()}</option>
                  ))}
                </select>
              ))}
            </div>

            {/* User table */}
            {loading ? (
              <p style={{ color: 'rgba(255,255,255,.3)', textAlign: 'center', padding: '40px 0' }}>Loading users...</p>
            ) : users.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,.3)', textAlign: 'center', padding: '40px 0' }}>No users found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {users.map(user => (
                  <div key={user._id} style={{
                    background:   'rgba(255,255,255,.03)',
                    border:       '1px solid rgba(255,255,255,.07)',
                    borderRadius: '10px',
                    padding:      '14px 16px',
                    display:      'flex',
                    alignItems:   'center',
                    gap:          '14px',
                    flexWrap:     'wrap',
                    opacity:      user.status === 'deleted' ? 0.4 : 1,
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                      background: `${ROLE_COLOR[user.role] ?? '#666'}22`,
                      border:     `1px solid ${ROLE_COLOR[user.role] ?? '#666'}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.72rem', fontWeight: 700, color: ROLE_COLOR[user.role] ?? '#666',
                    }}>
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <p style={{ margin: 0, fontWeight: 700, color: '#e9d5ff', fontSize: '0.88rem' }}>
                        {user.name}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'rgba(255,255,255,.35)' }}>
                        {user.email}
                      </p>
                    </div>

                    {/* Badges */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700,
                        background: `${ROLE_COLOR[user.role] ?? '#666'}18`,
                        border:     `1px solid ${ROLE_COLOR[user.role] ?? '#666'}44`,
                        color:      ROLE_COLOR[user.role] ?? '#666',
                        letterSpacing: '0.08em',
                      }}>
                        {user.role.toUpperCase()}
                      </span>
                      <span style={{
                        padding: '3px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700,
                        background: `${STATUS_COLOR[user.status] ?? '#666'}18`,
                        border:     `1px solid ${STATUS_COLOR[user.status] ?? '#666'}44`,
                        color:      STATUS_COLOR[user.status] ?? '#666',
                        letterSpacing: '0.08em',
                      }}>
                        {user.status.toUpperCase()}
                      </span>
                      {user.tier && (
                        <span style={{
                          padding: '3px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700,
                          background: user.tier === 'elite' ? 'rgba(251,191,36,.15)' : 'rgba(168,85,247,.15)',
                          border:     user.tier === 'elite' ? '1px solid rgba(251,191,36,.4)' : '1px solid rgba(168,85,247,.4)',
                          color:      user.tier === 'elite' ? '#fbbf24' : '#d8b4fe',
                          letterSpacing: '0.08em',
                        }}>
                          {user.tier.toUpperCase()}
                        </span>
                      )}
                      {user.role === 'trainer' && (
                        <span style={{
                          padding: '3px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700,
                          background: user.issaVerified ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.1)',
                          border:     user.issaVerified ? '1px solid rgba(34,197,94,.4)' : '1px solid rgba(239,68,68,.3)',
                          color:      user.issaVerified ? '#86efac' : '#fca5a5',
                          letterSpacing: '0.08em',
                        }}>
                          {user.issaVerified ? '✓ ISSA' : '✗ UNVERIFIED'}
                        </span>
                      )}
                      {user.role === 'trainer' && user.clientCount > 0 && (
                        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,.3)' }}>
                          {user.clientCount} clients
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    {user.status !== 'deleted' && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {/* Status toggle */}
                        {user.status === 'active' ? (
                         <LiquidGlassButton onClick={() => updateUser(user._id, { status: 'suspended' })} disabled={updating === user._id} variant="admin" size="sm">SUSPEND</LiquidGlassButton>
                        ) : user.status === 'suspended' ? (
                          <LiquidGlassButton onClick={() => updateUser(user._id, { status: 'active' })} disabled={updating === user._id} variant="client" size="sm">RESTORE</LiquidGlassButton>
                        ) : user.status === 'pending' ? (
                          <LiquidGlassButton onClick={() => updateUser(user._id, { status: 'active', issaVerified: true })} disabled={updating === user._id} variant="client" size="sm">APPROVE</LiquidGlassButton>
                        ) : null}

                        {/* Tier toggle for trainers */}
                        {user.role === 'trainer' && (
                         <LiquidGlassButton onClick={() => updateUser(user._id, { tier: user.tier === 'elite' ? 'pro' : 'elite' })} disabled={updating === user._id} variant="warning" size="sm">
                            {user.tier === 'elite' ? '→ PRO' : '→ ELITE'}
                          </LiquidGlassButton>
                        )}

                        {/* ISSA verify for trainers */}
                        {user.role === 'trainer' && !user.issaVerified && (
                          <LiquidGlassButton onClick={() => updateUser(user._id, { issaVerified: true })} disabled={updating === user._id} variant="primary" size="sm">VERIFY ISSA</LiquidGlassButton>
                        )}

                        {/* Delete */}
                        <LiquidGlassButton onClick={() => deleteUser(user._id, user.name)} disabled={updating === user._id} variant="ghost" size="sm">DELETE</LiquidGlassButton>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PENDING TAB ── */}
        {tab === 'pending' && (
          <div>
            {pendingTrainers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>✅</p>
                <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
                  NO PENDING APPROVALS
                </p>
              </div>
            ) : pendingTrainers.map(user => (
              <div key={user._id} style={{
                background:   'rgba(251,191,36,.04)',
                border:       '1px solid rgba(251,191,36,.2)',
                borderRadius: '12px',
                padding:      '20px',
                marginBottom: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: '#e9d5ff', fontSize: '1rem' }}>
                      {user.name}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '0.78rem', color: 'rgba(255,255,255,.4)' }}>
                      {user.email}
                    </p>
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,.3)', letterSpacing: '0.08em' }}>
                        ISSA CERT ID:
                      </span>
                      <span style={{
                        marginLeft: '8px', fontWeight: 700, color: '#fbbf24', fontSize: '0.82rem',
                        fontFamily: 'Courier New, monospace',
                      }}>
                        {user.issaCertId ?? 'NOT PROVIDED'}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.68rem', color: 'rgba(255,255,255,.25)' }}>
                      Registered: {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                 <LiquidGlassButton onClick={() => updateUser(user._id, { status: 'active', issaVerified: true })} disabled={updating === user._id} variant="client" size="md">✓ APPROVE + VERIFY</LiquidGlassButton>
                   <LiquidGlassButton onClick={() => updateUser(user._id, { status: 'suspended' })} disabled={updating === user._id} variant="admin" size="md">✕ REJECT</LiquidGlassButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

function actionBtn(color: string) {
  return {
    padding:      '4px 10px',
    borderRadius: '6px',
    fontSize:     '0.65rem',
    fontWeight:   700 as const,
    letterSpacing:'0.08em',
    cursor:       'pointer' as const,
    fontFamily:   'Courier New, monospace',
    border:       `1px solid ${color}44`,
    background:   `${color}12`,
    color:        color,
    transition:   'all 0.15s',
  };
}