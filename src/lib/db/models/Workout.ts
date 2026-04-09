// ─────────────────────────────────────────────
//  F3 — Workout Mongoose Model
// ─────────────────────────────────────────────

import mongoose, {
  Schema,
  type Document,
  type Model,
} from 'mongoose';
import type { IWorkout } from '@/types';

export interface IWorkoutDocument
  extends Omit<IWorkout, '_id' | 'clientId' | 'trainerId'>,
    Document {
  clientId:  mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
}
const ExerciseSchema = new Schema(
  {
    name:          { type: String, required: true },
    sets:          { type: Number, required: true },
    reps:          { type: String, required: true },
    weight:        { type: String },
    tempo:         { type: String },
    rest:          { type: String },
    description:   { type: String },
    executionTime: { type: Number },
  },
  { _id: false }
);

const WorkoutDaySchema = new Schema(
  {
    dayLabel:  { type: String,           required: true },
    exercises: { type: [ExerciseSchema], default:  []   },
  },
  { _id: false }
);

const WorkoutLogSchema = new Schema(
  {
    date:               { type: Date,            required: true },
    dayLabel:           { type: String,          required: true },
    completedExercises: { type: [ExerciseSchema], default: []   },
    notes:              { type: String },
    durationMinutes:    { type: Number },
  },
  { _id: false }
);

const WorkoutSchema = new Schema<IWorkoutDocument>(
  {
    clientId: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    trainerId: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    plan: { type: [WorkoutDaySchema], default: [] },
    logs: { type: [WorkoutLogSchema], default: [] },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────
WorkoutSchema.index({ clientId:  1 });
WorkoutSchema.index({ trainerId: 1 });

const WorkoutModel: Model<IWorkoutDocument> =
  mongoose.models.Workout ??
  mongoose.model<IWorkoutDocument>('Workout', WorkoutSchema);

export default WorkoutModel;