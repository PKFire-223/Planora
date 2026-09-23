import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { memoryStore } from '../../config/db';
import { ApiError } from '../../errors/apiError';
import { CourseModel } from '../../models/course.model';
import { CourseItem } from '../../types';

export const courseRouter = Router();

// GET all courses
courseRouter.get('/', async (req: Request, res: Response) => {
  const { status } = req.query;

  // If Mongo is connected and memoryStore is empty, fetch from Mongo
  if (mongoose.connection.readyState === 1 && memoryStore.courses.length === 0) {
    try {
      const dbList = await CourseModel.find().lean();
      if (dbList.length > 0) {
        memoryStore.courses = dbList as unknown as CourseItem[];
      }
    } catch {
      // fallback to memoryStore
    }
  }

  let list = memoryStore.courses;
  if (status && typeof status === 'string') {
    list = list.filter(c => c.status === status);
  }
  res.json({ success: true, data: list });
});

// GET single course
courseRouter.get('/:id', async (req: Request, res: Response) => {
  let course = memoryStore.courses.find(c => c.id === req.params.id);

  if (!course && mongoose.connection.readyState === 1) {
    try {
      const dbCourse = await CourseModel.findOne({ id: req.params.id }).lean();
      if (dbCourse) {
        course = dbCourse as unknown as CourseItem;
      }
    } catch {
      // fallback
    }
  }

  if (!course) {
    throw ApiError.notFound('Không tìm thấy khoá học yêu cầu');
  }
  res.json({ success: true, data: course });
});

// POST create course
courseRouter.post('/', async (req: Request, res: Response) => {
  const {
    title,
    code,
    instructor,
    description,
    color,
    totalLessons,
    credits,
    semester,
    schedule,
    room,
    targetGrade,
    currentGrade,
    evaluationWeights,
    syllabus,
    lessons,
    materials
  } = req.body;

  if (!title || !code) {
    throw ApiError.badRequest('Tiêu đề và mã khoá học là bắt buộc');
  }

  const newCourse: CourseItem = {
    id: `course-${Date.now()}`,
    title,
    code: code.toUpperCase(),
    instructor: instructor || 'Chưa phân công',
    description: description || '',
    status: 'not_started',
    color: color || 'indigo',
    progress: 0,
    totalLessons: Number(totalLessons) || 12,
    completedLessons: 0,
    createdAt: new Date().toISOString().split('T')[0],
    credits: Number(credits) || 3,
    semester: semester || 'Học kỳ 1 - 2026-2027',
    schedule: schedule || '',
    room: room || '',
    targetGrade: targetGrade || 'A',
    currentGrade: currentGrade ?? undefined,
    evaluationWeights: evaluationWeights || [
      { label: 'Chuyên cần', weight: 20 },
      { label: 'Giữa kỳ', weight: 30 },
      { label: 'Cuối kỳ', weight: 50 }
    ],
    syllabus: syllabus || [],
    lessons: lessons || [],
    materials: materials || []
  };

  memoryStore.courses.unshift(newCourse);

  // Persist to MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await CourseModel.create(newCourse);
    } catch (err: any) {
      console.warn('[Course] MongoDB create warning:', err.message);
    }
  }

  res.status(201).json({ success: true, data: newCourse });
});

// PUT update course
courseRouter.put('/:id', async (req: Request, res: Response) => {
  const idx = memoryStore.courses.findIndex(c => c.id === req.params.id);
  if (idx === -1) {
    throw ApiError.notFound('Khoá học không tồn tại để cập nhật');
  }

  const current = memoryStore.courses[idx];
  const updated: CourseItem = {
    ...current,
    ...req.body,
    id: current.id // prevent ID mutation
  };

  if (updated.totalLessons > 0) {
    updated.progress = Math.min(100, Math.round((updated.completedLessons / updated.totalLessons) * 100));
    if (updated.progress === 100) {
      updated.status = 'completed';
    } else if (updated.progress > 0) {
      updated.status = 'in_progress';
    }
  }

  memoryStore.courses[idx] = updated;

  // Persist to MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await CourseModel.findOneAndUpdate({ id: req.params.id }, updated, { upsert: true });
    } catch (err: any) {
      console.warn('[Course] MongoDB update warning:', err.message);
    }
  }

  res.json({ success: true, data: updated });
});

// DELETE course
courseRouter.delete('/:id', async (req: Request, res: Response) => {
  const initialLen = memoryStore.courses.length;
  memoryStore.courses = memoryStore.courses.filter(c => c.id !== req.params.id);

  if (memoryStore.courses.length === initialLen) {
    throw ApiError.notFound('Không tìm thấy khoá học để xoá');
  }

  // Persist to MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await CourseModel.findOneAndDelete({ id: req.params.id });
    } catch (err: any) {
      console.warn('[Course] MongoDB delete warning:', err.message);
    }
  }

  res.json({ success: true, message: 'Đã xoá khoá học thành công' });
});
