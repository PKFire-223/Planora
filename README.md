# Nền Tảng Quản Lý Học Tập Cá Nhân (Personal LMS) - Đề Tài DACN

Dự án Full-Stack Quản lý học tập cá nhân được xây dựng với kiến trúc hiện đại, phân chia rõ ràng theo nguyên tắc **Separation of Concerns (SoC)** và **Single Responsibility Principle (SRP)**.

---

## 1. Công Nghệ Đề Xuất & Sử Dụng (Tech Stack)

Thay vì dùng Java Spring Boot cồng kềnh và khó đồng bộ kiểu dữ liệu với Frontend, dự án được chuẩn hoá với hệ sinh thái **TypeScript Full-Stack**:
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js 22, Express, TypeScript (`tsx` runtime dev, `esbuild` production).
- **Database**: MongoDB (Mongoose ODM) + In-Memory Fallback tự phục hồi.
- **AI Integration**: Google Gemini AI (`@google/genai`) hỗ trợ hỏi đáp, trợ lý học tập và chia nhỏ task tự động.
- **Error Tracking**: Centralized Error Logging, chuẩn hoá `ApiError`, bắt ngoại lệ 500 tự động.

---

## 2. Khung Sườn Cây Thư Mục Chuẩn (Project Directory Tree)

```text
DACN/
├── docs/                               # Tài liệu thiết kế hệ thống & Database
│   ├── ARCHITECTURE.md                 # Luồng kiến trúc Full-Stack, SoC & nguyên tắc code
│   ├── API_SPEC.md                     # Đặc tả RESTful API chi tiết từng module
│   └── DATABASE_SCHEMA.md              # Thiết kế MongoDB Collections & Mongoose Schemas
├── docker-compose.yml                  # Khởi chạy MongoDB & Mongo Express bằng Docker
├── .env.example                        # Mẫu biến môi trường (PORT, MONGODB_URI, GEMINI_API_KEY)
├── server/                             # Backend (Node.js + Express + TypeScript)
│   ├── config/
│   │   └── db.ts                       # Kết nối Mongoose + In-Memory Store dự phòng
│   ├── modules/                        # Các module nghiệp vụ độc lập
│   │   ├── courses/                    # Quản lý khoá học (course.routes.ts)
│   │   ├── tasks/                      # Quản lý bài tập, deadline (task.routes.ts)
│   │   ├── notes/                      # Ghi chú tài liệu Markdown (note.routes.ts)
│   │   ├── goals/                      # Mục tiêu KPI cá nhân (goal.routes.ts)
│   │   ├── ai/                         # Trợ lý AI hỏi đáp & chia nhỏ task (ai.routes.ts)
│   │   └── errors/                     # Quản lý báo cáo lỗi & sửa lỗi (errorLog.routes.ts)
│   ├── middlewares/
│   │   └── errorHandler.ts             # Bắt lỗi toàn cục, tự động log lỗi 500
│   ├── errors/
│   │   └── apiError.ts                 # Lớp lỗi chuẩn hoá (Bad Request, Not Found, Internal)
│   ├── data/
│   │   └── seedData.ts                 # Dữ liệu mẫu khởi tạo ban đầu
│   └── routes.ts                       # Master Router gom tất cả modules
├── src/                                # Frontend (React 19 + TypeScript + Tailwind)
│   ├── components/
│   │   └── layout/                     # Sidebar navigation & Header bar
│   ├── features/                       # Kiến trúc chia theo tính năng (Feature-Driven)
│   │   ├── dashboard/                  # DashboardView (KPI, tiến độ, chuỗi học tập)
│   │   ├── courses/                    # CoursesView (Danh sách môn, thêm môn, bài học)
│   │   ├── tasks/                      # TasksView (Quản lý deadline, chia nhỏ AI)
│   │   ├── notes/                      # NotesView (Ghi chú Markdown, gắn nhãn tag)
│   │   ├── goals/                      # GoalsView (Mục tiêu cá nhân, cộng giờ học)
│   │   ├── ai/                         # AiAssistantView (Trò chuyện hỏi đáp với AI)
│   │   ├── errorReports/               # ErrorReportsView (Trung tâm báo cáo & sửa lỗi)
│   │   └── structure/                  # ProjectStructureView (Cây thư mục tương tác)
│   ├── services/
│   │   └── api.ts                      # Client gọi RESTful API type-safe
│   ├── types.ts                        # Định nghĩa kiểu dữ liệu dùng chung
│   ├── App.tsx                         # Root component
│   └── main.tsx                        # Entry point
└── server.ts                           # Server Full-Stack chính chạy trên port 3000
```

---

## 3. Hướng Dẫn Vận Hành Nhanh

### Chạy ứng dụng trong môi trường hiện tại:
```bash
npm run dev
```
Ứng dụng sẽ tự động khởi chạy cả Express API và React Vite trên cổng `http://0.0.0.0:3000`.

### Khởi chạy MongoDB với Docker (khi triển khai ngoài máy):
```bash
docker compose up -d
```
MongoDB sẽ chạy tại `localhost:27017` và giao diện web Mongo Express tại `localhost:8081`.

---

## 4. Các Tính Năng Đã Hoàn Thiện

1. **Tổng quan (Dashboard)**: Thống kê KPI tiến độ khoá học, việc cần làm hôm nay, chuỗi ngày học tập liên tục (Study Streak).
2. **Khoá học (Courses)**: Quản lý môn học, số bài học, tiến độ hoàn thành % và cập nhật bài học trực tiếp.
3. **Nhiệm vụ & Bài tập (Tasks)**: Bộ lọc trạng thái, phân loại độ ưu tiên, tích hợp **Nút chia nhỏ AI** tự động phân rã 1 bài tập lớn thành 3 bài tập nhỏ.
4. **Ghi chú (Notes)**: Hỗ trợ ghi chép bài giảng, cấu trúc Markdown, hệ thống thẻ tag phân loại môn học và ghim quan trọng.
5. **Mục tiêu học tập (Goals)**: Đặt KPI số giờ học, số bài tập; có nút cộng nhanh `+1 giờ` / `+2 giờ` để theo dõi tiến độ.
6. **Trợ lý AI (AI Assistant)**: Giao tiếp với Google Gemini AI, hỏi đáp thuật toán, gợi ý lộ trình và chiến lược học.
7. **Báo cáo & Sửa lỗi (Error Tracker)**: Trung tâm tiếp nhận báo cáo lỗi từ FE & BE, hiển thị mức độ nghiêm trọng (Low/Medium/High/Critical) và cho phép nhập ghi chú khắc phục để chuyển trạng thái sang **Resolved**.
8. **Xem cây thư mục dự án (Structure Tree Explorer)**: Giao diện trực quan cho bạn copy toàn bộ sơ đồ phân chia thư mục chuẩn của đồ án.
