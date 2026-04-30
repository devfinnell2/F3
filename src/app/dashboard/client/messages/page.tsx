// ─────────────────────────────────────────────
//  F3 — Client Messages Page
// ─────────────────────────────────────────────

import { getServerSession }  from 'next-auth';
import { authOptions }       from '@/lib/auth/config';
import { redirect }          from 'next/navigation';
import { connectDB }         from '@/lib/db/mongoose';
import UserModel             from '@/lib/db/models/User';
import ClientProfileModel    from '@/lib/db/models/ClientProfile';
import MessageModel          from '@/lib/db/models/Message';
import ClientSidebar         from '@/components/client/ClientSidebar';
import ClientChat            from '@/components/client/ClientChat';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default async function ClientMessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session)                         redirect('/login');
  if (session.user.role === 'trainer')  redirect('/dashboard/trainer');
  if (session.user.role === 'admin')    redirect('/dashboard/admin');

  await connectDB();

  const profile = await ClientProfileModel.findOne({
    userId: session.user.id,
  }).lean();

  const trainer = profile?.trainerId
    ? await UserModel.findById(profile.trainerId)
        .select('name avatarInitials tier')
        .lean()
    : null;

  const unreadCount = await MessageModel.countDocuments({
    receiverId: session.user.id,
    read:       false,
  });

  const clientData = {
    name:           session.user.name ?? 'Client',
    email:          session.user.email ?? '',
    avatarInitials: (session.user.name ?? 'C')
      .split(' ')
      .map((p: string) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
    currentLevel: profile?.currentLevel ?? 0,
    expPoints:    profile?.expPoints    ?? 0,
  };

  const trainerData = trainer
    ? {
        name:           (trainer as any).name,
        avatarInitials: (trainer as any).avatarInitials ?? '??',
        tier:           (trainer as any).tier ?? 'pro',
      }
    : null;


  const sidebar = (
    <ClientSidebar
        client={clientData}
        trainer={trainerData}
        activeItem="messages"
        unreadCount={unreadCount}
      />
  );
  return (
    <DashboardLayout sidebar={sidebar} accentColor="#00ffc8">
      

      <main
        className="flex-1 overflow-hidden"
        style={{ color: '#e0d8ff', fontFamily: 'Courier New, monospace' }}
      >
        <ClientChat myId={session.user.id} />
      </main>
    </DashboardLayout>
  );
}