import { useState } from 'react';
import { BookOpen, Plus, Trash2, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { Course } from '../../types';

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
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    instructor: '',
    description: '',
    totalLessons: 12,
    color: 'rose'
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
      color: 'rose'
    });
  };

  const handleLessonIncrement = async (course: Course) => {
    if (course.completedLessons < course.totalLessons) {
      await onUpdateCourse(course.id, {
        completedLessons: course.completedLessons + 1
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['all', 'in_progress', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === tab
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {tab === 'all' ? 'Tất Cả' : tab === 'in_progress' ? 'Đang Học' : 'Đã Hoàn Thành'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Khoá Học Mới</span>
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(course => (
          <div
            key={course.id}
            className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-neutral-800 text-amber-300">
                  {course.code}
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  course.status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {course.status === 'completed' ? 'Đã Hoàn Thành' : 'Đang Học'}
                </span>
              </div>

              <h3 className="font-bold text-sm text-white mb-1">
                {course.title}
              </h3>
              <p className="text-xs text-neutral-400 mb-3">
                GV: {course.instructor}
              </p>
              <p className="text-xs text-neutral-300 line-clamp-2 mb-4">
                {course.description}
              </p>
            </div>

            <div>
              {/* Progress */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-neutral-400 text-[11px]">Tiến độ học tập</span>
                  <span className="text-white font-bold">{course.progress}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>{course.completedLessons}/{course.totalLessons} bài học</span>
                  {course.completedLessons < course.totalLessons && (
                    <button
                      onClick={() => handleLessonIncrement(course)}
                      className="text-amber-400 hover:text-amber-300 font-medium"
                    >
                      + Đánh dấu xong 1 bài
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80">
                <span className="text-[10px] font-mono text-neutral-400">
                  Tạo: {course.createdAt}
                </span>
                <button
                  onClick={() => onDeleteCourse(course.id)}
                  className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors"
                  title="Xoá khoá học"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Thêm Khoá Học Mới</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Mã môn (Course Code)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS102, WEB301"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Tên khoá học</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cơ Sở Dữ Liệu Phân Tán"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Giảng viên / Nguồn học</label>
                <input
                  type="text"
                  placeholder="e.g. TS. Nguyễn Văn A hoặc Coursera"
                  value={formData.instructor}
                  onChange={e => setFormData({ ...formData, instructor: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Số bài học dự kiến</label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalLessons}
                  onChange={e => setFormData({ ...formData, totalLessons: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Mô tả ngắn</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mục tiêu môn học, giáo trình cần theo..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 rounded-lg"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white rounded-lg"
                >
                  Lưu Khoá Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
