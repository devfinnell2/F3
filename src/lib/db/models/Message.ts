// ─────────────────────────────────────────────
//  F3 — Message Mongoose Model
// ─────────────────────────────────────────────

import mongoose, {
  Schema,
  type Document,
  type Model,
} from 'mongoose';
import type { IMessage } from '@/types';

export interface IMessageDocument
  extends Omit<IMessage, '_id' | 'senderId' | 'receiverId'>,
    Document {
  senderId:   mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    senderId: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    receiverId: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    message: {
      type:     String,
      required: true,
      trim:     true,
    },
    read: {
      type:    Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────
MessageSchema.index({ senderId:   1 });
MessageSchema.index({ receiverId: 1 });
MessageSchema.index({ createdAt:  -1 });

const MessageModel: Model<IMessageDocument> =
  mongoose.models.Message ??
  mongoose.model<IMessageDocument>('Message', MessageSchema);

export default MessageModel;