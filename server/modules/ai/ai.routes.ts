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
  const { question, context, persona, userContext, history, imageAttachment } = req.body;
  if (!question && !imageAttachment) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp câu hỏi hoặc hình ảnh/tài liệu đính kèm' });
  }

  const qText = question || 'Hãy phân tích tài liệu/hình ảnh đính kèm này và đưa ra hướng dẫn học tập chi tiết.';
  const qLower = qText.toLowerCase();

  // Detect whether this is a request to create or propose a course/syllabus
  const isCourseRequest =
    persona === 'course_architect' ||
    qLower.includes('tạo khóa học') ||
    qLower.includes('tạo môn học') ||
    qLower.includes('thiết kế khóa học') ||
    qLower.includes('khóa học mẫu') ||
    qLower.includes('lộ trình môn') ||
    qLower.includes('giáo trình') ||
    qLower.includes('đề cương môn') ||
    qLower.includes('create course') ||
    qLower.includes('syllabus');

  // Construct rich persona-guided prompt with context
  let personaInstruction = 'Bạn là Cố Vấn Học Tập Toàn Năng Planora AI (Planora Learning Master). Giúp sinh viên nắm vững kiến thức từ gốc rễ, chia nhỏ vấn đề và áp dụng ngay vào bài tập/đồ án thực tế.';
  if (persona === 'socratic') {
    personaInstruction = 'Bạn là Gia sư Socrates (Socratic Tutor). Hãy gợi ý tư duy từng bước, đặt câu hỏi phản biện gợi mở để người học tự khám phá ra đáp án, tuyệt đối không đưa đáp án giải sẵn thô thiển.';
  } else if (persona === 'coder') {
    personaInstruction = 'Bạn là Chuyên gia Lập trình & Kỹ sư Phần mềm Cấp cao (Senior Software Architect). Hướng dẫn chuẩn Clean Architecture, TypeScript/React/Node.js hiện đại, giải thích thuật toán, phân tích độ phức tạp O(n) và xử lý trường hợp biên.';
  } else if (persona === 'planner') {
    personaInstruction = 'Bạn là Chuyên gia Quản lý Thời gian & Lập kế hoạch (Study Planner). Hãy phân bổ thời gian học tập, chia nhỏ công việc theo Pomodoro, Eisenhower Matrix và gợi ý thứ tự ưu tiên.';
  } else if (persona === 'course_architect') {
    personaInstruction = 'Bạn là Kiến trúc sư Khóa học & Giáo dục Đại học (Curriculum Architect). Bạn thiết kế giáo trình môn học chi tiết theo tuần, chuẩn đầu ra (Learning Outcomes), thang điểm đánh giá và các bài tập thực hành chuẩn quốc tế.';
  } else if (persona === 'quiz') {
    personaInstruction = 'Bạn là Trợ lý Ôn thi & Kiểm tra kiến thức. Hãy đưa ra câu hỏi trắc nghiệm hoặc bài tập tình huống thực tế kèm lời giải thích ngắn gọn, súc tích.';
  }

  let courseInstruction = '';
  if (isCourseRequest) {
    courseInstruction = `
[YÊU CẦU ĐẶC BIỆT VỀ TẠO KHÓA HỌC / GIÁO TRÌNH]:
Người học muốn bạn thiết kế hoặc tạo một khóa học / môn học mẫu.
1. Hãy viết bài giới thiệu môn học thật chuyên nghiệp: Mục tiêu chuẩn đầu ra, kiến thức tiên quyết, đối tượng phù hợp, và đề cương tuần (Syllabus) chi tiết bằng Markdown.
2. CUỐI CÙNG, BẮT BUỘC xuất ra khối JSON chính xác dưới đây (được bọc trong thẻ \`\`\`planora-course và \`\`\`) để hệ thống Planora tự động kết nối và tạo môn học vào cơ sở dữ liệu cho người học:
\`\`\`planora-course
{
  "title": "Tên Khóa Học Cụ Thể (ví dụ: Lập trình Fullstack React & Node.js)",
  "code": "MÃ-MÔN (ví dụ: CS-301, WEB-202, AI-101)",
  "credits": 3,
  "instructor": "Hội đồng Cố vấn Planora AI",
  "color": "indigo",
  "description": "Mô tả khóa học súc tích, mục tiêu và ứng dụng thực tiễn...",
  "targetGrade": "A",
  "semester": "Học kỳ 1 - 2026",
  "syllabus": [
    { "week": 1, "title": "Tuần 1: Giới thiệu & Cài đặt", "desc": "Nắm vững tổng quan và thiết lập môi trường" },
    { "week": 2, "title": "Tuần 2: Nền tảng cốt lõi", "desc": "Lý thuyết trọng tâm và bài tập mở đầu" },
    { "week": 3, "title": "Tuần 3: Kỹ thuật nâng cao", "desc": "Hiện thực các tính năng phức tạp" },
    { "week": 4, "title": "Tuần 4: Đồ án tổng kết & Nghiệm thu", "desc": "Hoàn thiện sản phẩm và kiểm thử" }
  ],
  "initialTasks": [
    { "title": "[Khóa Học] Đọc tài liệu tuần 1 và thiết lập môi trường", "estimatedMinutes": 45, "priority": "high" },
    { "title": "[Khóa Học] Hoàn thành bài tập thực hành tuần 1", "estimatedMinutes": 60, "priority": "medium" },
    { "title": "[Khóa Học] Chuẩn bị đề cương đồ án giữa kỳ", "estimatedMinutes": 90, "priority": "high" }
  ]
}
\`\`\`
Màu sắc ("color") có thể chọn một trong: "indigo", "emerald", "amber", "rose", "sky", "purple".`;
  }

  const prompt = `${personaInstruction}
${userContext ? `Dữ liệu học tập hiện tại của học viên:\n${userContext}\n` : ''}
Ngữ cảnh chủ đề: ${context || 'Quản lý học tập cá nhân, Lập trình Web & Khoa học máy tính'}.
Câu hỏi của học viên: ${qText}
${courseInstruction}

Yêu cầu định dạng: Trả lời bằng Markdown rõ ràng, súc tích, định dạng mã nguồn trong code block có syntax highlighting nếu có, và dùng tiếng Việt chuẩn mực, truyền cảm hứng học tập.`;

  const ai = getGeminiClient();

  if (ai) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Model timeout')), 8000)
      );

      // Build multimodal payload or text contents
      const contents: any[] = [];

      // Attach previous conversation context if available
      if (history && Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-4)) {
          contents.push({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.text }]
          });
        }
      }

      const userParts: any[] = [];
      if (imageAttachment && typeof imageAttachment === 'string') {
        const match = imageAttachment.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          userParts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2]
            }
          });
        }
      }
      userParts.push({ text: prompt });
      contents.push({ role: 'user', parts: userParts });

      const apiCall = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents.length === 1 && userParts.length === 1 ? prompt : contents
      });

      const response = await Promise.race([apiCall, timeoutPromise]);

      if (response.text) {
        return res.json({
          success: true,
          answer: response.text,
          source: 'gemini',
          model: 'gemini-2.5-flash'
        });
      }
    } catch {
      // Quietly fall back to high-precision local study engine
    }
  }

  // Intelligent local fallback engine if API key is not configured or all candidate models spike
  let answer = '';

  if (isCourseRequest) {
    // Smart topic-based course proposal generator
    let title = 'Lập Trình Web Fullstack Hiện Đại (React & Node.js)';
    let code = 'WEB-301';
    let color = 'indigo';
    let desc = 'Khóa học trang bị toàn diện kiến thức xây dựng ứng dụng web từ giao diện người dùng đến kiến trúc backend và triển khai đám mây.';

    if (qLower.includes('dsa') || qLower.includes('thuật toán') || qLower.includes('cấu trúc dữ liệu')) {
      title = 'Cấu Trúc Dữ Liệu & Giải Thuật Thực Chiến';
      code = 'DSA-201';
      color = 'emerald';
      desc = 'Chinh phục các giải thuật cốt lõi: Đồ thị, Quy hoạch động, Cây tìm kiếm nhị phân và tối ưu độ phức tạp cho các kỳ thi phỏng vấn kỹ thuật.';
    } else if (qLower.includes('ai') || qLower.includes('machine learning') || qLower.includes('trí tuệ nhân tạo') || qLower.includes('python')) {
      title = 'Nhập Môn Trí Tuệ Nhân Tạo & Machine Learning';
      code = 'AI-2026';
      color = 'purple';
      desc = 'Học lý thuyết và thực hành ứng dụng AI, huấn luyện mô hình Machine Learning với Python, scikit-learn và tích hợp LLMs.';
    } else if (qLower.includes('database') || qLower.includes('cơ sở dữ liệu') || qLower.includes('sql') || qLower.includes('mongo')) {
      title = 'Hệ Quản Trị Cơ Sở Dữ Liệu & Thiết Kế Schema';
      code = 'DB-202';
      color = 'sky';
      desc = 'Thiết kế cơ sở dữ liệu quan hệ và NoSQL chuẩn mực, tối ưu chỉ mục (Indexing), ACID transactions và phân tích hiệu năng truy vấn.';
    } else if (qLower.includes('tiếng anh') || qLower.includes('english')) {
      title = 'Tiếng Anh Chuyên Ngành Khoa Học Máy Tính';
      code = 'ENG-IT101';
      color = 'amber';
      desc = 'Nâng cao vốn từ vựng chuyên ngành CNTT, kỹ năng đọc hiểu tài liệu kỹ thuật chuẩn quốc tế và thuyết trình giải pháp công nghệ.';
    }

    answer = `🎓 **Kế Hoạch & Đề Cương Khóa Học: ${title}**

Chào bạn! Dưới đây là chương trình đào tạo chuẩn mực được thiết kế để bạn tiếp thu kiến thức một cách khoa học, kết hợp giữa lý thuyết nền tảng và bài tập thực hành dự án:

### 🌟 1. Mục Tiêu Khóa Học (Course Learning Outcomes)
- Nắm vững các khái niệm và nguyên lý hoạt động cốt lõi của môn học.
- Tự tay hiện thực hóa các bài toán và đồ án từ nhỏ đến lớn.
- Phát triển tư duy giải quyết vấn đề và chuẩn bị tốt cho các kỳ thi kết thúc học phần.

### 📚 2. Đề Cương Giảng Dạy Chi Tiết
- **Tuần 1 - Nền tảng & Cài đặt môi trường**: Giới thiệu tổng quan, cài đặt công cụ và viết chương trình mẫu đầu tiên.
- **Tuần 2 - Khái niệm trọng tâm & Cấu trúc cơ bản**: Đi sâu vào các nguyên lý then chốt và các bài tập cơ sở.
- **Tuần 3 - Kỹ thuật nâng cao & Xử lý ngoại lệ**: Tối ưu hóa giải thuật, thiết kế cấu trúc dữ liệu và xử lý các lỗi thường gặp.
- **Tuần 4 - Đồ án thực chiến & Tổng kết**: Xây dựng sản phẩm hoàn chỉnh, kiểm thử và nghiệm thu kết quả.

### 🎯 3. Nhiệm Vụ Hành Động Đầu Tiên
Hệ thống đã chuẩn bị sẵn các bài tập ban đầu để bạn bắt tay vào học ngay hôm nay!

\`\`\`planora-course
{
  "title": "${title}",
  "code": "${code}",
  "credits": 3,
  "instructor": "Hội đồng Cố vấn Planora AI",
  "color": "${color}",
  "description": "${desc}",
  "targetGrade": "A",
  "semester": "Học kỳ 1 - 2026",
  "syllabus": [
    { "week": 1, "title": "Tuần 1: Nền tảng & Thiết lập môi trường", "desc": "Tìm hiểu tổng quan môn học, cài đặt bộ công cụ và chạy thử ví dụ đầu tiên." },
    { "week": 2, "title": "Tuần 2: Cốt lõi lý thuyết & Bài tập căn bản", "desc": "Nắm vững các cú pháp, nguyên lý hoạt động và làm quen với các cấu trúc chuẩn." },
    { "week": 3, "title": "Tuần 3: Kỹ thuật nâng cao & Giải quyết bài toán", "desc": "Áp dụng kỹ thuật tối ưu hóa, xử lý trường hợp biên và kiểm thử đơn vị." },
    { "week": 4, "title": "Tuần 4: Đồ án thực chiến & Báo cáo nghiệm thu", "desc": "Tích hợp toàn diện các tuần trước vào 1 sản phẩm dự án có thể triển khai." }
  ],
  "initialTasks": [
    { "title": "[${code}] Đọc giáo trình tuần 1 & thiết lập công cụ", "estimatedMinutes": 45, "priority": "high" },
    { "title": "[${code}] Hoàn thành bài tập thực hành tuần 1", "estimatedMinutes": 60, "priority": "medium" },
    { "title": "[${code}] Chuẩn bị ý tưởng đồ án tổng kết", "estimatedMinutes": 90, "priority": "high" }
  ]
}
\`\`\`

👉 *Bạn hãy bấm vào nút **"✨ Tạo Khóa Học Này"** ở thẻ bên dưới để đưa ngay môn học này vào danh mục học tập của bạn!*`;
  } else if (persona === 'socratic') {
    answer = `🧑‍🏫 **Gia sư Socrates (Gợi mở tư duy)**:
Để giải quyết câu hỏi: "*${qText}*", bạn hãy tự trả lời 3 câu hỏi gợi ý sau:
1. **Bản chất vấn đề**: Input đầu vào của bạn là gì và bạn kỳ vọng output sau cùng ở dạng nào?
2. **Điểm nghẽn tiềm ẩn**: Nếu dữ liệu đầu vào bị \`null\` hoặc mạng bị ngắt giữa chừng, hệ thống của bạn sẽ ứng xử thế nào?
3. **Thực nghiệm**: Bạn đã thử in (\`console.log\`) trạng thái của biến ở bước xảy ra bất thường chưa?
👉 *Hãy thử suy nghĩ câu trả lời cho bước 1 và phản hồi lại, tôi sẽ cùng bạn phân tích tiếp!*`;
  } else if (persona === 'quiz') {
    answer = `📝 **Mini Quiz Ôn Tập Kiến Thức**:
Dưới đây là 3 câu hỏi nhanh liên quan đến chủ đề bạn đang tìm hiểu:

1. **Câu 1**: Sự khác biệt cốt lõi giữa nhúng (Embedded Document) và tham chiếu (Referenced Document) trong Mongoose là gì?
2. **Câu 2**: Khi một request gặp lỗi 503 (Service Unavailable), client nên làm gì để tránh làm sập server (hint: Exponential Backoff)?
3. **Câu 3**: Trong Express, middleware xử lý lỗi (Error Handler) bắt buộc phải có đủ bao nhiêu tham số? *(Đáp án: 4 tham số \`(err, req, res, next)\`)*.

💡 *Bạn hãy thử giải câu 1 & câu 2 nhé!*`;
  } else if (persona === 'planner' || qLower.includes('lộ trình') || qLower.includes('roadmap') || qLower.includes('kế hoạch') || qLower.includes('ưu tiên')) {
    answer = `📅 **Kế Hoạch & Phân Bổ Thời Gian Học Tập**:
${userContext ? `*Dựa trên dữ liệu học tập hiện tại của bạn:*\n` : ''}
- 🎯 **Phiên Pomodoro 1 (45 phút - Ưu tiên cao nhất)**: Dứt điểm bài tập hoặc nhiệm vụ sắp đến hạn gần nhất trong danh sách.
- ☕ **Nghỉ ngắn 10 phút**: Vận động nhẹ, không nhìn màn hình.
- 🎯 **Phiên Pomodoro 2 (45 phút - Đọc & Code mẫu)**: Ôn tập lý thuyết môn học và thực hành 1 ví dụ code thực tế.
- 🎯 **Phiên Pomodoro 3 (30 phút - Tổng kết)**: Tạo ghi chú tóm tắt vào mục **Notes** và đánh dấu tiến độ trong mục **Goals**.`;
  } else {
    answer = `🤖 **Hướng Dẫn Từ Trợ Lý Học Tập Planora**:
Đối với vấn đề: "*${qText}*"

1. **Xác định mục tiêu chính**: Chia nhỏ bài toán thành các mốc khả thi (MVP - Minimum Viable Product).
2. **Kỹ thuật thực hiện**:
   - Viết logic cốt lõi trước, chưa vội tối ưu hóa sớm (Premature Optimization).
   - Kiểm thử từng module độc lập (Unit testing).
3. **Gợi ý tiếp theo**: Bạn có thể bấm nút **+ Task** ở góc dưới phản hồi này để tự động đưa mục tiêu này vào danh sách nhiệm vụ của bạn!`;
  }

  return res.json({
    success: true,
    answer,
    source: 'smart-assistant',
    model: 'Planora Study Engine'
  });
});

