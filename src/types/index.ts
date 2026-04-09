// ─────────────────────────────────────────────
//  F3 — Core TypeScript Types
// ─────────────────────────────────────────────

// ── Enums ─────────────────────────────────────

export type UserRole = 'admin' | 'trainer' | 'client' | 'basic';

export type PlanTier = 'elite' | 'pro';

export type GoalType =
  | 'fat_loss'
  | 'muscle_gain'
  | 'endurance'
  | 'recomposition'
  | 'general_fitness';

export type DietType =
  | 'standard'
  | 'keto'
  | 'vegan'
  | 'vegetarian'
  | 'paleo'
  | 'carnivore'
  | 'mediterranean';

export type AccountStatus = 'active' | 'suspended' | 'pending' | 'deleted';

// ── User ──────────────────────────────────────

export interface IUser {
  _id:            string;
  name:           string;
  email:          string;
  passwordHash:   string;
  role:           UserRole;
  tier?:          PlanTier;
  status:         AccountStatus;
  trainerId?:     string;
  issaCertId?:    string;
  issaVerified?:  boolean;
  avatarInitials?: string;
  createdAt:      Date;
  updatedAt:      Date;
}

// ── Client Profile ─────────────────────────────

export interface IWeightEntry {
  date:   Date;
  weight: number;
}

export interface IClientProfile {
  _id:           string;
  userId:        string;
  trainerId:     string;
  height?:       string;
  age?:          number;
  goalType:      GoalType;
  goalWeight?:   number;
  goalDate?:     Date;
  injuries?:     string;
  dietType?:     DietType;
  startingLevel: number;
  currentLevel:  number;
  expPoints:     number;
  weightHistory: IWeightEntry[];
  waistStart?:   number;
  waistGoal?:    number;
  waistCurrent?: number;
  createdAt:     Date;
  updatedAt:     Date;
}

// ── Workout ───────────────────────────────────

export interface IExercise {
  name:           string;
  sets:           number;
  reps:           string;
  weight?:        string;
  tempo?:         string;
  rest?:          string;
  description?:   string;
  executionTime?: number;
}

export interface IWorkoutDay {
  dayLabel:  string;
  exercises: IExercise[];
}

export interface IWorkoutLog {
  date:                Date;
  dayLabel:            string;
  completedExercises:  IExercise[];
  notes?:              string;
  durationMinutes?:    number;
}

export interface IWorkout {
  _id:       string;
  clientId:  string;
  trainerId: string;
  plan:      IWorkoutDay[];
  logs:      IWorkoutLog[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Meals ─────────────────────────────────────

export interface IFoodItem {
  name:      string;
  amount:    number;
  unit:      string;
  calories?: number;
  protein?:  number;
  carbs?:    number;
  fats?:     number;
}

export interface IMealEntry {
  mealName: string;
  mealTime: string;
  foods:    IFoodItem[];
}

export interface IDailyMacros {
  calories: number;
  protein:  number;
  carbs:    number;
  fats:     number;
}

export interface IMealPlan {
  _id:          string;
  clientId:     string;
  trainerId:    string;
  targetMacros: IDailyMacros;
  meals:        IMealEntry[];
  logs: Array<{
    date:        Date;
    meals:       IMealEntry[];
    totalMacros: IDailyMacros;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// ── Messages ──────────────────────────────────

export interface IMessage {
  _id:        string;
  senderId:   string;
  receiverId: string;
  message:    string;
  read:       boolean;
  createdAt:  Date;
}

// ── 1RM ───────────────────────────────────────

export interface ILiftRecord {
  exercise:         string;
  current1RM:       number;
  goal1RM?:         number;
  workingWeight:    number;
  weightLifted:     number;
  repsCompleted:    number;
  repsToHit?:       number;
  estimatedEndDate?: Date;
  recordedAt:       Date;
}

// ── Goals ─────────────────────────────────────

export interface IGoal {
  _id:              string;
  clientId:         string;
  trainerId:        string;
  goalType:         GoalType;
  description:      string;
  targetValue?:     number;
  currentValue?:    number;
  estimatedEndDate?: Date;
  completed:        boolean;
  completedAt?:     Date;
  createdAt:        Date;
}

// ── AI Logs ───────────────────────────────────

export interface IAILog {
  _id:         string;
  trainerId:   string;
  clientId?:   string;
  input:       string;
  output:      string;
  tokensUsed?: number;
  createdAt:   Date;
}

// ── EXP / Level ───────────────────────────────

export interface ILevelStats {
  currentLevel:    number;
  expPoints:       number;
  expToNextLevel:  number;
  willPower:       number;
  strength:        number;
  vitality:        number;
}

// ── NextAuth v4 augmentation ───────────────────

declare module 'next-auth' {
  interface Session {
    user: {
      id:      string;
      role:    UserRole;
      tier?:   PlanTier;
      status:  AccountStatus;
      name?:   string | null;
      email?:  string | null;
      image?:  string | null;
    };
  }

  interface User {
    id:      string;
    role:    UserRole;
    tier?:   PlanTier;
    status:  AccountStatus;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id:      string;
    role:    UserRole;
    tier?:   PlanTier;
    status:  AccountStatus;
  }
}