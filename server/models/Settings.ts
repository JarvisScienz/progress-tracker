import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  userId: mongoose.Types.ObjectId;
  thresholdPercentage: number;
  username: string;
  darkMode: boolean;
}

const SettingsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  thresholdPercentage: {
    type: Number,
    default: 70,
    min: 0,
    max: 100
  },
  username: {
    type: String,
    required: true
  },
  darkMode: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model<ISettings>('Settings', SettingsSchema); 