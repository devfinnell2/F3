// ─────────────────────────────────────────────
//  F3 — Workout Builder Component
//  Trainer creates/edits workout plans
// ─────────────────────────────────────────────

'use client';

import { useState } from 'react';
import type { IExercise, IWorkoutDay } from '@/types';

interface WorkoutBuilderProps {
  clientId: string;
  clientName: string;
  initialPlan: IWorkoutDay[];
  onSaved: () => void;
}

const EMPTY_EXERCISE: IExercise = {
  name: '',
  sets: 3,
  reps: '10',
  weight: '',
  tempo: '',
  rest: '60s',
  description: '',
  executionTime: undefined,
};

const DEFAULT_DAYS: IWorkoutDay[] = [
  { dayLabel: 'MONDAY', exercises: [] },
  { dayLabel: 'TUESDAY', exercises: [] },
  { dayLabel: 'WEDNESDAY', exercises: [] },
  { dayLabel: 'THURSDAY', exercises: [] },
  { dayLabel: 'FRIDAY', exercises: [] },
  { dayLabel: 'SATURDAY', exercises: [] },
  { dayLabel: 'SUNDAY', exercises: [] },
];

const inputStyle = {
  background: 'rgba(0,0,0,.45)',
  border: '1px solid rgba(168,85,247,.2)',
  color: '#e0d8ff',
  fontFamily: 'Courier New, monospace',
  fontSize: '13px',
  borderRadius: '4px',
  padding: '6px 8px',
  outline: 'none',
  width: '100%',
};

