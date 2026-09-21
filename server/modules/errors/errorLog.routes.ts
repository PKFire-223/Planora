import { Router, Request, Response } from 'express';
import { memoryStore } from '../../config/db';
import { ApiError } from '../../errors/apiError';

export const errorRouter = Router();

// GET all error reports
errorRouter.get('/', (req: Request, res: Response) => {
  const { status, severity } = req.query;
  let list = memoryStore.errors;

  if (status && typeof status === 'string') {
    list = list.filter(e => e.status === status);
  }
  if (severity && typeof severity === 'string') {
    list = list.filter(e => e.severity === severity);
  }

  res.json({ success: true, data: list });
});

// POST report a new bug / issue
errorRouter.post('/', (req: Request, res: Response) => {
  const { title, description, severity, componentName } = req.body;
  if (!title || !description) {
    throw ApiError.badRequest('Tiêu đề và mô tả lỗi là bắt buộc');
  }

  const newReport = {
    id: `err-${Date.now()}`,
    title,
    description,
    severity: severity || 'medium',
    status: 'open' as const,
    componentName: componentName || 'Khác',
    reportedAt: new Date().toISOString()
  };

  memoryStore.errors.unshift(newReport);
  res.status(201).json({ success: true, data: newReport });
});

// PATCH resolve or update error report
errorRouter.patch('/:id/status', (req: Request, res: Response) => {
  const { status, resolutionNotes } = req.body;
  const report = memoryStore.errors.find(e => e.id === req.params.id);
  if (!report) {
    throw ApiError.notFound('Không tìm thấy báo cáo lỗi');
  }

  if (status) {
    report.status = status;
  }
  if (resolutionNotes) {
    report.resolutionNotes = resolutionNotes;
  }

  res.json({ success: true, data: report });
});

// DELETE error report
errorRouter.delete('/:id', (req: Request, res: Response) => {
  const initialLen = memoryStore.errors.length;
  memoryStore.errors = memoryStore.errors.filter(e => e.id !== req.params.id);
  if (memoryStore.errors.length === initialLen) {
    throw ApiError.notFound('Không tìm thấy báo cáo lỗi để xoá');
  }
  res.json({ success: true, message: 'Đã xoá báo cáo lỗi thành công' });
});
