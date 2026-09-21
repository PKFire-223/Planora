import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { memoryStore } from '../../config/db';

export const aiRouter = Router();

// Lazy initialization of Gemini client if API key is present
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    try {
      geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.warn('[Gemini AI] Initialization skipped:', err);
    }
  }
  return geminiClient;
}

// POST /api/ai/ask
aiRouter.post('/ask', async (req: Request, res: Response) => {
  const { question, context } = req.body;
  if (!question) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp câu hỏi' });
  }

  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `Bạn là Trợ lý Học tập AI thông minh (AI Study Assistant) cho sinh viên trong hệ thống Personal LMS.
Ngữ cảnh học tập: ${context || 'Quản lý học tập cá nhân, Lập trình Web & Khoa học máy tính'}.
Câu hỏi của học viên: ${question}

Hãy trả lời ngắn gọn, súc tích, dễ hiểu, kèm ví dụ mã nguồn hoặc mẹo học tập thực tế bằng tiếng Việt.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return res.json({
        success: true,
        answer: response.text || 'Không nhận được câu trả lời từ mô hình.',
        source: 'gemini'
      });
    } catch (err: any) {
      console.warn('[Gemini AI Error - Falling back to local smart engine]:', err.message);
    }
  }

  // Smart local heuristic response when GEMINI_API_KEY is not configured
  let answer = '';
  const qLower = question.toLowerCase();

  if (qLower.includes('mongo') || qLower.includes('database')) {
    answer = `💡 **Mẹo MongoDB & Mongoose trong Personal LMS**:
1. **Schema Design**: Nên nhúng (embed) các dữ liệu gắn liền ít thay đổi (như tag, bài học con) và dùng tham chiếu (ObjectId Reference) cho quan hệ độc lập (Course -> Tasks).
2. **Indexing**: Tạo index trên các trường thường xuyên filter như \`status\`, \`dueDate\`, \`userId\` để tăng tốc độ truy vấn.
3. **Mongoose Middleware**: Sử dụng pre-save hook để tự động cập nhật \`updatedAt\` và tính toán phần trăm \`progress\` của khoá học.`;
  } else if (qLower.includes('clean architecture') || qLower.includes('cấu trúc') || qLower.includes('tree')) {
    answer = `🏛️ **Nguyên tắc phân chia thư mục chuẩn cho Full-Stack**:
- **Tách biệt mối quan tâm (SoC)**: Frontend chia theo \`features/\` (auth, courses, tasks, notes, ai), Backend chia theo \`modules/\` gồm (routes, controller, service, model).
- **Tránh hàm quá dài**: Tuân thủ Single Responsibility Principle (SRP) - mỗi hàm chỉ làm 1 việc duy nhất (ví dụ hàm validate riêng, hàm tính điểm riêng, hàm lưu DB riêng).
- **Naming Convention**: Dùng \`camelCase\` cho biến/hàm, \`PascalCase\` cho Components/Classes, \`kebab-case\` cho tên file.`;
  } else if (qLower.includes('lộ trình') || qLower.includes('roadmap') || qLower.includes('kế hoạch')) {
    answer = `📅 **Gợi ý kế hoạch học tập tuần này**:
- **Thứ 2 - Thứ 4**: Hoàn thành bài tập về Mongoose Schema & Global Error Handler (Ước tính: 3 giờ).
- **Thứ 5 - Thứ 6**: Luyện 3 bài giải thuật đồ thị và ghi chép lại giải pháp vào mục Ghi chú (Notes).
- **Cuối tuần**: Kiểm tra lại Mục tiêu (Goals) và chạy thử nghiệm kiểm tra lỗi với module Error Tracker.`;
  } else {
    answer = `🤖 **Gợi ý từ Trợ lý AI**: 
Đối với câu hỏi "${question}": 
Bạn nên chia nhỏ vấn đề thành 3 bước:
1. **Xác định đầu vào & đầu ra (I/O)**: Liệt kê dữ liệu cần thiết và kết quả mong muốn.
2. **Thực thi bản mẫu (Prototype)**: Viết mã nguồn tối giản nhất có thể chạy được trước khi tối ưu.
3. **Đóng gói & Bắt lỗi**: Sử dụng khối \`try/catch\` hoặc middleware \`errorHandler\` để xử lý các ca ngoại lệ.`;
  }

  return res.json({
    success: true,
    answer,
    source: 'local-assistant',
    note: process.env.GEMINI_API_KEY ? undefined : 'Để kích hoạt Gemini Live API, hãy cấu hình GEMINI_API_KEY trong .env.'
  });
});

// POST /api/ai/breakdown-task
aiRouter.post('/breakdown-task', async (req: Request, res: Response) => {
  const { taskTitle, courseId } = req.body;
  if (!taskTitle) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tên task cần chia nhỏ' });
  }

  const subtasks = [
    { title: `[1/3] Nghiên cứu tài liệu & thiết kế mẫu cho: ${taskTitle}`, estimatedMinutes: 20 },
    { title: `[2/3] Thực hiện code logic & xử lý ngoại lệ cho: ${taskTitle}`, estimatedMinutes: 45 },
    { title: `[3/3] Viết bài test kiểm thử & nghiệm thu kết quả: ${taskTitle}`, estimatedMinutes: 25 }
  ];

  // Auto-insert subtasks into the database store
  const createdTasks = subtasks.map((st, i) => {
    const newTask = {
      id: `task-ai-${Date.now()}-${i}`,
      courseId,
      title: st.title,
      priority: 'medium' as const,
      status: 'todo' as const,
      dueDate: new Date(Date.now() + (i + 1) * 86400000).toISOString().split('T')[0],
      estimatedMinutes: st.estimatedMinutes,
      isAiGenerated: true
    };
    memoryStore.tasks.unshift(newTask);
    return newTask;
  });

  res.json({
    success: true,
    message: `Đã tự động chia nhỏ và tạo ${createdTasks.length} nhiệm vụ con vào danh sách!`,
    data: createdTasks
  });
});
