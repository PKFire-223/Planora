import { useState } from 'react';
import { 
  FolderTree, 
  Folder, 
  Check, 
  Copy,
  Database,
  Server,
  Monitor
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ProjectStructureView() {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  const fullTreeText = `planora/
├── docs/                               # Tài liệu thiết kế hệ thống & Database
│   ├── ARCHITECTURE.md                 # Luồng kiến trúc Full-Stack, SoC & nguyên tắc code
│   ├── API_SPEC.md                     # Đặc tả RESTful API chi tiết từng module
│   └── DATABASE_SCHEMA.md              # Thiết kế MongoDB Collections & Mongoose Schemas
├── docker-compose.yml                  # Docker cấu hình MongoDB & App
├── .env.example                        # Biến môi trường (PORT, MONGO_URI, SEED_SYSTEM_ADMIN_EMAIL...)
├── server/                             # Backend (Node.js 22 + Express + TypeScript)
│   ├── config/                         # Cấu hình kết nối DB & Environment
│   │   └── db.ts                       # Kết nối Mongoose + In-Memory Fallback
│   ├── modules/                        # Kiến trúc Modular tách biệt nghiệp vụ
│   │   ├── auth/                       # Đăng nhập, đăng ký, JWT & Seed Admin
│   │   ├── courses/                    # Quản lý khoá học (course.routes.ts)
│   │   ├── lessons/                    # Quản lý bài học & tiến độ (lesson.routes.ts)
│   │   ├── tasks/                      # Quản lý bài tập & việc cần làm (task.routes.ts)
│   │   ├── notes/                      # Ghi chú tài liệu Markdown (note.routes.ts)
│   │   ├── goals/                      # Mục tiêu KPI học tập cá nhân (goal.routes.ts)
│   │   ├── ai/                         # Trợ lý học tập AI thông minh (ai.routes.ts)
│   │   └── errors/                     # Báo cáo & theo dõi sửa lỗi (errorLog.routes.ts)
│   ├── middlewares/                    # Global Exception Handler & Request Validator
│   │   └── errorHandler.ts             # Tự động bắt lỗi 500 và ghi nhận vào ErrorLog
│   ├── errors/                         # Chuẩn hoá mã lỗi ApiError
│   │   └── apiError.ts                 # 400 Bad Request, 404 Not Found, 500 Internal
│   ├── data/                           # Dữ liệu mẫu khởi tạo (Seed Data)
│   │   └── seedData.ts                 # Dữ liệu khởi tạo cho Course, Task, Note, Goal
│   └── routes.ts                       # Master API Router kết nối các modules
├── src/                                # Frontend (React 19 + TypeScript + Vite + Tailwind CSS)
│   ├── components/                     # UI components dùng chung (Modal, Card, Layout)
│   │   ├── auth/                       # AuthModal (Đăng nhập / Đăng ký tài khoản)
│   │   └── layout/                     # Sidebar, Header, Navigation
│   ├── context/                        # Global Application Contexts
│   │   ├── AuthContext.tsx             # Quản lý phiên đăng nhập & tài khoản
│   │   └── ThemeContext.tsx            # Quản lý Chế độ Sáng / Tối (Light & Dark)
│   ├── features/                       # Feature-Driven Architecture
│   │   ├── dashboard/                  # DashboardView (Tổng quan KPI, tiến độ, streak)
│   │   ├── courses/                    # CoursesView (Danh sách, tạo mới, tăng bài học)
│   │   ├── tasks/                      # TasksView (Kanban, chia nhỏ bài tập bằng AI)
│   │   ├── notes/                      # NotesView (Ghi chép Markdown, gắn thẻ tag)
│   │   ├── goals/                      # GoalsView (Mục tiêu cá nhân, cộng giờ học)
│   │   ├── ai/                         # AiAssistantView (Trợ lý hỏi đáp học tập Planora)
│   │   ├── errorReports/               # ErrorReportsView (Trung tâm báo cáo & sửa lỗi)
│   │   └── structure/                  # ProjectStructureView (Visual Tree Explorer)
│   ├── services/                       # Tầng kết nối RESTful API sang Backend
│   │   └── api.ts                      # Fetch client có type safety và fallback mượt mà
│   ├── types.ts                        # TypeScript Types & Interfaces chia sẻ chung
│   ├── App.tsx                         # Root component kết nối giao diện
│   ├── main.tsx                        # Entry point Vite React
│   └── index.css                       # Roboto Font & Tailwind CSS configuration
├── server.ts                           # Full-Stack Server Entry Point (Port 3000)
├── package.json                        # Khai báo dependencies & scripts
└── README.md                           # Hướng dẫn cài đặt & vận hành dự án`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullTreeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className={`p-5 rounded-2xl border transition-colors ${
        isDark ? 'bg-neutral-900/60 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2 mb-1">
              <FolderTree className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Khung Sườn Thư Mục Chuẩn Cho Dự Án Planora LMS</span>
            </h3>
            <p className={`text-xs max-w-2xl leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
              Định hình cấu trúc <strong>TypeScript Full-Stack (React 19 + Node.js Express + MongoDB + Gemini AI)</strong> đồng bộ, gọn gàng, tích hợp đầy đủ phân hệ <strong>sửa báo lỗi</strong>, <strong>dữ liệu seed</strong> và <strong>Planora AI Assistant</strong>.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className={`px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
              isDark 
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép Tree'}</span>
          </button>
        </div>
      </div>

      {/* Tech Stack Rationale 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border transition-all ${
          isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs mb-1.5">
            <Monitor className="w-4 h-4" />
            <span>Frontend: React + Vite + TS</span>
          </div>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-300' : 'text-slate-600'}`}>
            Áp dụng <strong>Feature-driven Architecture</strong> (`features/courses`, `features/tasks`, `features/ai`, v.v.) giúp code mô-đun hoá rõ ràng, dễ bảo trì và mở rộng.
          </p>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${
          isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs mb-1.5">
            <Server className="w-4 h-4" />
            <span>Backend: Node.js + Express + TS</span>
          </div>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-300' : 'text-slate-600'}`}>
            Đồng bộ ngôn ngữ TypeScript giữa Frontend và Backend. Khởi động nhanh, tối ưu tài nguyên và tích hợp trực tiếp Mongoose ODM cùng Google GenAI SDK.
          </p>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${
          isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs mb-1.5">
            <Database className="w-4 h-4" />
            <span>Database: MongoDB (Mongoose)</span>
          </div>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-300' : 'text-slate-600'}`}>
            Tài liệu JSON Schema linh hoạt cho khoá học, bài tập và ghi chú đa cấp. Kèm bộ nhớ In-Memory Fallback tự phục hồi mượt mà trong môi trường phát triển.
          </p>
        </div>
      </div>

      {/* Code / Tree Box */}
      <div className={`rounded-2xl border overflow-hidden text-xs ${
        isDark ? 'border-neutral-800 bg-neutral-950 shadow-xl' : 'border-slate-200 bg-slate-900 text-slate-200 shadow-sm'
      }`}>
        <div className={`px-4 py-2.5 border-b flex items-center justify-between ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-slate-800 border-slate-700 text-slate-300'
        }`}>
          <div className="flex items-center gap-2">
            <Folder className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-xs">planora / project-tree-structure</span>
          </div>
          <span className="text-[10px] opacity-70">Clean Modular Architecture</span>
        </div>

        <div className="p-5 text-slate-300 overflow-x-auto leading-relaxed whitespace-pre font-mono text-[11px]">
          {fullTreeText}
        </div>
      </div>

      {/* Rules & Best Practices Guideline */}
      <div className={`p-5 rounded-2xl border text-xs space-y-2.5 transition-colors ${
        isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <h4 className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Quy ước lập trình khuyến nghị (Coding Conventions & Rules):
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-indigo-600 dark:text-indigo-400 font-semibold">1. Đặt tên (Naming):</div>
            <p className={isDark ? 'text-neutral-400' : 'text-slate-600'}>
              • Biến & hàm: dùng <code>camelCase</code> (ví dụ: <code>calculateProgress()</code>, <code>dueDate</code>).<br />
              • Components & Classes: dùng <code>PascalCase</code> (ví dụ: <code>CoursesView</code>, <code>ApiError</code>).<br />
              • Files: dùng <code>kebab-case</code> hoặc <code>camelCase</code> (ví dụ: <code>errorHandler.ts</code>, <code>course.routes.ts</code>).
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-amber-600 dark:text-amber-400 font-semibold">2. Tách nhỏ chức năng (SRP):</div>
            <p className={isDark ? 'text-neutral-400' : 'text-slate-600'}>
              • Không dồn quá nhiều dòng xử lý phức tạp trong một hàm duy nhất.<br />
              • Tách riêng Controller (nhận request), Service (xử lý logic), Model (gọi Database) và Middleware (validate, error handling).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
