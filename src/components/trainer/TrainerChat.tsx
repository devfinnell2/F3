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
  message:    string;
  createdAt:  string;
}

export default function TrainerChat({ myId }: { myId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected,      setSelected]      = useState<Conversation | null>(null);
  const [messages,      setMessages]      = useState<Message[]>([]);
  const [input,         setInput]         = useState('');
  const [sending,       setSending]       = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchConversations = useCallback(async () => {
    const res  = await fetch('/api/messages/conversations');
    const data = await res.json();
    setConversations(data.conversations ?? []);
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const fetchMessages = useCallback(async (userId: string) => {
    const res  = await fetch(`/api/messages/${userId}`);
    const data = await res.json();
    setMessages(data.messages ?? []);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetchMessages(selected.userId);
    pollRef.current = setInterval(() => fetchMessages(selected.userId), 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selected, fetchMessages]);

  const openConversation = (conv: Conversation) => {
    setSelected(conv);
    setMessages([]);
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Client list ───────────────────────── */}
      <div style={{
        width:         '260px',
        minWidth:      '260px',
        borderRight:   '1px solid rgba(168,85,247,.12)',
        display:       'flex',
        flexDirection: 'column',
        background:    'rgba(0,0,0,.25)',
      }}>
        {/* Header */}
        <div style={{
          padding:      '20px 16px 14px',
          borderBottom: '1px solid rgba(168,85,247,.1)',
        }}>
          <h2 style={{
            margin: 0, fontSize: '0.8rem', fontWeight: 700,
            color: '#d8b4fe', letterSpacing: '0.15em',
          }}>
            MESSAGES
            {totalUnread > 0 && (
              <span style={{
                marginLeft: '8px', background: '#a855f7', color: '#fff',
                borderRadius: '12px', padding: '2px 7px', fontSize: '0.68rem',
              }}>
                {totalUnread}
              </span>
            )}
          </h2>
        </div>

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <p style={{
              color: 'rgba(255,255,255,.25)', fontSize: '0.8rem',
              padding: '20px', textAlign: 'center',
            }}>
              No clients enrolled yet
            </p>
          ) : conversations.map(conv => (
            <div
              key={conv.userId}
              onClick={() => openConversation(conv)}
              style={{
                padding:    '12px 16px',
                cursor:     'pointer',
                background: selected?.userId === conv.userId
                  ? 'rgba(168,85,247,.1)' : 'transparent',
                borderLeft: selected?.userId === conv.userId
                  ? '2px solid #a855f7' : '2px solid transparent',
                transition: 'all 0.15s',
                display:    'flex',
                alignItems: 'center',
                gap:        '10px',
              }}
              onMouseEnter={e => {
                if (selected?.userId !== conv.userId)
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(168,85,247,.05)';
              }}
              onMouseLeave={e => {
                if (selected?.userId !== conv.userId)
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent';
              }}
            >
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                background: 'rgba(168,85,247,.14)',
                border: '1px solid rgba(168,85,247,.32)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 700, color: '#d8b4fe',
              }}>
                {conv.avatarInitials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{
                    margin: 0, fontWeight: 600, color: '#e9d5ff',
                    fontSize: '0.82rem', letterSpacing: '0.05em',
                  }}>
                    {conv.name.toUpperCase()}
                  </p>
                  {conv.unread > 0 && (
                    <span style={{
                      background: '#a855f7', color: '#fff', borderRadius: '10px',
                      padding: '1px 6px', fontSize: '0.65rem', fontWeight: 700,
                    }}>
                      {conv.unread}
                    </span>
                  )}
                </div>
                <p style={{
                  margin: '2px 0 0', fontSize: '0.72rem',
                  color: 'rgba(255,255,255,.32)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {conv.latestMessage ?? 'No messages yet'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chat area ─────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selected ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column', gap: '8px',
          }}>
            <p style={{ color: 'rgba(168,85,247,.3)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
              SELECT A CLIENT TO MESSAGE
            </p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div style={{
              padding:      '14px 20px',
              borderBottom: '1px solid rgba(168,85,247,.1)',
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
                {selected.avatarInitials}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  margin: 0, fontWeight: 700, color: '#e9d5ff',
                  fontSize: '0.85rem', letterSpacing: '0.1em',
                }}>
                  {selected.name.toUpperCase()}
                </p>
                <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(255,255,255,.3)' }}>
                  CLIENT
                </p>
              </div>
              {/* Close / back button */}
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: 'transparent', border: 'none',
                  color: 'rgba(192,132,252,.45)', cursor: 'pointer',
                  fontSize: '0.75rem', letterSpacing: '0.1em',
                  fontFamily: 'Courier New, monospace',
                }}
              >
                ✕ CLOSE
              </button>
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
                  NO MESSAGES YET — SAY HI 👋
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
                      // Trainer sent = purple, received from client = cyan
                      background:   isMine
                        ? 'linear-gradient(135deg,#7c3aed,#a855f7)'
                        : 'rgba(6,182,212,.15)',
                      border:       isMine
                        ? 'none'
                        : '1px solid rgba(6,182,212,.35)',
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
              borderTop:  '1px solid rgba(168,85,247,.1)',
              display:    'flex',
              gap:        '10px',
              background: 'rgba(0,0,0,.2)',
            }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Message client... (Enter to send)"
                rows={1}
                style={{
                  flex:        1,
                  background:  'rgba(168,85,247,.06)',
                  border:      '1px solid rgba(168,85,247,.2)',
                  borderRadius:'8px',
                  color:       '#e9d5ff',
                  padding:     '9px 12px',
                  fontSize:    '0.85rem',
                  resize:      'none',
                  outline:     'none',
                  fontFamily:  'Courier New, monospace',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                style={{
                  padding:      '9px 18px',
                  borderRadius: '8px',
                  border:       '1px solid rgba(168,85,247,.4)',
                  background:   input.trim()
                    ? 'linear-gradient(135deg,#7c3aed,#a855f7)'
                    : 'rgba(168,85,247,.06)',
                  color:        input.trim() ? '#fff' : 'rgba(192,132,252,.35)',
                  fontWeight:   700,
                  fontSize:     '0.8rem',
                  cursor:       input.trim() ? 'pointer' : 'not-allowed',
                  letterSpacing:'0.08em',
                  fontFamily:   'Courier New, monospace',
                  alignSelf:    'flex-end',
                  transition:   'all 0.2s',
                }}
              >
                {sending ? '...' : 'SEND ↑'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}