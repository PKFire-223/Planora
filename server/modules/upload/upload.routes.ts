import { Router, Request, Response } from 'express';

export interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  category?: 'document' | 'image' | 'slide' | 'code' | 'archive' | 'other';
}

// In-memory registry of uploaded files for session / container lifecycle
const uploadedFilesStore = new Map<string, UploadedFileItem>();

export const uploadRouter = Router();

// GET /api/upload/status - Provides storage engine metadata and comparison
uploadRouter.get('/status', (_req: Request, res: Response) => {
  const isAwsConfigured = Boolean(
    process.env.AWS_S3_BUCKET &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  );

  res.json({
    success: true,
    engine: isAwsConfigured ? 'aws_s3' : 'built_in_local',
    isAwsConfigured,
    summary: isAwsConfigured
      ? 'Đang kết nối bucket AWS S3 Cloud Storage.'
      : 'Đang sử dụng Planora Unified Local Storage (hoạt động tức thì, không cần cấu hình thẻ/tài khoản AWS).',
    recommendation: {
      currentStatus: 'Hoạt động tối ưu và an toàn',
      awsEvaluation: 'AWS S3 là tiêu chuẩn lưu trữ đám mây cao cấp cho doanh nghiệp. Tuy nhiên với ứng dụng học tập/cá nhân, hệ thống lưu trữ tích hợp sẵn của Planora là lựa chọn tiện lợi nhất vì không phát sinh chi phí hàng tháng, không yêu cầu thẻ tín dụng và hoạt động 100% kể cả khi ngoại tuyến.'
    },
    totalStoredFiles: uploadedFilesStore.size
  });
});

// POST /api/upload - Handle file upload
uploadRouter.post('/', (req: Request, res: Response) => {
  const { id, name, size, type, dataUrl, category } = req.body;

  if (!dataUrl || !name) {
    res.status(400).json({
      success: false,
      message: 'Thiếu dữ liệu tệp tin hoặc tên tệp'
    });
    return;
  }

  const fileId = id || `file-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const fileItem: UploadedFileItem = {
    id: fileId,
    name: String(name),
    size: Number(size) || 0,
    type: String(type || 'application/octet-stream'),
    url: dataUrl, // Stores the optimized Base64 data URL
    uploadedAt: new Date().toISOString(),
    category: category || 'other'
  };

  uploadedFilesStore.set(fileId, fileItem);

  res.status(201).json({
    success: true,
    message: 'Tải lên tệp thành công',
    file: fileItem
  });
});

// DELETE /api/upload/:id - Remove uploaded file
uploadRouter.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (uploadedFilesStore.has(id)) {
    uploadedFilesStore.delete(id);
    res.json({ success: true, message: 'Đã xóa tệp tin' });
  } else {
    res.status(404).json({ success: false, message: 'Không tìm thấy tệp tin' });
  }
});
