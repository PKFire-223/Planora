import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  lastActiveAt: { type: String },
  phone: { type: String },
  studentCode: { type: String },
  faculty: { type: String },
  bio: { type: String },
  avatar: { type: String },
  coverImage: { type: String },
  schoolName: { type: String }
}, {
  timestamps: true
});

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
