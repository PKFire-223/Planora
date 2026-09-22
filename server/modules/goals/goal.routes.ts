import { Router, Request, Response } from 'express';
import { memoryStore } from '../../config/db';
import { ApiError } from '../../errors/apiError';

export const goalRouter = Router();

// GET all goals
goalRouter.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: memoryStore.goals });
});

// GET single goal by id
goalRouter.get('/:id', (req: Request, res: Response) => {
  const goal = memoryStore.goals.find(g => g.id === req.params.id);
  if (!goal) {
    throw ApiError.notFound('Không tìm thấy mục tiêu');
  }
  res.json({ success: true, data: goal });
});

// POST create goal
goalRouter.post('/', (req: Request, res: Response) => {
  const { title, targetDate, targetValue, currentValue, unit, description, category, priority, status } = req.body;
  if (!title || !targetValue) {
    throw ApiError.badRequest('Tiêu đề và mục tiêu định lượng là bắt buộc');
  }

  const numericTarget = Math.max(1, Number(targetValue) || 10);
  const numericCurrent = Math.max(0, Number(currentValue) || 0);

  const newGoal = {
    id: `goal-${Date.now()}`,
    title: String(title).trim(),
    description: description ? String(description).trim() : '',
    category: category ? String(category).trim() : 'Học tập',
    targetDate: targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    targetValue: numericTarget,
    currentValue: numericCurrent,
    unit: unit ? String(unit).trim() : 'giờ',
    status: (status || (numericCurrent >= numericTarget ? 'achieved' : 'active')) as 'active' | 'achieved' | 'missed',
    priority: (priority || 'medium') as 'low' | 'medium' | 'high',
    createdAt: new Date().toISOString().split('T')[0]
  };

  memoryStore.goals.unshift(newGoal);
  res.status(201).json({ success: true, data: newGoal });
});

// PUT update goal
goalRouter.put('/:id', (req: Request, res: Response) => {
  const goalIndex = memoryStore.goals.findIndex(g => g.id === req.params.id);
  if (goalIndex === -1) {
    throw ApiError.notFound('Không tìm thấy mục tiêu');
  }

  const existing = memoryStore.goals[goalIndex];
  const { title, targetDate, targetValue, currentValue, unit, description, category, priority, status } = req.body;

  const numericTarget = targetValue !== undefined ? Math.max(1, Number(targetValue)) : existing.targetValue;
  const numericCurrent = currentValue !== undefined ? Math.max(0, Number(currentValue)) : existing.currentValue;

  let resolvedStatus = status || existing.status;
  if (status === undefined) {
    if (numericCurrent >= numericTarget) {
      resolvedStatus = 'achieved';
    } else if (existing.status === 'achieved') {
      resolvedStatus = 'active';
    }
  }

  const updated = {
    ...existing,
    ...(title !== undefined && { title: String(title).trim() }),
    ...(description !== undefined && { description: String(description).trim() }),
    ...(category !== undefined && { category: String(category).trim() }),
    ...(targetDate !== undefined && { targetDate }),
    targetValue: numericTarget,
    currentValue: numericCurrent,
    ...(unit !== undefined && { unit: String(unit).trim() }),
    status: resolvedStatus as 'active' | 'achieved' | 'missed',
    ...(priority !== undefined && { priority: priority as 'low' | 'medium' | 'high' })
  };

  memoryStore.goals[goalIndex] = updated;
  res.json({ success: true, data: updated });
});

// DELETE goal
goalRouter.delete('/:id', (req: Request, res: Response) => {
  const goalIndex = memoryStore.goals.findIndex(g => g.id === req.params.id);
  if (goalIndex === -1) {
    throw ApiError.notFound('Không tìm thấy mục tiêu');
  }

  memoryStore.goals.splice(goalIndex, 1);
  res.json({ success: true, message: 'Đã xoá mục tiêu thành công' });
});

// PATCH update goal progress
goalRouter.patch('/:id/progress', (req: Request, res: Response) => {
  const { increment, currentValue } = req.body;
  const goal = memoryStore.goals.find(g => g.id === req.params.id);
  if (!goal) {
    throw ApiError.notFound('Không tìm thấy mục tiêu');
  }

  if (currentValue !== undefined) {
    goal.currentValue = Math.max(0, Number(currentValue));
  } else if (increment !== undefined) {
    goal.currentValue = Math.max(0, goal.currentValue + Number(increment));
  }

  if (goal.currentValue >= goal.targetValue) {
    goal.status = 'achieved';
  } else {
    goal.status = 'active';
  }

  res.json({ success: true, data: goal });
});