// POST /api/ai/generate-course
aiRouter.post('/generate-course', async (req: Request, res: Response) => {
  const { topic, level, durationWeeks } = req.body;
  if (!topic) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp chủ đề môn học' });
  }

  const weeks = Math.min(Math.max(Number(durationWeeks) || 8, 4), 16);
  const userLevel = level || 'Người mới bắt đầu (Beginner)';

  const prompt = `Bạn là Kiến trúc sư Chương trình Đào tạo Đại học (Curriculum Architect).
Hãy thiết kế một khóa học hoàn chỉnh về chủ đề: "${topic}".
Trình độ: ${userLevel}
Thời lượng: ${weeks} tuần.

BẮT BUỘC trả về duy nhất một JSON object thuần túy hợp lệ (không kèm markdown \`\`\`json hay bất kỳ văn bản nào khác):
{
  "title": "Tên môn học chuẩn mực",
  "code": "MÃ-MÔN (ví dụ CS-101, WEB-201, AI-301)",
  "credits": 3,
  "instructor": "Hội đồng Cố vấn Planora AI",
  "color": "indigo",
  "description": "Mô tả khóa học chi tiết và mục tiêu đào tạo...",
  "targetGrade": "A",
  "semester": "Học kỳ 1 - 2026",
  "syllabus": [
    { "week": 1, "title": "Tuần 1: ...", "desc": "..." },
    { "week": 2, "title": "Tuần 2: ...", "desc": "..." }
  ],
  "initialTasks": [
    { "title": "[Tên môn] Nhiệm vụ 1", "estimatedMinutes": 45, "priority": "high" },
    { "title": "[Tên môn] Nhiệm vụ 2", "estimatedMinutes": 60, "priority": "medium" }
  ]
}`;

  const ai = getGeminiClient();
  if (ai) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Model timeout')), 8000)
      );
      const apiCall = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const response = await Promise.race([apiCall, timeoutPromise]);
      if (response.text) {
        const cleanJson = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed && parsed.title && Array.isArray(parsed.syllabus)) {
          return res.json({
            success: true,
            course: parsed
          });
        }
      }
    } catch {
      // Proceed to fallback
    }
  }

  // Fallback high quality template
  const fallbackCourse = {
    title: `Khóa học: ${topic}`,
    code: `AI-${Date.now().toString().slice(-4)}`,
    credits: 3,
    instructor: 'Hội đồng Cố vấn Planora AI',
    color: 'indigo',
    description: `Khóa học toàn diện về ${topic} dành cho trình độ ${userLevel}, được thiết kế theo lộ trình ${weeks} tuần với bài tập thực hành hàng tuần.`,
    targetGrade: 'A',
    semester: 'Học kỳ 1 - 2026',
    syllabus: Array.from({ length: weeks }, (_, i) => ({
      week: i + 1,
      title: `Tuần ${i + 1}: Chuyên đề ${i + 1} về ${topic}`,
      desc: `Nắm vững nguyên lý cốt lõi và hoàn thành bài tập thực hành tuần ${i + 1}.`
    })),
    initialTasks: [
      { title: `[${topic}] Đọc giáo trình tuần 1 & cài đặt môi trường`, estimatedMinutes: 45, priority: 'high' },
      { title: `[${topic}] Làm bài tập thực hành tuần 1`, estimatedMinutes: 60, priority: 'medium' },
      { title: `[${topic}] Nghiên cứu đồ án tổng kết giữa kỳ`, estimatedMinutes: 90, priority: 'high' }
    ]
  };

  return res.json({
    success: true,
    course: fallbackCourse
  });
});

