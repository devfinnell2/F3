import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { connectDB } from '@/lib/db/mongoose';
import AIProposalModel from '@/lib/db/models/AIProposal';

// GET — list all proposals for this trainer
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'trainer') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') ?? 'pending';

    const proposals = await AIProposalModel
        .find({ trainerId: session.user.id, status })
        .sort({ createdAt: -1 })
        .lean();

    return NextResponse.json({ proposals });
}

// PATCH — approve or dismiss a proposal
export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'trainer') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const { id, status } = await req.json() as { id: string; status: 'approved' | 'dismissed' };

    if (!['approved', 'dismissed'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const proposal = await AIProposalModel.findOneAndUpdate(
        { _id: id, trainerId: session.user.id },
        { status, resolvedAt: new Date() },
        { new: true }
    );

    if (!proposal) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ proposal });
}