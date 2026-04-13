import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth/config';
import { redirect }         from 'next/navigation';
import TrainerSidebar       from '@/components/trainer/TrainerSidebar';

const SUPPLEMENTS = [
  { name: 'Whey Protein',  dose: '25–50g',   timing: 'Post-workout',      icon: '🥛', color: '#a855f7' },
  { name: 'Creatine',      dose: '3–5g',      timing: 'Daily with water',  icon: '⚡', color: '#00ffc8' },
  { name: 'Multivitamin',  dose: '1 serving', timing: 'With breakfast',    icon: '💊', color: '#f472b6' },
  { name: 'Omega-3',       dose: '1–3g',      timing: 'With meals',        icon: '🐟', color: '#fbbf24' },
  { name: 'Vitamin D3',    dose: '2000 IU',   timing: 'Morning with food', icon: '☀️', color: '#6ee7c8' },
  { name: 'Magnesium',     dose: '200–400mg', timing: 'Before bed',        icon: '🌙', color: '#c084fc' },
  { name: 'Pre-Workout',   dose: '1 scoop',   timing: '20–30min pre',      icon: '🔥', color: '#f97316' },
  { name: 'ZMA',           dose: '3 caps',    timing: 'Before bed',        icon: '💤', color: '#818cf8' },
];

export default async function TrainerSelfSuppsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'trainer' && session.user.role !== 'admin') redirect('/dashboard/client');

  const trainer = {
    name:           session.user.name  ?? 'Trainer',
    email:          session.user.email ?? '',
    tier:           session.user.tier  ?? 'pro',
    avatarInitials: (session.user.name ?? 'T').split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2),
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg,#060612 0%,#0d0820 40%,#140a2e 70%,#0a0a1a 100%)' }}>
      <TrainerSidebar trainer={trainer} activeItem="mysups" />
      <main className="flex-1 p-6 overflow-y-auto" style={{ color: '#e0d8ff', fontFamily: 'Courier New, monospace' }}>
        <h1 className="text-2xl font-bold tracking-widest mb-2" style={{ color: '#d8b4fe' }}>MY SUPPLEMENT STACK</h1>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,.32)' }}>
          Your personal supplement protocol. Customize as needed.
        </p>
        <div className="flex flex-col gap-3">
          {SUPPLEMENTS.map(s => (
            <div key={s.name} className="rounded-lg p-4 flex items-center gap-4"
              style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${s.color}22` }}>
              <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>{s.icon}</span>
              <div className="flex-1">
                <p style={{ margin: 0, fontWeight: 700, color: '#e9d5ff', fontSize: '0.95rem', letterSpacing: '0.05em' }}>
                  {s.name.toUpperCase()}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,.4)' }}>
                  {s.timing}
                </p>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700,
                background: `${s.color}18`, border: `1px solid ${s.color}44`, color: s.color,
              }}>
                {s.dose}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}