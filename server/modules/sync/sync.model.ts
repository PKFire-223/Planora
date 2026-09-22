import mongoose, { Schema } from 'mongoose';

const BackupSnapshotSchema = new Schema({
  snapshotId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  source: { type: String, default: '5min-autosave' },
  counts: {
    courses: { type: Number, default: 0 },
    tasks: { type: Number, default: 0 },
    goals: { type: Number, default: 0 }
  },
  courses: [{ type: Schema.Types.Mixed }],
  tasks: [{ type: Schema.Types.Mixed }],
  goals: [{ type: Schema.Types.Mixed }]
}, {
  timestamps: true
});

export const MongoBackupSnapshot = mongoose.models.BackupSnapshot || mongoose.model('BackupSnapshot', BackupSnapshotSchema);
