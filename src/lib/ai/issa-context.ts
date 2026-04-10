// ─────────────────────────────────────────────
//  F3 — ISSA Knowledge Context
//  RAG layer — curated from ISSA CPT manual
//  Used to ground all AI responses in
//  ISSA-certified methodology
// ─────────────────────────────────────────────

export const ISSA_NUTRITION = `
ISSA NUTRITION PRINCIPLES (CPT Manual):

MACRONUTRIENTS:
- Protein: 0.7–1.0g per lb of bodyweight for active clients. Up to 1.2g for muscle gain.
- Carbohydrates: Primary fuel for high-intensity exercise. 45–65% of total calories for active clients.
- Fats: Essential for hormone production. Minimum 20% of total calories. Focus on unsaturated fats.
- Calories: 1lb of fat = ~3,500 calories. Deficit of 500 kcal/day = ~1lb loss/week.

MEAL TIMING:
- Pre-workout: Carbs + protein 1–2 hours before training.
- Post-workout: Protein + carbs within 30–60 minutes for recovery.
- Protein distribution: Spread evenly across 3–5 meals for optimal muscle protein synthesis.

FAT LOSS:
- Caloric deficit of 300–500 kcal/day is sustainable and preserves muscle.
- High protein (1.0–1.2g/lb) preserves lean mass during a cut.
- Avoid deficits over 1,000 kcal/day — leads to muscle loss and metabolic adaptation.

MUSCLE GAIN:
- Caloric surplus of 200–300 kcal/day minimizes fat gain.
- Protein: 0.8–1.0g per lb bodyweight minimum.
- Carbohydrates support training volume and recovery.

HYDRATION:
- Minimum 0.5–1oz water per lb of bodyweight daily.
- Additional 16–24oz per hour of exercise.
`;

export const ISSA_TRAINING = `
ISSA TRAINING PRINCIPLES (CPT Manual):

PROGRESSIVE OVERLOAD:
- Increase load, volume, or frequency over time to drive adaptation.
- 2–5% increase in load when client completes all reps with good form.
- SAID principle: Specific Adaptation to Imposed Demands.

REP RANGES:
- Strength: 1–5 reps at 85–100% 1RM. Long rest (3–5 min).
- Hypertrophy: 6–12 reps at 67–85% 1RM. Rest 60–90 sec.
- Endurance: 12–20+ reps at <67% 1RM. Rest 30–60 sec.
- Power: 1–5 explosive reps at 75–90% 1RM. Rest 2–5 min.

PERIODIZATION:
- Linear: Gradual increase in intensity over weeks. Best for beginners.
- Undulating: Vary intensity daily/weekly. Best for intermediate/advanced.
- Block: Phases of accumulation, intensification, realization.

EXERCISE SELECTION:
- Compound movements first (squat, deadlift, bench, row, press).
- Isolation movements after compound work.
- 2–4 exercises per muscle group per session.

FREQUENCY:
- Beginners: Full body 2–3x/week.
- Intermediate: Upper/lower split 4x/week or PPL 3–6x/week.
- Advanced: Higher frequency with periodized volume.

RECOVERY:
- 48 hours minimum between training same muscle group.
- Sleep 7–9 hours for optimal recovery and hormone production.
- Deload weeks every 4–8 weeks to prevent overtraining.

TEMPO (4 digits — eccentric/pause/concentric/pause):
- 3010: 3s lower, no pause, 1s lift, no pause. Standard hypertrophy.
- 4011: 4s lower, no pause, 1s lift, 1s pause. Time under tension.
- 2010: 2s lower, explosive concentric. Power development.

WORKING WEIGHT:
- Training weight = 70–80% of 1RM for hypertrophy.
- Epley formula: 1RM = Weight × (1 + Reps ÷ 30).
`;

