// ─────────────────────────────────────────────
//  F3 — MealPlan Mongoose Model
// ─────────────────────────────────────────────

import mongoose, {
  Schema,
  type Document,
  type Model,
} from 'mongoose';
import type { IMealPlan } from '@/types';

export interface IMealPlanDocument
  extends Omit<IMealPlan, '_id' | 'clientId' | 'trainerId'>,
    Document {
  clientId:  mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
}

const FoodItemSchema = new Schema(
  {
    name:      { type: String, required: true },
    amount:    { type: Number, required: true },
    unit:      { type: String, required: true },
    calories:  { type: Number },
    protein:   { type: Number },
    carbs:     { type: Number },
    fats:      { type: Number },
  },
  { _id: false }
);

const MealEntrySchema = new Schema(
  {
    mealName: { type: String,          required: true },
    mealTime: { type: String,          required: true },
    foods:    { type: [FoodItemSchema], default: []   },
  },
  { _id: false }
);

const MacrosSchema = new Schema(
  {
    calories: { type: Number, default: 0 },
    protein:  { type: Number, default: 0 },
    carbs:    { type: Number, default: 0 },
    fats:     { type: Number, default: 0 },
  },
  { _id: false }
);

const MealLogSchema = new Schema(
  {
    date:        { type: Date,             required: true },
    meals:       { type: [MealEntrySchema], default: []  },
    totalMacros: { type: MacrosSchema                    },
  },
  { _id: false }
);

const MealPlanSchema = new Schema<IMealPlanDocument>(
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
    targetMacros: { type: MacrosSchema                    },
    meals:        { type: [MealEntrySchema], default: [] },
    logs:         { type: [MealLogSchema],  default: []  },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────
MealPlanSchema.index({ clientId:  1 });
MealPlanSchema.index({ trainerId: 1 });

const MealPlanModel: Model<IMealPlanDocument> =
  mongoose.models.MealPlan ??
  mongoose.model<IMealPlanDocument>('MealPlan', MealPlanSchema);

export default MealPlanModel;