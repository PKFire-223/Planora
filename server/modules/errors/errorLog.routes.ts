import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { memoryStore } from '../../config/db';
import { ApiError } from '../../errors/apiError';
import { ErrorReportModel } from '../../models/error.model';
import { ErrorReportItem } from '../../types';

export const errorRouter = Router();

// GET all error reports
errorRouter.get('/', async (req: Request, res: Response) => {
  const { status, severity } = req.query;

  if (mongoose.connection.readyState === 1 && memoryStore.errors.length === 0) {
    try {
      const dbList = await ErrorReportModel.find().lean();
      if (dbList.length > 0) {
        memoryStore.errors = dbList as unknown as ErrorReportItem[];
      }
    } catch {
      // fallback
    }
  }

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
errorRouter.post('/', async (req: Request, res: Response) => {
  const { title, description, severity, componentName } = req.body;
  if (!title || !description) {
    throw ApiError.badRequest('Tiêu đề và mô tả lỗi là bắt buộc');
  }

  const newReport: ErrorReportItem = {
    id: `err-${Date.now()}`,
    title,
    description,
    severity: severity || 'medium',
    status: 'open',
    componentName: componentName || 'Khác',
    reportedAt: new Date().toISOString()
  };

  memoryStore.errors.unshift(newReport);

  if (mongoose.connection.readyState === 1) {
    try {
      await ErrorReportModel.create(newReport);
    } catch (err: any) {
      console.warn('[ErrorLog] MongoDB create warning:', err.message);
    }
  }

  res.status(201).json({ success: true, data: newReport });
});

// PATCH resolve or update error report
errorRouter.patch('/:id/status', async (req: Request, res: Response) => {
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

  if (mongoose.connection.readyState === 1) {
    try {
      await ErrorReportModel.findOneAndUpdate({ id: req.params.id }, { status: report.status, resolutionNotes: report.resolutionNotes });
    } catch (err: any) {
      console.warn('[ErrorLog] MongoDB status update warning:', err.message);
    }
  }

  res.json({ success: true, data: report });
});

// DELETE error report
errorRouter.delete('/:id', async (req: Request, res: Response) => {
  const initialLen = memoryStore.errors.length;
  memoryStore.errors = memoryStore.errors.filter(e => e.id !== req.params.id);
  if (memoryStore.errors.length === initialLen) {
    throw ApiError.notFound('Không tìm thấy báo cáo lỗi để xoá');
  }

  if (mongoose.connection.readyState === 1) {
    try {
      await ErrorReportModel.findOneAndDelete({ id: req.params.id });
    } catch (err: any) {
      console.warn('[ErrorLog] MongoDB delete warning:', err.message);
    }
  }

  res.json({ success: true, message: 'Đã xoá báo cáo lỗi thành công' });
});
