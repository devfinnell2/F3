import { NextResponse }      from 'next/server';
import { getServerSession }  from 'next-auth';
import { authOptions }       from '@/lib/auth/config';
import { connectDB }         from '@/lib/db/mongoose';
import UserModel             from '@/lib/db/models/User';
import MessageModel          from '@/lib/db/models/Message';
import AILogModel            from '@/lib/db/models/AILog';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const [
    totalUsers,
    totalTrainers,
    totalClients,
    pendingTrainers,
    activeUsers,
    suspendedUsers,
    totalMessages,
    totalAIRequests,
    eliteTrainers,
    proTrainers,
  ] = await Promise.all([
    UserModel.countDocuments({ status: { $ne: 'deleted' } }),
    UserModel.countDocuments({ role: 'trainer', status: { $ne: 'deleted' } }),
    UserModel.countDocuments({ role: { $in: ['client','basic'] }, status: { $ne: 'deleted' } }),
    UserModel.countDocuments({ role: 'trainer', status: 'pending' }),
    UserModel.countDocuments({ status: 'active' }),
    UserModel.countDocuments({ status: 'suspended' }),
    MessageModel.countDocuments(),
    AILogModel.countDocuments(),
    UserModel.countDocuments({ role: 'trainer', tier: 'elite', status: 'active' }),
    UserModel.countDocuments({ role: 'trainer', tier: 'pro',   status: 'active' }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalTrainers,
    totalClients,
    pendingTrainers,
    activeUsers,
    suspendedUsers,
    totalMessages,
    totalAIRequests,
    eliteTrainers,
    proTrainers,
  });
}