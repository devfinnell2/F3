import mongoose, { Document, Schema } from 'mongoose';

export type ProposalType =
  | 'plateau_detected'
  | 'low_adherence'
  | 'macro_drift'
  | 'overtraining'
  | 'goal_ahead';

export type ProposalStatus = 'pending' | 'approved' | 'dismissed';

export interface IAIProposal extends Document {
  trainerId:   mongoose.Types.ObjectId;
  clientId:    mongoose.Types.ObjectId;
  clientName:  string;
  type:        ProposalType;
  summary:     string;
  detail:      string;
  action:      string;          // what the AI recommends doing
  status:      ProposalStatus;
  createdAt:   Date;
  resolvedAt?: Date;
}

const AIProposalSchema = new Schema<IAIProposal>(
  {
    trainerId:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
    clientId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    clientName: { type: String, required: true },
    type:       {
      type: String,
      enum: ['plateau_detected','low_adherence','macro_drift','overtraining','goal_ahead'],
      required: true,
    },
    summary:    { type: String, required: true },
    detail:     { type: String, required: true },
    action:     { type: String, required: true },
    status:     { type: String, enum: ['pending','approved','dismissed'], default: 'pending' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.AIProposal ||
  mongoose.model<IAIProposal>('AIProposal', AIProposalSchema);