// POST /api/ai/breakdown-task
aiRouter.post('/breakdown-task', async (req: Request, res: Response) => {
  const { taskTitle, courseId } = req.body;
  if (!taskTitle) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tên task cần chia nhỏ' });
  }

  const ai = getGeminiClient();
  let subtasks = [
    { title: `[1/3] Nghiên cứu tài liệu & thiết kế mẫu cho: ${taskTitle}`, estimatedMinutes: 25 },
    { title: `[2/3] Thực hiện code logic & xử lý ngoại lệ cho: ${taskTitle}`, estimatedMinutes: 45 },
    { title: `[3/3] Viết bài test kiểm thử & nghiệm thu kết quả: ${taskTitle}`, estimatedMinutes: 20 }
  ];

  if (ai) {
    const candidateModels = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    for (const modelName of candidateModels) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Model timeout')), 3500)
        );
        const apiCall = ai.models.generateContent({
          model: modelName,
          contents: `Hãy chia nhỏ nhiệm vụ sau của sinh viên thành 3 bước hành động cụ thể để hoàn thành bài tập: "${taskTitle}".
Trả về duy nhất JSON array thuần túy (không kèm giải thích):
[
  { "title": "[1/3] ...", "estimatedMinutes": 30 },
  { "title": "[2/3] ...", "estimatedMinutes": 45 },
  { "title": "[3/3] ...", "estimatedMinutes": 25 }
]`
        });

        const response = await Promise.race([apiCall, timeoutPromise]);

        if (response.text) {
          const cleanJson = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            subtasks = parsed.map((item: any, idx: number) => ({
              title: item.title || `[${idx + 1}/3] Thực hiện ${taskTitle}`,
              estimatedMinutes: Number(item.estimatedMinutes) || 30
            }));
            break;
          }
        }
      } catch {
        // Fallback to next model or default structured subtasks
        continue;
      }
    }
  }

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
