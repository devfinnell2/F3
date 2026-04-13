import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth/config';
import { redirect }         from 'next/navigation';
import TrainerSidebar       from '@/components/trainer/TrainerSidebar';
import BMICalculator        from '@/components/shared/BMICalculator';

export default async function TrainerBMIPage() {
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
      <TrainerSidebar trainer={trainer} activeItem="bmi" />
      <main className="flex-1 p-6 overflow-y-auto" style={{ color: '#e0d8ff', fontFamily: 'Courier New, monospace' }}>
        <h1 className="text-2xl font-bold tracking-widest mb-2" style={{ color: '#d8b4fe' }}>BMI CALCULATOR</h1>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,.32)' }}>
          Calculate Body Mass Index for client assessment and goal setting.
        </p>
        <BMICalculator accentColor="#a855f7" />
      </main>
    </div>
  );
}