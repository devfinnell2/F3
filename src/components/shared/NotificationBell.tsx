'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface AppNotification {
    _id: string;
    type: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
}

const TYPE_ICON: Record<string, string> = {
    missed_workout: '⚠️',
    low_macros: '🍽️',
    level_up: '🏆',
    message: '💬',
    ai_proposal: '🧠',
    goal_achieved: '🎯',
};

export default function NotificationBell({ accentColor = '#a855f7' }: { accentColor?: string }) {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unread, setUnread] = useState(0);
    const [open, setOpen] = useState(false);
    const [pushGranted, setPushGranted] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const prevUnreadRef = useRef(0);
    const audioCtxRef = useRef<AudioContext | null>(null);

    // Initialize AudioContext on first user interaction (browser requirement)
    useEffect(() => {
        const init = () => {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext ||
                    (window as any).webkitAudioContext)();
            }
        };
        document.addEventListener('click', init, { once: true });
        return () => document.removeEventListener('click', init);
    }, []);

    const fetchNotifications = useCallback(async () => {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        setNotifications(data.notifications ?? []);
        const newUnread = data.unread ?? 0;
        // Play chime if new notifications arrived
        if (newUnread > prevUnreadRef.current && prevUnreadRef.current >= 0) {
            try {
                const ctx = audioCtxRef.current;
                if (ctx) {
                    if (ctx.state === 'suspended') await ctx.resume();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.setValueAtTime(880, ctx.currentTime);
                    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
                    gain.gain.setValueAtTime(0.15, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                    osc.start(ctx.currentTime);
                    osc.stop(ctx.currentTime + 0.4);
                }
            } catch { /* audio not available */ }
        }
        prevUnreadRef.current = newUnread;
        setUnread(newUnread);
    }, []);

    useEffect(() => {
        fetchNotifications();
        const id = setInterval(fetchNotifications, 5000); // poll every 5s
        return () => clearInterval(id);
    }, [fetchNotifications]);

    // ── Close panel when clicking outside ────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Register service worker + request push permission ──
    const enablePush = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            alert('Push notifications are not supported in this browser.');
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            alert('Please allow notifications to receive push alerts.');
            return;
        }

        try {
            const reg = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            const existing = await reg.pushManager.getSubscription();
            if (existing) { await existing.unsubscribe(); }

            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                ) as unknown as BufferSource,
            });

            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription }),
            });

            setPushGranted(true);
        } catch (err) {
            console.error('Push subscription failed:', err);
        }
    };

    const markAllRead = async () => {
        await fetch('/api/notifications', { method: 'PATCH' });
        setUnread(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const togglePanel = () => {
        setOpen(prev => {
            if (!prev && unread > 0) markAllRead();
            return !prev;
        });
    };

    return (
        <div ref={panelRef} style={{ position: 'relative' }}>
            {/* Bell button */}
            <button
                onClick={togglePanel}
                style={{
                    position: 'relative',
                    background: 'transparent',
                    border: `1px solid ${accentColor}33`,
                    borderRadius: '8px',
                    color: accentColor,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontFamily: 'Courier New, monospace',
                    transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = `${accentColor}18`)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                title="Notifications"
            >
                🔔
                {unread > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        background: '#f472b6',
                        color: '#fff',
                        borderRadius: '10px',
                        padding: '1px 5px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        lineHeight: 1.4,
                    }}>
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <div style={{
                    position: 'fixed',
                    bottom: '80px',
                    left: '16px',
                    width: '300px',
                    maxHeight: '500px',
                    background: 'rgba(10,6,26,.97)',
                    border: `1px solid ${accentColor}30`,
                    borderRadius: '12px',
                    boxShadow: `0 8px 32px rgba(0,0,0,.6), 0 0 0 1px ${accentColor}18`,
                    zIndex: 999,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    {/* Panel header */}
                    <div style={{
                        padding: '12px 16px',
                        borderBottom: `1px solid ${accentColor}18`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <span style={{
                            fontSize: '0.75rem', fontWeight: 700,
                            color: accentColor, letterSpacing: '0.12em',
                        }}>
                            NOTIFICATIONS
                        </span>
                        {!pushGranted && 'Notification' in window && Notification.permission !== 'granted' && (
                            <button
                                onClick={enablePush}
                                style={{
                                    background: `${accentColor}18`,
                                    border: `1px solid ${accentColor}40`,
                                    color: accentColor,
                                    borderRadius: '6px',
                                    padding: '3px 10px',
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    letterSpacing: '0.08em',
                                    fontFamily: 'Courier New, monospace',
                                }}
                            >
                                ENABLE PUSH
                            </button>
                        )}
                    </div>

                    {/* Notification list */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <p style={{
                                color: 'rgba(255,255,255,.25)', fontSize: '0.8rem',
                                textAlign: 'center', padding: '24px 16px',
                                letterSpacing: '0.08em',
                            }}>
                                ALL CLEAR — NO NOTIFICATIONS
                            </p>
                        ) : notifications.map(n => (
                            <div
                                key={n._id}
                                style={{
                                    padding: '12px 16px',
                                    borderBottom: 'rgba(255,255,255,.04) 1px solid',
                                    background: n.read ? 'transparent' : `${accentColor}08`,
                                    display: 'flex',
                                    gap: '10px',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }}>
                                    {TYPE_ICON[n.type] ?? '🔔'}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        margin: 0, fontWeight: 700, color: n.read ? 'rgba(255,255,255,.55)' : '#e9d5ff',
                                        fontSize: '0.8rem', letterSpacing: '0.04em',
                                    }}>
                                        {n.title}
                                    </p>
                                    <p style={{
                                        margin: '3px 0 0', color: 'rgba(255,255,255,.38)',
                                        fontSize: '0.75rem', lineHeight: 1.5,
                                    }}>
                                        {n.body}
                                    </p>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.65rem', color: 'rgba(255,255,255,.22)' }}>
                                        {new Date(n.createdAt).toLocaleString([], {
                                            month: 'short', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                                {!n.read && (
                                    <div style={{
                                        width: '7px', height: '7px', borderRadius: '50%',
                                        background: accentColor, flexShrink: 0, marginTop: '5px',
                                    }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Utility: VAPID key converter ──────────────
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(base64);
    return new Uint8Array([...raw].map(c => c.charCodeAt(0)));
}