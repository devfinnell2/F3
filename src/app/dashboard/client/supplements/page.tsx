import { getServerSession }  from 'next-auth';
import { authOptions }       from '@/lib/auth/config';
import { redirect }          from 'next/navigation';
import { connectDB }         from '@/lib/db/mongoose';
import UserModel             from '@/lib/db/models/User';
import ClientProfileModel    from '@/lib/db/models/ClientProfile';
import MessageModel          from '@/lib/db/models/Message';
import ClientSidebar         from '@/components/client/ClientSidebar';

export default async function ClientSupplementsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role === 'trainer') redirect('/dashboard/trainer');

  await connectDB();
  const profile = await ClientProfileModel.findOne({ userId: session.user.id }).lean();
  const trainer = profile?.trainerId
    ? await UserModel.findById(profile.trainerId).select('name avatarInitials tier').lean()
    : null;
  const unreadCount = await MessageModel.countDocuments({ receiverId: session.user.id, read: false });

  const clientData = {
    name:           session.user.name ?? 'Client',
    email:          session.user.email ?? '',
    avatarInitials: (session.user.name ?? 'C').split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2),
    currentLevel:   profile?.currentLevel ?? 0,
    expPoints:      profile?.expPoints    ?? 0,
  };
  const trainerData = trainer ? {
    name:           (trainer as any).name,
    avatarInitials: (trainer as any).avatarInitials ?? '??',
    tier:           (trainer as any).tier ?? 'pro',
  } : null;

  const supplements = [
    { name: 'Whey Protein',    dose: '25–50g',   timing: 'Post-workout',       icon: '🥛', color: '#a855f7' },
    { name: 'Creatine',        dose: '3–5g',      timing: 'Daily with water',   icon: '⚡', color: '#00ffc8' },
    { name: 'Multivitamin',    dose: '1 serving', timing: 'With breakfast',     icon: '💊', color: '#f472b6' },
    { name: 'Omega-3',         dose: '1–3g',      timing: 'With meals',         icon: '🐟', color: '#fbbf24' },
    { name: 'Vitamin D3',      dose: '2000 IU',   timing: 'Morning with food',  icon: '☀️', color: '#6ee7c8' },
    { name: 'Magnesium',       dose: '200–400mg', timing: 'Before bed',         icon: '🌙', color: '#c084fc' },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg,#060612 0%,#0d0820 40%,#140a2e 70%,#0a0a1a 100%)' }}>
      <ClientSidebar client={clientData} trainer={trainerData} activeItem="supplements" unreadCount={unreadCount} />
      <main className="flex-1 p-6 overflow-y-auto" style={{ color: '#e0d8ff', fontFamily: 'Courier New, monospace' }}>
        <h1 className="text-2xl font-bold tracking-widest mb-2" style={{ color: '#6ee7c8' }}>SUPPLEMENT PLAN</h1>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,.32)' }}>
          Your trainer-recommended supplement stack. Always consult a doctor before starting new supplements.
        </p>

        {profile?.trainerId ? (
          <div className="flex flex-col gap-3">
            {supplements.map(s => (
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
            <div className="rounded-lg p-4 mt-2" style={{ background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.2)' }}>
              <p style={{ margin: 0, color: '#fbbf24', fontSize: '0.78rem', lineHeight: 1.6 }}>
                ⚠️ These are general recommendations. Your trainer will customize this list based on your goals and bloodwork.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg p-8 text-center" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)' }}>
            <p style={{ color: 'rgba(0,255,200,.4)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
              NO TRAINER ASSIGNED — Enroll with a trainer to get your custom supplement plan.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}