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
    createdAt: '2026-08-15',
    credits: 3,
    semester: 'Học kỳ 1 - 2026-2027',
    schedule: 'Thứ 2 (07:30 - 09:30)',
    room: 'Phòng B1-405',
    targetGrade: 'A',
    currentGrade: 8.5,
    evaluationWeights: [
      { label: 'Chuyên cần & Lab', weight: 20 },
      { label: 'Đồ án giữa kỳ', weight: 30 },
      { label: 'Bảo vệ cuối kỳ', weight: 50 }
    ],
    syllabus: [
      { week: 1, title: 'Tổng quan Clean Architecture & Monolith vs Microservices', completed: true },
      { week: 2, title: 'Domain-Driven Design (DDD) & Bounded Contexts', completed: true },
      { week: 3, title: 'Event-Driven Architecture với Kafka / RabbitMQ', completed: true },
      { week: 4, title: 'API Gateway & Service Mesh patterns', completed: true },
      { week: 5, title: 'Distributed Tracing & Centralized Logging', completed: false },
      { week: 6, title: 'Triển khai Docker Compose & Kubernetes Cluster', completed: false }
    ],
    lessons: [
      { id: 'l1', title: 'Bài 01: Giới thiệu hệ thống phân tán', completed: true, duration: '45 phút' },
      { id: 'l2', title: 'Bài 02: Tách service theo nghiệp vụ', completed: true, duration: '60 phút' },
      { id: 'l3', title: 'Bài 03: REST vs gRPC trong giao tiếp liên service', completed: true, duration: '50 phút' },
      { id: 'l4', title: 'Bài 04: Cấu hình Mongoose & Transactions', completed: true, duration: '65 phút' },
      { id: 'l5', title: 'Bài 05: Authentication với JWT & OAuth2 Server', completed: true, duration: '55 phút' },
      { id: 'l6', title: 'Bài 06: Circuit Breaker pattern với Opossum', completed: true, duration: '40 phút' },
      { id: 'l7', title: 'Bài 07: Thực hành Lab 1: Microservices Docker Compose', completed: true, duration: '90 phút' },
      { id: 'l8', title: 'Bài 08: Thiết kế Schema MongoDB hiệu năng cao', completed: false, duration: '50 phút' }
    ],
    materials: [
      { id: 'm1', name: 'Slide_Tuan_01_Architecture_Overview.pdf', type: 'slide', size: '4.2 MB' },
      { id: 'm2', name: 'Microservices_Lab_Starter_Code.zip', type: 'code', size: '12.8 MB' },
      { id: 'm3', name: 'Giao_trinh_Clean_Architecture_VN.pdf', type: 'pdf', size: '8.5 MB' },
      { id: 'm4', name: 'Link Github Repository đồ án mẫu', type: 'link', url: 'https://github.com/planora/microservices-sample' }
    ]
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
    createdAt: '2026-08-20',
    credits: 4,
    semester: 'Học kỳ 1 - 2026-2027',
    schedule: 'Thứ 4 (13:30 - 16:00)',
    room: 'Phòng C3.02 (Lab Máy Tính)',
    targetGrade: 'A+',
    currentGrade: 9.0,
    evaluationWeights: [
      { label: 'Bài tập tuần / LeetCode', weight: 25 },
      { label: 'Kiểm tra giữa kỳ', weight: 35 },
      { label: 'Thi kết thúc môn (Offline)', weight: 40 }
    ],
    syllabus: [
      { week: 1, title: 'Độ phức tạp thuật toán (Big-O, Master Theorem)', completed: true },
      { week: 2, title: 'Cấu trúc cây cân bằng (AVL, Red-Black Tree, Segment Tree)', completed: true },
      { week: 3, title: 'Thuật toán đồ thị nâng cao (Dijkstra, Bellman-Ford, Tarjan)', completed: true },
      { week: 4, title: 'Quy hoạch động 1D và 2D, Bitmask DP', completed: false },
      { week: 5, title: 'Kỹ thuật String Matching (KMP, Trie, Suffix Tree)', completed: false }
    ],
    lessons: [
      { id: 'd1', title: 'Bài 01: Ôn tập Cây nhị phân và Cây tìm kiếm BST', completed: true, duration: '60 phút' },
      { id: 'd2', title: 'Bài 02: Cài đặt cây Segment Tree với Lazy Propagation', completed: true, duration: '75 phút' },
      { id: 'd3', title: 'Bài 03: Tìm đường đi ngắn nhất đồ thị có trọng số âm', completed: true, duration: '50 phút' },
      { id: 'd4', title: 'Bài 04: Giải bài toán Ba lô và biến thể với DP', completed: true, duration: '60 phút' },
      { id: 'd5', title: 'Bài 05: DP trên cây (Tree DP) ứng dụng thực tế', completed: false, duration: '70 phút' },
      { id: 'd6', title: 'Bài 06: Trie & Bài toán tự động gợi ý từ khóa', completed: false, duration: '45 phút' }
    ],
    materials: [
      { id: 'dm1', name: 'Slide_Graph_Algorithms_DeepDive.pdf', type: 'slide', size: '5.1 MB' },
      { id: 'dm2', name: 'Tong_hop_100_bai_LeetCode_Medium_Hard.pdf', type: 'pdf', size: '3.4 MB' },
      { id: 'dm3', name: 'LeetCode Contest Platform Guide', type: 'link', url: 'https://leetcode.com' }
    ]
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
    createdAt: '2026-07-10',
    credits: 3,
    semester: 'Học kỳ Hè 2026',
    schedule: 'Thứ 6 (08:00 - 11:15)',
    room: 'Online qua LMS / Google Meet',
    targetGrade: 'A',
    currentGrade: 9.5,
    evaluationWeights: [
      { label: 'Chuyên cần & Thực hành', weight: 20 },
      { label: 'Đồ án cá nhân', weight: 40 },
      { label: 'Bảo vệ đồ án tốt nghiệp môn', weight: 40 }
    ],
    syllabus: [
      { week: 1, title: 'React 19 Core & React Compiler nguyên lý', completed: true },
      { week: 2, title: 'Server Components và Streaming SSR', completed: true },
      { week: 3, title: 'State Management & Custom Hooks chuyên sâu', completed: true },
      { week: 4, title: 'Build và Deploy tối ưu trên Cloud Run', completed: true }
    ],
    lessons: [
      { id: 'f1', title: 'Bài 01: Kiến trúc React 19 mới', completed: true, duration: '40 phút' },
      { id: 'f2', title: 'Bài 02: useActionState & useOptimistic', completed: true, duration: '50 phút' },
      { id: 'f3', title: 'Bài 03: Tối ưu Bundle với code-splitting', completed: true, duration: '60 phút' }
    ],
    materials: [
      { id: 'fm1', name: 'React19_Cheatsheet_Production.pdf', type: 'pdf', size: '2.8 MB' },
      { id: 'fm2', name: 'Tailwind_v4_Design_System.pdf', type: 'slide', size: '6.4 MB' }
    ]
  },
  {
    id: 'course-4',
    title: 'Học Máy và Trí Tuệ Nhân Tạo Ứng Dụng',
    code: 'AI-401',
    instructor: 'PGS. TS. Hoàng Minh D',
    description: 'Nghiên cứu mạng nơ-ron sâu, mô hình Transformer, Fine-tuning LLM và tích hợp Gemini API vào ứng dụng.',
    status: 'in_progress',
    color: 'indigo',
    progress: 40,
    totalLessons: 20,
    completedLessons: 8,
    createdAt: '2026-08-25',
    credits: 3,
    semester: 'Học kỳ 1 - 2026-2027',
    schedule: 'Thứ 5 (09:45 - 12:00)',
    room: 'Phòng A2-302',
    targetGrade: 'A',
    currentGrade: 8.8,
    evaluationWeights: [
      { label: 'Bài tập Lab thực hành', weight: 30 },
      { label: 'Kiểm tra giữa kỳ', weight: 20 },
      { label: 'Đồ án AI Capstone', weight: 50 }
    ],
    syllabus: [
      { week: 1, title: 'Giới thiệu Machine Learning & Deep Learning cơ bản', completed: true },
      { week: 2, title: 'Kiến trúc Convolutional Neural Networks (CNN)', completed: true },
      { week: 3, title: 'Cơ chế Attention & Transformer Architecture', completed: false },
      { week: 4, title: 'Prompt Engineering & Fine-tuning LLM với LoRA', completed: false }
    ],
    lessons: [
      { id: 'ai1', title: 'Bài 01: PyTorch cơ bản & Tensors', completed: true, duration: '60 phút' },
      { id: 'ai2', title: 'Bài 02: Xây dựng mạng nơ-ron phân loại ảnh', completed: true, duration: '75 phút' },
      { id: 'ai3', title: 'Bài 03: Cài đặt Self-Attention từ đầu', completed: false, duration: '90 phút' }
    ],
    materials: [
      { id: 'aim1', name: 'Slide_Deep_Learning_Intro.pdf', type: 'slide', size: '7.2 MB' },
      { id: 'aim2', name: 'Jupyter_Notebook_Lab_PyTorch.ipynb', type: 'code', size: '1.5 MB' }
    ]
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
    courseId: 'course-1',
    courseCode: 'ARC-301',
    name: 'Kiến Trúc Microservices & Node.js',
    time: '07:30 - 09:30',
    room: 'Phòng B1-405',
    instructor: 'TS. Nguyễn Văn A',
    credits: 3,
    notes: 'Thực hành kết nối Docker & Redis',
    color: 'rose',
    day: 'mon',
    session: 'morning'
  },
  {
    id: 'tt-2',
    courseId: 'course-2',
    courseCode: 'DSA-202',
    name: 'Cấu Trúc Dữ Liệu & Giải Thuật Nâng Cao',
    time: '13:30 - 16:00',
    room: 'Phòng C3.02 (Lab Máy Tính)',
    instructor: 'ThS. Trần Thị B',
    credits: 4,
    notes: 'Luyện tập giải thuật đồ thị & LeetCode',
    color: 'amber',
    day: 'wed',
    session: 'afternoon'
  },
  {
    id: 'tt-3',
    courseId: 'course-4',
    courseCode: 'AI-401',
    name: 'Học Máy và Trí Tuệ Nhân Tạo Ứng Dụng',
    time: '09:45 - 12:00',
    room: 'Phòng A2-302',
    instructor: 'PGS. TS. Hoàng Minh D',
    credits: 3,
    notes: 'Học mô hình Transformer & LLM',
    color: 'indigo',
    day: 'thu',
    session: 'morning'
  },
  {
    id: 'tt-4',
    courseId: 'course-3',
    courseCode: 'FE-101',
    name: 'Phát Triển Ứng Dụng Web Hiện Đại với React 19',
    time: '08:00 - 11:15',
    room: 'Online qua LMS / Google Meet',
    instructor: 'Lê Hoàng C',
    credits: 3,
    notes: 'Server Components & State Management',
    color: 'emerald',
    day: 'fri',
    session: 'morning'
  },
  {
    id: 'tt-5',
    name: 'Tự học thư viện & Luyện thuật toán',
    time: '14:00 - 16:30',
    room: 'Thư viện Tầng 3',
    notes: 'Luyện 3 bài LeetCode Medium',
    color: 'teal',
    day: 'tue',
    session: 'afternoon'
  },
  {
    id: 'tt-6',
    name: 'Seminar Công Nghệ Cloud & DevOps',
    time: '09:00 - 11:30',
    room: 'Online Zoom',
    notes: 'Hội thảo trực tuyến với diễn giả',
    color: 'sky'
    // Chưa xếp lịch (xuất hiện ở kho môn bên trái)
  },
  {
    id: 'tt-7',
    name: 'Sinh Hoạt Nhóm Đồ Án Tốt Nghiệp',
    time: '15:00 - 17:00',
    room: 'Căn tin tầng 2',
    color: 'purple'
    // Chưa xếp lịch (xuất hiện ở kho môn bên trái)
  }
];

