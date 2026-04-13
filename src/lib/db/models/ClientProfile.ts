// ─────────────────────────────────────────────
//  F3 — ClientProfile Mongoose Model
//  Extended data for each client user
// ─────────────────────────────────────────────

import mongoose, {
  Schema,
  type Document,
  type Model,
} from 'mongoose';
import type { IClientProfile } from '@/types';

export interface IClientProfileDocument
  extends Omit<IClientProfile, '_id' | 'userId' | 'trainerId'>,
    Document {
  userId:    mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
}
const WeightEntrySchema = new Schema(
  {
    date:   { type: Date,   required: true },
    weight: { type: Number, required: true },
  },
  { _id: false }
);

const ClientProfileSchema = new Schema<IClientProfileDocument>(
  {
    userId: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      unique:   true,
    },
    trainerId: {
      type: Schema.Types.ObjectId,
      ref:  'User',
    },
    height:    { type: String },
    age:       { type: Number },
    goalType: {
      type: String,
      enum: ['fat_loss','muscle_gain','endurance','recomposition','general_fitness'],
    },
    goalWeight:  { type: Number },
    goalDate:    { type: Date   },
    injuries:    { type: String },
    dietType: {
      type: String,
      enum: ['standard','keto','vegan','vegetarian','paleo','carnivore','mediterranean'],
    },
    startingLevel: { type: Number, default: 0   },
    currentLevel:  { type: Number, default: 0   },
    expPoints:     { type: Number, default: 0   },
    weightHistory: { type: [WeightEntrySchema], default: [] },
    waistStart:    { type: Number },
    waistGoal:     { type: Number },
    waistCurrent:  { type: Number },
    beforePhoto:   { type: String }, // Cloudinary URL
    afterPhoto:    { type: String }, // Cloudinary URL
    beforePhotoDate: { type: Date  },
    afterPhotoDate:  { type: Date  },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────

ClientProfileSchema.index({ trainerId: 1 });

const ClientProfileModel: Model<IClientProfileDocument> =
  mongoose.models.ClientProfile ??
  mongoose.model<IClientProfileDocument>('ClientProfile', ClientProfileSchema);

export default ClientProfileModel;