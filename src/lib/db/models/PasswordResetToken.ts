import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPasswordResetTokenDocument extends Document {
  userId:    mongoose.Types.ObjectId;
  token:     string;
  expiresAt: Date;
  used:      boolean;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetTokenDocument>({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token:     { type: String, required: true, unique: true },
  expiresAt: { type: Date,   required: true },
  used:      { type: Boolean, default: false },
});

PasswordResetTokenSchema.index({ token: 1 });
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetTokenModel: Model<IPasswordResetTokenDocument> =
  mongoose.models.PasswordResetToken ??
  mongoose.model<IPasswordResetTokenDocument>('PasswordResetToken', PasswordResetTokenSchema);

export default PasswordResetTokenModel;