import { useState } from 'react';
import { 
  FolderTree, 
  Folder, 
  FileCode, 
  FileText, 
  Database, 
  Bot, 
  ShieldAlert, 
  Check, 
  Copy,
  ChevronRight,
  ChevronDown,
  Layers,
  Server,
  Monitor
} from 'lucide-react';

export function ProjectStructureView() {
  const [copied, setCopied] = useState(false);

  const fullTreeText = `DACN/
├── docs/                               # Tài liệu thiết kế hệ thống & Database
│   ├── ARCHITECTURE.md                 # Luồng kiến trúc Full-Stack, SoC & nguyên tắc code
│   ├── API_SPEC.md                     # Đặc tả RESTful API chi tiết từng module
│   └── DATABASE_SCHEMA.md              # Thiết kế MongoDB Collections & Mongoose Schemas
├── docker-compose.yml                  # Docker cấu hình MongoDB, Mongo-Express & App
├── .env.example                        # Mẫu khai báo biến môi trường (PORT, MONGO_URI, GEMINI_API_KEY)
├── server/                             # Backend (Node.js 22 + Express + TypeScript)
│   ├── config/                         # Cấu hình kết nối DB & Environment
│   │   └── db.ts                       # Kết nối Mongoose + In-Memory Fallback
│   ├── modules/                        # Kiến trúc Modular tách biệt nghiệp vụ
│   │   ├── courses/                    # Quản lý khoá học (course.routes.ts, controller)
│   │   ├── lessons/                    # Quản lý bài học & tiến độ (lesson.routes.ts)
│   │   ├── tasks/                      # Quản lý bài tập & việc cần làm (task.routes.ts)
│   │   ├── notes/                      # Ghi chú tài liệu Markdown (note.routes.ts)
│   │   ├── goals/                      # Mục tiêu KPI học tập cá nhân (goal.routes.ts)
│   │   ├── ai/                         # Trợ lý học tập AI thông minh (ai.routes.ts + Gemini SDK)
│   │   └── errors/                     # Báo cáo & theo dõi sửa lỗi (errorLog.routes.ts)
│   ├── middlewares/                    # Global Exception Handler & Request Validator
│   │   └── errorHandler.ts             # Tự động bắt lỗi 500 và ghi nhận vào ErrorLog
│   ├── errors/                         # Chuẩn hoá mã lỗi ApiError
│   │   └── apiError.ts                 # 400 Bad Request, 404 Not Found, 500 Internal
│   ├── data/                           # Dữ liệu mẫu khởi tạo (Seed Data)
│   │   └── seedData.ts                 # Dữ liệu khởi tạo cho Course, Task, Note, Goal
│   └── routes.ts                       # Master API Router kết nối các modules
├── src/                                # Frontend (React 19 + TypeScript + Vite + Tailwind CSS)
│   ├── assets/                         # Hình ảnh, icons, static assets
│   ├── components/                     # UI components dùng chung (Button, Card, Modal, Input)
│   │   └── layout/                     # Sidebar, Header, Navigation
│   ├── features/                       # Feature-Driven Architecture
│   │   ├── dashboard/                  # DashboardView (Tổng quan KPI, tiến độ, streak)
│   │   ├── courses/                    # CoursesView (Danh sách, tạo mới, tăng bài học)
│   │   ├── tasks/                      # TasksView (Kanban, chia nhỏ bài tập bằng AI)
│   │   ├── notes/                      # NotesView (Ghi chép Markdown, gắn thẻ tag)
│   │   ├── goals/                      # GoalsView (Mục tiêu cá nhân, cộng giờ học)
│   │   ├── ai/                         # AiAssistantView (Chatbot hỏi đáp trợ lý học tập)
│   │   ├── errorReports/               # ErrorReportsView (Trung tâm báo cáo & sửa lỗi)
│   │   └── structure/                  # ProjectStructureView (Visual Tree Explorer)
│   ├── services/                       # Tầng kết nối RESTful API sang Backend
│   │   └── api.ts                      # Fetch client có type safety đầy đủ
│   ├── types/                          # TypeScript Types & Interfaces chia sẻ chung
│   │   └── index.ts                    # Course, Task, Note, Goal, ErrorReport
│   ├── App.tsx                         # Root component kết nối giao diện
│   ├── main.tsx                        # Entry point Vite React
│   └── index.css                       # Tailwind CSS configuration
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
      <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-1">
              <FolderTree className="w-4 h-4 text-rose-400" />
              <span>Khung Sườn Thư Mục Chuẩn Cho Dự Án Personal LMS</span>
            </h3>
            <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
              Thiết kế đã chuyển từ Java Spring Boot sang <strong>TypeScript Full-Stack (React 19 + Node.js Express + MongoDB + Gemini AI)</strong> để code đồng bộ, nhẹ nhàng, hỗ trợ đầy đủ phần <strong>sửa báo lỗi</strong>, <strong>data seed</strong> và <strong>AI Assistant</strong>.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép Tree'}</span>
          </button>
        </div>
      </div>

      {/* Tech Stack Rationale 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs mb-1.5">
            <Monitor className="w-4 h-4" />
            <span>Frontend: React + Vite + TS</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Áp dụng <strong>Feature-driven Architecture</strong> (`features/courses`, `features/tasks`, `features/ai`, v.v.) giúp code không bị phình to, tái sử dụng components dễ dàng.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1.5">
            <Server className="w-4 h-4" />
            <span>Backend: Node.js + Express + TS</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Thay thế Java Spring Boot cồng kềnh. Node.js dùng chung TypeScript với FE, khởi động siêu nhanh và tích hợp trực tiếp Mongoose ODM và Google Gemini AI SDK.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1.5">
            <Database className="w-4 h-4" />
            <span>Database: MongoDB (Mongoose)</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Cấu trúc JSON documents hoàn hảo cho khoá học, ghi chú Markdown lồng nhau. Đã cấu hình sẵn In-Memory Fallback để luôn chạy mượt mà kể cả khi offline Mongo.
          </p>
        </div>
      </div>

      {/* Code / Tree Box */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 shadow-xl overflow-hidden font-mono text-xs">
        <div className="px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-neutral-300">
            <Folder className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-xs">DACN / personal-lms-project-tree</span>
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">Chuẩn Clean Architecture</span>
        </div>

        <div className="p-5 text-neutral-300 overflow-x-auto leading-relaxed whitespace-pre">
          {fullTreeText}
        </div>
      </div>

      {/* Rules & Best Practices Guideline */}
      <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-xs space-y-2">
        <h4 className="font-bold text-white text-sm mb-1">
          📌 Quy ước lập trình khuyến nghị (Coding Conventions & Rules):
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-300">
          <div className="space-y-1">
            <div className="text-rose-400 font-medium font-mono">1. Đặt tên (Naming):</div>
            <p className="text-neutral-400">
              • Biến & hàm: dùng <code>camelCase</code> (ví dụ: <code>calculateProgress()</code>, <code>dueDate</code>).<br />
              • Components & Classes: dùng <code>PascalCase</code> (ví dụ: <code>CoursesView</code>, <code>ApiError</code>).<br />
              • Files: dùng <code>kebab-case</code> hoặc <code>camelCase</code> (ví dụ: <code>errorHandler.ts</code>, <code>course.routes.ts</code>).
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-amber-400 font-medium font-mono">2. Tách nhỏ chức năng (SRP):</div>
            <p className="text-neutral-400">
              • Không dồn quá 40-50 dòng trong 1 hàm.<br />
              • Tách riêng Controller (nhận request), Service (xử lý logic), Model (gọi Database) và Middleware (validate, error handling).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
