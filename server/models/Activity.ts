import mongoose from 'mongoose';

export type ActivityFrequency = 'daily' | 'weekly' | 'monthly';

interface CompletionRecord {
  date: Date;
  completed: boolean;
  title?: string;
  description?: string;
}

export interface IActivity extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  frequency: ActivityFrequency;
  startDate: Date;
  endDate?: Date;
  completionHistory: CompletionRecord[];
  createdAt: Date;
  isActive: boolean;
  daysInRow: number;
  daysRecords: number;
}

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  completionHistory: [{
    date: {
      type: Date,
      required: true,
    },
    completed: {
      type: Boolean,
      required: true,
      default: true,
    },
    description: {
      type: String,
      trim: true,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  daysInRow: {
    type: Number,
    default: 0
  },
  daysRecord: {
    type: Number,
    default: 0
  } 
});

// Index for efficient querying
activitySchema.index({ userId: 1, isActive: 1 });
activitySchema.index({ 'completionHistory.date': 1 });

export default mongoose.model<IActivity>('Activity', activitySchema); 