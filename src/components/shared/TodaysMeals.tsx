'use client';

import { useEffect, useState, useCallback } from 'react';

interface FoodItem {
  name:      string;
  amount:    number;
  unit:      string;
  calories?: number;
  protein?:  number;
  carbs?:    number;
  fats?:     number;
}

interface MealEntry {
  mealName: string;
  mealTime: string;
  foods:    FoodItem[];
}

interface MealLog {
  date:        string;
  meals:       MealEntry[];
  totalMacros: { calories: number; protein: number; carbs: number; fats: number };
}

interface MealPlan {
  targetMacros: { calories: number; protein: number; carbs: number; fats: number };
  meals:        MealEntry[];
  logs:         MealLog[];
}

export default function TodaysMeals({
  clientId,
  accentColor = '#a855f7',
}: {
  clientId:    string;
  accentColor?: string;
}) {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading,  setLoading]  = useState(true);

  const fetchMeals = useCallback(async () => {
    try {
      const res  = await fetch(`/api/meals/${clientId}`);
      const data = await res.json();
      setMealPlan(data.mealPlan ?? null);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [clientId]);

  useEffect(() => {
    fetchMeals();
    const id = setInterval(fetchMeals, 15000); // refresh every 15s
    return () => clearInterval(id);
  }, [fetchMeals]);

  if (loading) return (
    <p style={{ color: 'rgba(255,255,255,.25)', fontSize: '0.78rem', padding: '12px 0' }}>
      Loading meals...
    </p>
  );

  const now       = new Date();
  const todayStr  = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const todayLog  = mealPlan?.logs
    ?.filter(l => {
      const d = new Date(l.date);
      const s = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      return s === todayStr;
    })
    ?.slice(-1)[0] ?? null;

  const targets  = mealPlan?.targetMacros ?? { calories: 0, protein: 0, carbs: 0, fats: 0 };
  const totals   = todayLog?.totalMacros  ?? { calories: 0, protein: 0, carbs: 0, fats: 0 };
  const template = mealPlan?.meals        ?? [];

  return (
    <div>
      {/* Macro progress bars */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Calories', current: totals.calories, target: targets.calories, color: '#fbbf24', unit: 'kcal' },
          { label: 'Protein',  current: totals.protein,  target: targets.protein,  color: '#6ee7c8', unit: 'g'    },
          { label: 'Carbs',    current: totals.carbs,    target: targets.carbs,    color: '#a5b4fc', unit: 'g'    },
          { label: 'Fats',     current: totals.fats,     target: targets.fats,     color: '#f9a8d4', unit: 'g'    },
        ].map(m => {
          const pct  = m.target > 0 ? Math.min((m.current / m.target) * 100, 100) : 0;
          const over = m.target > 0 && m.current > m.target;
          return (
            <div key={m.label} style={{
              background:   `${accentColor}06`,
              border:       `1px solid ${over ? '#f472b644' : accentColor + '22'}`,
              borderRadius: '8px',
              padding:      '10px 12px',
            }}>
              <div style={{ fontSize: '0.62rem', letterSpacing: '0.1em', color: `${accentColor}66`, marginBottom: '4px' }}>
                {m.label.toUpperCase()}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: over ? '#f472b6' : m.color }}>
                {Math.round(m.current)}
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,.3)', marginLeft: '3px' }}>
                  / {m.target} {m.unit}
                </span>
              </div>
              <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,.05)', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  width:      `${pct}%`,
                  background: over ? '#f472b6' : `linear-gradient(90deg,${accentColor},${m.color})`,
                  transition: 'width 0.4s',
                }} />
              </div>
              <div style={{ fontSize: '0.6rem', marginTop: '3px', color: over ? '#f472b6' : 'rgba(255,255,255,.25)' }}>
                {m.target > 0
                  ? over
                    ? `${Math.round(m.current - m.target)} over`
                    : `${Math.round(m.target - m.current)} remaining`
                  : 'No target set'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's logged meals */}
      {todayLog ? (
        <div>
          <div style={{ fontSize: '0.68rem', letterSpacing: '0.1em', color: `${accentColor}66`, marginBottom: '8px' }}>
            TODAY'S LOG — {new Date(todayLog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {todayLog.meals.map((meal, i) => (
              <div key={i} style={{
                borderRadius: '8px', overflow: 'hidden',
                border: `1px solid ${accentColor}18`,
              }}>
                <div style={{
                  padding:    '8px 12px',
                  background: `${accentColor}0a`,
                  display:    'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontWeight: 700, color: '#e9d5ff', fontSize: '0.82rem', letterSpacing: '0.05em' }}>
                    {meal.mealName.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,.3)' }}>
                    {meal.mealTime}
                  </span>
                </div>
                <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,.15)' }}>
                  {meal.foods.map((food, fi) => (
                    <div key={fi} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '3px 0',
                      borderBottom: fi < meal.foods.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
                    }}>
                      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,.6)' }}>
                        {food.name} — {food.amount}{food.unit}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: `${accentColor}88` }}>
                        {food.calories ?? 0} kcal
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : template.length > 0 ? (
        <div>
          <div style={{ fontSize: '0.68rem', letterSpacing: '0.1em', color: `${accentColor}55`, marginBottom: '8px' }}>
            MEAL PLAN TEMPLATE — NOT YET LOGGED TODAY
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {template.map((meal, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', borderRadius: '8px',
                background: `${accentColor}06`, border: `1px solid ${accentColor}18`,
              }}>
                <span style={{ fontWeight: 600, color: '#e9d5ff', fontSize: '0.82rem' }}>
                  {meal.mealName}
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,.3)' }}>
                    {meal.mealTime}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: `${accentColor}66` }}>
                    {meal.foods.length} food{meal.foods.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <a href="/dashboard/trainer/profile/meals" style={{
            display: 'block', marginTop: '10px', textAlign: 'center',
            padding: '8px', borderRadius: '6px', fontSize: '0.72rem',
            fontWeight: 700, letterSpacing: '0.1em', textDecoration: 'none',
            background: `${accentColor}0a`, border: `1px solid ${accentColor}25`,
            color: accentColor,
          }}>
            LOG TODAY'S MEALS →
          </a>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ color: `${accentColor}35`, fontSize: '0.8rem', margin: '0 0 12px', letterSpacing: '0.08em' }}>
            NO MEALS LOGGED TODAY
          </p>
          <a href="/dashboard/trainer/profile/meals" style={{
            padding: '8px 16px', borderRadius: '6px', fontSize: '0.72rem',
            fontWeight: 700, letterSpacing: '0.1em', textDecoration: 'none',
            background: `${accentColor}0a`, border: `1px solid ${accentColor}25`,
            color: accentColor,
          }}>
            + LOG MEALS
          </a>
        </div>
      )}
    </div>
  );
}