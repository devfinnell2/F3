// ─────────────────────────────────────────────
//  F3 — Goal Mongoose Model
// ─────────────────────────────────────────────

import mongoose, {
  Schema,
  type Document,
  type Model,
} from 'mongoose';
import type { IGoal } from '@/types';

export interface IGoalDocument
  extends Omit<IGoal, '_id' | 'clientId' | 'trainerId'>,
    Document {
  clientId:  mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
}

const GoalSchema = new Schema<IGoalDocument>(
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
    goalType: {
      type: String,
      enum: ['fat_loss','muscle_gain','endurance','recomposition','general_fitness'],
      required: true,
    },
    description:      { type: String, required: true },
    targetValue:      { type: Number },
    currentValue:     { type: Number },
    estimatedEndDate: { type: Date   },
    completed: {
      type:    Boolean,
      default: false,
    },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────
GoalSchema.index({ clientId:  1 });
GoalSchema.index({ trainerId: 1 });
GoalSchema.index({ completed: 1 });

const GoalModel: Model<IGoalDocument> =
  mongoose.models.Goal ??
  mongoose.model<IGoalDocument>('Goal', GoalSchema);

export default GoalModel;