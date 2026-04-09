// ─────────────────────────────────────────────
//  F3 — Trainer Workouts Page
//  Select a client and build their plan
// ─────────────────────────────────────────────

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db/mongoose';
import UserModel from '@/lib/db/models/User';
import WorkoutModel from '@/lib/db/models/Workout';
import TrainerSidebar from '@/components/trainer/TrainerSidebar';
import WorkoutBuilder from '@/components/trainer/WorkoutBuilder';
import type { IWorkoutDay } from '@/types';

interface PageProps {
    searchParams: { clientId?: string };
}

export default async function TrainerWorkoutsPage({ searchParams }: PageProps) {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');
    if (session.user.role !== 'trainer' && session.user.role !== 'admin') {
        redirect('/dashboard/client');
    }

    await connectDB();

    // ── Fetch trainer's clients ─────────────────
    const clients = await UserModel.find({
        role: 'client',
        trainerId: session.user.id,
        status: 'active',
    })
        .select('name avatarInitials')
        .lean();

    const trainer = {
        name: session.user.name ?? 'Trainer',
        email: session.user.email ?? '',
        tier: session.user.tier ?? 'pro',
        avatarInitials: (session.user.name ?? 'T')
            .split(' ')
            .map((p: string) => p[0])
            .join('')
            .toUpperCase()
            .slice(0, 2),
    };

    // ── Selected client ─────────────────────────
    const selectedId = searchParams.clientId ?? clients[0]?._id.toString();
    const selectedClient = clients.find(c => c._id.toString() === selectedId);

    // ── Fetch existing plan ─────────────────────
    let existingPlan: IWorkoutDay[] = [];
    if (selectedId) {
        const workout = await WorkoutModel.findOne({
            clientId: selectedId,
            trainerId: session.user.id,
        }).lean();
        existingPlan = (workout?.plan as IWorkoutDay[]) ?? [];
    }

    return (
        <div
            className="flex min-h-screen"
            style={{
                background: 'linear-gradient(135deg,#060612 0%,#0d0820 40%,#140a2e 70%,#0a0a1a 100%)',
            }}
        >
            <TrainerSidebar trainer={trainer} activeItem="workouts" />

            <main
                className="flex-1 p-6 overflow-y-auto"
                style={{ color: '#e0d8ff', fontFamily: 'Courier New, monospace' }}
            >
                <h1
                    className="text-2xl font-bold tracking-widest mb-6"
                    style={{ color: '#d8b4fe' }}
                >
                    WORKOUT BUILDER
                </h1>

                {clients.length === 0 ? (
                    <div
                        className="rounded-lg p-8 text-center"
                        style={{
                            background: 'rgba(255,255,255,.035)',
                            border: '1px solid rgba(168,85,247,.16)',
                        }}
                    >
                        <div className="text-lg mb-2" style={{ color: 'rgba(168,85,247,.5)' }}>
                            NO CLIENTS YET
                        </div>
                        <div className="text-sm" style={{ color: 'rgba(255,255,255,.28)' }}>
                            Enroll a client first to build their workout plan.
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-6">

                        {/* Client selector */}
                        <div
                            className="w-48 shrink-0"
                            style={{ fontFamily: 'Courier New, monospace' }}
                        >
                            <div
                                className="text-xs tracking-widest mb-2"
                                style={{ color: 'rgba(168,85,247,.38)' }}
                            >
                                SELECT CLIENT
                            </div>
                            <nav className="flex flex-col gap-1">
                                {clients.map(client => {
                                    const isSelected = client._id.toString() === selectedId;
                                    return (
                                        <a
                                            key={client._id.toString()}
                                            href={`/dashboard/trainer/workouts?clientId=${client._id}`}
                                            className="flex items-center gap-2 px-3 py-2 rounded transition-all text-sm"
                                            style={{
                                                background: isSelected ? 'rgba(168,85,247,.1)' : 'transparent',
                                                border: isSelected ? '1px solid rgba(168,85,247,.3)' : '1px solid transparent',
                                                color: isSelected ? '#e9d5ff' : 'rgba(192,132,252,.5)',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            <div
                                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                style={{
                                                    background: 'rgba(0,255,200,.09)',
                                                    border: '1px solid rgba(0,255,200,.28)',
                                                    color: '#6ee7c8',
                                                }}
                                            >
                                                {client.avatarInitials ?? '??'}
                                            </div>
                                            <span className="truncate uppercase">
                                                {client.name}
                                            </span>
                                        </a>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Workout builder */}
                        <div className="flex-1 min-w-0">
                            {selectedClient ? (
                                <WorkoutBuilder
                                    clientId={selectedId!}
                                    clientName={selectedClient.name}
                                    initialPlan={existingPlan}
                                    onSaved={() => { }}
                                />
                            ) : (
                                <div
                                    className="rounded-lg p-8 text-center"
                                    style={{
                                        background: 'rgba(255,255,255,.035)',
                                        border: '1px solid rgba(168,85,247,.16)',
                                    }}
                                >
                                    <div style={{ color: 'rgba(168,85,247,.5)' }}>
                                        Select a client to build their workout plan.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}