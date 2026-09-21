import { Course, Task, Note, Goal, ErrorReport } from '../types';

export const FALLBACK_COURSES: Course[] = [
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

export const FALLBACK_TASKS: Task[] = [
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

export const FALLBACK_NOTES: Note[] = [
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

export const FALLBACK_GOALS: Goal[] = [
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

export const FALLBACK_ERRORS: ErrorReport[] = [
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

export const FALLBACK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Hạn nộp đồ án môn Kiến Trúc Microservices',
    message: 'Bạn còn 24 giờ để hoàn thiện cài đặt Mongoose Schema và nộp báo cáo.',
    type: 'deadline' as const,
    timestamp: '15 phút trước',
    read: false,
    linkTab: 'tasks' as const
  },
  {
    id: 'notif-2',
    title: 'Gemini AI đã hoàn thành gợi ý lộ trình',
    message: 'Kế hoạch học tập tuần mới cho môn Giải Thuật Nâng Cao đã sẵn sàng để xem xét.',
    type: 'ai' as const,
    timestamp: '1 giờ trước',
    read: false,
    linkTab: 'ai' as const
  },
  {
    id: 'notif-3',
    title: 'Mục tiêu tuần đạt tiến độ 80%',
    message: 'Chúc mừng! Bạn đã hoàn thành 4/5 mục tiêu học tập đề ra cho tuần này.',
    type: 'success' as const,
    timestamp: 'Hôm qua',
    read: true,
    linkTab: 'goals' as const
  },
  {
    id: 'notif-4',
    title: 'Chào mừng bạn đến với Planora LMS',
    message: 'Hãy bắt đầu bằng việc thêm các môn học kỳ này và tạo danh sách nhiệm vụ đầu tiên.',
    type: 'info' as const,
    timestamp: '2 ngày trước',
    read: true,
    linkTab: 'courses' as const
  }
];

export const FALLBACK_TIMETABLE: import('../types').TimetableEntry[] = [
  {
    id: 'tt-1',
    name: 'Kiến Trúc Microservices & Node.js',
    time: '07:00 - 09:15',
    room: 'Lab A2-302',
    instructor: 'TS. Nguyễn Văn Toàn',
    notes: 'Thực hành kết nối Docker & Redis',
    color: 'indigo',
    day: 'mon',
    session: 'morning'
  },
  {
    id: 'tt-2',
    name: 'Lập Trình Web React 19',
    time: '09:30 - 11:45',
    room: 'B1-405',
    instructor: 'ThS. Trần Minh Đức',
    notes: 'Kiểm tra đồ án giữa kỳ',
    color: 'sky',
    day: 'mon',
    session: 'morning'
  },
  {
    id: 'tt-3',
    name: 'Hệ Quản Trị Cơ Sở Dữ Liệu',
    time: '13:30 - 16:00',
    room: 'Lab C4-101',
    instructor: 'TS. Lê Hoàng Mai',
    notes: 'Tối ưu chỉ mục và Transaction',
    color: 'emerald',
    day: 'tue',
    session: 'afternoon'
  },
  {
    id: 'tt-4',
    name: 'Trí Tuệ Nhân Tạo & Machine Learning',
    time: '07:30 - 10:30',
    room: 'Hội trường H1',
    instructor: 'PGS. Vũ Đình Trí',
    notes: 'Học mô hình Transformer & LLM',
    color: 'purple',
    day: 'wed',
    session: 'morning'
  },
  {
    id: 'tt-5',
    name: 'An Ninh Mạng & Mật Mã Học',
    time: '13:15 - 16:30',
    room: 'Lab An Ninh Mạng',
    instructor: 'ThS. Đặng Hữu Phong',
    color: 'amber',
    day: 'thu',
    session: 'afternoon'
  },
  {
    id: 'tt-6',
    name: 'Toán Rời Rạc & Lý Thuyết Đồ Thị',
    time: '07:30 - 09:45',
    room: 'P204',
    color: 'rose',
    day: 'fri',
    session: 'morning'
  },
  {
    id: 'tt-7',
    name: 'Tự học thư viện & Luyện thuật toán',
    time: '14:00 - 16:30',
    room: '', // Tự do để trống phòng
    notes: 'Luyện 3 bài LeetCode Medium',
    color: 'teal'
    // Chưa xếp lịch (xuất hiện ở danh sách bên trái)
  },
  {
    id: 'tt-8',
    name: 'Seminar Công Nghệ Cloud & DevOps',
    time: '09:00 - 11:30',
    room: 'Online Zoom',
    notes: 'Hội thảo trực tuyến với diễn giả',
    color: 'indigo'
    // Chưa xếp lịch (xuất hiện ở danh sách bên trái)
  },
  {
    id: 'tt-9',
    name: 'Sinh Hoạt Nhóm Đồ Án Tốt Nghiệp',
    time: '15:00 - 17:00',
    room: 'Căn tin tầng 2',
    color: 'emerald'
    // Chưa xếp lịch (xuất hiện ở danh sách bên trái)
  }
];

