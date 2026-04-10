// ─────────────────────────────────────────────
//  F3 — User Mongoose Model
// ─────────────────────────────────────────────

import mongoose, { Schema, type Document, type Model } from 'mongoose';
import type { IUser } from '@/types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  currentLevel?: number;
  expPoints?:    number;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'trainer', 'client', 'basic'],
      default: 'client',
    },
    tier: {
      type: String,
      enum: ['elite', 'pro'],
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending', 'deleted'],
      default: 'active',
    },
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    issaCertId: {
      type: String,
      trim: true,
    },
    issaVerified: {
      type: Boolean,
      default: false,
    },
    avatarInitials: {
      type: String,
      trim: true,
      maxlength: 3,
    },
    currentLevel: {
      type: Number,
      default: 100,  // trainers start at 100
    },
    expPoints: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // auto-manages createdAt + updatedAt
  }
);

// ── Indexes ────────────────────────────────────

UserSchema.index({ role: 1 });
UserSchema.index({ trainerId: 1 });

// ── Prevent model re-registration in dev hot reload
const UserModel: Model<IUserDocument> =
  mongoose.models.User ?? mongoose.model<IUserDocument>('User', UserSchema);

export default UserModel;