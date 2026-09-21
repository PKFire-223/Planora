import { BookOpen, GraduationCap, Percent, Clock, CheckCircle2 } from 'lucide-react';
import { Course } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface CourseMetricsStripProps {
  courses: Course[];
  selectedSemester: string;
}

export function CourseMetricsStrip({ courses, selectedSemester }: CourseMetricsStripProps) {
  const { isDark } = useTheme();

  // Filter courses if a specific semester is selected, or use all
  const relevantCourses = selectedSemester === 'all'
    ? courses
    : courses.filter(c => (c.semester || 'Học kỳ 1 - 2026-2027') === selectedSemester);

  const inProgressCourses = relevantCourses.filter(c => c.status === 'in_progress');
  const completedCourses = relevantCourses.filter(c => c.status === 'completed');

  // Total credits
  const totalCredits = relevantCourses.reduce((sum, c) => sum + (c.credits || 3), 0);
  const inProgressCredits = inProgressCourses.reduce((sum, c) => sum + (c.credits || 3), 0);

  // Average completion rate of in-progress courses (or all)
  const activeCoursesForAvg = inProgressCourses.length > 0 ? inProgressCourses : relevantCourses;
  const avgProgress = activeCoursesForAvg.length > 0
    ? Math.round(activeCoursesForAvg.reduce((sum, c) => sum + (c.progress || 0), 0) / activeCoursesForAvg.length)
    : 0;

  // Remaining lessons
  const totalLessons = relevantCourses.reduce((sum, c) => sum + (c.totalLessons || 0), 0);
  const completedLessons = relevantCourses.reduce((sum, c) => sum + (c.completedLessons || 0), 0);
  const remainingLessons = Math.max(0, totalLessons - completedLessons);

  const metrics = [
    {
      id: 'credits',
      label: 'Tổng Tín Chỉ Đăng Ký',
      value: `${totalCredits} TC`,
      subtext: `${inProgressCredits} TC đang học`,
      icon: GraduationCap,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-500/10'
    },
    {
      id: 'avg_progress',
      label: 'Tiến Độ Trung Bình',
      value: `${avgProgress}%`,
      subtext: inProgressCourses.length > 0 ? `Tính trên ${inProgressCourses.length} môn đang học` : 'Tất cả các môn',
      icon: Percent,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10'
    },
    {
      id: 'remaining_lessons',
      label: 'Bài Học Cần Hoàn Tất',
      value: `${remainingLessons} bài`,
      subtext: `Đã hoàn thành ${completedLessons}/${totalLessons} bài`,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-500/10'
    },
    {
      id: 'status_dist',
      label: 'Trạng Thái Môn Học',
      value: `${inProgressCourses.length} / ${relevantCourses.length}`,
      subtext: `${completedCourses.length} môn đã hoàn tất`,
      icon: BookOpen,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {metrics.map(m => {
        const Icon = m.icon;
        return (
          <div
            key={m.id}
            className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
              isDark
                ? 'bg-neutral-900/60 border-neutral-800'
                : 'bg-white border-slate-200/90 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] sm:text-xs font-medium truncate ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                {m.label}
              </span>
              <div className={`p-1.5 rounded-lg ${m.bg}`}>
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${m.color}`} />
              </div>
            </div>
            <div className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {m.value}
            </div>
            <div className={`text-[11px] mt-1 truncate ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              {m.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
