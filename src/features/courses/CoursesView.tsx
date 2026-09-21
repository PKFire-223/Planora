import { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { Course } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface CoursesViewProps {
  courses: Course[];
  onCreateCourse: (data: Partial<Course>) => Promise<void>;
  onDeleteCourse: (id: string) => Promise<void>;
  onUpdateCourse: (id: string, data: Partial<Course>) => Promise<void>;
}

export function CoursesView({
  courses,
  onCreateCourse,
  onDeleteCourse,
  onUpdateCourse
}: CoursesViewProps) {
  const { isDark } = useTheme();
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    instructor: '',
    description: '',
    totalLessons: 12,
    color: 'indigo'
  });

  const filtered = filter === 'all'
    ? courses
    : courses.filter(c => c.status === filter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.code) return;
    await onCreateCourse(formData);
    setIsCreateOpen(false);
    setFormData({
      title: '',
      code: '',
      instructor: '',
      description: '',
      totalLessons: 12,
      color: 'indigo'
    });
  };

  const handleLessonIncrement = async (course: Course) => {
    if (course.completedLessons < course.totalLessons) {
      const nextCompleted = course.completedLessons + 1;
      const nextProgress = Math.round((nextCompleted / course.totalLessons) * 100);
      const isFinished = nextCompleted >= course.totalLessons;
      await onUpdateCourse(course.id, {
        completedLessons: nextCompleted,
        progress: nextProgress,
        status: isFinished ? 'completed' : 'in_progress'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className={`inline-flex p-1 rounded-xl border text-xs font-medium ${
          isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-100 border-slate-200'
        }`}>
          {(['all', 'in_progress', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === tab
                  ? isDark
                    ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                    : 'bg-white text-indigo-700 font-semibold shadow-xs'
                  : isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'all' ? 'Tất Cả Môn Học' : tab === 'in_progress' ? 'Đang Học' : 'Đã Hoàn Thành'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Môn Học Mới</span>
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(course => (
          <div
            key={course.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              isDark
                ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                : 'bg-white border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                  isDark ? 'bg-neutral-800 text-indigo-300' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  {course.code}
                </span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  course.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300'
                }`}>
                  {course.status === 'completed' ? 'Đã Hoàn Thành' : 'Đang Học'}
                </span>
              </div>

              <h3 className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {course.title}
              </h3>
              <p className={`text-xs mb-3 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Giảng viên: {course.instructor}
              </p>
              <p className={`text-xs line-clamp-2 mb-4 leading-relaxed ${isDark ? 'text-neutral-300' : 'text-slate-600'}`}>
                {course.description}
              </p>
            </div>

            <div>
              {/* Progress */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs">
                  <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>Tiến độ bài giảng</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{course.progress}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`}>
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] items-center pt-0.5">
                  <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>
                    {course.completedLessons}/{course.totalLessons} bài hoàn tất
                  </span>
                  {course.completedLessons < course.totalLessons ? (
                    <button
                      onClick={() => handleLessonIncrement(course)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                    >
                      + Xong 1 bài
                    </button>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Hoàn tất</span>
                    </span>
                  )}
                </div>
              </div>

              <div className={`flex items-center justify-between pt-3 border-t ${
                isDark ? 'border-neutral-800' : 'border-slate-100'
              }`}>
                <span className={`text-[10px] ${isDark ? 'text-neutral-400' : 'text-slate-400'}`}>
                  Ngày tạo: {course.createdAt}
                </span>
                <button
                  onClick={() => onDeleteCourse(course.id)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isDark ? 'text-neutral-400 hover:text-rose-400 hover:bg-neutral-800' : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                  }`}
                  title="Xoá môn học"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Course */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border transition-all ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-base font-bold mb-4">Thêm Môn Học Mới Vào Planora</h3>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Mã môn học (Course Code)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: CS102, FE201, ARC301"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Tên môn học
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Thiết Kế Hệ Thống Phân Tán"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Giảng viên / Nguồn học
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: TS. Nguyễn Văn A hoặc Coursera / Udemy"
                  value={formData.instructor}
                  onChange={e => setFormData({ ...formData, instructor: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Tổng số bài học dự kiến
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalLessons}
                  onChange={e => setFormData({ ...formData, totalLessons: Number(e.target.value) })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Mô tả môn học
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mục tiêu kiến thức, tài liệu tham khảo..."
                  className={`w-full px-3 py-2 text-xs rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className={`px-3.5 py-2 text-xs rounded-xl cursor-pointer ${
                    isDark ? 'text-neutral-300 hover:bg-neutral-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Lưu Môn Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
