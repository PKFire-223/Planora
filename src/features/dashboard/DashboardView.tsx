import { 
  BookOpen, 
  CheckSquare, 
  Flame, 
  Target, 
  Clock, 
  ArrowUpRight, 
  Sparkles,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Course, Task, Goal, ErrorReport, ActiveTab } from '../../types';

interface DashboardViewProps {
  courses: Course[];
  tasks: Task[];
  goals: Goal[];
  errors: ErrorReport[];
  onNavigate: (tab: ActiveTab) => void;
  onToggleTask: (id: string, currentStatus: Task['status']) => void;
}

export function DashboardView({
  courses,
  tasks,
  goals,
  errors,
  onNavigate,
  onToggleTask
}: DashboardViewProps) {
  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const completedTasks = tasks.filter(t => t.status === 'done');
  const inProgressCourses = courses.filter(c => c.status === 'in_progress');
  const openErrors = errors.filter(e => e.status !== 'resolved');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/50 via-neutral-900 to-amber-950/30 border border-neutral-800 p-6">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-300 mb-3">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Chuỗi học tập: 14 ngày liên tiếp 🔥</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Chào mừng trở lại! Hôm nay bạn có {pendingTasks.length} bài tập cần xử lý.
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Hệ thống Personal LMS đã được cấu trúc với Backend Node.js Express, MongoDB Mongoose, AI Assistant và Error Logging Center.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2.5 relative z-10">
          <button
            onClick={() => onNavigate('tasks')}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors"
          >
            Làm Bài Tập Ngay
          </button>
          <button
            onClick={() => onNavigate('ai')}
            className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Hỏi Trợ Lý AI</span>
          </button>
          <button
            onClick={() => onNavigate('structure')}
            className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-mono transition-colors"
          >
            Xem Cấu Trúc Tree Dự Án
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('courses')}
          className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Khoá Học Đang Học</span>
            <BookOpen className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white">{inProgressCourses.length}</div>
          <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
            <span>Tổng số {courses.length} khoá</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('tasks')}
          className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Việc Cần Làm</span>
            <CheckSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{pendingTasks.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Đã xong {completedTasks.length} task</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('goals')}
          className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Mục Tiêu Tháng</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{goals.length}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Đang bám sát kế hoạch</div>
        </div>

        <div 
          onClick={() => onNavigate('errors')}
          className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Sự Cố & Báo Lỗi</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white">{openErrors.length}</div>
          <div className="text-[11px] text-neutral-400 mt-1">
            {openErrors.length === 0 ? 'Tất cả đã xử lý' : 'Đang theo dõi xử lý'}
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: In-Progress Courses & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Courses Progress */}
          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-rose-400" />
                <span>Tiến Độ Khoá Học Hiện Tại</span>
              </h3>
              <button
                onClick={() => onNavigate('courses')}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {courses.slice(0, 3).map(course => (
                <div 
                  key={course.id}
                  className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 mr-2">
                        {course.code}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {course.title}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {course.progress}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>GV: {course.instructor}</span>
                    <span>{course.completedLessons}/{course.totalLessons} bài học</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tasks Quick Checklist */}
          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-400" />
                <span>Nhiệm Vụ & Bài Tập Cần Hoàn Thành</span>
              </h3>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>Mở danh sách task</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {pendingTasks.slice(0, 4).map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={task.status === 'done'}
                      onChange={() => onToggleTask(task.id, task.status)}
                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-rose-600 focus:ring-0 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <p className={`text-xs font-medium truncate ${task.status === 'done' ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-400">
                        {task.courseName && (
                          <span className="font-mono text-neutral-400">{task.courseName}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Hạn: {task.dueDate}</span>
                        </span>
                        {task.isAiGenerated && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-mono">
                            AI
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                    task.priority === 'urgent'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : task.priority === 'high'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Goals, AI Insight, Error Snapshot */}
        <div className="space-y-6">
          {/* Active Goals */}
          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Mục Tiêu Học Tập</span>
              </h3>
              <button
                onClick={() => onNavigate('goals')}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Chi tiết
              </button>
            </div>

            <div className="space-y-4">
              {goals.slice(0, 2).map(goal => {
                const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                return (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-200 font-medium truncate pr-2">{goal.title}</span>
                      <span className="font-mono text-emerald-400 font-bold shrink-0">{percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-neutral-400 text-right">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Study Tip Widget */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900 to-amber-950/20 border border-amber-500/30">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Gợi Ý Trợ Lý Học Tập AI</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed mb-3">
              "Bạn nên ưu tiên hoàn thành task Mongoose Schema trước buổi trưa để đảm bảo flow backend thông suốt. Đã có thể dùng nút AI để tự động chia nhỏ task!"
            </p>
            <button
              onClick={() => onNavigate('ai')}
              className="w-full py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
            >
              Trò chuyện với AI Assistant →
            </button>
          </div>

          {/* Quick Architecture Note */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 space-y-1">
            <div className="font-mono font-semibold text-neutral-300">Stack Khuyên Dùng:</div>
            <div>• Frontend: React 19 + TypeScript + Tailwind</div>
            <div>• Backend: Node.js Express + TypeScript</div>
            <div>• Database: MongoDB (Mongoose ODM)</div>
            <div>• Error Tracker: Centralized API Logger</div>
          </div>
        </div>
      </div>
    </div>
  );
}
