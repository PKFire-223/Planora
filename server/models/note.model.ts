import mongoose, { Schema } from 'mongoose';

const NoteSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  courseId: { type: String, index: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  tags: [{ type: String }],
  isPinned: { type: Boolean, default: false },
  updatedAt: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, {
  timestamps: true
});

export const NoteModel = mongoose.models.Note || mongoose.model('Note', NoteSchema);
