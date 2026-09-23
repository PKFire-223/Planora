import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { memoryStore } from '../../config/db';
import { MongoBackupSnapshot } from './sync.model';
import { CourseModel } from '../../models/course.model';
import { TaskModel } from '../../models/task.model';
import { GoalModel } from '../../models/goal.model';

export const syncRouter = Router();

// POST /api/sync/auto-save - Periodic 5-minute auto-save for courses, tasks, goals
syncRouter.post('/auto-save', async (req: Request, res: Response) => {
  try {
    const { courses, tasks, goals } = req.body;

    // 1. Update resilient in-memory store
    if (Array.isArray(courses)) {
      memoryStore.courses = courses;
    }
    if (Array.isArray(tasks)) {
      memoryStore.tasks = tasks;
    }
    if (Array.isArray(goals)) {
      memoryStore.goals = goals;
    }

    const coursesCount = Array.isArray(courses) ? courses.length : memoryStore.courses.length;
    const tasksCount = Array.isArray(tasks) ? tasks.length : memoryStore.tasks.length;
    const goalsCount = Array.isArray(goals) ? goals.length : memoryStore.goals.length;

    let mongoSaved = false;
    let backupRecordId = `backup-${Date.now()}`;

    // 2. Persist to MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        // Create backup snapshot
        const doc = await MongoBackupSnapshot.create({
          snapshotId: backupRecordId,
          timestamp: new Date(),
          source: '5min-autosave',
          counts: {
            courses: coursesCount,
            tasks: tasksCount,
            goals: goalsCount
          },
          courses: memoryStore.courses,
          tasks: memoryStore.tasks,
          goals: memoryStore.goals
        });
        mongoSaved = true;
        backupRecordId = doc._id.toString();

        // Also upsert individual documents for collection-level persistence
        if (Array.isArray(courses)) {
          for (const c of courses) {
            await CourseModel.findOneAndUpdate({ id: c.id }, c, { upsert: true });
          }
        }
        if (Array.isArray(tasks)) {
          for (const t of tasks) {
            await TaskModel.findOneAndUpdate({ id: t.id }, t, { upsert: true });
          }
        }
        if (Array.isArray(goals)) {
          for (const g of goals) {
            await GoalModel.findOneAndUpdate({ id: g.id }, g, { upsert: true });
          }
        }
      } catch (mErr: any) {
        console.warn('[Sync] MongoDB persist warning:', mErr?.message || mErr);
      }
    }

    res.json({
      success: true,
      message: 'Dữ liệu (courses, tasks, goals) đã được tự động sao lưu an toàn.',
      savedAt: new Date().toISOString(),
      storage: {
        mongo: mongoSaved,
        inMemory: true,
        databaseStatus: mongoose.connection.readyState === 1 ? 'MongoDB Live' : 'Resilient In-Memory + Client Storage'
      },
      counts: {
        courses: coursesCount,
        tasks: tasksCount,
        goals: goalsCount
      },
      backupId: backupRecordId
    });
  } catch (err: any) {
    console.error('[Sync] Auto-save error:', err);
    res.status(500).json({
      success: false,
      message: 'Không thể sao lưu dữ liệu: ' + (err?.message || 'Lỗi không xác định')
    });
  }
});

// GET /api/sync/status - Returns last sync status
syncRouter.get('/status', async (_req: Request, res: Response) => {
  let lastBackup = null;
  if (mongoose.connection.readyState === 1) {
    try {
      lastBackup = await MongoBackupSnapshot.findOne().sort({ createdAt: -1 }).lean();
    } catch {
      // ignore
    }
  }

  res.json({
    success: true,
    mongoConnected: mongoose.connection.readyState === 1,
    database: mongoose.connection.readyState === 1 ? 'MongoDB' : 'In-Memory Store',
    lastBackupTimestamp: lastBackup ? (lastBackup as any).timestamp : null,
    currentCounts: {
      courses: memoryStore.courses.length,
      tasks: memoryStore.tasks.length,
      goals: memoryStore.goals.length
    }
  });
});
