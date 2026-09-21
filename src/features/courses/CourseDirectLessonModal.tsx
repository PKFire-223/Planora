import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Course } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface CourseDirectLessonModalProps {
  course: Course;
  onClose: () => void;
  onUpdate: (completedLessons: number) => Promise<void>;
}

export function CourseDirectLessonModal({
  course,
  onClose,
  onUpdate
}: CourseDirectLessonModalProps) {
  const { isDark } = useTheme();
  const [value, setValue] = useState(course.completedLessons);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clamped = Math.max(0, Math.min(course.totalLessons, Number(value) || 0));
    setIsSubmitting(true);
    await onUpdate(clamped);
    setIsSubmitting(false);
    onClose();
  };

  const currentPercent = course.totalLessons > 0 ? Math.round((value / course.totalLessons) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm rounded-2xl p-5 shadow-xl border ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider">{course.code}</span>
            <h3 className="text-sm font-bold">Cập Nhật Tiến Độ Bài Học</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className={`text-xs mb-4 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
          Nhập trực tiếp số bài học bạn đã hoàn thành cho môn <strong>{course.title}</strong>:
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className={isDark ? 'text-neutral-300' : 'text-slate-700'}>Số bài đã học:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {value} / {course.totalLessons} bài ({currentPercent}%)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setValue(prev => Math.max(0, prev - 1))}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700'
                    : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                }`}
              >
                - 1
              </button>
              
              <input
                type="number"
                min="0"
                max={course.totalLessons}
                value={value}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setValue(isNaN(val) ? 0 : Math.max(0, Math.min(course.totalLessons, val)));
                }}
                className={`flex-1 text-center font-bold text-base px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-neutral-950 border-neutral-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />

              <button
                type="button"
                onClick={() => setValue(prev => Math.min(course.totalLessons, prev + 1))}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700'
                    : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                }`}
              >
                + 1
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center justify-between gap-1.5 mt-2.5">
              {[
                { label: '0%', val: 0 },
                { label: '25%', val: Math.round(course.totalLessons * 0.25) },
                { label: '50%', val: Math.round(course.totalLessons * 0.5) },
                { label: '75%', val: Math.round(course.totalLessons * 0.75) },
                { label: '100%', val: course.totalLessons }
              ].map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setValue(preset.val)}
                  className={`px-2 py-1 text-[10px] font-medium rounded-lg border transition-colors cursor-pointer ${
                    value === preset.val
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : isDark
                        ? 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-dashed border-neutral-700/50">
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-1.5 text-xs rounded-xl cursor-pointer ${
                isDark ? 'text-neutral-400 hover:bg-neutral-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Đang lưu...' : 'Xác Nhận'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
