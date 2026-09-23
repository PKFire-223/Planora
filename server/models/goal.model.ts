import mongoose, { Schema } from 'mongoose';

const GoalSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'Học tập' },
  targetDate: { type: String, required: true },
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  unit: { type: String, default: 'mục tiêu' },
  status: { type: String, enum: ['active', 'achieved', 'missed'], default: 'active' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, {
  timestamps: true
});

export const GoalModel = mongoose.models.Goal || mongoose.model('Goal', GoalSchema);
