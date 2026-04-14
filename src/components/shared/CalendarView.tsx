'use client';
import { useState, useEffect, useCallback } from 'react';

const DAYS   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const EVENT_COLORS: Record<string, string> = {
  workout: '#a855f7',
  meal:    '#00ffc8',
  cardio:  '#f472b6',
  rest:    '#60a5fa',
  note:    '#fbbf24',
};

interface CalEvent {
  _id:    string;
  date:   string;
  type:   string;
  title:  string;
  notes?: string;
}

export default function CalendarView({ accentColor = '#a855f7' }: { accentColor?: string }) {
  const today      = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events,   setEvents]   = useState<CalEvent[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [form,     setForm]     = useState({ title: '', type: 'note', notes: '' });
  const [saving,   setSaving]   = useState(false);

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const fetchEvents = useCallback(async () => {
    const res  = await fetch(`/api/calendar?month=${monthStr}`);
    const data = await res.json();
    setEvents(data.events ?? []);
  }, [monthStr]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells       = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  const dateKey  = (d: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const isToday  = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const dayEvents = (d: number) =>
    events.filter(e => e.date === dateKey(d));

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const openDay = (d: number) => {
    setSelected(dateKey(d));
    setForm({ title: '', type: 'note', notes: '' });
  };

  const saveEvent = async () => {
    if (!selected || !form.title.trim()) return;
    setSaving(true);
    await fetch('/api/calendar', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ date: selected, ...form }),
    });
    await fetchEvents();
    setForm({ title: '', type: 'note', notes: '' });
    setSaving(false);
  };

  const deleteEvent = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch('/api/calendar', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id }),
    });
    setEvents(prev => prev.filter(ev => ev._id !== id));
  };

  const inputStyle = {
    width: '100%', background: `${accentColor}08`,
    border: `1px solid ${accentColor}2a`, borderRadius: '8px',
    color: '#e9d5ff', padding: '8px 10px', fontSize: '0.85rem',
    outline: 'none', fontFamily: 'Courier New, monospace', boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ maxWidth: '760px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={prevMonth} style={{
          background: 'transparent', border: `1px solid ${accentColor}33`,
          borderRadius: '8px', color: accentColor, padding: '6px 14px',
          cursor: 'pointer', fontFamily: 'Courier New, monospace', fontSize: '1rem',
        }}>←</button>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: accentColor, letterSpacing: '0.15em' }}>
          {MONTHS[month].toUpperCase()} {year}
        </h2>
        <button onClick={nextMonth} style={{
          background: 'transparent', border: `1px solid ${accentColor}33`,
          borderRadius: '8px', color: accentColor, padding: '6px 14px',
          cursor: 'pointer', fontFamily: 'Courier New, monospace', fontSize: '1rem',
        }}>→</button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {Object.entries(EVENT_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }} />
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,.35)', letterSpacing: '0.08em' }}>
              {type.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '4px' }}>
        {DAYS.map(d => (
          <div key={d} style={{
            textAlign: 'center', fontSize: '0.62rem', fontWeight: 700,
            color: `${accentColor}55`, letterSpacing: '0.1em', padding: '4px 0',
          }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const evs = dayEvents(d);
          return (
            <div key={i} onClick={() => openDay(d)} style={{
              minHeight: '72px', borderRadius: '8px', padding: '5px',
              background: isToday(d) ? `${accentColor}22` : selected === dateKey(d) ? `${accentColor}14` : 'rgba(255,255,255,.03)',
              border: `1px solid ${isToday(d) ? accentColor + '66' : selected === dateKey(d) ? accentColor + '44' : 'rgba(255,255,255,.06)'}`,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = `${accentColor}14`)}
            onMouseLeave={e => (e.currentTarget.style.background = isToday(d) ? `${accentColor}22` : selected === dateKey(d) ? `${accentColor}14` : 'rgba(255,255,255,.03)')}
            >
              <div style={{
                fontSize: '0.78rem', fontWeight: isToday(d) ? 700 : 400,
                color: isToday(d) ? accentColor : 'rgba(255,255,255,.6)', marginBottom: '3px',
              }}>{d}</div>
              {evs.slice(0, 3).map(ev => (
                <div key={ev._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: `${EVENT_COLORS[ev.type] ?? accentColor}22`,
                  borderRadius: '3px', padding: '1px 4px', marginBottom: '2px',
                }}>
                  <span style={{
                    fontSize: '0.58rem', color: EVENT_COLORS[ev.type] ?? accentColor,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                  }}>
                    {ev.title}
                  </span>
                  <span
                    onClick={e => deleteEvent(ev._id, e)}
                    style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,.3)', cursor: 'pointer', marginLeft: '2px', flexShrink: 0 }}
                  >✕</span>
                </div>
              ))}
              {evs.length > 3 && (
                <div style={{ fontSize: '0.55rem', color: `${accentColor}66` }}>+{evs.length - 3} more</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Event creator */}
      {selected && (
        <div style={{
          marginTop: '16px', padding: '16px', borderRadius: '10px',
          background: 'rgba(255,255,255,.04)', border: `1px solid ${accentColor}33`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ margin: 0, fontSize: '0.72rem', letterSpacing: '0.1em', color: `${accentColor}88` }}>
              ADD EVENT — {selected}
            </p>
            <button onClick={() => setSelected(null)} style={{
              background: 'transparent', border: 'none', color: 'rgba(255,255,255,.3)',
              cursor: 'pointer', fontSize: '0.8rem',
            }}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Event title..."
              style={inputStyle}
            />
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              {Object.keys(EVENT_COLORS).map(t => (
                <option key={t} value={t} style={{ background: '#0d0820' }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Notes (optional)..."
            rows={2}
            style={{ ...inputStyle, resize: 'none', marginBottom: '10px', display: 'block' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={saveEvent} disabled={!form.title.trim() || saving} style={{
              flex: 1, padding: '8px', borderRadius: '6px',
              border: `1px solid ${accentColor}55`, background: `${accentColor}18`,
              color: accentColor, fontWeight: 700, fontSize: '0.75rem',
              letterSpacing: '0.1em', cursor: form.title.trim() ? 'pointer' : 'not-allowed',
              fontFamily: 'Courier New, monospace',
            }}>
              {saving ? 'SAVING...' : 'SAVE EVENT'}
            </button>
          </div>

          {/* Events on selected day */}
          {events.filter(e => e.date === selected).length > 0 && (
            <div style={{ marginTop: '12px', borderTop: `1px solid ${accentColor}18`, paddingTop: '10px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '0.65rem', letterSpacing: '0.1em', color: `${accentColor}55` }}>
                EVENTS THIS DAY
              </p>
              {events.filter(e => e.date === selected).map(ev => (
                <div key={ev._id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 8px', borderRadius: '6px', marginBottom: '4px',
                  background: `${EVENT_COLORS[ev.type] ?? accentColor}12`,
                  border: `1px solid ${EVENT_COLORS[ev.type] ?? accentColor}28`,
                }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#e9d5ff', fontWeight: 600 }}>{ev.title}</span>
                    {ev.notes && <p style={{ margin: '2px 0 0', fontSize: '0.65rem', color: 'rgba(255,255,255,.35)' }}>{ev.notes}</p>}
                  </div>
                  <button onClick={e => deleteEvent(ev._id, e)} style={{
                    background: 'transparent', border: 'none', color: 'rgba(255,255,255,.3)',
                    cursor: 'pointer', fontSize: '0.75rem',
                  }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}