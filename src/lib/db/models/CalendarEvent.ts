import mongoose, { Schema, Document, Model } from 'mongoose';

export type CalendarEventType = 'workout' | 'meal' | 'note' | 'rest' | 'cardio';

export interface ICalendarEventDocument extends Document {
  userId:    mongoose.Types.ObjectId;
  date:      string; // YYYY-MM-DD
  type:      CalendarEventType;
  title:     string;
  notes?:    string;
  createdAt: Date;
}

const CalendarEventSchema = new Schema<ICalendarEventDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date:   { type: String, required: true },
    type:   { type: String, enum: ['workout','meal','note','rest','cardio'], default: 'note' },
    title:  { type: String, required: true },
    notes:  { type: String },
  },
  { timestamps: true }
);

CalendarEventSchema.index({ userId: 1, date: 1 });

const CalendarEventModel: Model<ICalendarEventDocument> =
  mongoose.models.CalendarEvent ??
  mongoose.model<ICalendarEventDocument>('CalendarEvent', CalendarEventSchema);

export default CalendarEventModel;