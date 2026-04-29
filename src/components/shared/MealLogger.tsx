// ─────────────────────────────────────────────
//  F3 — Meal Logger Component
//  Used by both trainers and clients
// ─────────────────────────────────────────────

'use client';

import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
import { useState } from 'react';
import type { IFoodItem, IMealEntry, IDailyMacros } from '@/types';
import { inputStyle } from '@/lib/inputStyles';

interface MealLoggerProps {
  clientId:     string;
  targetMacros: IDailyMacros;
  onLogged?:    () => void;
}

const UNITS = ['g', 'oz', 'cup', 'tbsp', 'tsp', 'scoop', 'piece'];

const EMPTY_FOOD: IFoodItem = {
  name:     '',
  amount:   100,
  unit:     'g',
  calories: undefined,
  protein:  undefined,
  carbs:    undefined,
  fats:     undefined,
};

const EMPTY_MEAL: IMealEntry = {
  mealName: '',
  mealTime: '09:00',
  foods:    [{ ...EMPTY_FOOD }],
};

export default function MealLogger({
  clientId,
  targetMacros,
  onLogged,
}: MealLoggerProps) {
  const [meals,   setMeals  ] = useState<IMealEntry[]>([{ ...EMPTY_MEAL }]);
  const [saving,  setSaving ] = useState(false);
  const [message, setMessage] = useState('');

  // ── Totals ──────────────────────────────────
  const totals = meals.reduce(
    (acc, meal) => {
      meal.foods.forEach(food => {
        acc.calories += food.calories ?? 0;
        acc.protein  += food.protein  ?? 0;
        acc.carbs    += food.carbs    ?? 0;
        acc.fats     += food.fats     ?? 0;
      });
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  // ── Meal helpers ────────────────────────────
  function addMeal() {
    setMeals(prev => [...prev, { ...EMPTY_MEAL, foods: [{ ...EMPTY_FOOD }] }]);
  }

  function removeMeal(mIdx: number) {
    setMeals(prev => prev.filter((_, i) => i !== mIdx));
  }

  function updateMeal(mIdx: number, field: keyof IMealEntry, value: string) {
    setMeals(prev => prev.map((m, i) =>
      i === mIdx ? { ...m, [field]: value } : m
    ));
  }

  // ── Food helpers ────────────────────────────
  function addFood(mIdx: number) {
    setMeals(prev => prev.map((m, i) =>
      i === mIdx
        ? { ...m, foods: [...m.foods, { ...EMPTY_FOOD }] }
        : m
    ));
  }

  function removeFood(mIdx: number, fIdx: number) {
    setMeals(prev => prev.map((m, i) =>
      i === mIdx
        ? { ...m, foods: m.foods.filter((_, fi) => fi !== fIdx) }
        : m
    ));
  }

  function updateFood(
    mIdx:  number,
    fIdx:  number,
    field: keyof IFoodItem,
    value: string | number
  ) {
    setMeals(prev => prev.map((m, i) =>
      i === mIdx
        ? {
            ...m,
            foods: m.foods.map((f, fi) =>
              fi === fIdx ? { ...f, [field]: value } : f
            ),
          }
        : m
    ));
  }

  // ── Save ────────────────────────────────────
 const [aiCorrection, setAiCorrection] = useState('');
const [correcting,   setCorrecting  ] = useState(false);

async function handleLog() {
  setSaving(true);
  setMessage('');

  try {
    const res = await fetch(`/api/meals/${clientId}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ meals, totalMacros: totals }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error ?? 'Save failed.');
    } else {
      setMessage('✓ Meals logged successfully.');

      // ── Trigger AI macro correction ───────────
      setCorrecting(true);
      try {
        const flatMeals = meals.flatMap(m =>
          m.foods.map(f => ({
            name:     `${m.mealName} — ${f.name}`,
            calories: f.calories ?? 0,
            protein:  f.protein  ?? 0,
            carbs:    f.carbs    ?? 0,
            fats:     f.fats     ?? 0,
          }))
        );

        const aiRes = await fetch('/api/ai/macros', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            clientId,
            loggedMeals: flatMeals,
          }),
        });

        const aiData = await aiRes.json();
        if (aiRes.ok && aiData.suggestion) {
          setAiCorrection(aiData.suggestion);
        }
      } catch {
        // AI correction is non-blocking — don't fail the save
        console.warn('AI macro correction unavailable');
      } finally {
        setCorrecting(false);
      }

      setMeals([{ ...EMPTY_MEAL, foods: [{ ...EMPTY_FOOD }] }]);
      onLogged?.();
    }
  } catch {
    setMessage('Network error. Please try again.');
  } finally {
    setSaving(false);
  }
}
  return (
    <div style={{ fontFamily: 'Courier New, monospace', color: '#e0d8ff' }}>

      {/* Macro targets */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Calories', target: targetMacros.calories, current: totals.calories, unit: 'kcal', color: '#fbbf24' },
          { label: 'Protein',  target: targetMacros.protein,  current: totals.protein,  unit: 'g',    color: '#6ee7c8' },
          { label: 'Carbs',    target: targetMacros.carbs,    current: totals.carbs,    unit: 'g',    color: '#a5b4fc' },
          { label: 'Fats',     target: targetMacros.fats,     current: totals.fats,     unit: 'g',    color: '#fbbf24' },
        ].map(macro => {
          const pct = macro.target > 0
            ? Math.min(Math.round((macro.current / macro.target) * 100), 100)
            : 0;
          const over = macro.target > 0 && macro.current > macro.target;
          return (
            <div
              key={macro.label}
              className="rounded-lg p-3"
              style={{
                background: 'rgba(168,85,247,.05)',
                border:     `1px solid ${over ? 'rgba(244,114,182,.4)' : 'rgba(168,85,247,.13)'}`,
              }}
            >
              <div
                className="text-xs tracking-widest mb-1"
                style={{ color: 'rgba(192,132,252,.48)' }}
              >
                {macro.label.toUpperCase()}
              </div>
              <div
                className="text-xl font-bold"
                style={{ color: over ? '#f472b6' : macro.color }}
              >
                {macro.current}
                <span className="text-xs font-normal ml-1" style={{ color: 'rgba(255,255,255,.3)' }}>
                  / {macro.target} {macro.unit}
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden mt-2"
                style={{ background: 'rgba(255,255,255,.05)' }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width:      `${pct}%`,
                    background: over
                      ? 'linear-gradient(90deg,#f472b6,#fb7185)'
                      : `linear-gradient(90deg,#a855f7,${macro.color})`,
                  }}
                />
              </div>
              {macro.target > 0 && (
                <div
                  className="text-xs mt-1"
                  style={{ color: over ? '#f472b6' : 'rgba(255,255,255,.28)' }}
                >
                  {over
                    ? `${macro.current - macro.target} over`
                    : `${macro.target - macro.current} remaining`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Meal blocks */}
      <div className="flex flex-col gap-4 mb-4">
        {meals.map((meal, mIdx) => (
          <div
            key={mIdx}
            className="rounded-lg overflow-hidden"
            style={{ border: '1px solid rgba(168,85,247,.14)' }}
          >
            {/* Meal header */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ background: 'rgba(168,85,247,.06)' }}
            >
              <input
                value={meal.mealName}
                onChange={e => updateMeal(mIdx, 'mealName', e.target.value)}
                placeholder="Meal name (e.g. Breakfast)"
                style={{ ...inputStyle, flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(168,85,247,.3)', borderRadius: 0, fontWeight: '700', color: '#d8b4fe' }}
              />
              <input
                type="time"
                value={meal.mealTime}
                onChange={e => updateMeal(mIdx, 'mealTime', e.target.value)}
                style={{ ...inputStyle, width: '110px' }}
              />
             <LiquidGlassButton onClick={() => removeMeal(mIdx)} variant="admin" size="sm">✕</LiquidGlassButton>
            </div>

            {/* Food rows */}
            <div className="p-4" style={{ background: 'rgba(0,0,0,.2)' }}>
              {/* Column headers */}
              {meal.foods.length > 0 && (
                <div
                  className="grid gap-2 mb-2 text-xs tracking-wide uppercase pb-2"
                  style={{
                    gridTemplateColumns: '1fr 70px 80px 65px 65px 65px 65px 32px',
                    color:        'rgba(168,85,247,.4)',
                    borderBottom: '1px solid rgba(168,85,247,.1)',
                  }}
                >
                  <span>Food</span>
                  <span>Amount</span>
                  <span>Unit</span>
                  <span>Cal</span>
                  <span>Protein</span>
                  <span>Carbs</span>
                  <span>Fats</span>
                  <span></span>
                </div>
              )}

              {/* Food entries */}
              {meal.foods.map((food, fIdx) => (
                <div
                  key={fIdx}
                  className="grid gap-2 mb-2 items-center"
                  style={{ gridTemplateColumns: '1fr 70px 80px 65px 65px 65px 65px 32px' }}
                >
                  <input
                    value={food.name}
                    onChange={e => updateFood(mIdx, fIdx, 'name', e.target.value)}
                    placeholder="Food name"
                    style={inputStyle}
                  />
                  <input
                    type="number"
                    value={food.amount}
                    onChange={e => updateFood(mIdx, fIdx, 'amount', Number(e.target.value))}
                    placeholder="100"
                    style={inputStyle}
                  />
                  <select
                    value={food.unit}
                    onChange={e => updateFood(mIdx, fIdx, 'unit', e.target.value)}
                    style={inputStyle}
                  >
                    {UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={food.calories ?? ''}
                    onChange={e => updateFood(mIdx, fIdx, 'calories', Number(e.target.value))}
                    placeholder="kcal"
                    style={inputStyle}
                  />
                  <input
                    type="number"
                    value={food.protein ?? ''}
                    onChange={e => updateFood(mIdx, fIdx, 'protein', Number(e.target.value))}
                    placeholder="g"
                    style={inputStyle}
                  />
                  <input
                    type="number"
                    value={food.carbs ?? ''}
                    onChange={e => updateFood(mIdx, fIdx, 'carbs', Number(e.target.value))}
                    placeholder="g"
                    style={inputStyle}
                  />
                  <input
                    type="number"
                    value={food.fats ?? ''}
                    onChange={e => updateFood(mIdx, fIdx, 'fats', Number(e.target.value))}
                    placeholder="g"
                    style={inputStyle}
                  />
                  <LiquidGlassButton onClick={() => removeFood(mIdx, fIdx)} variant="admin" size="sm" style={{ height:'30px', width:'30px', padding:'0' }}>✕</LiquidGlassButton>
                </div>
              ))}

             <LiquidGlassButton onClick={() => addFood(mIdx)} variant="client" size="sm" style={{ marginTop:'8px' }}>+ ADD FOOD</LiquidGlassButton>
            </div>
          </div>
        ))}
      </div>

      {/* Add meal + save row */}
      <div className="flex items-center gap-3 flex-wrap">
       <LiquidGlassButton onClick={addMeal} variant="primary" size="sm">+ ADD MEAL</LiquidGlassButton>
        <LiquidGlassButton onClick={handleLog} disabled={saving} variant="client" size="sm">
          {saving ? 'LOGGING...' : 'SAVE + LOG MEALS'}
        </LiquidGlassButton>
        {message && (
          <span
            style={{
              fontSize:   '12px',
              padding:    '6px 12px',
              borderRadius: '4px',
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
      </div>
      {/* ── AI Macro Correction ── */}
      {correcting && (
        <div
          className="mt-4 p-4 rounded-lg text-sm"
          style={{
            background: 'rgba(0,255,200,.04)',
            border:     '1px solid rgba(0,255,200,.15)',
            color:      'rgba(0,255,200,.6)',
            fontFamily: 'Courier New, monospace',
          }}
        >
          F3 AI analyzing macros...
        </div>
      )}

      {aiCorrection && !correcting && (
        <div
          className="mt-4 p-4 rounded-lg"
          style={{
            background: 'rgba(0,255,200,.04)',
            border:     '1px solid rgba(0,255,200,.2)',
          }}
        >
          <div
            className="text-xs tracking-widest mb-2"
            style={{ color: 'rgba(0,255,200,.5)' }}
          >
            🤖 F3 AI — MACRO CORRECTION
          </div>
          <div
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: '#a7f3d0' }}
          >
            {aiCorrection}
          </div>
          <LiquidGlassButton onClick={() => setAiCorrection('')} variant="ghost" size="sm" style={{ marginTop:'12px' }}>DISMISS</LiquidGlassButton>
        </div>
      )}
    </div>
  );
}