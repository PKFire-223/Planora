import mongoose, { Schema } from 'mongoose';

const CourseSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  code: { type: String, required: true, index: true },
  instructor: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  color: { type: String, default: 'indigo' },
  progress: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 12 },
  completedLessons: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
  credits: { type: Number, default: 3 },
  semester: { type: String, default: 'Học kỳ 1 - 2026-2027' },
  schedule: { type: String, default: '' },
  room: { type: String, default: '' },
  targetGrade: { type: String, default: 'A' },
  currentGrade: { type: Schema.Types.Mixed },
  evaluationWeights: [{ label: String, weight: Number }],
  syllabus: [{ week: Number, title: String, desc: String, completed: Boolean }],
  lessons: [{ id: String, title: String, completed: Boolean, duration: String }],
  materials: [{ id: String, name: String, type: { type: String }, url: String, size: String }]
}, {
  timestamps: true
});

export const CourseModel = mongoose.models.Course || mongoose.model('Course', CourseSchema);
