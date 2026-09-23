import mongoose, { Schema } from 'mongoose';

const TimetableSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  time: { type: String, required: true },
  room: { type: String, default: '' },
  instructor: { type: String, default: '' },
  notes: { type: String, default: '' },
  color: { type: String, default: 'indigo' },
  day: { type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] },
  session: { type: String, enum: ['morning', 'afternoon'] },
  courseId: { type: String, index: true },
  courseCode: { type: String },
  credits: { type: Number, default: 3 }
}, {
  timestamps: true
});

export const TimetableModel = mongoose.models.Timetable || mongoose.model('Timetable', TimetableSchema);
