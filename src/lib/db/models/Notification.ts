// ─────────────────────────────────────────────
//  F3 — Notification Model
// ─────────────────────────────────────────────
import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType =
  | 'missed_workout'
  | 'low_macros'
  | 'level_up'
  | 'message'
  | 'ai_proposal'
  | 'goal_achieved';

export interface INotificationDocument extends Document {
  userId:    mongoose.Types.ObjectId;
  type:      NotificationType;
  title:     string;
  body:      string;
  read:      boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type:   {
      type: String,
      enum: ['missed_workout','low_macros','level_up','message','ai_proposal','goal_achieved'],
      required: true,
    },
    title: { type: String, required: true },
    body:  { type: String, required: true },
    read:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

const NotificationModel: Model<INotificationDocument> =
  mongoose.models.Notification ??
  mongoose.model<INotificationDocument>('Notification', NotificationSchema);

export default NotificationModel;