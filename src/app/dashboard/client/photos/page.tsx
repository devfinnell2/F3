// ─────────────────────────────────────────────
//  F3 — Client Progress Photos Page
// ─────────────────────────────────────────────
import { getServerSession }  from 'next-auth';
import { authOptions }       from '@/lib/auth/config';
import { redirect }          from 'next/navigation';
import { connectDB }         from '@/lib/db/mongoose';
import UserModel             from '@/lib/db/models/User';
import ClientProfileModel    from '@/lib/db/models/ClientProfile';
import MessageModel          from '@/lib/db/models/Message';
import ClientSidebar         from '@/components/client/ClientSidebar';
import PhotoUploader         from '@/components/client/PhotoUploader';

export default async function ClientPhotosPage() {
  const session = await getServerSession(authOptions);
  if (!session)                        redirect('/login');
  if (session.user.role === 'trainer') redirect('/dashboard/trainer');

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
      .split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2),
    currentLevel: profile?.currentLevel ?? 0,
    expPoints:    profile?.expPoints    ?? 0,
  };

  const trainerData = trainer ? {
    name:           (trainer as any).name,
    avatarInitials: (trainer as any).avatarInitials ?? '??',
    tier:           (trainer as any).tier ?? 'pro',
  } : null;

  const photos = {
    before:     (profile as any)?.beforePhoto     ?? null,
    after:      (profile as any)?.afterPhoto      ?? null,
    beforeDate: (profile as any)?.beforePhotoDate ?? null,
    afterDate:  (profile as any)?.afterPhotoDate  ?? null,
  };

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: 'linear-gradient(135deg,#060612 0%,#0d0820 40%,#140a2e 70%,#0a0a1a 100%)',
      }}
    >
      <ClientSidebar
        client={clientData}
        trainer={trainerData}
        activeItem="photos"
        unreadCount={unreadCount}
      />
      <main
        className="flex-1 p-6 overflow-y-auto"
        style={{ color: '#e0d8ff', fontFamily: 'Courier New, monospace' }}
      >
        <h1
          className="text-2xl font-bold tracking-widest mb-2"
          style={{ color: '#f472b6' }}
        >
          PROGRESS PHOTOS
        </h1>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,.32)' }}>
          Upload your before and after photos to track your transformation.
        </p>
        <PhotoUploader photos={photos} />
      </main>
    </div>
  );
}