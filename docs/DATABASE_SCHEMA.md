# Thiết Kế Cơ Sở Dữ Liệu MongoDB (Database Schema)

Dự án sử dụng MongoDB với Mongoose ODM.

---

## 1. Collections & Data Models

### 1.1. `users`
Lưu trữ thông tin người dùng / học viên:
```typescript
{
  _id: ObjectId,
  fullName: string,
  email: string,        // unique, indexed
  passwordHash: string,
  avatar?: string,
  role: 'student' | 'admin',
  preferences: {
    theme: 'dark' | 'light',
    dailyStudyGoalMinutes: number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 1.2. `courses`
Lưu trữ khoá học cá nhân (tự học, học trên trường, hoặc khoá online):
```typescript
{
  _id: ObjectId,
  userId: ObjectId,     // ref to users
  title: string,
  code: string,         // e.g. "CS101", "WEB301"
  instructor?: string,
  description?: string,
  status: 'not_started' | 'in_progress' | 'completed' | 'archived',
  color: string,        // Mã màu định danh UI (#rose, #amber, etc.)
  progress: number,     // 0 -> 100%
  totalLessons: number,
  completedLessons: number,
  createdAt: Date,
  updatedAt: Date
}
```

### 1.3. `lessons`
Lưu trữ các bài học chi tiết thuộc từng khoá học:
```typescript
{
  _id: ObjectId,
  courseId: ObjectId,   // ref to courses
  title: string,
  order: number,
  durationMinutes: number,
  isCompleted: boolean,
  completedAt?: Date,
  resourceLinks: string[],
  summaryAi?: string,   // Tóm tắt tự động bởi AI
  createdAt: Date
}
```

### 1.4. `tasks`
Việc cần làm / Bài tập đến hạn:
```typescript
{
  _id: ObjectId,
  courseId?: ObjectId,  // Tuỳ chọn liên kết với course
  title: string,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  status: 'todo' | 'in_progress' | 'done',
  dueDate?: Date,
  estimatedMinutes?: number,
  isAiGenerated: boolean, // Đánh dấu task do AI chia nhỏ
  createdAt: Date
}
```

### 1.5. `notes`
Ghi chú học tập (hỗ trợ Markdown):
```typescript
{
  _id: ObjectId,
  courseId?: ObjectId,
  lessonId?: ObjectId,
  title: string,
  content: string,      // Markdown text
  tags: string[],
  isPinned: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 1.6. `goals`
Mục tiêu học tập dài hạn hoặc tuần:
```typescript
{
  _id: ObjectId,
  title: string,
  targetDate: Date,
  targetValue: number,  // ví dụ 50 giờ học
  currentValue: number, // ví dụ 28 giờ đã học
  unit: string,         // 'hours', 'courses', 'tasks'
  status: 'active' | 'achieved' | 'missed'
}
```

### 1.7. `error_logs` (Hệ thống sửa & báo lỗi)
Lưu trữ báo cáo lỗi người dùng gửi hoặc lỗi exception từ server:
```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  status: 'open' | 'investigating' | 'resolved',
  stackTrace?: string,
  reportedBy?: string,
  componentName?: string,
  createdAt: Date
}
```

### 1.8. `ai_interactions`
Nhật ký trò chuyện với Trợ lý AI và gợi ý học tập:
```typescript
{
  _id: ObjectId,
  prompt: string,
  response: string,
  contextType: 'general' | 'course_summary' | 'task_breakdown' | 'quiz',
  createdAt: Date
}
```
