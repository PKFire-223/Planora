import { Router } from 'express';
import { courseRouter } from './modules/courses/course.routes';
import { taskRouter } from './modules/tasks/task.routes';
import { noteRouter } from './modules/notes/note.routes';
import { goalRouter } from './modules/goals/goal.routes';
import { aiRouter } from './modules/ai/ai.routes';
import { errorRouter } from './modules/errors/errorLog.routes';
import { memoryStore, isMongoConnected } from './config/db';

export const apiRouter = Router();

// Health check and overview status
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    database: {
      type: 'MongoDB',
      connected: isMongoConnected,
      mode: isMongoConnected ? 'live-mongo' : 'in-memory-fallback'
    },
    counts: {
      courses: memoryStore.courses.length,
      tasks: memoryStore.tasks.length,
      notes: memoryStore.notes.length,
      goals: memoryStore.goals.length,
      errors: memoryStore.errors.length
    },
    timestamp: new Date().toISOString()
  });
});

// Mount modules
apiRouter.use('/courses', courseRouter);
apiRouter.use('/tasks', taskRouter);
apiRouter.use('/notes', noteRouter);
apiRouter.use('/goals', goalRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/errors', errorRouter);
