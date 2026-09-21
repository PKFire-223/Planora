import { Router, Request, Response } from 'express';
import { memoryStore } from '../../config/db';
import { ApiError } from '../../errors/apiError';

export const taskRouter = Router();

// GET all tasks
taskRouter.get('/', (req: Request, res: Response) => {
  const { status, priority } = req.query;
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
taskRouter.post('/', (req: Request, res: Response) => {
  const { title, courseId, priority, dueDate, estimatedMinutes, isAiGenerated } = req.body;
  if (!title) {
    throw ApiError.badRequest('Tên nhiệm vụ/bài tập là bắt buộc');
  }

  let courseName = undefined;
  if (courseId) {
    const matched = memoryStore.courses.find(c => c.id === courseId);
    if (matched) courseName = matched.code;
  }

  const newTask = {
    id: `task-${Date.now()}`,
    title,
    courseId,
    courseName,
    priority: priority || 'medium',
    status: 'todo' as const,
    dueDate: dueDate || new Date().toISOString().split('T')[0],
    estimatedMinutes: Number(estimatedMinutes) || 30,
    isAiGenerated: Boolean(isAiGenerated)
  };

  memoryStore.tasks.unshift(newTask);
  res.status(201).json({ success: true, data: newTask });
});

// PATCH task status
taskRouter.patch('/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const task = memoryStore.tasks.find(t => t.id === req.params.id);
  if (!task) {
    throw ApiError.notFound('Không tìm thấy nhiệm vụ');
  }
  if (!['todo', 'in_progress', 'done'].includes(status)) {
    throw ApiError.badRequest('Trạng thái không hợp lệ');
  }

  task.status = status;
  res.json({ success: true, data: task });
});

// DELETE task
taskRouter.delete('/:id', (req: Request, res: Response) => {
  const initialLen = memoryStore.tasks.length;
  memoryStore.tasks = memoryStore.tasks.filter(t => t.id !== req.params.id);
  if (memoryStore.tasks.length === initialLen) {
    throw ApiError.notFound('Không tìm thấy nhiệm vụ để xoá');
  }
  res.json({ success: true, message: 'Đã xoá nhiệm vụ thành công' });
});
