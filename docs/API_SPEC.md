# Tài Liệu Đặc Tả RESTful API (API Specification)

Prefix chung của toàn bộ API: `/api`

---

## 1. Authentication (`/api/auth`)
- `POST /api/auth/register` — Đăng ký tài khoản học viên
- `POST /api/auth/login` — Đăng nhập & lấy token / session
- `GET /api/auth/me` — Lấy thông tin người dùng hiện tại

---

## 2. Courses (`/api/courses`)
- `GET /api/courses` — Lấy danh sách toàn bộ khoá học (hỗ trợ filter theo status)
- `GET /api/courses/:id` — Chi tiết khoá học + bài học
- `POST /api/courses` — Tạo khoá học mới
- `PUT /api/courses/:id` — Cập nhật thông tin / tiến độ khoá học
- `DELETE /api/courses/:id` — Xoá khoá học

---

## 3. Tasks (`/api/tasks`)
- `GET /api/tasks` — Lấy danh sách nhiệm vụ / bài tập (status, priority)
- `POST /api/tasks` — Tạo task mới
- `PATCH /api/tasks/:id/status` — Cập nhật trạng thái (todo -> in_progress -> done)
- `DELETE /api/tasks/:id` — Xoá task

---

## 4. Notes (`/api/notes`)
- `GET /api/notes` — Lấy danh sách ghi chú (search, filter theo tags)
- `POST /api/notes` — Tạo ghi chú mới
- `PUT /api/notes/:id` — Cập nhật ghi chú
- `DELETE /api/notes/:id` — Xoá ghi chú

---

## 5. Goals (`/api/goals`)
- `GET /api/goals` — Lấy danh sách mục tiêu học tập
- `POST /api/goals` — Tạo mục tiêu mới
- `PATCH /api/goals/:id/progress` — Cập nhật tiến độ mục tiêu

---

## 6. AI Assistant (`/api/ai`)
- `POST /api/ai/ask` — Đặt câu hỏi học tập, giải thích khái niệm
- `POST /api/ai/summarize` — Tự động tóm tắt nội dung bài học hoặc khoá học
- `POST /api/ai/breakdown-task` — Tự động chia nhỏ 1 bài tập lớn thành các sub-tasks

---

## 7. Error Reports & Issue Tracker (`/api/errors`)
- `GET /api/errors` — Lấy danh sách các báo cáo lỗi
- `POST /api/errors` — Tạo báo cáo lỗi mới (người dùng gửi hoặc log từ client)
- `PATCH /api/errors/:id/resolve` — Đánh dấu lỗi đã được khắc phục/sửa xong
