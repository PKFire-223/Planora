# Kiến Trúc Hệ Thống Nền Tảng Quản Lý Học Tập Cá Nhân (Personal LMS)

Tài liệu thiết kế kiến trúc kỹ thuật cho dự án **Personal LMS (DACN)**.

---

## 1. Lựa chọn Ngôn Ngữ & Công Nghệ (Tech Stack Rationale)

### 1.1. Frontend (Client-side)
- **Ngôn ngữ**: TypeScript
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Icons & Animation**: Lucide React + Motion
- **Lý do lựa chọn**:
  - **Type Safety**: TypeScript giúp bắt lỗi kiểu dữ liệu ngay khi code, dễ dàng tái sử dụng Types/DTO từ backend.
  - **Tốc độ & Trải nghiệm**: Vite khởi động và hot-reload cực nhanh; React hỗ trợ chia nhỏ component theo Feature-based.
  - **UI Hiện đại**: Tailwind CSS giúp xây dựng giao diện tối giản, trực quan, hỗ trợ Dark/Light theme dễ dàng.

### 1.2. Backend (Server-side & API)
- **Ngôn ngữ**: TypeScript
- **Runtime & Framework**: Node.js 22 + Express
- **Lý do thay thế Java Spring Boot**:
  - **Đồng bộ ngôn ngữ**: Toàn bộ dự án dùng chung TypeScript, giảm cognitive load khi chuyển đổi giữa FE và BE.
  - **Tương thích hoàn hảo với MongoDB**: Node.js + Mongoose là bộ đôi chuẩn công nghiệp cho NoSQL Document database, định nghĩa Schema nhanh, linh hoạt hơn JPA/Hibernate của Java.
  - **Khởi động siêu tốc**: Node.js tốn ít tài nguyên bộ nhớ (RAM < 80MB so với > 400MB của JVM Spring Boot), phù hợp với container và serverless/cloud.
  - **Tích hợp AI dễ dàng**: SDK chính thức của Google Gemini (`@google/genai`) hỗ trợ TypeScript hạng nhất.

### 1.3. Cơ sở dữ liệu (Database)
- **Hệ quản trị**: MongoDB 7.0 (Mongoose ODM)
- **Cơ chế lưu trữ**: NoSQL Document Database
- **Lý do**: Cấu trúc khoá học, nội dung bài học (Lessons), ghi chú Markdown (Notes) và mục tiêu (Goals) có tính đa hình, phi cấu trúc hoặc lồng nhau (embedded documents), rất phù hợp với MongoDB.

---

## 2. Mô Hình Phân Tách Thư Mục (Folder Architecture)

Dự án áp dụng:
- **Frontend**: **Feature-Driven Architecture** (chia theo từng tính năng nghiệp vụ: `auth`, `dashboard`, `courses`, `lessons`, `tasks`, `notes`, `goals`, `ai`, `errorReports`).
- **Backend**: **Modular Layered Architecture** (mỗi module tự quản lý `model`, `controller`, `service`, `routes` + tầng dùng chung `middlewares`, `errors`, `config`, `data`).

```text
DACN/
├── docs/                               # Tài liệu thiết kế & API
│   ├── ARCHITECTURE.md
│   ├── API_SPEC.md
│   └── DATABASE_SCHEMA.md
├── docker-compose.yml                  # Docker orchestration (Mongo + App)
├── server/                             # Backend code (TypeScript + Express + Mongoose)
│   ├── config/                         # Kết nối DB & Cấu hình môi trường
│   ├── modules/                        # Các tính năng backend
│   │   ├── auth/                       # Đăng ký, đăng nhập, JWT
│   │   ├── courses/                    # Quản lý khoá học
│   │   ├── lessons/                    # Quản lý bài học & tiến độ
│   │   ├── tasks/                      # Bài tập / Việc cần làm
│   │   ├── notes/                      # Ghi chú tài liệu học tập
│   │   ├── goals/                      # Mục tiêu & KPI học tập
│   │   ├── ai/                         # Trợ lý học tập AI (Gemini)
│   │   └── errors/                     # Hệ thống báo lỗi & Error Logs
│   ├── middlewares/                    # Global Error Handler & Auth Middleware
│   ├── errors/                         # Chuẩn hoá ApiError (400, 401, 404, 500)
│   └── data/                           # Seed data & in-memory fallback
├── src/                                # Frontend code (React + Vite + Tailwind)
│   ├── assets/
│   ├── components/                     # Component dùng chung (UI primitives)
│   ├── features/                       # Tính năng nghiệp vụ độc lập
│   ├── hooks/                          # Custom React hooks
│   ├── layouts/                        # Layout chính (Sidebar, Header, Content)
│   ├── lib/                            # API client & helpers
│   ├── services/                       # Tầng gọi API sang backend
│   ├── types/                          # TypeScript Interfaces dùng chung
│   ├── App.tsx
│   └── main.tsx
└── server.ts                           # Full-stack server entry point
```

---

## 3. Luồng Xử Lý Báo Lỗi Tập Trung (Centralized Error Reporting)

- **Backend**:
  - `ApiError`: Class chuẩn hoá mã lỗi HTTP (400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Error).
  - `errorHandler` Middleware: Bắt tất cả exception, ghi nhận vào MongoDB collection `ErrorLog` và trả về JSON chuẩn:
    ```json
    {
      "success": false,
      "message": "Chi tiết lỗi",
      "code": "ERROR_CODE",
      "timestamp": "2026-09-21T07:30:00Z"
    }
    ```
- **Frontend**:
  - Tích hợp màn hình **Báo Lỗi & Phản Hồi (Issue / Error Reports)** giúp người dùng hoặc lập trình viên gửi báo cáo lỗi phát sinh, theo dõi trạng thái xử lý (`open`, `in-progress`, `resolved`).
