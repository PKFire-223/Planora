import mongoose, { Schema } from 'mongoose';

const ErrorReportSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['open', 'investigating', 'resolved'], default: 'open' },
  componentName: { type: String, default: 'General' },
  reportedAt: { type: String, default: () => new Date().toISOString() },
  resolutionNotes: { type: String }
}, {
  timestamps: true
});

export const ErrorReportModel = mongoose.models.ErrorReport || mongoose.model('ErrorReport', ErrorReportSchema);
