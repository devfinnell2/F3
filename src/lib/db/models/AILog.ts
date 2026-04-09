// ─────────────────────────────────────────────
//  F3 — AILog Mongoose Model
//  Trainer-only — logs every AI query
// ─────────────────────────────────────────────

import mongoose, {
  Schema,
  type Document,
  type Model,
} from 'mongoose';
import type { IAILog } from '@/types';

export interface IAILogDocument
  extends Omit<IAILog, '_id' | 'trainerId' | 'clientId'>,
    Document {
  trainerId: mongoose.Types.ObjectId;
  clientId?: mongoose.Types.ObjectId;
}

const AILogSchema = new Schema<IAILogDocument>(
  {
    trainerId: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref:  'User',
    },
    input:      { type: String, required: true },
    output:     { type: String, required: true },
    tokensUsed: { type: Number },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────
AILogSchema.index({ trainerId: 1 });
AILogSchema.index({ clientId:  1 });
AILogSchema.index({ createdAt: -1 });

const AILogModel: Model<IAILogDocument> =
  mongoose.models.AILog ??
  mongoose.model<IAILogDocument>('AILog', AILogSchema);

export default AILogModel;