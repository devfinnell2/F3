// ─────────────────────────────────────────────
//  F3 — Workout Builder Component
//  Trainer creates/edits workout plans
// ─────────────────────────────────────────────

'use client';

import { useState } from 'react';
import type { IExercise, IWorkoutDay } from '@/types';

interface WorkoutBuilderProps {
  clientId:    string;
  clientName:  string;
  initialPlan: IWorkoutDay[];
  onSaved:     () => void;
}

const EMPTY_EXERCISE: IExercise = {
  name:          '',
  sets:          3,
  reps:          '10',
  weight:        '',
  tempo:         '',
  rest:          '60s',
  description:   '',
  executionTime: undefined,
};

const DEFAULT_DAYS: IWorkoutDay[] = [
  { dayLabel: 'MONDAY',    exercises: [] },
  { dayLabel: 'TUESDAY',   exercises: [] },
  { dayLabel: 'WEDNESDAY', exercises: [] },
  { dayLabel: 'THURSDAY',  exercises: [] },
  { dayLabel: 'FRIDAY',    exercises: [] },
  { dayLabel: 'SATURDAY',  exercises: [] },
  { dayLabel: 'SUNDAY',    exercises: [] },
];

const inputStyle = {
  background: 'rgba(0,0,0,.45)',
  border:     '1px solid rgba(168,85,247,.2)',
  color:      '#e0d8ff',
  fontFamily: 'Courier New, monospace',
  fontSize:   '13px',
  borderRadius: '4px',
  padding:    '6px 8px',
  outline:    'none',
  width:      '100%',
};

