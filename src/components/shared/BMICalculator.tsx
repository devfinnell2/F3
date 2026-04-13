'use client';
import { useState } from 'react';

export default function BMICalculator({ accentColor = '#a855f7' }: { accentColor?: string }) {
  const [unit,    setUnit]    = useState<'imperial' | 'metric'>('imperial');
  const [weight,  setWeight]  = useState('');
  const [heightFt,setHeightFt]= useState('');
  const [heightIn,setHeightIn]= useState('');
  const [heightCm,setHeightCm]= useState('');
  const [result,  setResult]  = useState<{ bmi: number; category: string; color: string } | null>(null);

  const calculate = () => {
    let bmi = 0;
    if (unit === 'imperial') {
      const w = parseFloat(weight);
      const h = (parseFloat(heightFt) * 12) + parseFloat(heightIn || '0');
      if (!w || !h) return;
      bmi = (w / (h * h)) * 703;
    } else {
      const w = parseFloat(weight);
      const h = parseFloat(heightCm) / 100;
      if (!w || !h) return;
      bmi = w / (h * h);
    }
    bmi = Math.round(bmi * 10) / 10;
    const category =
      bmi < 18.5 ? { label: 'Underweight', color: '#60a5fa' } :
      bmi < 25   ? { label: 'Normal',       color: '#34d399' } :
      bmi < 30   ? { label: 'Overweight',   color: '#fbbf24' } :
                   { label: 'Obese',        color: '#f87171' };
    setResult({ bmi, category: category.label, color: category.color });
  };

  const inputStyle = {
    width: '100%', background: `${accentColor}08`, border: `1px solid ${accentColor}2a`,
    borderRadius: '8px', color: '#e9d5ff', padding: '10px 12px',
    fontSize: '0.9rem', outline: 'none', fontFamily: 'Courier New, monospace',
  };

  return (
    <div style={{ maxWidth: '480px' }}>
      {/* Unit toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['imperial', 'metric'] as const).map(u => (
          <button key={u} onClick={() => setUnit(u)} style={{
            padding: '8px 20px', borderRadius: '8px', fontWeight: 700,
            fontSize: '0.75rem', letterSpacing: '0.1em', cursor: 'pointer',
            fontFamily: 'Courier New, monospace', transition: 'all 0.2s',
            border: `1px solid ${accentColor}${u === unit ? '88' : '22'}`,
            background: u === unit ? `${accentColor}18` : 'transparent',
            color: u === unit ? accentColor : 'rgba(255,255,255,.3)',
          }}>
            {u.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: `${accentColor}88`, display: 'block', marginBottom: '6px' }}>
            WEIGHT ({unit === 'imperial' ? 'LBS' : 'KG'})
          </label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
            placeholder={unit === 'imperial' ? '185' : '84'} style={inputStyle} min="0" />
        </div>

        {unit === 'imperial' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: `${accentColor}88`, display: 'block', marginBottom: '6px' }}>
                HEIGHT (FT)
              </label>
              <input type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)}
                placeholder="5" style={inputStyle} min="0" max="8" />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: `${accentColor}88`, display: 'block', marginBottom: '6px' }}>
                HEIGHT (IN)
              </label>
              <input type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)}
                placeholder="11" style={inputStyle} min="0" max="11" />
            </div>
          </div>
        ) : (
          <div>
            <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: `${accentColor}88`, display: 'block', marginBottom: '6px' }}>
              HEIGHT (CM)
            </label>
            <input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)}
              placeholder="180" style={inputStyle} min="0" />
          </div>
        )}

        <button onClick={calculate} style={{
          padding: '12px', borderRadius: '8px', border: `1px solid ${accentColor}55`,
          background: `${accentColor}18`, color: accentColor, fontWeight: 700,
          fontSize: '0.85rem', letterSpacing: '0.1em', cursor: 'pointer',
          fontFamily: 'Courier New, monospace', transition: 'all 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = `${accentColor}2e`)}
        onMouseLeave={e => (e.currentTarget.style.background = `${accentColor}18`)}
        >
          CALCULATE BMI
        </button>
      </div>

      {result && (
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${result.color}33` }}>
          <div style={{ padding: '20px', background: `${result.color}12`, textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: '3rem', fontWeight: 700, color: result.color, fontFamily: 'Courier New, monospace' }}>
              {result.bmi}
            </p>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: result.color, letterSpacing: '0.1em' }}>
              {result.category.toUpperCase()}
            </p>
          </div>
          <div style={{ padding: '14px 20px', background: 'rgba(255,255,255,.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'rgba(255,255,255,.35)', marginBottom: '8px' }}>
              <span>UNDERWEIGHT</span><span>NORMAL</span><span>OVERWEIGHT</span><span>OBESE</span>
            </div>
            <div style={{ position: 'relative', height: '8px', borderRadius: '4px', background: 'linear-gradient(90deg,#60a5fa,#34d399,#fbbf24,#f87171)', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 0, bottom: 0, left: `${Math.min(Math.max((result.bmi - 15) / 25 * 100, 0), 100)}%`,
                width: '3px', background: '#fff', borderRadius: '2px',
                transform: 'translateX(-50%)',
              }} />
            </div>
            <p style={{ margin: '12px 0 0', fontSize: '0.72rem', color: 'rgba(255,255,255,.3)', lineHeight: 1.5 }}>
              ⚠️ BMI is a screening tool only. It does not measure body fat directly. Always combine with other assessments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}