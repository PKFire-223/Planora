# Nền Tảng Quản Lý Học Tập Cá Nhân (Planora LMS) - Đề Tài DACN

Dự án Full-Stack Quản lý học tập cá nhân (Personal Learning Management System) được xây dựng với kiến trúc hiện đại, phân chia rõ ràng theo nguyên tắc **Separation of Concerns (SoC)** và **Single Responsibility Principle (SRP)**.

---

## 1. Công Nghệ Đề Xuất & Sử Dụng (Tech Stack)

Hệ sinh thái **TypeScript Full-Stack** đồng bộ, type-safe toàn diện:
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons.
- **Backend**: Node.js 22, Express, TypeScript (`tsx` runtime dev, `esbuild` production).
- **Database**: MongoDB (Mongoose ODM) + Resilient In-Memory Cache tự phục hồi khi không có DB.
- **AI Integration**: Google Gemini AI (`@google/genai`) hỗ trợ hỏi đáp, trợ lý học tập và chia nhỏ task tự động.
- **Error Tracking**: Centralized Error Logging, chuẩn hoá `ApiError`, bắt ngoại lệ 500 tự động.

---

## 2. Dữ Liệu Mẫu Độc Lập & Cách Nạp Vào MongoDB (Seed Data Guide)

### 🌟 Tính năng tách biệt dữ liệu mẫu hoàn toàn:
Toàn bộ dữ liệu mẫu (môn học, bài tập, ghi chú, mục tiêu, thời khóa biểu, tài khoản demo) đã được cô lập trong **DUY NHẤT 1 file JSON**:
👉 `server/seed/sampleData.json`

- **Không bị phụ thuộc tĩnh trong code**: Hệ thống đọc dữ liệu mẫu một cách an toàn (`safe dynamic read`).
- **Xóa bỏ dễ dàng**: Sau khi bạn đã đẩy dữ liệu vào MongoDB thành công, bạn có thể **XÓA THẲNG** file `server/seed/sampleData.json` (hoặc cả thư mục `server/seed/`) mà **KHÔNG GẶP BẤT KỲ LỖI BIÊN DỊCH HAY XUNG ĐỘT IMPORT NÀO**!
- Không cần phải vào từng dòng code hay từng file component để xóa thủ công.

### 🚀 Cách đẩy dữ liệu mẫu vào MongoDB khi clone về:

#### Cách 1: Sử dụng lệnh CLI (Khuyên dùng)
```bash
# Đảm bảo MongoDB đang chạy (local hoặc Docker hoặc MongoDB Atlas)
# Thiết lập biến môi trường trong file .env:
# MONGODB_URI=mongodb://localhost:27017/personal_lms

npm run seed
# hoặc
npm run db:seed
```
Script sẽ tự động kết nối MongoDB, upsert tất cả dữ liệu từ `server/seed/sampleData.json` vào các collection tương ứng (`users`, `courses`, `tasks`, `notes`, `goals`, `error_logs`, `timetables`) và in ra bảng tổng kết số lượng bản ghi.

#### Cách 2: Gọi trực tiếp qua API HTTP
Gửi request `POST /api/seed` tới máy chủ backend:
```bash
curl -X POST http://localhost:3000/api/seed \
  -H "Content-Type: application/json" \
  -d '{"uri": "mongodb://localhost:27017/personal_lms"}'
```

#### Sau khi đã đẩy dữ liệu vào MongoDB xong:
Bạn có thể tùy ý giữ lại hoặc xóa file mẫu:
```bash
# Xóa file dữ liệu mẫu một cách an toàn mà không ảnh hưởng đến server hay frontend:
rm server/seed/sampleData.json
```

---