export default function WorkoutBuilder({
  clientId,
  clientName,
  initialPlan,
  onSaved,
}: WorkoutBuilderProps) {
  const [plan,    setPlan   ] = useState<IWorkoutDay[]>(
    initialPlan.length > 0 ? initialPlan : DEFAULT_DAYS
  );
  const [saving,  setSaving ] = useState(false);
  const [message, setMessage] = useState('');
  const [openDay, setOpenDay] = useState<number | null>(0);

  // ── Update day label ────────────────────────
  function updateDayLabel(dayIdx: number, label: string) {
    setPlan(prev => prev.map((d, i) => i === dayIdx ? { ...d, dayLabel: label } : d));
  }

  // ── Add exercise to a day ───────────────────
  function addExercise(dayIdx: number) {
    setPlan(prev => prev.map((d, i) =>
      i === dayIdx
        ? { ...d, exercises: [...d.exercises, { ...EMPTY_EXERCISE }] }
        : d
    ));
  }

  // ── Remove exercise ─────────────────────────
  function removeExercise(dayIdx: number, exIdx: number) {
    setPlan(prev => prev.map((d, i) =>
      i === dayIdx
        ? { ...d, exercises: d.exercises.filter((_, ei) => ei !== exIdx) }
        : d
    ));
  }

  // ── Update exercise field ───────────────────
  function updateExercise(
    dayIdx: number,
    exIdx:  number,
    field:  keyof IExercise,
    value:  string | number
  ) {
    setPlan(prev => prev.map((d, i) =>
      i === dayIdx
        ? {
            ...d,
            exercises: d.exercises.map((ex, ei) =>
              ei === exIdx ? { ...ex, [field]: value } : ex
            ),
          }
        : d
    ));
  }

  // ── Add a new day ───────────────────────────
  function addDay() {
    setPlan(prev => [...prev, { dayLabel: `DAY ${prev.length + 1}`, exercises: [] }]);
  }

  // ── Remove a day ────────────────────────────
  function removeDay(dayIdx: number) {
    setPlan(prev => prev.filter((_, i) => i !== dayIdx));
  }

  // ── Save plan ───────────────────────────────
  async function savePlan() {
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/workouts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ clientId, plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error ?? 'Save failed.');
      } else {
        setMessage('✓ Plan saved successfully.');
        onSaved();
      }
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ fontFamily: 'Courier New, monospace', color: '#e0d8ff' }}>

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-lg font-bold tracking-widest" style={{ color: '#d8b4fe' }}>
            WORKOUT PLAN
          </div>
          <div className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,.32)' }}>
            {clientName.toUpperCase()}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {message && (
            <span
              className="text-xs px-3 py-1.5 rounded"
              style={{
                background: message.startsWith('✓')
                  ? 'rgba(0,255,200,.08)'
                  : 'rgba(244,114,182,.08)',
                border: message.startsWith('✓')
                  ? '1px solid rgba(0,255,200,.25)'
                  : '1px solid rgba(244,114,182,.25)',
                color: message.startsWith('✓') ? '#6ee7c8' : '#f472b6',
              }}
            >
              {message}
            </span>
          )}
          <button
            onClick={savePlan}
            disabled={saving}
            className="px-4 py-2 text-xs font-bold tracking-widest rounded transition-all"
            style={{
              background: saving ? 'rgba(168,85,247,.06)' : 'rgba(168,85,247,.15)',
              border:     '1px solid rgba(168,85,247,.4)',
              color:      saving ? 'rgba(192,132,252,.4)' : '#e9d5ff',
              cursor:     saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'SAVING...' : 'SAVE PLAN'}
          </button>
        </div>
      </div>

      {/* Day blocks */}
      <div className="flex flex-col gap-3">
        {plan.map((day, dayIdx) => (
          <div
            key={dayIdx}
            className="rounded-lg overflow-hidden"
            style={{ border: '1px solid rgba(168,85,247,.14)' }}
          >
            {/* Day header — click to expand */}
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer"
              style={{ background: 'rgba(168,85,247,.06)' }}
              onClick={() => setOpenDay(openDay === dayIdx ? null : dayIdx)}
            >
              <input
                value={day.dayLabel}
                onChange={e => {
                  e.stopPropagation();
                  updateDayLabel(dayIdx, e.target.value);
                }}
                onClick={e => e.stopPropagation()}
                style={{
                  ...inputStyle,
                  width:      'auto',
                  flex:       1,
                  background: 'transparent',
                  border:     'none',
                  borderBottom: '1px solid rgba(168,85,247,.3)',
                  borderRadius: 0,
                  fontWeight: '700',
                  fontSize:   '14px',
                  color:      '#d8b4fe',
                  letterSpacing: '1.5px',
                }}
              />
              <span
                className="text-xs"
                style={{ color: 'rgba(168,85,247,.5)' }}
              >
                {day.exercises.length} exercises
              </span>
              <span style={{ color: 'rgba(168,85,247,.5)', fontSize: '12px' }}>
                {openDay === dayIdx ? '▲' : '▼'}
              </span>
              <button
                onClick={e => { e.stopPropagation(); removeDay(dayIdx); }}
                className="text-xs px-2 py-1 rounded"
                style={{
                  background: 'rgba(244,114,182,.08)',
                  border:     '1px solid rgba(244,114,182,.25)',
                  color:      '#f472b6',
                  cursor:     'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Expanded exercises */}
            {openDay === dayIdx && (
              <div className="p-4" style={{ background: 'rgba(0,0,0,.2)' }}>

                {/* Column headers */}
                {day.exercises.length > 0 && (
                  <div
                    className="grid gap-2 mb-2 text-xs tracking-wide uppercase pb-2"
                    style={{
                      gridTemplateColumns: '1fr 55px 70px 80px 65px 65px 32px',
                      color:  'rgba(168,85,247,.4)',
                      borderBottom: '1px solid rgba(168,85,247,.1)',
                    }}
                  >
                    <span>Exercise</span>
                    <span>Sets</span>
                    <span>Reps</span>
                    <span>Weight</span>
                    <span>Tempo</span>
                    <span>Rest</span>
                    <span></span>
                  </div>
                )}

                {/* Exercise rows */}
                {day.exercises.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    className="grid gap-2 mb-2 items-center"
                    style={{ gridTemplateColumns: '1fr 55px 70px 80px 65px 65px 32px' }}
                  >
                    <input
                      value={ex.name}
                      onChange={e => updateExercise(dayIdx, exIdx, 'name', e.target.value)}
                      placeholder="Exercise name"
                      style={inputStyle}
                    />
                    <input
                      type="number"
                      value={ex.sets}
                      onChange={e => updateExercise(dayIdx, exIdx, 'sets', Number(e.target.value))}
                      placeholder="3"
                      style={inputStyle}
                    />
                    <input
                      value={ex.reps}
                      onChange={e => updateExercise(dayIdx, exIdx, 'reps', e.target.value)}
                      placeholder="8–12"
                      style={inputStyle}
                    />
                    <input
                      value={ex.weight ?? ''}
                      onChange={e => updateExercise(dayIdx, exIdx, 'weight', e.target.value)}
                      placeholder="lbs / BW"
                      style={inputStyle}
                    />
                    <input
                      value={ex.tempo ?? ''}
                      onChange={e => updateExercise(dayIdx, exIdx, 'tempo', e.target.value)}
                      placeholder="3010"
                      style={inputStyle}
                    />
                    <input
                      value={ex.rest ?? ''}
                      onChange={e => updateExercise(dayIdx, exIdx, 'rest', e.target.value)}
                      placeholder="60s"
                      style={inputStyle}
                    />
                    <button
                      onClick={() => removeExercise(dayIdx, exIdx)}
                      className="flex items-center justify-center rounded text-xs font-bold"
                      style={{
                        background: 'rgba(244,114,182,.08)',
                        border:     '1px solid rgba(244,114,182,.25)',
                        color:      '#f472b6',
                        cursor:     'pointer',
                        height:     '30px',
                        width:      '30px',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Add exercise */}
                <button
                  onClick={() => addExercise(dayIdx)}
                  className="mt-2 px-3 py-1.5 text-xs font-bold tracking-widest rounded transition-all"
                  style={{
                    background: 'rgba(0,255,200,.07)',
                    border:     '1px solid rgba(0,255,200,.32)',
                    color:      '#6ee7c8',
                    cursor:     'pointer',
                  }}
                >
                  + ADD EXERCISE
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add day */}
      <button
        onClick={addDay}
        className="mt-3 px-4 py-2 text-xs font-bold tracking-widest rounded transition-all"
        style={{
          background: 'rgba(168,85,247,.09)',
          border:     '1px solid rgba(168,85,247,.38)',
          color:      '#c084fc',
          cursor:     'pointer',
        }}
      >
        + ADD DAY
      </button>
    </div>
  );
}