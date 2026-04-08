// ─────────────────────────────────────────────
//  F3 — Core TypeScript Types
//  All MongoDB documents + shared enums
// ─────────────────────────────────────────────

import type { DefaultSession } from 'next-auth';

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
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  tier?: PlanTier;          // trainers only
  status: AccountStatus;
  trainerId?: string;       // clients only — ref to IUser._id
  issaCertId?: string;      // trainers only — numeric string
  issaVerified?: boolean;   // trainers only
  avatarInitials?: string;  // e.g. "JT"
  createdAt: Date;
  updatedAt: Date;
}

// ── Client Profile (extended data) ────────────

export interface IWeightEntry {
  date: Date;
  weight: number; // lbs
}

export interface IClientProfile {
  _id: string;
  userId: string;       // ref to IUser._id
  trainerId: string;    // ref to IUser._id
  height?: string;      // e.g. "5'11"
  age?: number;
  goalType: GoalType;
  goalWeight?: number;  // lbs
  goalDate?: Date;
  injuries?: string;
  dietType?: DietType;
  startingLevel: number;   // 0–100, calculated at onboarding
  currentLevel: number;
  expPoints: number;
  weightHistory: IWeightEntry[];
  waistStart?: number;  // inches
  waistGoal?: number;   // inches
  waistCurrent?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ── Workout ───────────────────────────────────

export interface IExercise {
  name: string;
  sets: number;
  reps: string;        // e.g. "8–12" or "45s"
  weight?: string;     // e.g. "135 lbs" or "BW"
  tempo?: string;      // e.g. "3010"
  rest?: string;       // e.g. "90s"
  description?: string;
  executionTime?: number;  // minutes
}

export interface IWorkoutDay {
  dayLabel: string;    // e.g. "MONDAY — UPPER PUSH"
  exercises: IExercise[];
}

export interface IWorkoutLog {
  date: Date;
  dayLabel: string;
  completedExercises: IExercise[];
  notes?: string;
  durationMinutes?: number;
}

export interface IWorkout {
  _id: string;
  clientId: string;    // ref to IUser._id
  trainerId: string;
  plan: IWorkoutDay[];
  logs: IWorkoutLog[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Meals ─────────────────────────────────────

export interface IFoodItem {
  name: string;
  amount: number;
  unit: string;        // g, oz, cup, tbsp, tsp, scoop, piece
  calories?: number;
  protein?: number;    // grams
  carbs?: number;
  fats?: number;
}

export interface IMealEntry {
  mealName: string;    // e.g. "Breakfast"
  mealTime: string;    // e.g. "09:00"
  foods: IFoodItem[];
}

export interface IDailyMacros {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface IMealPlan {
  _id: string;
  clientId: string;
  trainerId: string;
  targetMacros: IDailyMacros;
  meals: IMealEntry[];        // the assigned plan
  logs: Array<{
    date: Date;
    meals: IMealEntry[];
    totalMacros: IDailyMacros;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// ── Messages ──────────────────────────────────

export interface IMessage {
  _id: string;
  senderId: string;    // ref to IUser._id
  receiverId: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

// ── 1RM ───────────────────────────────────────

export interface ILiftRecord {
  exercise: string;
  current1RM: number;    // lbs
  goal1RM?: number;
  workingWeight: number; // 80% of 1RM
  weightLifted: number;  // lbs used in last session
  repsCompleted: number;
  repsToHit?: number;
  estimatedEndDate?: Date;
  recordedAt: Date;
}

// ── Goals ─────────────────────────────────────

export interface IGoal {
  _id: string;
  clientId: string;
  trainerId: string;
  goalType: GoalType;
  description: string;
  targetValue?: number;
  currentValue?: number;
  estimatedEndDate?: Date;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}

// ── AI Logs (trainer only) ────────────────────

export interface IAILog {
  _id: string;
  trainerId: string;
  clientId?: string;
  input: string;
  output: string;
  tokensUsed?: number;
  createdAt: Date;
}

// ── EXP / Level ───────────────────────────────

export interface ILevelStats {
  currentLevel: number;
  expPoints: number;
  expToNextLevel: number;
  willPower: number;   // 0–100  (was Adherence)
  strength: number;    // 0–100  (was Progress)
  vitality: number;    // 0–100  (was Recovery)
}

// ── NextAuth session extension ────────────────

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      tier?: PlanTier;
      status: AccountStatus;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: UserRole;
    tier?: PlanTier;
    status: AccountStatus;
  }
}