export default function WorkoutBuilder({
  clientId,
  clientName,
  initialPlan,
  onSaved,
}: WorkoutBuilderProps) {
  const [plan, setPlan] = useState<IWorkoutDay[]>(
    initialPlan.length > 0 ? initialPlan : DEFAULT_DAYS
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [openDay, setOpenDay] = useState<number | null>(0);
  const [generating, setGenerating] = useState(false);
  const [aiPlan, setAiPlan] = useState<IWorkoutDay[] | null>(null);
  const [showAiPreview, setShowAiPreview] = useState(false);
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [sessionMins, setSessionMins] = useState(60);

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
    exIdx: number,
    field: keyof IExercise,
    value: string | number
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

  // ── Generate plan with AI ───────────────────
  async function generateWithAI() {
    setGenerating(true);
    setMessage('');

    try {
      const res = await fetch('/api/ai/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, daysPerWeek, sessionMins }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error ?? 'AI generation failed.');
        return;
      }

      setAiPlan(data.plan);
      setShowAiPreview(true);
      setMessage('✓ AI plan generated. Review below before applying.');

    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  // ── Apply AI plan to builder ────────────────
  function applyAIPlan() {
    if (aiPlan) {
      setPlan(aiPlan);
      setShowAiPreview(false);
      setAiPlan(null);
      setOpenDay(0);
      setMessage('✓ AI plan applied. Review each day then save.');
    }
  }

  // ── Save plan ───────────────────────────────
  async function savePlan() {
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, plan }),
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
      <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
        <div>
          <div className="text-lg font-bold tracking-widest" style={{ color: '#d8b4fe' }}>
            WORKOUT PLAN
          </div>
          <div className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,.32)' }}>
            {clientName.toUpperCase()}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* AI controls */}
          <div className="flex items-center gap-2">
            <select
              value={daysPerWeek}
              onChange={e => setDaysPerWeek(Number(e.target.value))}
              style={{
                background: 'rgba(0,0,0,.45)',
                border: '1px solid rgba(0,255,200,.2)',
                color: '#6ee7c8',
                fontFamily: 'Courier New, monospace',
                fontSize: '12px',
                padding: '5px 8px',
                borderRadius: '4px',
                outline: 'none',
              }}
            >
              {[3, 4, 5, 6].map(d => (
                <option key={d} value={d}>{d} days/week</option>
              ))}
            </select>
            <select
              value={sessionMins}
              onChange={e => setSessionMins(Number(e.target.value))}
              style={{
                background: 'rgba(0,0,0,.45)',
                border: '1px solid rgba(0,255,200,.2)',
                color: '#6ee7c8',
                fontFamily: 'Courier New, monospace',
                fontSize: '12px',
                padding: '5px 8px',
                borderRadius: '4px',
                outline: 'none',
              }}
            >
              {[30, 45, 60, 75, 90].map(m => (
                <option key={m} value={m}>{m} min</option>
              ))}
            </select>
            <button
              onClick={generateWithAI}
              disabled={generating || saving}
              className="px-3 py-2 text-xs font-bold tracking-widest rounded transition-all"
              style={{
                background: generating
                  ? 'rgba(0,255,200,.04)'
                  : 'rgba(0,255,200,.1)',
                border: '1px solid rgba(0,255,200,.35)',
                color: generating
                  ? 'rgba(0,255,200,.3)'
                  : '#6ee7c8',
                cursor: generating ? 'not-allowed' : 'pointer',
                fontFamily: 'Courier New, monospace',
              }}
            >
              {generating ? '🤖 GENERATING...' : '🤖 AI GENERATE'}
            </button>
          </div>

          {/* Status message */}
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

          {/* Save button */}
          <button
            onClick={savePlan}
            disabled={saving}
            className="px-4 py-2 text-xs font-bold tracking-widest rounded transition-all"
            style={{
              background: saving ? 'rgba(168,85,247,.06)' : 'rgba(168,85,247,.15)',
              border: '1px solid rgba(168,85,247,.4)',
              color: saving ? 'rgba(192,132,252,.4)' : '#e9d5ff',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'Courier New, monospace',
            }}
          >
            {saving ? 'SAVING...' : 'SAVE PLAN'}
          </button>
        </div>
      </div>

      {/* AI Preview Panel */}
      {showAiPreview && aiPlan && (
        <div
          className="rounded-lg p-4 mb-5"
          style={{
            background: 'rgba(0,255,200,.04)',
            border: '1px solid rgba(0,255,200,.2)',
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <div
              className="text-sm font-bold tracking-widest"
              style={{ color: '#6ee7c8' }}
            >
              🤖 AI GENERATED PLAN — REVIEW BEFORE APPLYING
            </div>
            <div className="flex gap-2">
              <button
                onClick={applyAIPlan}
                className="px-3 py-1.5 text-xs font-bold tracking-widest rounded"
                style={{
                  background: 'rgba(0,255,200,.12)',
                  border: '1px solid rgba(0,255,200,.35)',
                  color: '#6ee7c8',
                  cursor: 'pointer',
                  fontFamily: 'Courier New, monospace',
                }}
              >
                ✓ APPLY TO BUILDER
              </button>
              <button
                onClick={() => { setShowAiPreview(false); setAiPlan(null); }}
                className="px-3 py-1.5 text-xs font-bold tracking-widest rounded"
                style={{
                  background: 'rgba(244,114,182,.08)',
                  border: '1px solid rgba(244,114,182,.25)',
                  color: '#f472b6',
                  cursor: 'pointer',
                  fontFamily: 'Courier New, monospace',
                }}
              >
                ✕ DISCARD
              </button>
            </div>
          </div>

          {/* Preview each day */}
          <div className="flex flex-col gap-2">
            {aiPlan.map((day, i) => (
              <div
                key={i}
                className="rounded p-3"
                style={{
                  background: 'rgba(0,0,0,.25)',
                  border: '1px solid rgba(0,255,200,.1)',
                }}
              >
                <div
                  className="font-bold text-xs tracking-widest mb-2"
                  style={{ color: '#00ffc8' }}
                >
                  {day.dayLabel}
                </div>
                <div className="flex flex-col gap-1">
                  {day.exercises.map((ex, ei) => (
                    <div
                      key={ei}
                      className="text-xs flex gap-3"
                      style={{ color: 'rgba(255,255,255,.6)' }}
                    >
                      <span style={{ color: '#e0d8ff', minWidth: '160px' }}>{ex.name}</span>
                      <span style={{ color: '#d8b4fe' }}>{ex.sets}×{ex.reps}</span>
                      {ex.weight && <span style={{ color: '#fbbf24' }}>{ex.weight}</span>}
                      {ex.rest && <span style={{ color: 'rgba(255,255,255,.35)' }}>rest {ex.rest}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  width: 'auto',
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(168,85,247,.3)',
                  borderRadius: 0,
                  fontWeight: '700',
                  fontSize: '14px',
                  color: '#d8b4fe',
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
                  border: '1px solid rgba(244,114,182,.25)',
                  color: '#f472b6',
                  cursor: 'pointer',
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
                      color: 'rgba(168,85,247,.4)',
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
                        border: '1px solid rgba(244,114,182,.25)',
                        color: '#f472b6',
                        cursor: 'pointer',
                        height: '30px',
                        width: '30px',
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
                    border: '1px solid rgba(0,255,200,.32)',
                    color: '#6ee7c8',
                    cursor: 'pointer',
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
          border: '1px solid rgba(168,85,247,.38)',
          color: '#c084fc',
          cursor: 'pointer',
        }}
      >
        + ADD DAY
      </button>
    </div>
  );
}