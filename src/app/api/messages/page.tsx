// ─────────────────────────────────────────────
//  Trainer Messages Page
// ─────────────────────────────────────────────
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Conversation {
  userId:         string;
  name:           string;
  avatarInitials: string;
  unread:         number;
  latestMessage:  string | null;
  latestAt:       string | null;
}

interface Message {
  _id:        string;
  senderId:   string;
  receiverId: string;
  message:    string;
  read:       boolean;
  createdAt:  string;
}

export default function TrainerMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected,      setSelected]      = useState<Conversation | null>(null);
  const [messages,      setMessages]      = useState<Message[]>([]);
  const [input,         setInput]         = useState('');
  const [sending,       setSending]       = useState(false);
  const [myId,          setMyId]          = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch my session ID ──────────────────────
  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(d => setMyId(d.id ?? d._id ?? ''));
  }, []);

  // ── Fetch conversation list ──────────────────
  const fetchConversations = useCallback(async () => {
    const res  = await fetch('/api/messages/conversations');
    const data = await res.json();
    setConversations(data.conversations ?? []);
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // ── Fetch messages for selected conversation ─
  const fetchMessages = useCallback(async (userId: string) => {
    const res  = await fetch(`/api/messages/${userId}`);
    const data = await res.json();
    setMessages(data.messages ?? []);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // ── Poll every 3s when a conversation is open ─
  useEffect(() => {
    if (!selected) return;
    fetchMessages(selected.userId);
    pollRef.current = setInterval(() => fetchMessages(selected.userId), 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selected, fetchMessages]);

  // ── Auto-scroll on new messages ───────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = (conv: Conversation) => {
    setSelected(conv);
    setMessages([]);
    // Clear unread badge locally
    setConversations(prev =>
      prev.map(c => c.userId === conv.userId ? { ...c, unread: 0 } : c)
    );
  };

  const sendMessage = async () => {
    if (!input.trim() || !selected || sending) return;
    setSending(true);
    const text = input.trim();
    setInput('');
    await fetch(`/api/messages/${selected.userId}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ message: text }),
    });
    await fetchMessages(selected.userId);
    await fetchConversations();
    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', gap: '0', overflow: 'hidden' }}>

      {/* ── Sidebar: conversation list ─────────── */}
      <div style={{
        width:        '300px',
        minWidth:     '300px',
        borderRight:  '1px solid rgba(255,255,255,0.08)',
        display:      'flex',
        flexDirection:'column',
        background:   'rgba(0,0,0,0.2)',
      }}>
        <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0' }}>
            Messages {totalUnread > 0 && (
              <span style={{
                marginLeft: '8px', background: '#8b5cf6', color: '#fff',
                borderRadius: '12px', padding: '2px 8px', fontSize: '0.72rem',
              }}>
                {totalUnread}
              </span>
            )}
          </h2>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', padding: '20px', textAlign: 'center' }}>
              No clients enrolled yet
            </p>
          ) : conversations.map(conv => (
            <div
              key={conv.userId}
              onClick={() => openConversation(conv)}
              style={{
                padding:    '14px 20px',
                cursor:     'pointer',
                background: selected?.userId === conv.userId ? 'rgba(139,92,246,0.12)' : 'transparent',
                borderLeft: selected?.userId === conv.userId ? '3px solid #8b5cf6' : '3px solid transparent',
                transition: 'all 0.15s',
                display:    'flex',
                alignItems: 'center',
                gap:        '12px',
              }}
              onMouseEnter={e => { if (selected?.userId !== conv.userId) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (selected?.userId !== conv.userId) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              {/* Avatar */}
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, color: '#fff',
              }}>
                {conv.avatarInitials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>
                    {conv.name}
                  </p>
                  {conv.unread > 0 && (
                    <span style={{
                      background: '#8b5cf6', color: '#fff', borderRadius: '10px',
                      padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700,
                    }}>
                      {conv.unread}
                    </span>
                  )}
                </div>
                <p style={{
                  margin: '2px 0 0', fontSize: '0.78rem',
                  color: 'rgba(255,255,255,0.38)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {conv.latestMessage ?? 'No messages yet'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chat thread ───────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '1rem' }}>
              Select a client to start messaging
            </p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div style={{
              padding:      '16px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display:      'flex',
              alignItems:   'center',
              gap:          '12px',
              background:   'rgba(0,0,0,0.15)',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.78rem', fontWeight: 700, color: '#fff',
              }}>
                {selected.avatarInitials}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: '#e2e8f0', fontSize: '0.95rem' }}>
                  {selected.name}
                </p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                  Client
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.length === 0 && (
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem', textAlign: 'center', margin: 'auto' }}>
                  No messages yet — say hi! 👋
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
                        ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)'
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
                placeholder="Type a message... (Enter to send)"
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
                  background:   input.trim() ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)' : 'rgba(255,255,255,0.06)',
                  color:        input.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
                  fontWeight:   600,
                  fontSize:     '0.88rem',
                  cursor:       input.trim() ? 'pointer' : 'not-allowed',
                  transition:   'all 0.2s',
                  whiteSpace:   'nowrap',
                  alignSelf:    'flex-end',
                }}
              >
                {sending ? '...' : 'Send ↑'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}