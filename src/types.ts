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
  createdAt: string;
}

export type ThemeMode = 'light' | 'dark';

export type ActiveTab = 
  | 'dashboard'
  | 'courses'
  | 'tasks'
  | 'notes'
  | 'goals'
  | 'ai'
  | 'errors'
  | 'structure';

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

