// ─────────────────────────────────────────────
//  F3 — AI Coach Chat Component
//  Trainer-only. Full chat interface with
//  client context, quick actions, and
//  AI-suggested plan pushes.
// ─────────────────────────────────────────────

'use client';

import { useState, useRef, useEffect } from 'react';
import GlitchButton from '@/components/ui/GlitchButton';

interface Client {
  id: string;
  name: string;
  avatarInitials: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time: string;
  actionResult?: string;
}

interface AICoachProps {
  clients: Client[];
  trainerTier: string;
}

const QUICK_ACTIONS = [
  { label: 'EXP breakdown', prompt: 'Give me a full EXP and level breakdown for this client.' },
  { label: 'Fix macros', prompt: 'Analyze this client\'s macros and suggest corrections for remaining meals today.' },
  { label: 'Predict level', prompt: 'Predict when this client will hit their goal level based on current progress.' },
  { label: 'Suggest recipe', prompt: 'Suggest a high-protein recipe to help this client hit their protein target.' },
  { label: 'Check recovery', prompt: 'Evaluate this client\'s recovery based on their Vitality HP and suggest improvements.' },
  { label: 'Plateau fix', prompt: 'This client appears to be plateauing. What adjustments should I make?' },
];

function formatTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AICoach({ clients, trainerTier }: AICoachProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients[0]?.id ?? ''
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const isElite = trainerTier === 'elite';

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `F3 AI Coach online. ISSA methodology loaded.\n\n${clients.length > 0 ? `I can see ${clients.length} client${clients.length > 1 ? 's' : ''} assigned to you. Select a client above for context-aware recommendations, or ask me anything.` : 'No clients assigned yet. Enroll clients to get context-aware AI recommendations.'}`,
        time: formatTime(),
      },
    ]);
  }, [clients.length]);

  async function sendMessage(messageText?: string) {
    const text = (messageText ?? input).trim();
    if (!text || loading) return;

    setInput('');
    setError('');

    const userMsg: Message = {
      role: 'user',
      content: text,
      time: formatTime(),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0)
        .slice(-4)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          clientId: selectedClientId || undefined,
          conversationHistory: history,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'AI request failed.');
        return;
      }

      const aiMsg: Message = {
        role: 'assistant',
        content: data.output,
        time: formatTime(),
        actionResult: data.actionResult ?? undefined,
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-screen" style={{ fontFamily: 'Courier New, monospace' }}>

      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-6 py-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(168,85,247,.14)', background: 'rgba(0,0,0,.3)' }}
      >
        {/* AI avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
          style={{ background: 'rgba(0,255,200,.08)', border: '1px solid rgba(0,255,200,.25)' }}
        >
          🤖
        </div>

        <div className="flex-1">
          <div
            className="font-bold tracking-widest"
            style={{ color: '#d8b4fe', fontSize: '16px' }}
          >
            F3 AI COACH
          </div>
          <div className="text-xs" style={{ color: 'rgba(168,85,247,.48)' }}>
            ISSA-TRAINED · ONLY RESULTS · NO FLUFF
          </div>
        </div>

        {/* Tier badge */}
        {isElite ? (
          <span
            className="text-xs font-bold px-3 py-1 rounded"
            style={{
              background: 'rgba(251,191,36,.1)',
              border: '1px solid rgba(251,191,36,.28)',
              color: '#fbbf24',
            }}
          >
            ELITE — UNLIMITED AI
          </span>
        ) : (
          <span
            className="text-xs font-bold px-3 py-1 rounded"
            style={{
              background: 'rgba(168,85,247,.1)',
              border: '1px solid rgba(168,85,247,.28)',
              color: '#d8b4fe',
            }}
          >
            PRO — LIMITED AI
          </span>
        )}

        {/* Client selector */}
        {clients.length > 0 && (
          <select
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}
            style={{
              background: 'rgba(0,0,0,.45)',
              border: '1px solid rgba(168,85,247,.3)',
              color: '#e0d8ff',
              fontFamily: 'Courier New, monospace',
              fontSize: '13px',
              padding: '6px 10px',
              borderRadius: '4px',
              outline: 'none',
            }}
          >
            <option value="">No client selected</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.name.toUpperCase()}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ── Messages ── */}
      <div
        className="flex-1 overflow-y-auto px-6 py-4"
        style={{ background: 'rgba(0,0,0,.1)' }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '15px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                background: msg.role === 'user'
                  ? 'rgba(168,85,247,.12)'
                  : 'rgba(0,255,200,.05)',
                border: msg.role === 'user'
                  ? '1px solid rgba(168,85,247,.25)'
                  : '1px solid rgba(0,255,200,.15)',
                color: msg.role === 'user' ? '#ddd6fe' : '#a7f3d0',
              }}
            >
              {msg.content}
              {msg.actionResult && (
                <div style={{
                  marginTop: '10px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: msg.actionResult.startsWith('✅')
                    ? 'rgba(34,197,94,.1)' : 'rgba(251,191,36,.1)',
                  border: msg.actionResult.startsWith('✅')
                    ? '1px solid rgba(34,197,94,.3)' : '1px solid rgba(251,191,36,.3)',
                  color: msg.actionResult.startsWith('✅') ? '#86efac' : '#fcd34d',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}>
                  {msg.actionResult}
                </div>
              )}
              <div
                className="text-xs mt-1 text-right"
                style={{ color: 'rgba(255,255,255,.2)' }}
              >
                {msg.time}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start mb-4">
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(0,255,200,.05)',
                border: '1px solid rgba(0,255,200,.15)',
                color: 'rgba(0,255,200,.5)',
                fontSize: '15px',
              }}
            >
              F3 AI thinking...
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="text-sm px-4 py-2 rounded mb-4"
            style={{
              background: 'rgba(244,114,182,.08)',
              border: '1px solid rgba(244,114,182,.25)',
              color: '#f472b6',
            }}
          >
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Quick actions ── */}
      <div
        className="px-6 py-3 flex gap-2 flex-wrap shrink-0"
        style={{ borderTop: '1px solid rgba(168,85,247,.08)' }}
      >
        {QUICK_ACTIONS.map(action => (
          <GlitchButton
            key={action.label}
            onClick={() => sendMessage(action.prompt)}
            disabled={loading}
            variant="ghost"
            size="sm"
          >
            {action.label}
          </GlitchButton>
        ))}
      </div>

      {/* ── Input ── */}
      <div
        className="px-6 py-4 flex gap-3 shrink-0"
        style={{ borderTop: '1px solid rgba(168,85,247,.14)', background: 'rgba(0,0,0,.3)' }}
      >
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Query F3 AI${selectedClient ? ` about ${selectedClient.name.toUpperCase()}` : ''} — client, protocol, or plan...`}
          rows={2}
          style={{
            flex: 1,
            background: 'rgba(0,0,0,.45)',
            border: '1px solid rgba(168,85,247,.25)',
            color: '#e0d8ff',
            fontFamily: 'Courier New, monospace',
            fontSize: '15px',
            padding: '10px 12px',
            borderRadius: '6px',
            outline: 'none',
            resize: 'none',
          }}
        />
        <GlitchButton
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          variant="primary"
          size="md"
        >
          SEND →
        </GlitchButton>
      </div>
    </div>
  );
}