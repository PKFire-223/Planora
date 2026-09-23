import { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Search,
  X,
  GraduationCap,
  Calendar,
  Edit3,
  BookOpen
} from 'lucide-react';
import { Course, ActiveTab } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { CourseMetricsStrip } from './CourseMetricsStrip';
import { CourseFormModal } from './CourseFormModal';
import { CourseDetailModal } from './CourseDetailModal';
import { CourseDirectLessonModal } from './CourseDirectLessonModal';

interface CoursesViewProps {
  courses: Course[];
  onCreateCourse: (data: Partial<Course>) => Promise<void>;
  onDeleteCourse: (id: string) => Promise<void>;
  onUpdateCourse: (id: string, data: Partial<Course>) => Promise<void>;
  onNavigateToTab?: (tab: ActiveTab, context?: { courseId?: string; courseCode?: string; aiPrompt?: string }) => void;
}

export function CoursesView({
  courses,
  onCreateCourse,
  onDeleteCourse,
  onUpdateCourse,
  onNavigateToTab
}: CoursesViewProps) {
  const { isDark } = useTheme();

  // Search, Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'progress_desc' | 'progress_asc' | 'newest' | 'name_asc' | 'name_desc' | 'credits_desc'>('newest');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [detailedCourse, setDetailedCourse] = useState<Course | null>(null);
  const [directLessonCourse, setDirectLessonCourse] = useState<Course | null>(null);

  // Extract unique semesters from current courses
  const availableSemesters = useMemo(() => {
    const sems = new Set<string>();
    courses.forEach(c => {
      if (c.semester) sems.add(c.semester);
    });
    // Add default fallbacks if empty
    if (!sems.has('Học kỳ 1 - 2026-2027')) sems.add('Học kỳ 1 - 2026-2027');
    if (!sems.has('Học kỳ Hè 2026')) sems.add('Học kỳ Hè 2026');
    return Array.from(sems);
  }, [courses]);

  // Filter and Sort Courses
  const filteredAndSortedCourses = useMemo(() => {
    return courses
      .filter(c => {
        // Status filter
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;

        // Semester filter
        if (semesterFilter !== 'all' && (c.semester || 'Học kỳ 1 - 2026-2027') !== semesterFilter) {
          return false;
        }

        // Search query (code, title, instructor)
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const matchCode = c.code.toLowerCase().includes(q);
          const matchTitle = c.title.toLowerCase().includes(q);
          const matchInstructor = (c.instructor || '').toLowerCase().includes(q);
          if (!matchCode && !matchTitle && !matchInstructor) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'progress_desc') return b.progress - a.progress;
        if (sortBy === 'progress_asc') return a.progress - b.progress;
        if (sortBy === 'credits_desc') return (b.credits || 3) - (a.credits || 3);
        if (sortBy === 'name_asc') return a.title.localeCompare(b.title, 'vi');
        if (sortBy === 'name_desc') return b.title.localeCompare(a.title, 'vi');
        // newest
        return new Date(b.createdAt || '2026-01-01').getTime() - new Date(a.createdAt || '2026-01-01').getTime();
      });
  }, [courses, statusFilter, semesterFilter, searchTerm, sortBy]);

  // Quick increment/decrement completed lessons
  const handleLessonChange = async (course: Course, delta: number) => {
    const nextCompleted = Math.max(0, Math.min(course.totalLessons, course.completedLessons + delta));
    const nextProgress = course.totalLessons > 0 ? Math.round((nextCompleted / course.totalLessons) * 100) : 0;
    const isFinished = nextCompleted >= course.totalLessons;

    await onUpdateCourse(course.id, {
      completedLessons: nextCompleted,
      progress: nextProgress,
      status: isFinished ? 'completed' : 'in_progress'
    });

    // Update opened detail modal if matching
    if (detailedCourse && detailedCourse.id === course.id) {
      setDetailedCourse({
        ...detailedCourse,
        completedLessons: nextCompleted,
        progress: nextProgress,
        status: isFinished ? 'completed' : 'in_progress'
      });
    }
  };

  const handleNavigate = (tab: ActiveTab, context?: { courseId?: string; courseCode?: string; aiPrompt?: string }) => {
    if (onNavigateToTab) {
      onNavigateToTab(tab, context);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Quản Lý Môn Học & Học Phần
          </h1>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            Theo dõi đề cương, bài giảng, số tín chỉ và điểm mục tiêu trong từng học kỳ
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Môn Học Mới</span>
        </button>
      </div>

      {/* 2. Top Metrics Overview Strip */}
      <CourseMetricsStrip
        courses={courses}
        selectedSemester={semesterFilter}
      />

      {/* 3. Search, Filter, and Sort Bar */}
      <div className={`p-4 rounded-2xl border space-y-3.5 ${
        isDark ? 'bg-neutral-900/70 border-neutral-800' : 'bg-white border-slate-200/90 shadow-xs'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className={`absolute left-3.5 top-2.5 w-4 h-4 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã môn (ARC-301), tên môn hoặc giảng viên..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark
                  ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 p-0.5 rounded-full hover:bg-neutral-800 text-neutral-400 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Semester Filter */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={semesterFilter}
                onChange={e => setSemesterFilter(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="all">Tất cả học kỳ / Niên khóa</option>
                {availableSemesters.map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="newest">Sắp xếp: Mới nhất</option>
                <option value="progress_desc">Tiến độ: Cao nhất → Thấp nhất</option>
                <option value="progress_asc">Tiến độ: Thấp nhất → Cao nhất</option>
                <option value="credits_desc">Số tín chỉ: Nhiều nhất</option>
                <option value="name_asc">Tên môn: A → Z</option>
                <option value="name_desc">Tên môn: Z → A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs & Results Count */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-neutral-200 dark:border-neutral-800">
          <div className={`inline-flex p-1 rounded-xl border text-xs font-medium ${
            isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {[
              { id: 'all', label: 'Tất Cả', count: courses.length },
              { id: 'in_progress', label: 'Đang Học', count: courses.filter(c => c.status === 'in_progress').length },
              { id: 'completed', label: 'Đã Hoàn Thành', count: courses.filter(c => c.status === 'completed').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? isDark
                      ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                      : 'bg-white text-indigo-700 font-semibold shadow-xs'
                    : isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  statusFilter === tab.id
                    ? 'bg-indigo-500 text-white'
                    : isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            Hiển thị <strong>{filteredAndSortedCourses.length}</strong> môn học phù hợp
          </div>
        </div>
      </div>

      {/* 4. Courses Grid */}
      {filteredAndSortedCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSortedCourses.map(course => {
            const isCompleted = course.status === 'completed';
            const credits = course.credits || 3;
            const hasSchedule = Boolean(course.schedule);
            const hasRoom = Boolean(course.room);

            return (
              <div
                key={course.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between group ${
                  isDark
                    ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/80'
                    : 'bg-white border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {/* Top Card Info */}
                <div>
                  {/* Metadata Row: Code, Credits, Status */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded-lg border ${
                        isDark
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {course.code}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg border ${
                        isDark
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {credits} TC
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
                      }`}>
                        {isCompleted ? 'Đã Hoàn Thành' : 'Đang Học'}
                      </span>
                      {course.semester && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border hidden sm:inline-block ${
                          isDark ? 'border-neutral-800 text-neutral-400' : 'border-slate-200 text-slate-500'
                        }`}>
                          {course.semester.split(' - ')[0] || course.semester}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Course Title */}
                  <h3
                    onClick={() => setDetailedCourse(course)}
                    className={`font-bold text-sm sm:text-base mb-1 cursor-pointer transition-colors hover:text-indigo-500 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {course.title}
                  </h3>

                  {/* Instructor */}
                  <p className={`text-xs mb-2.5 flex items-center gap-1.5 ${
                    isDark ? 'text-neutral-400' : 'text-slate-500'
                  }`}>
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Giảng viên: <strong>{course.instructor || 'Chưa phân công'}</strong></span>
                  </p>

                  {/* Schedule & Location Line with direct link to Timetable */}
                  {(hasSchedule || hasRoom) && (
                    <div
                      onClick={() => onNavigateToTab?.('timetable', { courseId: course.id, courseCode: course.code })}
                      title="Bấm để xem lịch học trên Thời Khóa Biểu"
                      className={`p-2.5 rounded-xl text-xs mb-3 flex items-center justify-between gap-2 border transition-all cursor-pointer group ${
                        isDark 
                          ? 'bg-neutral-950/60 border-neutral-800/80 text-neutral-300 hover:border-indigo-500/50 hover:bg-neutral-900/60' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <div className="truncate">
                          {hasSchedule && <span className="font-semibold">{course.schedule}</span>}
                          {hasSchedule && hasRoom && <span className="mx-1.5 opacity-50">•</span>}
                          {hasRoom && <span className="font-medium">{course.room}</span>}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0 opacity-80 group-hover:opacity-100 flex items-center gap-0.5">
                        Xem TKB →
                      </span>
                    </div>
                  )}

                  {/* Course Description */}
                  {course.description && (
                    <p className={`text-xs line-clamp-2 mb-3.5 leading-relaxed ${isDark ? 'text-neutral-300' : 'text-slate-600'}`}>
                      {course.description}
                    </p>
                  )}
                </div>

                {/* Bottom Section: Progress & Actions */}
                <div className="space-y-3 pt-2">
                  {/* Progress Bar with Quick Controls */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs items-center">
                      <button
                        onClick={() => setDirectLessonCourse(course)}
                        className={`hover:underline cursor-pointer font-medium text-left ${
                          isDark ? 'text-neutral-400 hover:text-indigo-400' : 'text-slate-600 hover:text-indigo-600'
                        }`}
                        title="Bấm để nhập trực tiếp số bài đã học"
                      >
                        Tiến độ: <strong>{course.completedLessons}/{course.totalLessons} bài</strong>
                      </button>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {course.progress}%
                      </span>
                    </div>

                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`}>
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>

                    {/* Quick Granular Progress Buttons */}
                    <div className="flex justify-between text-[11px] items-center pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleLessonChange(course, -1)}
                          disabled={course.completedLessons <= 0}
                          className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                            isDark
                              ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-300'
                              : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                          }`}
                          title="Giảm 1 bài học nếu bấm nhầm"
                        >
                          - 1 bài
                        </button>
                        <button
                          onClick={() => handleLessonChange(course, 1)}
                          disabled={course.completedLessons >= course.totalLessons}
                          className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                            isDark
                              ? 'border-indigo-800/60 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20'
                              : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                          }`}
                          title="Hoàn thành thêm 1 bài học"
                        >
                          + 1 bài
                        </button>
                      </div>

                      {course.completedLessons >= course.totalLessons ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold text-[10px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã xong</span>
                        </span>
                      ) : (
                        <span className={`text-[10px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                          Còn {Math.max(0, course.totalLessons - course.completedLessons)} bài
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Action Buttons: View Details, Edit, Delete */}
                  <div className={`flex items-center justify-between pt-3 border-t ${
                    isDark ? 'border-neutral-800' : 'border-slate-100'
                  }`}>
                    <button
                      onClick={() => setDetailedCourse(course)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Xem Chi Tiết</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingCourse(course)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isDark
                            ? 'text-neutral-400 hover:text-indigo-300 hover:bg-neutral-800'
                            : 'text-slate-500 hover:text-indigo-700 hover:bg-slate-100'
                        }`}
                        title="Chỉnh sửa thông tin môn học"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteCourse(course.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isDark
                            ? 'text-neutral-400 hover:text-rose-400 hover:bg-neutral-800'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                        }`}
                        title="Xoá môn học này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className={`p-12 text-center rounded-2xl border border-dashed ${
          isDark ? 'border-neutral-800 text-neutral-400' : 'border-slate-300 text-slate-500'
        }`}>
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40 text-indigo-500" />
          <h3 className="text-base font-bold mb-1">Không tìm thấy môn học nào</h3>
          <p className="text-xs max-w-sm mx-auto mb-4">
            Không có môn học nào khớp với điều kiện tìm kiếm hoặc bộ lọc hiện tại. Thử thay đổi từ khóa hoặc chọn học kỳ khác.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setSemesterFilter('all');
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}

      {/* MODAL 1: Create New Course Modal */}
      <CourseFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (data) => {
          await onCreateCourse(data);
        }}
      />

      {/* MODAL 2: Edit Existing Course Modal */}
      {editingCourse && (
        <CourseFormModal
          initialCourse={editingCourse}
          isOpen={Boolean(editingCourse)}
          onClose={() => setEditingCourse(null)}
          onSubmit={async (data) => {
            await onUpdateCourse(editingCourse.id, data);
            setEditingCourse(null);
          }}
        />
      )}

      {/* MODAL 3: Comprehensive Course Detail Modal */}
      {detailedCourse && (
        <CourseDetailModal
          course={detailedCourse}
          isOpen={Boolean(detailedCourse)}
          onClose={() => setDetailedCourse(null)}
          onUpdateCourse={async (id, data) => {
            await onUpdateCourse(id, data);
            // Refresh detailed course state
            setDetailedCourse(prev => prev ? { ...prev, ...data } : null);
          }}
          onEditCourse={(c) => {
            setDetailedCourse(null);
            setEditingCourse(c);
          }}
          onNavigateToTab={handleNavigate}
        />
      )}

      {/* MODAL 4: Direct Lesson Input Modal */}
      {directLessonCourse && (
        <CourseDirectLessonModal
          course={directLessonCourse}
          onClose={() => setDirectLessonCourse(null)}
          onUpdate={async (completedLessons) => {
            const nextProgress = directLessonCourse.totalLessons > 0
              ? Math.round((completedLessons / directLessonCourse.totalLessons) * 100)
              : 0;
            const isFinished = completedLessons >= directLessonCourse.totalLessons;
            await onUpdateCourse(directLessonCourse.id, {
              completedLessons,
              progress: nextProgress,
              status: isFinished ? 'completed' : 'in_progress'
            });
          }}
        />
      )}
    </div>
  );
}
