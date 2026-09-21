import React from 'react';
import {
  X,
  BookOpen,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  FileText,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Course, CourseLesson, ActiveTab } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface CourseQuickContentModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCourse?: (id: string, data: Partial<Course>) => Promise<void>;
  onNavigateToTab?: (tab: ActiveTab, context?: { courseId?: string; courseCode?: string; aiPrompt?: string }) => void;
}

export function CourseQuickContentModal({
  course,
  isOpen,
  onClose,
  onUpdateCourse,
  onNavigateToTab
}: CourseQuickContentModalProps) {
  const { isDark } = useTheme();

  if (!isOpen || !course) return null;

  const lessons: CourseLesson[] = course.lessons && course.lessons.length > 0
    ? course.lessons
    : Array.from({ length: course.totalLessons || 12 }).map((_, idx) => ({
        id: `gen-l-${idx + 1}`,
        title: `Bài ${String(idx + 1).padStart(2, '0')}: Nội dung học phần ${idx + 1}`,
        completed: idx < course.completedLessons,
        duration: '45 phút'
      }));

  const handleToggleLesson = async (lessonId: string) => {
    if (!onUpdateCourse) return;
    const updated = lessons.map(l => l.id === lessonId ? { ...l, completed: !l.completed } : l);
    const completedCount = updated.filter(l => l.completed).length;
    const total = updated.length;
    const progress = Math.min(100, Math.round((completedCount / total) * 100));

    await onUpdateCourse(course.id, {
      lessons: updated,
      completedLessons: completedCount,
      totalLessons: total,
      progress,
      status: completedCount >= total ? 'completed' : 'in_progress'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-start justify-between gap-4 ${
          isDark ? 'border-neutral-800 bg-neutral-950/40' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {course.code}
              </span>
              {course.credits && (
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                  isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-slate-200 text-slate-700'
                }`}>
                  {course.credits} Tín chỉ
                </span>
              )}
              {course.semester && (
                <span className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  • {course.semester}
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold leading-snug">
              {course.title}
            </h3>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs">
              <span className={`flex items-center gap-1.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                <span>GV: <strong>{course.instructor || 'Chưa phân công'}</strong></span>
              </span>

              {course.room && (
                <span className={`flex items-center gap-1.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Phòng: <strong>{course.room}</strong></span>
                </span>
              )}

              {course.schedule && (
                <span className={`flex items-center gap-1.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Lịch: <strong>{course.schedule}</strong></span>
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Strip */}
        <div className={`px-5 py-3 border-b flex items-center justify-between gap-4 ${
          isDark ? 'bg-neutral-950/20 border-neutral-800' : 'bg-slate-50/40 border-slate-100'
        }`}>
          <div className="flex-1">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className={isDark ? 'text-neutral-300' : 'text-slate-700'}>
                Tiến độ hoàn thành bài học
              </span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {course.completedLessons}/{course.totalLessons} bài ({course.progress}%)
              </span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`}>
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>

          {onNavigateToTab && (
            <button
              onClick={() => {
                onClose();
                onNavigateToTab('courses', { courseId: course.id, courseCode: course.code });
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
            >
              <span>Xem trang khóa học</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Body Content: Lessons & Syllabus */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[50vh]">
          {/* Syllabus or Description */}
          {course.description && (
            <div className={`p-3 rounded-xl text-xs leading-relaxed border ${
              isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-300' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <strong className="block mb-1 text-slate-800 dark:text-neutral-200 font-semibold">
                Mô tả học phần:
              </strong>
              {course.description}
            </div>
          )}

          {/* Lessons List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Nội Dung Các Bài Học ({lessons.length})</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                (Bấm để đánh dấu hoàn thành bài học)
              </span>
            </div>

            <div className="space-y-1.5">
              {lessons.map((lesson, idx) => (
                <div
                  key={lesson.id || idx}
                  onClick={() => handleToggleLesson(lesson.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    lesson.completed
                      ? isDark
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-neutral-300'
                        : 'bg-emerald-50/50 border-emerald-200/60 text-slate-700'
                      : isDark
                        ? 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-200'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {lesson.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className={`w-4 h-4 shrink-0 ${isDark ? 'text-neutral-600' : 'text-slate-300'}`} />
                    )}
                    <span className={`text-xs font-medium truncate ${lesson.completed ? 'line-through opacity-70' : ''}`}>
                      {lesson.title}
                    </span>
                  </div>

                  {lesson.duration && (
                    <span className={`text-[10px] shrink-0 font-medium ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                      {lesson.duration}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Materials if any */}
          {course.materials && course.materials.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5 mb-2">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Tài Liệu Đính Kèm ({course.materials.length})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {course.materials.map(mat => (
                  <div
                    key={mat.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="truncate font-medium pr-2">{mat.name}</span>
                    {mat.size && (
                      <span className="text-[10px] text-slate-400 shrink-0">{mat.size}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500">
            Nội dung được đồng bộ tự động với Thời Khóa Biểu
          </div>

          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
              isDark ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
            }`}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
