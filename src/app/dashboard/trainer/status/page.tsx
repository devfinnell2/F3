import { getServerSession }  from 'next-auth';
import { authOptions }       from '@/lib/auth/config';
import { redirect }          from 'next/navigation';
import { connectDB }         from '@/lib/db/mongoose';
import UserModel             from '@/lib/db/models/User';
import ClientProfileModel    from '@/lib/db/models/ClientProfile';
import WorkoutModel          from '@/lib/db/models/Workout';
import TrainerSidebar        from '@/components/trainer/TrainerSidebar';

const CERT_COLORS: Record<string, string> = {
  'ISSA CPT':           '#a855f7',
  'ISSA Nutritionist':  '#00ffc8',
  'ISSA Bodybuilding':  '#f472b6',
  'ISSA Strength':      '#fbbf24',
  'ISSA Online Coach':  '#60a5fa',
};

export default async function TrainerStatusPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'trainer' && session.user.role !== 'admin') {
    redirect('/dashboard/client');
  }

  await connectDB();

  const user = await UserModel.findById(session.user.id)
    .select('-passwordHash').lean();

  // Trainer's own profile (self-enrolled)
  const profile = await ClientProfileModel.findOne({
    userId: session.user.id,
  }).lean();

  // Trainer's own workout
  const workout = await WorkoutModel.findOne({
    clientId: session.user.id,
  }).lean();

  // Client count
  const clientCount = await UserModel.countDocuments({
    trainerId: session.user.id,
    role:      { $in: ['client', 'basic'] },
    status:    'active',
  });

  const trainer = {
    name:           session.user.name  ?? 'Trainer',
    email:          session.user.email ?? '',
    tier:           session.user.tier  ?? 'pro',
    avatarInitials: (session.user.name ?? 'T')
      .split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2),
  };

  // Parse certifications from issaCertId field (comma-separated) or default
  const certString = (user as any)?.issaCertId ?? '';
  const certs: string[] = certString
    ? certString.split(',').map((c: string) => c.trim()).filter(Boolean)
    : ['ISSA CPT'];

  const isVerified = (user as any)?.issaVerified ?? false;

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: 'linear-gradient(135deg,#060612 0%,#0d0820 40%,#140a2e 70%,#0a0a1a 100%)',
      }}
    >
      <TrainerSidebar trainer={trainer} activeItem="status" />

      <main
        className="flex-1 p-6 overflow-y-auto"
        style={{ color: '#e0d8ff', fontFamily: 'Courier New, monospace' }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl shrink-0"
            style={{
              background: 'rgba(168,85,247,.14)',
              border:     '2px solid rgba(168,85,247,.4)',
              color:      '#d8b4fe',
            }}
          >
            {trainer.avatarInitials}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-widest" style={{ color: '#d8b4fe' }}>
              {trainer.name.toUpperCase()}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,.35)' }}>
              {trainer.email}
            </p>
          </div>
          <div className="ml-auto flex flex-col items-end gap-2">
            <span style={{
              padding:    '4px 14px',
              borderRadius:'20px',
              background: trainer.tier === 'elite' ? 'rgba(251,191,36,.12)' : 'rgba(168,85,247,.14)',
              border:     trainer.tier === 'elite' ? '1px solid rgba(251,191,36,.3)' : '1px solid rgba(168,85,247,.3)',
              color:      trainer.tier === 'elite' ? '#fbbf24' : '#d8b4fe',
              fontSize:   '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
            }}>
              {trainer.tier === 'elite' ? '⭐ ELITE' : '💎 PRO'}
            </span>
            {isVerified && (
              <span style={{
                padding: '3px 10px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 700,
                background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.3)', color: '#86efac',
                letterSpacing: '0.08em',
              }}>
                ✓ ISSA VERIFIED
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ── Platform stats ── */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Active Clients', value: clientCount,      color: '#00ffc8' },
              { label: 'Plan Tier',      value: trainer.tier.toUpperCase(), color: '#a855f7' },
              { label: 'My Level',       value: profile?.currentLevel ?? 0, color: '#fbbf24' },
              { label: 'My EXP',         value: (profile?.expPoints ?? 0).toLocaleString(), color: '#f472b6' },
            ].map(stat => (
              <div key={stat.label} className="rounded-lg p-4"
                style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${stat.color}22` }}>
                <div style={{ fontSize: '0.62rem', letterSpacing: '0.12em', color: `${stat.color}66`, marginBottom: '6px' }}>
                  {stat.label.toUpperCase()}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── Certifications ── */}
          <div className="rounded-lg p-4"
            style={{ background: 'rgba(168,85,247,.05)', border: '1px solid rgba(168,85,247,.13)' }}>
            <div className="text-xs tracking-widest mb-3" style={{ color: 'rgba(168,85,247,.5)' }}>
              CERTIFICATIONS
            </div>
            <div className="flex flex-col gap-2">
              {certs.map(cert => {
                const color = CERT_COLORS[cert] ?? '#a855f7';
                return (
                  <div key={cert} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: '8px',
                    background: `${color}0a`, border: `1px solid ${color}33`,
                  }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: color, flexShrink: 0,
                      boxShadow: `0 0 6px ${color}`,
                    }} />
                    <span style={{ fontWeight: 700, color: '#e9d5ff', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                      {cert}
                    </span>
                    {isVerified && (
                      <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#86efac' }}>✓</span>
                    )}
                  </div>
                );
              })}
              <p style={{ margin: '8px 0 0', fontSize: '0.68rem', color: 'rgba(255,255,255,.25)', lineHeight: 1.5 }}>
                To add certifications, update your ISSA Cert ID in your profile settings (comma-separated).
              </p>
            </div>
          </div>

          {/* ── My stats bars ── */}
          {profile && (
            <div className="rounded-lg p-4"
              style={{ background: 'rgba(0,255,200,.04)', border: '1px solid rgba(0,255,200,.1)' }}>
              <div className="text-xs tracking-widest mb-3" style={{ color: 'rgba(0,255,200,.5)' }}>
                MY STATS
              </div>
              {/* EXP bar */}
              <div className="flex items-center gap-3 mb-4">
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(0,255,200,.08)', border: '2px solid rgba(0,255,200,.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontWeight: 700, color: '#00ffc8',
                }}>
                  {profile.currentLevel ?? 0}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(0,255,200,.45)', marginBottom: '4px' }}>
                    <span>LVL {profile.currentLevel ?? 0}</span>
                    <span>{(profile.expPoints ?? 0).toLocaleString()} EXP</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.05)' }}>
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min(((profile.expPoints ?? 0) % 10000) / 100, 100)}%`,
                      background: 'linear-gradient(90deg,#6d28d9,#a855f7,#00ffc8)',
                    }} />
                  </div>
                </div>
              </div>
              {[
                { label: '⚡ Will',     value: 0, from: '#a855f7', to: '#c084fc' },
                { label: '💪 Strength', value: 0, from: '#00ffc8', to: '#6ee7c8' },
                { label: '❤️ Vitality', value: 0, from: '#f472b6', to: '#f9a8d4' },
              ].map(stat => (
                <div key={stat.label} className="grid items-center gap-2 mb-2"
                  style={{ gridTemplateColumns: '90px 1fr 32px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,.45)' }}>{stat.label}</span>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.05)' }}>
                    <div className="h-full rounded-full" style={{
                      width: `${Math.max(stat.value, 2)}%`,
                      background: `linear-gradient(90deg,${stat.from},${stat.to})`,
                    }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: stat.to, textAlign: 'right' }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ── Today's workout preview ── */}
          <div className="rounded-lg p-4"
            style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(168,85,247,.12)' }}>
            <div className="text-xs tracking-widest mb-3" style={{ color: 'rgba(168,85,247,.5)' }}>
              MY NEXT WORKOUT
            </div>
            {workout?.plan?.length ? (
              <div className="flex flex-col gap-2">
                {workout.plan[0].exercises.slice(0, 5).map((ex, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '6px 0', borderBottom: '1px solid rgba(168,85,247,.06)',
                  }}>
                    <span style={{ color: '#e0d8ff', fontSize: '0.85rem' }}>{ex.name}</span>
                    <span style={{
                      background: 'rgba(168,85,247,.1)', border: '1px solid rgba(168,85,247,.25)',
                      borderRadius: '4px', padding: '2px 8px', fontSize: '0.72rem', color: '#d8b4fe',
                    }}>
                      {ex.sets}×{ex.reps}
                    </span>
                  </div>
                ))}
                <a href="/dashboard/trainer/profile/workout" style={{
                  marginTop: '8px', display: 'block', textAlign: 'center',
                  padding: '8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                  background: 'rgba(168,85,247,.08)', border: '1px solid rgba(168,85,247,.25)',
                  color: '#c084fc', textDecoration: 'none', letterSpacing: '0.1em',
                }}>
                  VIEW FULL PLAN →
                </a>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ color: 'rgba(168,85,247,.35)', fontSize: '0.8rem', margin: '0 0 12px' }}>
                  NO WORKOUT PLAN YET
                </p>
                <a href="/dashboard/trainer/profile/workout" style={{
                  padding: '8px 16px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                  background: 'rgba(168,85,247,.08)', border: '1px solid rgba(168,85,247,.25)',
                  color: '#c084fc', textDecoration: 'none', letterSpacing: '0.1em',
                }}>
                  + CREATE MY PLAN
                </a>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}