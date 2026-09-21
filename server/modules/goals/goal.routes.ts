import { Router, Request, Response } from 'express';
import { memoryStore } from '../../config/db';
import { ApiError } from '../../errors/apiError';

export const goalRouter = Router();

// GET all goals
goalRouter.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: memoryStore.goals });
});

// POST create goal
goalRouter.post('/', (req: Request, res: Response) => {
  const { title, targetDate, targetValue, unit } = req.body;
  if (!title || !targetValue) {
    throw ApiError.badRequest('Tiêu đề và mục tiêu định lượng là bắt buộc');
  }

  const newGoal = {
    id: `goal-${Date.now()}`,
    title,
    targetDate: targetDate || new Date().toISOString().split('T')[0],
    targetValue: Number(targetValue) || 10,
    currentValue: 0,
    unit: unit || 'giờ',
    status: 'active' as const
  };

  memoryStore.goals.unshift(newGoal);
  res.status(201).json({ success: true, data: newGoal });
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
