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
}

export interface Note {
  id: string;
  courseId?: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  targetDate: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: 'active' | 'achieved' | 'missed';
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
  bio?: string;
  phone?: string;
  studentCode?: string;
  faculty?: string;
  createdAt: string;
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
  | 'structure'
  | 'notifications'
  | 'profile'
  | 'settings';

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

