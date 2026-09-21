import { 
  BookOpen, 
  CheckSquare, 
  Award, 
  Target, 
  Clock, 
  ArrowUpRight, 
  Sparkles,
  AlertCircle,
  TrendingUp,
  FolderTree,
  CheckCircle2
} from 'lucide-react';
import { Course, Task, Goal, ErrorReport, ActiveTab } from '../../types';
import { useTheme } from '../../context/ThemeContext';

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
  const { isDark } = useTheme();

  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const completedTasks = tasks.filter(t => t.status === 'done');
  const inProgressCourses = courses.filter(c => c.status === 'in_progress');
  const openErrors = errors.filter(e => e.status !== 'resolved');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className={`relative overflow-hidden rounded-2xl p-6 border transition-colors ${
        isDark
          ? 'bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950/40 border-neutral-800 text-white'
          : 'bg-gradient-to-r from-indigo-50/70 via-white to-sky-50/60 border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="max-w-2xl relative z-10">
          {/* Streak badge - clean icon, no chat emojis */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3.5 ${
            isDark 
              ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300' 
              : 'bg-indigo-100/80 border border-indigo-200 text-indigo-800'
          }`}>
            <Award className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Chuỗi học tập: 14 ngày liên tiếp</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Chào mừng đến với Planora! Hôm nay bạn có {pendingTasks.length} nhiệm vụ cần xử lý.
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-neutral-300' : 'text-slate-600'}`}>
            Nền tảng quản lý kế hoạch & học tập thông minh với hệ thống khoá học, tiến độ bài tập, mục tiêu KPI và trợ lý AI tích hợp.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5 relative z-10">
          <button
            onClick={() => onNavigate('tasks')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
          >
            Làm Bài Tập Ngay
          </button>
          <button
            onClick={() => onNavigate('ai')}
            className={`px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDark
                ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Hỏi Trợ Lý AI</span>
          </button>
          <button
            onClick={() => onNavigate('structure')}
            className={`px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDark
                ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-2xs'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5 text-slate-400" />
            <span>Xem Cấu Trúc Dự Án</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('courses')}
          className={`p-4 rounded-xl border cursor-pointer transition-all hover:-translate-y-0.5 ${
            isDark
              ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
              : 'bg-white border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Khoá Học Đang Học
            </span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {inProgressCourses.length}
          </div>
          <div className={`text-[11px] mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            Tổng cộng {courses.length} môn học
          </div>
        </div>

        <div 
          onClick={() => onNavigate('tasks')}
          className={`p-4 rounded-xl border cursor-pointer transition-all hover:-translate-y-0.5 ${
            isDark
              ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
              : 'bg-white border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Việc Cần Hoàn Thành
            </span>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {pendingTasks.length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Đã làm xong {completedTasks.length} task</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('goals')}
          className={`p-4 rounded-xl border cursor-pointer transition-all hover:-translate-y-0.5 ${
            isDark
              ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
              : 'bg-white border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Mục Tiêu Học Tập
            </span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {goals.length}
          </div>
          <div className={`text-[11px] mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            Đang bám sát mục tiêu
          </div>
        </div>

        <div 
          onClick={() => onNavigate('errors')}
          className={`p-4 rounded-xl border cursor-pointer transition-all hover:-translate-y-0.5 ${
            isDark
              ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
              : 'bg-white border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Sự Cố & Báo Lỗi
            </span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {openErrors.length}
          </div>
          <div className={`text-[11px] mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            {openErrors.length === 0 ? 'Tất cả đã xử lý' : `${openErrors.length} mục đang xử lý`}
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: In-Progress Courses & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Courses Progress */}
          <div className={`p-5 rounded-2xl border transition-colors ${
            isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>Tiến Độ Khoá Học Hiện Tại</span>
              </h3>
              <button
                onClick={() => onNavigate('courses')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>Xem tất cả</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {courses.slice(0, 3).map(course => (
                <div 
                  key={course.id}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700' 
                      : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded mr-2 ${
                        isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-white text-slate-700 border border-slate-200'
                      }`}>
                        {course.code}
                      </span>
                      <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {course.title}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {course.progress}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className={`w-full h-2 rounded-full overflow-hidden mb-2 ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`}>
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>

                  <div className={`flex items-center justify-between text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    <span>GV: {course.instructor}</span>
                    <span>{course.completedLessons}/{course.totalLessons} bài hoàn tất</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tasks Quick Checklist */}
          <div className={`p-5 rounded-2xl border transition-colors ${
            isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <CheckSquare className="w-4 h-4 text-amber-500" />
                <span>Nhiệm Vụ & Bài Tập Cần Làm</span>
              </h3>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>Mở danh sách task</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {pendingTasks.slice(0, 4).map(task => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700' 
                      : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={task.status === 'done'}
                      onChange={() => onToggleTask(task.id, task.status)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <p className={`text-xs font-medium truncate ${
                        task.status === 'done' 
                          ? 'line-through text-slate-400 dark:text-neutral-500' 
                          : isDark ? 'text-neutral-200' : 'text-slate-800'
                      }`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 dark:text-neutral-400">
                        {task.courseName && (
                          <span className="font-medium text-slate-500 dark:text-neutral-400">{task.courseName}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Hạn: {task.dueDate}</span>
                        </span>
                        {task.isAiGenerated && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium">
                            AI
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    task.priority === 'urgent'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                      : task.priority === 'high'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                      : 'bg-slate-200 text-slate-700 dark:bg-neutral-800 dark:text-neutral-400'
                  }`}>
                    {task.priority === 'urgent' ? 'Khẩn cấp' : task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Goals, AI Insight */}
        <div className="space-y-6">
          {/* Active Goals */}
          <div className={`p-5 rounded-2xl border transition-colors ${
            isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Target className="w-4 h-4 text-emerald-500" />
                <span>Mục Tiêu Tự Học</span>
              </h3>
              <button
                onClick={() => onNavigate('goals')}
                className={`text-xs hover:underline cursor-pointer ${isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Chi tiết
              </button>
            </div>

            <div className="space-y-4">
              {goals.slice(0, 3).map(goal => {
                const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                return (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className={`font-medium truncate pr-2 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                        {goal.title}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                        {percent}%
                      </span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`}>
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className={`text-[10px] text-right ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Study Tip Widget */}
          <div className={`p-5 rounded-2xl border transition-colors ${
            isDark 
              ? 'bg-gradient-to-br from-neutral-900 to-indigo-950/30 border-indigo-500/30 text-neutral-200' 
              : 'bg-gradient-to-br from-indigo-50/80 to-white border-indigo-200 text-slate-800 shadow-xs'
          }`}>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs mb-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Gợi Ý Học Tập Từ Planora AI</span>
            </div>
            <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-neutral-300' : 'text-slate-600'}`}>
              "Hãy phân bổ 45 phút buổi sáng hoàn thành các task bài tập ưu tiên cao. Bạn có thể sử dụng nút phân rã thông minh để AI chia nhỏ bài tập thành từng bước hành động!"
            </p>
            <button
              onClick={() => onNavigate('ai')}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer text-center ${
                isDark
                  ? 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-xs'
              }`}
            >
              Trò chuyện cùng Planora AI →
            </button>
          </div>

          {/* Architecture info */}
          <div className={`p-4 rounded-xl border text-xs space-y-1 ${
            isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className={`font-semibold ${isDark ? 'text-neutral-300' : 'text-slate-800'}`}>
              Kiến Trúc Hệ Thống:
            </div>
            <div>• Giao diện: React 19 + Tailwind CSS + Roboto Font</div>
            <div>• Máy chủ: Node.js Express 5 + REST API</div>
            <div>• Cơ sở dữ liệu: MongoDB Mongoose + In-Memory Fallback</div>
            <div>• Xác thực: Phân quyền Quản Trị Viên (Admin) & Học Viên</div>
          </div>
        </div>
      </div>
    </div>
  );
}
