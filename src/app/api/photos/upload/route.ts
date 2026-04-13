// ─────────────────────────────────────────────
//  POST /api/photos/upload
//  Accepts base64 image, uploads to Cloudinary,
//  saves URL to ClientProfile
// ─────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }          from 'next-auth';
import { authOptions }               from '@/lib/auth/config';
import { connectDB }                 from '@/lib/db/mongoose';
import ClientProfileModel            from '@/lib/db/models/ClientProfile';
import cloudinary                    from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { image, type, clientId } = await req.json() as {
    image:    string;           // base64 data URL
    type:     'before' | 'after';
    clientId?: string;          // trainer uploading for a client
  };

  if (!image || !['before', 'after'].includes(type)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Determine whose profile to update
  const targetId = session.user.role === 'trainer' && clientId
    ? clientId
    : session.user.id;

  // Trainers can only update their own clients
  if (session.user.role === 'trainer' && clientId) {
    await connectDB();
    const profile = await ClientProfileModel.findOne({ userId: clientId }).lean();
    if (!profile || profile.trainerId?.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Upload to Cloudinary
  let uploadResult;
  try {
    uploadResult = await cloudinary.uploader.upload(image, {
      folder:         `f3/${targetId}`,
      public_id:      `${type}_photo`,
      overwrite:      true,
      transformation: [
        { width: 800, height: 1000, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto'   },
      ],
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  await connectDB();

  const field     = type === 'before' ? 'beforePhoto'     : 'afterPhoto';
  const dateField = type === 'before' ? 'beforePhotoDate' : 'afterPhotoDate';

  await ClientProfileModel.findOneAndUpdate(
    { userId: targetId },
    {
      [field]:     uploadResult.secure_url,
      [dateField]: new Date(),
    },
    { upsert: true }
  );

  return NextResponse.json({ url: uploadResult.secure_url });
}