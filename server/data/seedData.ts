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
  targetDate: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: 'active' | 'achieved' | 'missed';
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

export const INITIAL_COURSES: CourseItem[] = [
  {
    id: 'course-1',
    title: 'Kiến Trúc Microservices & Node.js',
    code: 'ARC-301',
    instructor: 'TS. Nguyễn Văn A',
    description: 'Nghiên cứu mô hình Clean Architecture, Domain-Driven Design và kết nối MongoDB hiệu năng cao.',
    status: 'in_progress',
    color: 'rose',
    progress: 68,
    totalLessons: 24,
    completedLessons: 16,
    createdAt: '2026-08-15'
  },
  {
    id: 'course-2',
    title: 'Cấu Trúc Dữ Liệu & Giải Thuật Nâng Cao',
    code: 'DSA-202',
    instructor: 'ThS. Trần Thị B',
    description: 'Luyện tập giải thuật đồ thị, quy hoạch động và cấu trúc dữ liệu cây tối ưu trên LeetCode.',
    status: 'in_progress',
    color: 'amber',
    progress: 45,
    totalLessons: 30,
    completedLessons: 14,
    createdAt: '2026-08-20'
  },
  {
    id: 'course-3',
    title: 'Phát Triển Ứng Dụng Web Hiện Đại với React 19',
    code: 'FE-101',
    instructor: 'Lê Hoàng C',
    description: 'Nắm vững Server Components, Action Hooks, Tailwind CSS v4 và Tối ưu hoá Client State.',
    status: 'completed',
    color: 'emerald',
    progress: 100,
    totalLessons: 18,
    completedLessons: 18,
    createdAt: '2026-07-10'
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    courseId: 'course-1',
    courseName: 'ARC-301',
    title: 'Cài đặt Mongoose Schema cho module Courses và Lessons',
    priority: 'high',
    status: 'done',
    dueDate: '2026-09-22',
    estimatedMinutes: 45
  },
  {
    id: 'task-2',
    courseId: 'course-1',
    courseName: 'ARC-301',
    title: 'Viết Global Error Handler bắt lỗi Mongoose Validation',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: '2026-09-23',
    estimatedMinutes: 60
  },
  {
    id: 'task-3',
    courseId: 'course-2',
    courseName: 'DSA-202',
    title: 'Giải 3 bài Dijkstra và Bellman-Ford trên đồ thị có hướng',
    priority: 'medium',
    status: 'todo',
    dueDate: '2026-09-25',
    estimatedMinutes: 90
  },
  {
    id: 'task-4',
    title: 'Tích hợp Gemini API vào AI Study Assistant để tóm tắt bài',
    priority: 'high',
    status: 'todo',
    dueDate: '2026-09-26',
    estimatedMinutes: 40,
    isAiGenerated: true
  }
];

export const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    courseId: 'course-1',
    title: 'Tóm tắt mô hình 3 lớp (3-Tier Architecture) trong Node.js',
    content: `# 3-Tier Architecture\n- **Controller**: Nhận request từ Express router, validate body/params, gọi Service.\n- **Service**: Chứa toàn bộ Business Logic, quy tắc nghiệp vụ, tính toán.\n- **Repository / Model**: Tương tác trực tiếp với MongoDB thông qua Mongoose models.`,
    tags: ['Architecture', 'NodeJS', 'Backend'],
    isPinned: true,
    updatedAt: '2026-09-20'
  },
  {
    id: 'note-2',
    courseId: 'course-2',
    title: 'Mẹo tối ưu bộ nhớ khi duyệt cây nhị phân (Binary Tree)',
    content: `# Binary Tree Traversal\n- Sử dụng Morris Traversal để duyệt In-order với độ phức tạp không gian O(1) thay vì O(N) của đệ quy thông thường.\n- Khắc phục lỗi Stack Overflow khi cây bị lệch một phía (degenerate tree).`,
    tags: ['DSA', 'Algorithms', 'Trees'],
    isPinned: false,
    updatedAt: '2026-09-18'
  }
];

export const INITIAL_GOALS: GoalItem[] = [
  {
    id: 'goal-1',
    title: 'Hoàn thành 50 giờ tự học có tập trung trong tháng',
    targetDate: '2026-09-30',
    targetValue: 50,
    currentValue: 36,
    unit: 'giờ',
    status: 'active'
  },
  {
    id: 'goal-2',
    title: 'Hoàn thành 2 khoá học chuyên sâu về Backend & DSA',
    targetDate: '2026-10-15',
    targetValue: 2,
    currentValue: 1,
    unit: 'khoá',
    status: 'active'
  },
  {
    id: 'goal-3',
    title: 'Giải quyết 40 bài tập thuật toán',
    targetDate: '2026-10-01',
    targetValue: 40,
    currentValue: 28,
    unit: 'bài tập',
    status: 'active'
  }
];

export const INITIAL_ERRORS: ErrorReportItem[] = [
  {
    id: 'err-101',
    title: 'Lỗi validate dueDate khi chọn ngày quá khứ',
    description: 'Khi tạo task mới với dueDate nhỏ hơn ngày hiện tại, hệ thống cần hiển thị cảnh báo đỏ thân thiện thay vì thông báo mặc định.',
    severity: 'low',
    status: 'resolved',
    componentName: 'TaskCreateModal',
    reportedAt: '2026-09-19',
    resolutionNotes: 'Đã thêm hàm validate kiểm tra minDate = new Date().'
  },
  {
    id: 'err-102',
    title: 'Mất kết nối MongoDB Atlas khi mạng chập chờn',
    description: 'Cần cấu hình cơ chế graceful fallback in-memory để ứng dụng không bị crash 500 khi mạng database gián đoạn.',
    severity: 'medium',
    status: 'investigating',
    componentName: 'DatabaseConnector',
    reportedAt: '2026-09-20'
  }
];
