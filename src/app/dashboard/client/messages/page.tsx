// ─────────────────────────────────────────────
//  Client Messages Page — chat with trainer only
// ─────────────────────────────────────────────
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Message {
  _id:        string;
  senderId:   string;
  receiverId: string;
  message:    string;
  read:       boolean;
  createdAt:  string;
}

interface Trainer {
  userId:         string;
  name:           string;
  avatarInitials: string;
  unread:         number;
}

export default function ClientMessagesPage() {
  const [trainer,  setTrainer]  = useState<Trainer | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input,    setInput]    = useState('');
  const [sending,  setSending]  = useState(false);
  const [myId,     setMyId]     = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(d => setMyId(d.id ?? d._id ?? ''));
  }, []);

  const fetchThread = useCallback(async (trainerId: string) => {
    const res  = await fetch(`/api/messages/${trainerId}`);
    const data = await res.json();
    setMessages(data.messages ?? []);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  if (!trainer) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: 'rgba(255,255,255,0.3)' }}>No trainer assigned yet. Ask your trainer to enroll you.</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        padding:      '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display:      'flex',
        alignItems:   'center',
        gap:          '12px',
        background:   'rgba(0,0,0,0.15)',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.85rem', fontWeight: 700, color: '#fff',
        }}>
          {trainer.avatarInitials}
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, color: '#e2e8f0', fontSize: '0.95rem' }}>{trainer.name}</p>
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>Your Trainer</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem', textAlign: 'center', margin: 'auto' }}>
            No messages yet — your trainer will reach out soon! 💪
          </p>
        )}
        {messages.map(msg => {
          const isMine = msg.senderId === myId;
          return (
            <div key={msg._id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth:     '68%',
                padding:      '10px 14px',
                borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background:   isMine
                  ? 'linear-gradient(135deg,#06b6d4,#0891b2)'
                  : 'rgba(255,255,255,0.07)',
                border:       isMine ? 'none' : '1px solid rgba(255,255,255,0.1)',
                color:        '#e2e8f0',
                fontSize:     '0.88rem',
                lineHeight:   1.5,
                wordBreak:    'break-word',
              }}>
                <p style={{ margin: 0 }}>{msg.message}</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.68rem', color: isMine ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)', textAlign: 'right' }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding:    '14px 24px',
        borderTop:  '1px solid rgba(255,255,255,0.08)',
        display:    'flex',
        gap:        '12px',
        background: 'rgba(0,0,0,0.2)',
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Message your trainer... (Enter to send)"
          rows={1}
          style={{
            flex:        1,
            background:  'rgba(255,255,255,0.06)',
            border:      '1px solid rgba(255,255,255,0.12)',
            borderRadius:'10px',
            color:       '#e2e8f0',
            padding:     '10px 14px',
            fontSize:    '0.88rem',
            resize:      'none',
            outline:     'none',
            fontFamily:  'inherit',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          style={{
            padding:      '10px 20px',
            borderRadius: '10px',
            border:       'none',
            background:   input.trim() ? 'linear-gradient(135deg,#06b6d4,#0891b2)' : 'rgba(255,255,255,0.06)',
            color:        input.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
            fontWeight:   600,
            fontSize:     '0.88rem',
            cursor:       input.trim() ? 'pointer' : 'not-allowed',
            transition:   'all 0.2s',
            alignSelf:    'flex-end',
          }}
        >
          {sending ? '...' : 'Send ↑'}
        </button>
      </div>
    </div>
  );
}
