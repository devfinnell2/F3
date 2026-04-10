// ─────────────────────────────────────────────
//  F3 — Enroll Form Component
// ─────────────────────────────────────────────

'use client';

import { useState }  from 'react';
import { useRouter } from 'next/navigation';

const GOAL_TYPES = [
  { value: 'fat_loss',        label: 'Fat Loss'        },
  { value: 'muscle_gain',     label: 'Muscle Gain'     },
  { value: 'endurance',       label: 'Endurance'       },
  { value: 'recomposition',   label: 'Recomposition'   },
  { value: 'general_fitness', label: 'General Fitness' },
];

const DIET_TYPES = [
  { value: 'standard',      label: 'Standard'      },
  { value: 'keto',          label: 'Keto'          },
  { value: 'vegan',         label: 'Vegan'         },
  { value: 'vegetarian',    label: 'Vegetarian'    },
  { value: 'paleo',         label: 'Paleo'         },
  { value: 'carnivore',     label: 'Carnivore'     },
  { value: 'mediterranean', label: 'Mediterranean' },
];

const inputStyle = {
  background:   'rgba(0,0,0,.45)',
  border:       '1px solid rgba(168,85,247,.2)',
  color:        '#e0d8ff',
  fontFamily:   'Courier New, monospace',
  fontSize:     '15px',
  borderRadius: '5px',
  padding:      '8px 11px',
  outline:      'none',
  width:        '100%',
};

