'use client';
import { useState } from 'react';

const DAYS    = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MONTHS  = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CalendarView({ accentColor = '#a855f7' }: { accentColor?: string }) {
  const today     = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells      = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  const key = (d: number) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  const openDay = (d: number) => {
    const k = key(d);
    setSelected(k);
    setNoteInput(notes[k] ?? '');
  };

  const saveNote = () => {
    if (!selected) return;
    setNotes(prev => ({ ...prev, [selected]: noteInput }));
    setSelected(null);
  };

  return (
    <div style={{ maxWidth: '680px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={prevMonth} style={{
          background: 'transparent', border: `1px solid ${accentColor}33`, borderRadius: '8px',
          color: accentColor, padding: '6px 14px', cursor: 'pointer', fontFamily: 'Courier New, monospace',
        }}>←</button>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: accentColor, letterSpacing: '0.15em' }}>
          {MONTHS[month].toUpperCase()} {year}
        </h2>
        <button onClick={nextMonth} style={{
          background: 'transparent', border: `1px solid ${accentColor}33`, borderRadius: '8px',
          color: accentColor, padding: '6px 14px', cursor: 'pointer', fontFamily: 'Courier New, monospace',
        }}>→</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '4px' }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700,
            color: `${accentColor}55`, letterSpacing: '0.1em', padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const k    = key(d);
          const note = notes[k];
          const sel  = selected === k;
          return (
            <div key={i} onClick={() => openDay(d)} style={{
              minHeight: '64px', borderRadius: '8px', padding: '6px',
              background: isToday(d) ? `${accentColor}22` : sel ? `${accentColor}14` : 'rgba(255,255,255,.03)',
              border: `1px solid ${isToday(d) ? accentColor + '66' : sel ? accentColor + '44' : 'rgba(255,255,255,.06)'}`,
              cursor: 'pointer', transition: 'all 0.15s', position: 'relative',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = `${accentColor}14`)}
            onMouseLeave={e => (e.currentTarget.style.background = isToday(d) ? `${accentColor}22` : 'rgba(255,255,255,.03)')}
            >
              <div style={{
                fontSize: '0.78rem', fontWeight: isToday(d) ? 700 : 400,
                color: isToday(d) ? accentColor : 'rgba(255,255,255,.6)',
                marginBottom: '4px',
              }}>
                {d}
              </div>
              {note && (
                <div style={{
                  fontSize: '0.62rem', color: `${accentColor}cc`, lineHeight: 1.3,
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {note}
                </div>
              )}
              {note && <div style={{
                position: 'absolute', top: '6px', right: '6px',
                width: '5px', height: '5px', borderRadius: '50%', background: accentColor,
              }} />}
            </div>
          );
        })}
      </div>

      {/* Note editor */}
      {selected && (
        <div style={{
          marginTop: '16px', padding: '16px', borderRadius: '10px',
          background: 'rgba(255,255,255,.04)', border: `1px solid ${accentColor}33`,
        }}>
          <p style={{ margin: '0 0 8px', fontSize: '0.72rem', letterSpacing: '0.1em', color: `${accentColor}88` }}>
            NOTE FOR {selected}
          </p>
          <textarea
            value={noteInput}
            onChange={e => setNoteInput(e.target.value)}
            placeholder="Add a note, session detail, or reminder..."
            rows={3}
            style={{
              width: '100%', background: `${accentColor}08`, border: `1px solid ${accentColor}22`,
              borderRadius: '8px', color: '#e9d5ff', padding: '10px', fontSize: '0.85rem',
              outline: 'none', resize: 'none', fontFamily: 'Courier New, monospace', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button onClick={saveNote} style={{
              flex: 1, padding: '8px', borderRadius: '6px', border: `1px solid ${accentColor}55`,
              background: `${accentColor}18`, color: accentColor, fontWeight: 700,
              fontSize: '0.75rem', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'Courier New, monospace',
            }}>SAVE</button>
            <button onClick={() => setSelected(null)} style={{
              padding: '8px 16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,.1)',
              background: 'transparent', color: 'rgba(255,255,255,.3)', fontWeight: 700,
              fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Courier New, monospace',
            }}>CANCEL</button>
          </div>
        </div>
      )}
    </div>
  );
}