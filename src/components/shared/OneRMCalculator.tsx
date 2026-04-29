'use client';
import { useState } from 'react';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';

const FORMULAS = [
  { name: 'Epley',   fn: (w: number, r: number) => r === 1 ? w : w * (1 + r / 30) },
  { name: 'Brzycki', fn: (w: number, r: number) => r === 1 ? w : w * (36 / (37 - r)) },
  { name: 'Lombardi',fn: (w: number, r: number) => w * Math.pow(r, 0.1) },
];

const LIFTS = ['Bench Press','Squat','Deadlift','Overhead Press','Barbell Row','Romanian Deadlift'];

export default function OneRMCalculator({ accentColor = '#a855f7' }: { accentColor?: string }) {
  const [weight,  setWeight]  = useState('');
  const [reps,    setReps]    = useState('');
  const [lift,    setLift]    = useState(LIFTS[0]);
  const [results, setResults] = useState<{ name: string; value: number }[] | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    if (!w || !r || w <= 0 || r <= 0) return;
    setResults(FORMULAS.map(f => ({ name: f.name, value: Math.round(f.fn(w, r)) })));
  };

  const inputStyle = {
    width: '100%', background: `${accentColor}08`, border: `1px solid ${accentColor}2a`,
    borderRadius: '8px', color: '#e9d5ff', padding: '10px 12px',
    fontSize: '0.9rem', outline: 'none', fontFamily: 'Courier New, monospace',
  };

  return (
    <div style={{ maxWidth: '520px' }}>
      <div className="flex flex-col gap-4 mb-6">
        {/* Lift selector */}
        <div>
          <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: `${accentColor}88`, display: 'block', marginBottom: '6px' }}>
            EXERCISE
          </label>
          <select value={lift} onChange={e => setLift(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            {LIFTS.map(l => <option key={l} value={l} style={{ background: '#0d0820' }}>{l}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: `${accentColor}88`, display: 'block', marginBottom: '6px' }}>
              WEIGHT (LBS)
            </label>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
              placeholder="225" style={inputStyle} min="0" />
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: `${accentColor}88`, display: 'block', marginBottom: '6px' }}>
              REPS PERFORMED
            </label>
            <input type="number" value={reps} onChange={e => setReps(e.target.value)}
              placeholder="5" style={inputStyle} min="1" max="30" />
          </div>
        </div>

       <LiquidGlassButton onClick={calculate} variant="primary" size="md" fullWidth>
          CALCULATE 1RM
        </LiquidGlassButton>
      </div>

      {results && (
        <div>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: `${accentColor}66`, marginBottom: '12px' }}>
            ESTIMATED 1RM — {lift.toUpperCase()}
          </p>
          <div className="flex flex-col gap-3">
            {results.map((r, i) => (
              <div key={r.name} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', borderRadius: '10px',
                background: i === 0 ? `${accentColor}18` : 'rgba(255,255,255,.03)',
                border: `1px solid ${i === 0 ? accentColor + '44' : 'rgba(255,255,255,.07)'}`,
              }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,.5)', letterSpacing: '0.08em' }}>
                  {r.name.toUpperCase()} {i === 0 ? '(RECOMMENDED)' : ''}
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: i === 0 ? accentColor : '#e9d5ff' }}>
                  {r.value} <span style={{ fontSize: '0.7rem' }}>LBS</span>
                </span>
              </div>
            ))}
          </div>

          {/* Working weight suggestions */}
          <div style={{ marginTop: '16px', padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
            <p style={{ margin: '0 0 10px', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,.35)' }}>
              WORKING WEIGHT SUGGESTIONS (% OF 1RM)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { pct: 65, label: 'Endurance' },
                { pct: 75, label: 'Hypertrophy' },
                { pct: 85, label: 'Strength' },
              ].map(({ pct, label }) => (
                <div key={pct} style={{ textAlign: 'center', padding: '8px', borderRadius: '6px', background: `${accentColor}0a`, border: `1px solid ${accentColor}22` }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: accentColor }}>{Math.round(results[0].value * pct / 100)}</div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,.3)', marginTop: '2px' }}>{pct}% · {label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}