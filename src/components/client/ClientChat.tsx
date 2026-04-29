'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';

interface Message {
  _id:       string;
  senderId:  string;
  message:   string;
  createdAt: string;
}

interface Trainer {
  userId:         string;
  name:           string;
  avatarInitials: string;
  unread:         number;
}

export default function ClientChat({ myId }: { myId: string }) {
  const [trainer,  setTrainer]  = useState<Trainer | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input,    setInput]    = useState('');
  const [sending,  setSending]  = useState(false);
  const [open,     setOpen]     = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchThread = useCallback(async (trainerId: string) => {
    const res  = await fetch(`/api/messages/${trainerId}`);
    const data = await res.json();
    setMessages(data.messages ?? []);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  useEffect(() => {
    fetch('/api/messages/conversations')
      .then(r => r.json())
      .then(data => {
        const t = data.conversations?.[0];
        if (t) {
          setTrainer(t);
          fetchThread(t.userId);
          pollRef.current = setInterval(() => fetchThread(t.userId), 3000);
        }
      });
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchThread]);

  const sendMessage = async () => {
    if (!input.trim() || !trainer || sending) return;
    setSending(true);
    const text = input.trim();
    setInput('');
    await fetch(`/api/messages/${trainer.userId}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ message: text }),
    });
    await fetchThread(trainer.userId);
    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── No trainer assigned ────────────────────
  if (!trainer) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', flexDirection: 'column', gap: '8px',
    }}>
      <p style={{ color: 'rgba(0,255,200,.3)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
        NO TRAINER ASSIGNED YET
      </p>
      <p style={{ color: 'rgba(255,255,255,.2)', fontSize: '0.75rem' }}>
        Ask your trainer to enroll you.
      </p>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Trainer info panel (left) ──────────── */}
      <div style={{
        width:         '260px',
        minWidth:      '260px',
        borderRight:   '1px solid rgba(0,255,200,.1)',
        display:       'flex',
        flexDirection: 'column',
        background:    'rgba(0,0,0,.25)',
      }}>
        <div style={{
          padding:      '20px 16px 14px',
          borderBottom: '1px solid rgba(0,255,200,.08)',
        }}>
          <h2 style={{
            margin: 0, fontSize: '0.8rem', fontWeight: 700,
            color: '#6ee7c8', letterSpacing: '0.15em',
          }}>
            MESSAGES
          </h2>
        </div>

        {/* Trainer card — click to open chat */}
        <div
          onClick={() => setOpen(true)}
          style={{
            padding:    '12px 16px',
            cursor:     'pointer',
            background: open ? 'rgba(0,255,200,.08)'  : 'transparent',
            borderLeft: open ? '2px solid #00ffc8'    : '2px solid transparent',
            transition: 'all 0.15s',
            display:    'flex',
            alignItems: 'center',
            gap:        '10px',
          }}
          onMouseEnter={e => {
            if (!open) (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,255,200,.04)';
          }}
          onMouseLeave={e => {
            if (!open) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
          }}
        >
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(168,85,247,.14)',
            border: '1px solid rgba(168,85,247,.32)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.72rem', fontWeight: 700, color: '#d8b4fe',
          }}>
            {trainer.avatarInitials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{
                margin: 0, fontWeight: 600, color: '#e9d5ff',
                fontSize: '0.82rem', letterSpacing: '0.05em',
              }}>
                {trainer.name.toUpperCase()}
              </p>
              {trainer.unread > 0 && (
                <span style={{
                  background: '#f472b6', color: '#fff', borderRadius: '10px',
                  padding: '1px 6px', fontSize: '0.65rem', fontWeight: 700,
                }}>
                  {trainer.unread}
                </span>
              )}
            </div>
            <p style={{
              margin: '2px 0 0', fontSize: '0.72rem',
              color: 'rgba(0,255,200,.4)',
            }}>
              YOUR TRAINER
            </p>
          </div>
        </div>
      </div>

      {/* ── Chat area (right) ─────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!open ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            justifyContent: 'center',
          }}>
            <p style={{
              color: 'rgba(0,255,200,.25)', fontSize: '0.85rem', letterSpacing: '0.1em',
            }}>
              SELECT YOUR TRAINER TO MESSAGE
            </p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div style={{
              padding:      '14px 20px',
              borderBottom: '1px solid rgba(0,255,200,.08)',
              display:      'flex',
              alignItems:   'center',
              gap:          '10px',
              background:   'rgba(0,0,0,.2)',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(168,85,247,.14)',
                border: '1px solid rgba(168,85,247,.32)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, color: '#d8b4fe',
              }}>
                {trainer.avatarInitials}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  margin: 0, fontWeight: 700, color: '#e9d5ff',
                  fontSize: '0.85rem', letterSpacing: '0.1em',
                }}>
                  {trainer.name.toUpperCase()}
                </p>
                <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(0,255,200,.4)' }}>
                  YOUR TRAINER
                </p>
              </div>
              <LiquidGlassButton
                onClick={() => setOpen(false)}
                variant="ghost"
                size="sm"
              >
                ✕ CLOSE
              </LiquidGlassButton>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '20px',
              display: 'flex', flexDirection: 'column', gap: '10px',
            }}>
              {messages.length === 0 && (
                <p style={{
                  color: 'rgba(255,255,255,.2)', fontSize: '0.8rem',
                  textAlign: 'center', margin: 'auto', letterSpacing: '0.08em',
                }}>
                  NO MESSAGES YET — YOUR TRAINER WILL REACH OUT SOON 💪
                </p>
              )}
              {messages.map(msg => {
                const isMine = msg.senderId === myId;
                return (
                  <div key={msg._id} style={{
                    display: 'flex',
                    justifyContent: isMine ? 'flex-end' : 'flex-start',
                  }}>
                    <div style={{
                      maxWidth:     '65%',
                      padding:      '9px 13px',
                      borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      // Client sent = cyan, trainer received = purple
                      background:   isMine
                        ? 'linear-gradient(135deg,#06b6d4,#0891b2)'
                        : 'rgba(168,85,247,.2)',
                      border:       isMine
                        ? 'none'
                        : '1px solid rgba(168,85,247,.4)',
                      color:        '#e9d5ff',
                      fontSize:     '0.85rem',
                      lineHeight:   1.55,
                      wordBreak:    'break-word',
                    }}>
                      <p style={{ margin: 0 }}>{msg.message}</p>
                      <p style={{
                        margin: '3px 0 0', fontSize: '0.65rem',
                        color: 'rgba(255,255,255,.4)', textAlign: 'right',
                      }}>
                        {new Date(msg.createdAt).toLocaleTimeString([],
                          { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
              padding:    '12px 20px',
              borderTop:  '1px solid rgba(0,255,200,.08)',
              display:    'flex',
              gap:        '10px',
              background: 'rgba(0,0,0,.2)',
            }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Message your trainer... (Enter to send)"
                rows={1}
                style={{
                  flex:        1,
                  background:  'rgba(0,255,200,.04)',
                  border:      '1px solid rgba(0,255,200,.18)',
                  borderRadius:'8px',
                  color:       '#e9d5ff',
                  padding:     '9px 12px',
                  fontSize:    '0.85rem',
                  resize:      'none',
                  outline:     'none',
                  fontFamily:  'Courier New, monospace',
                }}
              />
              <LiquidGlassButton
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                variant="client"
                size="sm"
                style={{ alignSelf: 'flex-end' }}
              >
                {sending ? '...' : 'SEND ↑'}
              </LiquidGlassButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}