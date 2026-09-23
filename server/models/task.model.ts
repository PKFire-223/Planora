import mongoose, { Schema } from 'mongoose';

const TaskSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  courseId: { type: String, index: true },
  courseName: { type: String },
  title: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
  dueDate: { type: String, required: true },
  estimatedMinutes: { type: Number, default: 30 },
  isAiGenerated: { type: Boolean, default: false },
  description: { type: String, default: '' },
  subtasks: [{ id: String, title: String, completed: Boolean }],
  notes: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, {
  timestamps: true
});

export const TaskModel = mongoose.models.Task || mongoose.model('Task', TaskSchema);
