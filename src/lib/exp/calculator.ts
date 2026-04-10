// ─────────────────────────────────────────────
//  F3 — EXP / Level Calculator
//  Will     = 40% of EXP (Adherence)
//  Strength = 40% of EXP (Progress)
//  Vitality = 20% of EXP (Recovery)
//
//  Client levels: 0–100
//  Trainer levels: 100–500
// ─────────────────────────────────────────────

// ── Constants ──────────────────────────────────
const CLIENT_MAX_LEVEL  = 100;
const TRAINER_MIN_LEVEL = 100;
const TRAINER_MAX_LEVEL = 500;
const EXP_PER_LEVEL     = 1000; // EXP needed per level

// ── Weights ────────────────────────────────────
const WILL_WEIGHT     = 0.40;
const STRENGTH_WEIGHT = 0.40;
const VITALITY_WEIGHT = 0.20;

// ─────────────────────────────────────────────
//  Input types
// ─────────────────────────────────────────────

export interface WorkoutAdherenceData {
  workoutsAssigned:  number; // planned workouts in period
  workoutsCompleted: number; // actual logged workouts
  lastWorkoutDate:   Date | null;
}

export interface MealAdherenceData {
  mealsAssigned:  number; // meals in plan × days
  mealsLogged:    number; // actual logged entries
  avgProteinPct:  number; // 0–100: how close to protein target on average
}

export interface ProgressData {
  startingWeight:  number | null;
  currentWeight:   number | null;
  goalWeight:      number | null;
  waistStart:      number | null;
  waistCurrent:    number | null;
  waistGoal:       number | null;
  liftsImproved:   number; // count of 1RM improvements
}

export interface RecoveryData {
  restDaysCompleted:  number;
  restDaysAssigned:   number;
  avgSleepHours?:     number;   // optional — from self-report
  fatigueFlagsCount:  number;   // trainer-noted fatigue flags
}

export interface LevelCalculationInput {
  workout:  WorkoutAdherenceData;
  meals:    MealAdherenceData;
  progress: ProgressData;
  recovery: RecoveryData;
  role:     'client' | 'trainer';
  currentLevel: number;
  currentExp:   number;
}

export interface LevelCalculationResult {
  willPower:    number; // 0–100
  strength:     number; // 0–100
  vitality:     number; // 0–100
  expEarned:    number; // EXP gained this calculation
  totalExp:     number;
  newLevel:     number;
  leveledUp:    boolean;
  breakdown:    string; // human-readable explanation
}

// ─────────────────────────────────────────────
//  Core calculation functions
// ─────────────────────────────────────────────

