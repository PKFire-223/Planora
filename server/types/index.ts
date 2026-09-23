export interface CourseItem {
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
  credits?: number;
  semester?: string;
  schedule?: string;
  room?: string;
  targetGrade?: string;
  currentGrade?: number | string;
  evaluationWeights?: { label: string; weight: number }[];
  syllabus?: { week: number; title: string; desc?: string; completed?: boolean }[];
  lessons?: { id: string; title: string; completed: boolean; duration?: string }[];
  materials?: { id: string; name: string; type: 'slide' | 'pdf' | 'link' | 'code'; url?: string; size?: string }[];
}

export interface TaskSubtaskItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
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
  subtasks?: TaskSubtaskItem[];
  notes?: string;
  createdAt?: string;
}

export interface NoteItem {
  id: string;
  courseId?: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  updatedAt: string;
}

export interface GoalItem {
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

export interface ErrorReportItem {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  componentName: string;
  reportedAt: string;
  resolutionNotes?: string;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'student';
  createdAt: string;
  lastActiveAt?: string;
  phone?: string;
  studentCode?: string;
  faculty?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  schoolName?: string;
}

export interface TimetableItem {
  id: string;
  name: string;
  time: string;
  room?: string;
  instructor?: string;
  notes?: string;
  color: 'indigo' | 'sky' | 'emerald' | 'amber' | 'rose' | 'purple' | 'teal';
  day?: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  session?: 'morning' | 'afternoon';
  courseId?: string;
  courseCode?: string;
  credits?: number;
}
