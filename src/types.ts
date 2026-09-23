export interface CourseLesson {
  id: string;
  title: string;
  completed: boolean;
  duration?: string;
}

export interface CourseMaterial {
  id: string;
  name: string;
  type: 'slide' | 'pdf' | 'link' | 'code';
  url?: string;
  size?: string;
}

export interface CourseSyllabusWeek {
  week: number;
  title: string;
  desc?: string;
  completed?: boolean;
}

export interface CourseEvaluationWeight {
  label: string;
  weight: number;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  instructor: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  color: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  createdAt: string;
  credits?: number; // Số tín chỉ (ví dụ: 3)
  semester?: string; // Ví dụ: "Học kỳ 1 - 2026-2027"
  schedule?: string; // Ví dụ: "Thứ 3 (Tiết 1-3)"
  room?: string; // Ví dụ: "Phòng B2.10" hoặc "Online qua LMS"
  targetGrade?: string; // Ví dụ: "A", "A+", "B+"
  currentGrade?: number | string; // Điểm quá trình tích lũy
  evaluationWeights?: CourseEvaluationWeight[]; // Trọng số đánh giá
  syllabus?: CourseSyllabusWeek[];
  lessons?: CourseLesson[];
  materials?: CourseMaterial[];
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number; // in bytes
  type: string; // mime type or file category
  url: string; // file URL or Base64 data URL
  uploadedAt: string;
  category?: 'document' | 'image' | 'slide' | 'code' | 'archive' | 'other';
}

export interface TaskSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  courseId?: string;
  courseName?: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'done';
  dueDate: string;
  estimatedMinutes: number;
  isAiGenerated?: boolean;
  description?: string;
  subtasks?: TaskSubtask[];
  notes?: string;
  attachments?: FileAttachment[];
  createdAt?: string;
}

export interface Note {
  id: string;
  courseId?: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  attachments?: FileAttachment[];
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category?: string;
  targetDate: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: 'active' | 'achieved' | 'missed';
  priority?: 'low' | 'medium' | 'high';
  createdAt?: string;
}

export interface ErrorReport {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  componentName: string;
  reportedAt: string;
  resolutionNotes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  avatar?: string;
  coverImage?: string; // Tùy chỉnh ảnh bìa / hình nền hồ sơ
  bio?: string;
  phone?: string;
  studentCode?: string;
  faculty?: string;
  schoolName?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
  createdAt: string;
  lastActiveAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'ai' | 'deadline';
  timestamp: string;
  read: boolean;
  linkTab?: ActiveTab;
}

export type ThemeMode = 'light' | 'dark';

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type DaySession = 'morning' | 'afternoon';

export interface TimetableEntry {
  id: string;
  name: string; // Tên môn / nội dung tự do nhập
  time: string; // Giờ học (VD: 07:00 - 09:15)
  room?: string; // Tự do nhập gì cũng được, không ép buộc
  instructor?: string; // Giảng viên / người hướng dẫn (tuỳ chọn)
  notes?: string; // Ghi chú thêm
  color: 'indigo' | 'sky' | 'emerald' | 'amber' | 'rose' | 'purple' | 'teal';
  day?: DayOfWeek; // Thứ trong tuần nếu đã xếp lịch
  session?: DaySession; // Sáng hoặc Chiều
  courseId?: string; // ID môn học liên kết
  courseCode?: string; // Mã môn học liên kết
  credits?: number; // Số tín chỉ
}

export type ActiveTab = 
  | 'dashboard'
  | 'courses'
  | 'timetable'
  | 'tasks'
  | 'notes'
  | 'goals'
  | 'ai'
  | 'errors'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'users';

// Legacy types for existing components
export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: 'web' | 'tools' | 'opensource' | 'systems';
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  metrics?: { label: string; value: string };
  highlights: string[];
}

export interface SkillCategory {
  title: string;
  description: string;
  skills: {
    name: string;
    level: string;
    iconName?: string;
    years?: string;
  }[];
}

export interface TerminalCommand {
  command: string;
  output: string | string[];
}