// ── Will Power (Adherence) — 0–100 ────────────
function calcWillPower(workout: WorkoutAdherenceData, meals: MealAdherenceData): number {
  // Workout adherence (60% of will)
  const workoutRate = workout.workoutsAssigned > 0
    ? Math.min(workout.workoutsCompleted / workout.workoutsAssigned, 1)
    : 0;

  // Meal logging adherence (40% of will)
  const mealRate = meals.mealsAssigned > 0
    ? Math.min(meals.mealsLogged / meals.mealsAssigned, 1)
    : 0;

  // Recency bonus — worked out in last 3 days
  const daysSinceLastWorkout = workout.lastWorkoutDate
    ? Math.floor((Date.now() - workout.lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  const recencyBonus = daysSinceLastWorkout <= 3 ? 0.1 : 0;

  const raw = (workoutRate * 0.6) + (mealRate * 0.4) + recencyBonus;
  return Math.min(Math.round(raw * 100), 100);
}

// ── Strength (Progress) — 0–100 ───────────────
function calcStrength(progress: ProgressData): number {
  let score = 0;
  let components = 0;

  // Weight progress toward goal
  if (
    progress.startingWeight !== null &&
    progress.currentWeight  !== null &&
    progress.goalWeight     !== null
  ) {
    const totalToLose  = Math.abs(progress.startingWeight - progress.goalWeight);
    const actualChange = Math.abs(progress.startingWeight - progress.currentWeight);
    if (totalToLose > 0) {
      score      += Math.min(actualChange / totalToLose, 1) * 100;
      components += 1;
    }
  }

  // Waist progress toward goal
  if (
    progress.waistStart   !== null &&
    progress.waistCurrent !== null &&
    progress.waistGoal    !== null
  ) {
    const totalWaistChange   = Math.abs(progress.waistStart   - progress.waistGoal);
    const actualWaistChange  = Math.abs(progress.waistStart   - progress.waistCurrent);
    if (totalWaistChange > 0) {
      score      += Math.min(actualWaistChange / totalWaistChange, 1) * 100;
      components += 1;
    }
  }

  // 1RM improvements bonus
  if (progress.liftsImproved > 0) {
    score      += Math.min(progress.liftsImproved * 10, 30);
    components += 0.3;
  }

  if (components === 0) return 0;
  return Math.min(Math.round(score / components), 100);
}

// ── Vitality HP (Recovery) — 0–100 ────────────
function calcVitality(recovery: RecoveryData): number {
  // Rest day compliance
  const restRate = recovery.restDaysAssigned > 0
    ? Math.min(recovery.restDaysCompleted / recovery.restDaysAssigned, 1)
    : 1;

  // Sleep score (if available)
  const sleepScore = recovery.avgSleepHours
    ? Math.min((recovery.avgSleepHours / 8) * 100, 100)
    : 70; // assume average if not tracked

  // Fatigue penalty
  const fatiguePenalty = Math.min(recovery.fatigueFlagsCount * 10, 40);

  const raw = ((restRate * 100) * 0.5) + (sleepScore * 0.5) - fatiguePenalty;
  return Math.max(Math.min(Math.round(raw), 100), 0);
}

// ─────────────────────────────────────────────
//  Main export
// ─────────────────────────────────────────────

export function calculateLevel(input: LevelCalculationInput): LevelCalculationResult {
  const willPower = calcWillPower(input.workout, input.meals);
  const strength  = calcStrength(input.progress);
  const vitality  = calcVitality(input.recovery);

  // ── EXP earned this session ─────────────────
  const expEarned = Math.round(
    (willPower  * WILL_WEIGHT     * 10) +
    (strength   * STRENGTH_WEIGHT * 10) +
    (vitality   * VITALITY_WEIGHT * 10)
  );

  const totalExp = input.currentExp + expEarned;

  // ── Level calculation ───────────────────────
  const maxLevel = input.role === 'trainer' ? TRAINER_MAX_LEVEL : CLIENT_MAX_LEVEL;
  const minLevel = input.role === 'trainer' ? TRAINER_MIN_LEVEL : 0;

  const newLevel = Math.min(
    Math.max(
      Math.floor(totalExp / EXP_PER_LEVEL),
      minLevel
    ),
    maxLevel
  );

  const leveledUp = newLevel > input.currentLevel;

  // ── Human-readable breakdown ────────────────
  const breakdown = [
    `⚡ Will Power:  ${willPower}/100 (workout ${Math.round(input.workout.workoutsCompleted)}/${input.workout.workoutsAssigned} + meal logging ${Math.round(input.meals.mealsLogged)}/${input.meals.mealsAssigned})`,
    `💪 Strength:   ${strength}/100 (progress toward goal)`,
    `❤️  Vitality:   ${vitality}/100 (recovery + rest days)`,
    ``,
    `EXP earned:    +${expEarned}`,
    `Total EXP:     ${totalExp.toLocaleString()}`,
    `Level:         ${newLevel}${leveledUp ? ' ⬆ LEVEL UP!' : ''}`,
  ].join('\n');

  return {
    willPower,
    strength,
    vitality,
    expEarned,
    totalExp,
    newLevel,
    leveledUp,
    breakdown,
  };
}

// ── Trainer level bonus on client progress ─────
export function calcTrainerExpBonus(clientsLeveledUp: number): number {
  return clientsLeveledUp * 500; // 500 EXP per client level-up
}

// ── Starting level calculator ──────────────────
export function calcStartingLevel(params: {
  bmi:              number;
  yearsTraining:    number;
  dietQuality:      number; // 0–10 self-reported
  hasInjuries:      boolean;
}): number {
  let score = 0;

  // BMI contribution (inverse — lower BMI = higher starting score for fitness)
  if      (params.bmi < 18.5) score += 10; // underweight
  else if (params.bmi < 25)   score += 30; // normal
  else if (params.bmi < 30)   score += 15; // overweight
  else                        score += 5;  // obese

  // Training history
  if      (params.yearsTraining >= 5) score += 30;
  else if (params.yearsTraining >= 2) score += 20;
  else if (params.yearsTraining >= 1) score += 10;
  else                                score += 0;

  // Diet quality
  score += Math.round(params.dietQuality * 3); // max 30

  // Injury penalty
  if (params.hasInjuries) score -= 5;

  return Math.max(Math.min(score, 60), 0);
}