export const ISSA_ASSESSMENT = `
ISSA CLIENT ASSESSMENT (CPT Manual):

BMI CATEGORIES:
- Underweight: < 18.5
- Normal: 18.5–24.9
- Overweight: 25–29.9
- Obese Class I: 30–34.9
- Obese Class II: 35–39.9
- Obese Class III: 40+

WAIST CIRCUMFERENCE RISK:
- Men: High risk > 40 inches
- Women: High risk > 35 inches

FITNESS ASSESSMENTS:
- Push-up test: Measures upper body muscular endurance.
- 3-minute step test: Measures cardiovascular endurance.
- Sit-and-reach: Measures lower back and hamstring flexibility.
- Overhead squat: Identifies movement compensations.

BORG SCALE (Rate of Perceived Exertion):
- 6–7: Very light (warm-up)
- 11–12: Light (fat burning zone)
- 13–14: Somewhat hard (aerobic)
- 15–16: Hard (threshold)
- 17–18: Very hard (anaerobic)
- 19–20: Maximum effort

BEGINNER STARTING LEVELS:
- Level based on BMI, initial 1RM, training history, and diet quality.
- No training history + poor diet + high BMI = Level 0–10.
- Some training + adequate diet + normal BMI = Level 20–40.
- Consistent training + good diet + athletic = Level 40–60.
`;

export const ISSA_AI_PERSONALITY = `
F3 AI COACH PERSONALITY AND RULES:

TONE:
- Kind, direct, supportive. No fluff, no toxic positivity.
- Encouraging but honest. If something is off, say so clearly.
- Never body shame. Focus on health, performance, and goals — not appearance.
- Professional. You are a certified ISSA coach speaking to another certified trainer.

RESPONSE RULES:
- Always ground recommendations in ISSA methodology.
- When you cannot find relevant ISSA guidance, say: "I am currently not at a high enough LEVEL for this information — please consult the ISSA CPT manual directly."
- Never prescribe supplements or medical interventions.
- Always frame AI suggestions as options for the trainer to review, never direct mandates to clients.
- Keep responses concise and actionable. Trainers are busy.

FORMAT:
- Lead with the direct answer or recommendation.
- Follow with the reasoning/evidence.
- End with a suggested action (e.g. "Push to client plan?" or "Adjust macros?").
`;

// ── Build context string for a specific query type ──
export function buildISSAContext(queryType: 'nutrition' | 'training' | 'assessment' | 'general'): string {
  switch (queryType) {
    case 'nutrition':
      return ISSA_NUTRITION + '\n' + ISSA_AI_PERSONALITY;
    case 'training':
      return ISSA_TRAINING + '\n' + ISSA_AI_PERSONALITY;
    case 'assessment':
      return ISSA_ASSESSMENT + '\n' + ISSA_AI_PERSONALITY;
    case 'general':
    default:
      return ISSA_NUTRITION + '\n' + ISSA_TRAINING + '\n' + ISSA_ASSESSMENT + '\n' + ISSA_AI_PERSONALITY;
  }
}

// ── Detect query type from message ──────────────
export function detectQueryType(message: string): 'nutrition' | 'training' | 'assessment' | 'general' {
  const msg = message.toLowerCase();

  const nutritionKeywords = ['macro', 'protein', 'calorie', 'carb', 'fat', 'meal', 'diet', 'food', 'eat', 'nutrition', 'supplement'];
  const trainingKeywords  = ['workout', 'exercise', 'rep', 'set', 'lift', 'weight', 'squat', 'bench', 'deadlift', 'program', 'split', 'recovery', '1rm'];
  const assessmentKeywords = ['bmi', 'level', 'exp', 'assessment', 'progress', 'waist', 'measurement', 'goal'];

  if (nutritionKeywords.some(k => msg.includes(k)))  return 'nutrition';
  if (trainingKeywords.some(k  => msg.includes(k)))  return 'training';
  if (assessmentKeywords.some(k => msg.includes(k))) return 'assessment';
  return 'general';
}