export default function EnrollForm() {
  const router = useRouter();

  const [clientEmail,   setClientEmail  ] = useState('');
  const [goalType,      setGoalType     ] = useState('fat_loss');
  const [dietType,      setDietType     ] = useState('standard');
  const [age,           setAge          ] = useState('');
  const [height,        setHeight       ] = useState('');
  const [waistStart,    setWaistStart   ] = useState('');
  const [waistGoal,     setWaistGoal    ] = useState('');
  const [injuries,      setInjuries     ] = useState('');
  const [yearsTraining, setYearsTraining] = useState('0');
  const [bmi,           setBmi          ] = useState('25');
  const [dietQuality,   setDietQuality  ] = useState('5');
  const [loading,       setLoading      ] = useState(false);
  const [error,         setError        ] = useState('');
  const [success,       setSuccess      ] = useState('');

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!clientEmail.trim()) {
      setError('Client email is required.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/clients', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          clientEmail:   clientEmail.trim().toLowerCase(),
          goalType,
          dietType,
          age:           age          ? Number(age)           : undefined,
          height:        height       || undefined,
          waistStart:    waistStart   ? Number(waistStart)    : undefined,
          waistGoal:     waistGoal    ? Number(waistGoal)     : undefined,
          injuries:      injuries     || undefined,
          yearsTraining: Number(yearsTraining),
          bmi:           Number(bmi),
          dietQuality:   Number(dietQuality),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Enrollment failed.');
        return;
      }

      setSuccess(
        `✓ ${data.clientName} enrolled! Starting Level: ${data.startingLevel}. Redirecting...`
      );

      setTimeout(() => router.push('/dashboard/trainer'), 2000);

    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleEnroll} className="flex flex-col gap-4">

      {/* Client email */}
      <div>
        <div
          className="text-xs tracking-widest mb-2"
          style={{ color: 'rgba(168,85,247,.5)' }}
        >
          CLIENT EMAIL *
        </div>
        <input
          type="email"
          value={clientEmail}
          onChange={e => setClientEmail(e.target.value)}
          placeholder="client@email.com"
          style={inputStyle}
          required
        />
        <div
          className="text-xs mt-1"
          style={{ color: 'rgba(255,255,255,.28)' }}
        >
          Client must have already created an F3 account.
        </div>
      </div>

      {/* Goal + diet */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs tracking-widest mb-2" style={{ color: 'rgba(168,85,247,.5)' }}>
            GOAL TYPE
          </div>
          <select
            value={goalType}
            onChange={e => setGoalType(e.target.value)}
            style={inputStyle}
          >
            {GOAL_TYPES.map(g => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="text-xs tracking-widest mb-2" style={{ color: 'rgba(168,85,247,.5)' }}>
            DIET TYPE
          </div>
          <select
            value={dietType}
            onChange={e => setDietType(e.target.value)}
            style={inputStyle}
          >
            {DIET_TYPES.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Age + height */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs tracking-widest mb-2" style={{ color: 'rgba(168,85,247,.5)' }}>
            AGE
          </div>
          <input
            type="number"
            value={age}
            onChange={e => setAge(e.target.value)}
            placeholder="32"
            style={inputStyle}
          />
        </div>
        <div>
          <div className="text-xs tracking-widest mb-2" style={{ color: 'rgba(168,85,247,.5)' }}>
            HEIGHT
          </div>
          <input
            type="text"
            value={height}
            onChange={e => setHeight(e.target.value)}
            placeholder={`5'10"`}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Waist */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs tracking-widest mb-2" style={{ color: 'rgba(168,85,247,.5)' }}>
            WAIST START (inches)
          </div>
          <input
            type="number"
            value={waistStart}
            onChange={e => setWaistStart(e.target.value)}
            placeholder="38"
            style={inputStyle}
          />
        </div>
        <div>
          <div className="text-xs tracking-widest mb-2" style={{ color: 'rgba(168,85,247,.5)' }}>
            WAIST GOAL (inches)
          </div>
          <input
            type="number"
            value={waistGoal}
            onChange={e => setWaistGoal(e.target.value)}
            placeholder="32"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Starting level inputs */}
      <div
        className="rounded-lg p-4"
        style={{
          background: 'rgba(168,85,247,.04)',
          border:     '1px solid rgba(168,85,247,.14)',
        }}
      >
        <div
          className="text-xs tracking-widest mb-3"
          style={{ color: 'rgba(168,85,247,.5)' }}
        >
          STARTING LEVEL CALCULATION
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-xs mb-1" style={{ color: 'rgba(168,85,247,.4)' }}>
              BMI
            </div>
            <input
              type="number"
              value={bmi}
              onChange={e => setBmi(e.target.value)}
              placeholder="25"
              style={{ ...inputStyle, fontSize: '13px' }}
            />
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'rgba(168,85,247,.4)' }}>
              YEARS TRAINING
            </div>
            <input
              type="number"
              value={yearsTraining}
              onChange={e => setYearsTraining(e.target.value)}
              placeholder="0"
              style={{ ...inputStyle, fontSize: '13px' }}
            />
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'rgba(168,85,247,.4)' }}>
              DIET QUALITY (0–10)
            </div>
            <input
              type="number"
              value={dietQuality}
              onChange={e => setDietQuality(e.target.value)}
              placeholder="5"
              min="0"
              max="10"
              style={{ ...inputStyle, fontSize: '13px' }}
            />
          </div>
        </div>
      </div>

      {/* Injuries */}
      <div>
        <div className="text-xs tracking-widest mb-2" style={{ color: 'rgba(168,85,247,.5)' }}>
          INJURIES / LIMITATIONS
        </div>
        <input
          type="text"
          value={injuries}
          onChange={e => setInjuries(e.target.value)}
          placeholder="e.g. Bad left knee, lower back pain"
          style={inputStyle}
        />
      </div>

      {/* Error / success */}
      {error && (
        <div
          className="px-4 py-3 rounded text-sm"
          style={{
            background: 'rgba(244,114,182,.08)',
            border:     '1px solid rgba(244,114,182,.25)',
            color:      '#f472b6',
            fontFamily: 'Courier New, monospace',
          }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          className="px-4 py-3 rounded text-sm"
          style={{
            background: 'rgba(0,255,200,.08)',
            border:     '1px solid rgba(0,255,200,.25)',
            color:      '#6ee7c8',
            fontFamily: 'Courier New, monospace',
          }}
        >
          {success}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 font-bold tracking-widest rounded transition-all"
        style={{
          background: loading ? 'rgba(168,85,247,.06)' : 'rgba(168,85,247,.15)',
          border:     '1px solid rgba(168,85,247,.4)',
          color:      loading ? 'rgba(192,132,252,.35)' : '#e9d5ff',
          cursor:     loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Courier New, monospace',
        }}
      >
        {loading ? 'ENROLLING...' : 'ENROLL CLIENT →'}
      </button>
    </form>
  );
}