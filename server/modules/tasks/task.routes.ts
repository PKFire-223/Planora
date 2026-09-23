import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { memoryStore } from '../../config/db';
import { ApiError } from '../../errors/apiError';
import { TaskModel } from '../../models/task.model';
import { TaskItem } from '../../types';

export const taskRouter = Router();

// GET all tasks
taskRouter.get('/', async (req: Request, res: Response) => {
  const { status, priority } = req.query;

  // If Mongo connected and memoryStore is empty, sync from Mongo
  if (mongoose.connection.readyState === 1 && memoryStore.tasks.length === 0) {
    try {
      const dbList = await TaskModel.find().lean();
      if (dbList.length > 0) {
        memoryStore.tasks = dbList as unknown as TaskItem[];
      }
    } catch {
      // fallback
    }
  }

  let list = memoryStore.tasks;
  if (status && typeof status === 'string') {
    list = list.filter(t => t.status === status);
  }
  if (priority && typeof priority === 'string') {
    list = list.filter(t => t.priority === priority);
  }
  res.json({ success: true, data: list });
});

// POST create task
taskRouter.post('/', async (req: Request, res: Response) => {
  const { title, courseId, priority, dueDate, estimatedMinutes, isAiGenerated, description, subtasks, notes } = req.body;
  if (!title) {
    throw ApiError.badRequest('Tên nhiệm vụ là bắt buộc');
  }

  let courseName = undefined;
  if (courseId) {
    const matched = memoryStore.courses.find(c => c.id === courseId);
    if (matched) courseName = matched.code;
  }

  const newTask: TaskItem = {
    id: `task-${Date.now()}`,
    title,
    courseId,
    courseName,
    priority: priority || 'medium',
    status: 'todo',
    dueDate: dueDate || new Date().toISOString().split('T')[0],
    estimatedMinutes: Number(estimatedMinutes) || 30,
    isAiGenerated: Boolean(isAiGenerated),
    description: description || '',
    subtasks: Array.isArray(subtasks) ? subtasks : [],
    notes: notes || '',
    createdAt: new Date().toISOString().split('T')[0]
  };

  memoryStore.tasks.unshift(newTask);

  if (mongoose.connection.readyState === 1) {
    try {
      await TaskModel.create(newTask);
    } catch (err: any) {
      console.warn('[Task] MongoDB create warning:', err.message);
    }
  }

  res.status(201).json({ success: true, data: newTask });
});

// PATCH / PUT update task
taskRouter.patch('/:id', async (req: Request, res: Response) => {
  const task = memoryStore.tasks.find(t => t.id === req.params.id);
  if (!task) {
    throw ApiError.notFound('Không tìm thấy nhiệm vụ');
  }

  const { title, courseId, priority, status, dueDate, estimatedMinutes, description, subtasks, notes } = req.body;
  if (title !== undefined) task.title = title;
  if (priority !== undefined) task.priority = priority;
  if (status !== undefined) task.status = status;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (estimatedMinutes !== undefined) task.estimatedMinutes = Number(estimatedMinutes);
  if (description !== undefined) task.description = description;
  if (subtasks !== undefined) task.subtasks = subtasks;
  if (notes !== undefined) task.notes = notes;
  if (courseId !== undefined) {
    task.courseId = courseId;
    const matched = memoryStore.courses.find(c => c.id === courseId);
    task.courseName = matched ? matched.code : undefined;
  }

  if (mongoose.connection.readyState === 1) {
    try {
      await TaskModel.findOneAndUpdate({ id: req.params.id }, task, { upsert: true });
    } catch (err: any) {
      console.warn('[Task] MongoDB update warning:', err.message);
    }
  }

  res.json({ success: true, data: task });
});

// PATCH task status
taskRouter.patch('/:id/status', async (req: Request, res: Response) => {
  const { status } = req.body;
  const task = memoryStore.tasks.find(t => t.id === req.params.id);
  if (!task) {
    throw ApiError.notFound('Không tìm thấy nhiệm vụ');
  }
  if (!['todo', 'in_progress', 'done'].includes(status)) {
    throw ApiError.badRequest('Trạng thái không hợp lệ');
  }

  task.status = status;

  if (mongoose.connection.readyState === 1) {
    try {
      await TaskModel.findOneAndUpdate({ id: req.params.id }, { status });
    } catch (err: any) {
      console.warn('[Task] MongoDB status update warning:', err.message);
    }
  }

  res.json({ success: true, data: task });
});

// DELETE task
taskRouter.delete('/:id', async (req: Request, res: Response) => {
  const initialLen = memoryStore.tasks.length;
  memoryStore.tasks = memoryStore.tasks.filter(t => t.id !== req.params.id);
  if (memoryStore.tasks.length === initialLen) {
    throw ApiError.notFound('Không tìm thấy nhiệm vụ để xoá');
  }

  if (mongoose.connection.readyState === 1) {
    try {
      await TaskModel.findOneAndDelete({ id: req.params.id });
    } catch (err: any) {
      console.warn('[Task] MongoDB delete warning:', err.message);
    }
  }

  res.json({ success: true, message: 'Đã xoá nhiệm vụ thành công' });
});
