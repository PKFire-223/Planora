import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { courseRouter } from './modules/courses/course.routes';
import { taskRouter } from './modules/tasks/task.routes';
import { noteRouter } from './modules/notes/note.routes';
import { goalRouter } from './modules/goals/goal.routes';
import { aiRouter } from './modules/ai/ai.routes';
import { errorRouter } from './modules/errors/errorLog.routes';
import { authRouter } from './modules/auth/auth.routes';
import { syncRouter } from './modules/sync/sync.routes';
import { uploadRouter } from './modules/upload/upload.routes';
import { memoryStore, isMongoConnected, syncFromMongoToMemory } from './config/db';
import { TimetableModel } from './models/timetable.model';
import { TimetableItem } from './types';
import { runDatabaseSeed } from './seed/seedRunner';

export const apiRouter = Router();

// Health check and overview status
apiRouter.get('/health', (_req, res) => {
  const sampleFilePath = path.join(process.cwd(), 'server', 'seed', 'sampleData.json');
  const sampleFileExists = fs.existsSync(sampleFilePath);

  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    database: {
      type: 'MongoDB',
      connected: mongoose.connection.readyState === 1 || isMongoConnected,
      mode: (mongoose.connection.readyState === 1 || isMongoConnected) ? 'live-mongo' : 'in-memory-resilient'
    },
    sampleData: {
      isolatedFile: 'server/seed/sampleData.json',
      fileExists: sampleFileExists,
      status: sampleFileExists ? 'Available for seeding or optional initial load' : 'Clean (Deleted or not present)'
    },
    counts: {
      courses: memoryStore.courses.length,
      tasks: memoryStore.tasks.length,
      notes: memoryStore.notes.length,
      goals: memoryStore.goals.length,
      errors: memoryStore.errors.length,
      timetable: memoryStore.timetable.length
    },
    timestamp: new Date().toISOString()
  });
});

// Seed API: Trigger database seeding directly via HTTP POST /api/seed
apiRouter.post('/seed', async (req, res) => {
  try {
    const customUri = req.body?.uri || process.env.MONGODB_URI;
    const result = await runDatabaseSeed(customUri);

    // If successfully seeded into MongoDB, re-sync into memoryStore immediately
    if (result.success) {
      await syncFromMongoToMemory();
    }

    res.json({
      success: result.success,
      message: result.success
        ? 'Dữ liệu mẫu đã được nạp thành công vào MongoDB!'
        : 'Không thể nạp dữ liệu: ' + (result.reason || 'Lỗi không xác định'),
      result
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi nạp dữ liệu: ' + err.message
    });
  }
});

// Seed status: Check whether sampleData.json exists and if database has records
apiRouter.get('/seed/status', (_req, res) => {
  const sampleFilePath = path.join(process.cwd(), 'server', 'seed', 'sampleData.json');
  const fileExists = fs.existsSync(sampleFilePath);

  res.json({
    sampleFileExists: fileExists,
    sampleFilePath: 'server/seed/sampleData.json',
    mongoConnected: mongoose.connection.readyState === 1,
    counts: {
      courses: memoryStore.courses.length,
      tasks: memoryStore.tasks.length,
      notes: memoryStore.notes.length,
      goals: memoryStore.goals.length,
      errors: memoryStore.errors.length,
      timetable: memoryStore.timetable.length
    }
  });
});

// Timetable API
apiRouter.get('/timetable', async (_req, res) => {
  if (mongoose.connection.readyState === 1 && memoryStore.timetable.length === 0) {
    try {
      const list = await TimetableModel.find().lean();
      if (list.length > 0) {
        memoryStore.timetable = list as unknown as TimetableItem[];
      }
    } catch {
      // fallback
    }
  }
  res.json({ success: true, data: memoryStore.timetable });
});

apiRouter.put('/timetable', async (req, res) => {
  const { entries } = req.body;
  if (!Array.isArray(entries)) {
    res.status(400).json({ success: false, message: 'Danh sách thời khoá biểu không hợp lệ' });
    return;
  }

  memoryStore.timetable = entries;

  if (mongoose.connection.readyState === 1) {
    try {
      await TimetableModel.deleteMany({});
      if (entries.length > 0) {
        await TimetableModel.insertMany(entries);
      }
    } catch (err: any) {
      console.warn('[Timetable] MongoDB sync warning:', err.message);
    }
  }

  res.json({ success: true, data: memoryStore.timetable });
});

// Mount modules
apiRouter.use('/auth', authRouter);
apiRouter.use('/courses', courseRouter);
apiRouter.use('/tasks', taskRouter);
apiRouter.use('/notes', noteRouter);
apiRouter.use('/goals', goalRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/errors', errorRouter);
apiRouter.use('/sync', syncRouter);
apiRouter.use('/upload', uploadRouter);
