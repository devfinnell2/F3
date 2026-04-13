// ─────────────────────────────────────────────
//  F3 — PushSubscription Model
//  Stores browser push tokens per user/device
// ─────────────────────────────────────────────
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPushSubscriptionDocument extends Document {
  userId:   mongoose.Types.ObjectId;
  endpoint: string;
  keys: {
    p256dh: string;
    auth:   string;
  };
  createdAt: Date;
}

const PushSubscriptionSchema = new Schema<IPushSubscriptionDocument>(
  {
    userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth:   { type: String, required: true },
    },
  },
  { timestamps: true }
);

PushSubscriptionSchema.index({ userId: 1 });

const PushSubscriptionModel: Model<IPushSubscriptionDocument> =
  mongoose.models.PushSubscription ??
  mongoose.model<IPushSubscriptionDocument>('PushSubscription', PushSubscriptionSchema);

export default PushSubscriptionModel;