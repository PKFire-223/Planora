import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/apiError';
import { memoryStore } from '../config/db';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || 'Lỗi máy chủ nội bộ (Internal Server Error)';

  console.error(`[Error Handler] [${req.method}] ${req.path} - ${statusCode}: ${message}`);

  // Automatically record server 500 errors into the error tracking system
  if (statusCode >= 500) {
    memoryStore.errors.unshift({
      id: `err-auto-${Date.now()}`,
      title: `Server Error on ${req.method} ${req.path}`,
      description: message,
      severity: 'high',
      status: 'open',
      componentName: req.path.split('/')[2] || 'ServerCore',
      reportedAt: new Date().toISOString()
    });
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    timestamp: new Date().toISOString()
  });
}