## 3. Khung Sườn Cây Thư Mục Dự Án (Project Directory Tree)

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
│   │   └── db.ts                       # Kết nối Mongoose + In-Memory Store tự động đồng bộ
│   ├── models/                         # Mongoose Models độc lập
│   │   ├── user.model.ts               # Collection users
│   │   ├── course.model.ts             # Collection courses
│   │   ├── task.model.ts               # Collection tasks
│   │   ├── note.model.ts               # Collection notes
│   │   ├── goal.model.ts               # Collection goals
│   │   ├── error.model.ts              # Collection error_logs
│   │   └── timetable.model.ts          # Collection timetables
│   ├── modules/                        # Các module nghiệp vụ RESTful
│   │   ├── auth/                       # Đăng nhập, đăng ký, phân quyền JWT & Admin
│   │   ├── courses/                    # Quản lý khoá học (course.routes.ts)
│   │   ├── tasks/                      # Quản lý bài tập, deadline (task.routes.ts)
│   │   ├── notes/                      # Ghi chú tài liệu Markdown (note.routes.ts)
│   │   ├── goals/                      # Mục tiêu KPI cá nhân (goal.routes.ts)
│   │   ├── ai/                         # Trợ lý AI hỏi đáp & chia nhỏ task (ai.routes.ts)
│   │   ├── errors/                     # Quản lý báo cáo lỗi & sửa lỗi (errorLog.routes.ts)
│   │   ├── sync/                       # Tự động đồng bộ và sao lưu dữ liệu
│   │   └── upload/                     # Tải tệp đính kèm và tài liệu
│   ├── seed/                           # Dữ liệu mẫu hoàn toàn tách biệt
│   │   ├── sampleData.json             # File JSON chứa toàn bộ dữ liệu mẫu (có thể xoá khi đã push DB)
│   │   └── seedRunner.ts               # Script CLI chạy npm run seed
│   ├── types/
│   │   └── index.ts                    # Kiểu dữ liệu TypeScript độc lập của Server
│   ├── middlewares/
│   │   └── errorHandler.ts             # Bắt lỗi toàn cục, tự động log lỗi 500
│   ├── errors/
│   │   └── apiError.ts                 # Lớp lỗi chuẩn hoá (Bad Request, Not Found, Internal)
│   └── routes.ts                       # Master Router gom tất cả modules & endpoints
├── src/                                # Frontend (React 19 + TypeScript + Tailwind)
│   ├── components/                     # Components dùng chung (AuthModal, UserMenu, Toast, etc.)
│   ├── context/                        # React Contexts (AuthContext, ThemeContext, ToastContext)
│   ├── features/                       # Kiến trúc chia theo tính năng (Feature-Driven)
│   │   ├── dashboard/                  # DashboardView (KPI, tiến độ, chuỗi học tập)
│   │   ├── courses/                    # CoursesView (Danh sách môn, thêm môn, bài học)
│   │   ├── tasks/                      # TasksView (Quản lý deadline, chia nhỏ AI)
│   │   ├── timetable/                  # TimetableView (Thời khoá biểu tương tác kéo thả)
│   │   ├── notes/                      # NotesView (Ghi chú Markdown, gắn nhãn tag)
│   │   ├── goals/                      # GoalsView (Mục tiêu cá nhân, cộng giờ học)
│   │   ├── ai/                         # AiAssistantView (Trò chuyện hỏi đáp với AI)
│   │   ├── errorReports/               # ErrorReportsView (Trung tâm báo cáo & sửa lỗi)
│   │   ├── structure/                  # ProjectStructureView (Cây thư mục tương tác)
│   │   └── landing/                    # LandingView (Trang giới thiệu công khai)
│   ├── services/
│   │   └── api.ts                      # Client gọi RESTful API type-safe
│   ├── types.ts                        # Định nghĩa kiểu dữ liệu dùng chung Client
│   ├── App.tsx                         # Root component
│   └── main.tsx                        # Entry point
└── server.ts                           # Server Full-Stack chính chạy trên port 3000
```

---

## 4. Hướng Dẫn Vận Hành Nhanh

### Bước 1: Cài đặt thư viện
```bash
npm install
```

### Bước 2: Khởi chạy MongoDB (tùy chọn nếu muốn lưu DB thật)
```bash
docker compose up -d
```
*MongoDB sẽ chạy tại `localhost:27017` và Mongo Express GUI tại `localhost:8081`.*

### Bước 3: Đẩy dữ liệu mẫu vào MongoDB (nếu muốn)
```bash
npm run seed
```

### Bước 4: Chạy ứng dụng
```bash
npm run dev
```
Ứng dụng sẽ tự động khởi chạy cả Express API và React Vite trên cổng `http://0.0.0.0:3000`.

---

## 5. Tài Khoản Mẫu Đăng Nhập

- **Quản Trị Viên (Admin)**:
  - Email: `systemadmin@gmail.com`
  - Mật khẩu: `@Systemadmin`
  - Quyền hạn: Quản trị tài khoản người dùng, xem error log toàn hệ thống, cấu hình hệ thống.
- **Học Viên (Student)**:
  - Email: `hocvien@planora.edu.vn`
  - Mật khẩu: `@Hocvien123`
