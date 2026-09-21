import { useState } from 'react';
import {
  X,
  BookOpen,
  GraduationCap,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  Circle,
  FileText,
  FileCode,
  Link2,
  Download,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { Course, CourseLesson, CourseMaterial } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface CourseDetailModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCourse: (id: string, data: Partial<Course>) => Promise<void>;
  onEditCourse: (course: Course) => void;
  onNavigateToTab: (tab: any, context?: { courseId?: string; courseCode?: string; aiPrompt?: string }) => void;
}

export function CourseDetailModal({
  course,
  isOpen,
  onClose,
  onUpdateCourse,
  onEditCourse,
  onNavigateToTab
}: CourseDetailModalProps) {
  const { isDark } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState<'syllabus' | 'lessons' | 'materials' | 'grades'>('lessons');

  // New lesson form state
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('45 phút');
  const [isAddingLesson, setIsAddingLesson] = useState(false);

  // New material form state
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [materialForm, setMaterialForm] = useState<{
    name: string;
    type: 'slide' | 'pdf' | 'link' | 'code';
    url: string;
    size: string;
  }>({
    name: '',
    type: 'slide',
    url: '',
    size: '2.5 MB'
  });

  // AI quick ask state
  const [customAiQuestion, setCustomAiQuestion] = useState('');

  if (!isOpen) return null;

  const currentLessons: CourseLesson[] = course.lessons && course.lessons.length > 0
    ? course.lessons
    : Array.from({ length: course.totalLessons }).map((_, idx) => ({
        id: `gen-l-${idx + 1}`,
        title: `Bài ${String(idx + 1).padStart(2, '0')}: Nội dung chuyên đề ${idx + 1}`,
        completed: idx < course.completedLessons,
        duration: '45 phút'
      }));

  const materials: CourseMaterial[] = course.materials || [];

  // Toggle single lesson completion
  const handleToggleLesson = async (lessonId: string) => {
    const updatedLessons = currentLessons.map(l =>
      l.id === lessonId ? { ...l, completed: !l.completed } : l
    );
    const newCompletedCount = updatedLessons.filter(l => l.completed).length;
    const newProgress = Math.min(100, Math.round((newCompletedCount / course.totalLessons) * 100));

    await onUpdateCourse(course.id, {
      lessons: updatedLessons,
      completedLessons: newCompletedCount,
      progress: newProgress,
      status: newCompletedCount >= course.totalLessons ? 'completed' : 'in_progress'
    });
  };

  // Add new lesson
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;

    const newLesson: CourseLesson = {
      id: `lesson-${Date.now()}`,
      title: newLessonTitle.trim(),
      completed: false,
      duration: newLessonDuration.trim() || '45 phút'
    };

    const updatedLessons = [...currentLessons, newLesson];
    const newTotal = updatedLessons.length;
    const completedCount = updatedLessons.filter(l => l.completed).length;
    const newProgress = Math.min(100, Math.round((completedCount / newTotal) * 100));

    await onUpdateCourse(course.id, {
      lessons: updatedLessons,
      totalLessons: newTotal,
      progress: newProgress
    });

    setNewLessonTitle('');
    setIsAddingLesson(false);
  };

  // Add new material
  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.name.trim()) return;

    const newMat: CourseMaterial = {
      id: `mat-${Date.now()}`,
      name: materialForm.name.trim(),
      type: materialForm.type,
      url: materialForm.url.trim() || undefined,
      size: materialForm.type === 'link' ? undefined : materialForm.size.trim()
    };

    const updatedMaterials = [...materials, newMat];
    await onUpdateCourse(course.id, { materials: updatedMaterials });

    setMaterialForm({ name: '', type: 'slide', url: '', size: '2.5 MB' });
    setIsAddingMaterial(false);
  };

  // Delete material
  const handleDeleteMaterial = async (matId: string) => {
    const updatedMaterials = materials.filter(m => m.id !== matId);
    await onUpdateCourse(course.id, { materials: updatedMaterials });
  };

  const handleQuickAskAi = (prompt: string) => {
    onClose();
    onNavigateToTab('ai', {
      courseCode: course.code,
      aiPrompt: prompt
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border transition-all my-4 ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header Strip */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {course.code}
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {course.credits || 3} Tín chỉ
              </span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-lg ${
                course.status === 'completed'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
              }`}>
                {course.status === 'completed' ? 'Đã hoàn thành' : 'Đang học'}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-lg border ${
                isDark ? 'border-neutral-800 text-neutral-400' : 'border-slate-200 text-slate-500'
              }`}>
                {course.semester || 'Học kỳ 1 - 2026-2027'}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-1">{course.title}</h2>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                {course.instructor || 'Chưa phân công'}
              </span>
              {course.schedule && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  {course.schedule}
                </span>
              )}
              {course.room && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  {course.room}
                </span>
              )}
              <span className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                <Award className="w-3.5 h-3.5" />
                Mục tiêu: {course.targetGrade || 'A'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onClose();
                onEditCourse(course);
              }}
              title="Chỉnh sửa môn học"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-300'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Progress & Cross Links Bar */}
        <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDark ? 'bg-neutral-950/40 border-neutral-800' : 'bg-slate-50/60 border-slate-200'
        }`}>
          {/* Progress Mini Bar */}
          <div className="flex items-center gap-3 min-w-[200px] flex-1">
            <div className="flex-1">
              <div className="flex justify-between text-[11px] font-medium mb-1">
                <span className={isDark ? 'text-neutral-400' : 'text-slate-600'}>
                  Tiến độ: {course.completedLessons}/{course.totalLessons} bài
                </span>
                <span className="font-bold text-indigo-500">{course.progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cross Module Links */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => {
                onClose();
                onNavigateToTab('timetable');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-200'
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Thời Khóa Biểu</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigateToTab('tasks', { courseId: course.id, courseCode: course.code });
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-200'
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Tasks & Deadline</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigateToTab('notes', { courseCode: course.code });
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-200'
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>Ghi Chú Môn</span>
            </button>
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center px-5 border-b border-neutral-200 dark:border-neutral-800 gap-6 text-xs font-semibold">
          {[
            { id: 'lessons', label: `Bài Giảng & Checklist (${currentLessons.length})` },
            { id: 'syllabus', label: `Đề Cương Chi Tiết (${course.syllabus?.length || 0})` },
            { id: 'materials', label: `Kho Tài Liệu & Slide (${materials.length})` },
            { id: 'grades', label: 'Điểm Số & Trọng Số' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeSubTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sub-Tab Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: LESSONS CHECKLIST */}
          {activeSubTab === 'lessons' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                  Đánh dấu checkbox khi hoàn thành mỗi bài giảng. Tiến độ môn học sẽ tự động được cập nhật.
                </p>
                <button
                  onClick={() => setIsAddingLesson(!isAddingLesson)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm bài giảng</span>
                </button>
              </div>

              {/* Add lesson form */}
              {isAddingLesson && (
                <form onSubmit={handleAddLesson} className={`p-3.5 rounded-xl border ${
                  isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <input
                      type="text"
                      required
                      placeholder="Tiêu đề bài giảng (VD: Bài 09: Thiết kế Cache với Redis)"
                      value={newLessonTitle}
                      onChange={e => setNewLessonTitle(e.target.value)}
                      className={`sm:col-span-8 px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Thời lượng (VD: 60 phút)"
                      value={newLessonDuration}
                      onChange={e => setNewLessonDuration(e.target.value)}
                      className={`sm:col-span-2 px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    <div className="sm:col-span-2 flex items-center gap-1.5">
                      <button
                        type="submit"
                        className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingLesson(false)}
                        className={`px-2.5 py-1.5 text-xs rounded-lg border cursor-pointer ${
                          isDark ? 'border-neutral-700 text-neutral-400' : 'border-slate-200 text-slate-500'
                        }`}
                      >
                        Huỷ
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Lesson Items List */}
              <div className="space-y-2">
                {currentLessons.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    onClick={() => handleToggleLesson(lesson.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      lesson.completed
                        ? isDark
                          ? 'bg-neutral-900/40 border-neutral-800/60 opacity-85'
                          : 'bg-slate-50/80 border-slate-200/80'
                        : isDark
                          ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {lesson.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className={`w-5 h-5 shrink-0 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`} />
                      )}
                      <div>
                        <div className={`text-xs font-semibold ${
                          lesson.completed
                            ? 'line-through text-neutral-400 dark:text-neutral-500'
                            : isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {lesson.title}
                        </div>
                        {lesson.duration && (
                          <div className={`text-[11px] ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                            Thời lượng: {lesson.duration}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      lesson.completed
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {lesson.completed ? 'Đã hoàn thành' : 'Chưa học'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SYLLABUS OUTLINE */}
          {activeSubTab === 'syllabus' && (
            <div className="space-y-4">
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                Lộ trình đề cương giảng dạy các tuần / chương của môn học:
              </p>

              {course.syllabus && course.syllabus.length > 0 ? (
                <div className="relative pl-6 border-l-2 border-indigo-500/30 space-y-4 my-2">
                  {course.syllabus.map((item) => (
                    <div key={item.week} className="relative group">
                      <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 ${
                        item.completed
                          ? 'bg-emerald-500 border-white dark:border-neutral-900'
                          : 'bg-indigo-500 border-white dark:border-neutral-900'
                      }`} />
                      <div className={`p-3.5 rounded-xl border ${
                        isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-indigo-500">Tuần {item.week}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            item.completed
                              ? 'bg-emerald-500/10 text-emerald-500 font-medium'
                              : isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.completed ? 'Đã học' : 'Kế hoạch'}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold">{item.title}</h4>
                        {item.desc && (
                          <p className={`text-[11px] mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                            {item.desc}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`p-8 text-center rounded-2xl border border-dashed ${
                  isDark ? 'border-neutral-800 text-neutral-500' : 'border-slate-200 text-slate-400'
                }`}>
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-medium">Chưa có đề cương chi tiết cho môn này.</p>
                  <p className="text-[11px] mt-1">Bạn có thể hỏi Trợ lý AI để tự động tạo đề cương học tập chuẩn.</p>
                  <button
                    onClick={() => handleQuickAskAi(`Hãy giúp tôi lập đề cương chi tiết các tuần cho môn học: ${course.code} - ${course.title}`)}
                    className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Hỏi AI tạo đề cương ngay</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MATERIALS & SLIDES */}
          {activeSubTab === 'materials' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                  File bài giảng, slide bài tập, tài liệu giáo trình và đường dẫn hữu ích:
                </p>
                <button
                  onClick={() => setIsAddingMaterial(!isAddingMaterial)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm tài liệu</span>
                </button>
              </div>

              {/* Add material form */}
              {isAddingMaterial && (
                <form onSubmit={handleAddMaterial} className={`p-3.5 rounded-xl border space-y-3 ${
                  isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <input
                      type="text"
                      required
                      placeholder="Tên tài liệu (VD: Slide Tuần 05 - Microservices.pdf)"
                      value={materialForm.name}
                      onChange={e => setMaterialForm({ ...materialForm, name: e.target.value })}
                      className={`sm:col-span-6 px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    <select
                      value={materialForm.type}
                      onChange={e => setMaterialForm({ ...materialForm, type: e.target.value as any })}
                      className={`sm:col-span-3 px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="slide">Slide thuyết trình</option>
                      <option value="pdf">Tài liệu PDF / Sách</option>
                      <option value="code">Mã nguồn / Lab ZIP</option>
                      <option value="link">Liên kết Web / GitHub</option>
                    </select>
                    <input
                      type="text"
                      placeholder={materialForm.type === 'link' ? 'https://...' : 'Dung lượng (VD: 3.5 MB)'}
                      value={materialForm.type === 'link' ? materialForm.url : materialForm.size}
                      onChange={e => {
                        if (materialForm.type === 'link') {
                          setMaterialForm({ ...materialForm, url: e.target.value });
                        } else {
                          setMaterialForm({ ...materialForm, size: e.target.value });
                        }
                      }}
                      className={`sm:col-span-3 px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingMaterial(false)}
                      className={`px-3 py-1 text-xs rounded-lg border cursor-pointer ${
                        isDark ? 'border-neutral-700 text-neutral-400' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      Huỷ
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs"
                    >
                      Lưu tài liệu
                    </button>
                  </div>
                </form>
              )}

              {/* Material list */}
              {materials.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {materials.map(mat => {
                    const isLink = mat.type === 'link';
                    const isCode = mat.type === 'code';
                    const isSlide = mat.type === 'slide';

                    return (
                      <div
                        key={mat.id}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                          isDark
                            ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-xl shrink-0 ${
                            isSlide
                              ? 'bg-amber-500/10 text-amber-500'
                              : isCode
                                ? 'bg-indigo-500/10 text-indigo-500'
                                : isLink
                                  ? 'bg-sky-500/10 text-sky-500'
                                  : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {isLink ? <Link2 className="w-4 h-4" /> : isCode ? <FileCode className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold truncate" title={mat.name}>
                              {mat.name}
                            </h4>
                            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                              {isLink ? 'Liên kết ngoài' : mat.size || 'Tài liệu môn học'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isLink && mat.url ? (
                            <a
                              href={mat.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-500/10 transition-colors"
                              title="Mở liên kết"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <button
                              onClick={() => alert(`Tải tài liệu: ${mat.name}`)}
                              className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                              title="Tải xuống"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMaterial(mat.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Xoá tài liệu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={`p-8 text-center rounded-2xl border border-dashed ${
                  isDark ? 'border-neutral-800 text-neutral-500' : 'border-slate-200 text-slate-400'
                }`}>
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-medium">Chưa có tài liệu hay slide nào được lưu.</p>
                  <p className="text-[11px] mt-1">Bấm "Thêm tài liệu" để đính kèm bài giảng hoặc slide môn học.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: GRADES & EVALUATION */}
          {activeSubTab === 'grades' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200'
                }`}>
                  <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5 text-amber-500">
                    <Award className="w-4 h-4" />
                    <span>Mục Tiêu & Điểm Quá Trình</span>
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-neutral-200 dark:border-neutral-800">
                      <span className={isDark ? 'text-neutral-400' : 'text-slate-600'}>Điểm mục tiêu:</span>
                      <span className="font-bold text-amber-500">{course.targetGrade || 'A'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-neutral-200 dark:border-neutral-800">
                      <span className={isDark ? 'text-neutral-400' : 'text-slate-600'}>Điểm quá trình hiện tại:</span>
                      <span className="font-bold text-indigo-500">
                        {course.currentGrade !== undefined ? `${course.currentGrade} / 10` : 'Chưa nhập'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className={isDark ? 'text-neutral-400' : 'text-slate-600'}>Số tín chỉ:</span>
                      <span className="font-bold">{course.credits || 3} Tín chỉ</span>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200'
                }`}>
                  <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5 text-indigo-500">
                    <BookOpen className="w-4 h-4" />
                    <span>Cơ Cấu Trọng Số Đánh Giá</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    {(course.evaluationWeights && course.evaluationWeights.length > 0
                      ? course.evaluationWeights
                      : [
                          { label: 'Chuyên cần & Lab', weight: 20 },
                          { label: 'Kiểm tra giữa kỳ', weight: 30 },
                          { label: 'Thi kết thúc môn (Cuối kỳ)', weight: 50 }
                        ]
                    ).map((w, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className={isDark ? 'text-neutral-300' : 'text-slate-700'}>{w.label}</span>
                          <span className="font-bold text-indigo-500">{w.weight}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${w.weight}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Context Assistant Box at Bottom of Modal */}
          <div className={`mt-6 p-4 rounded-2xl border ${
            isDark ? 'bg-indigo-950/20 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-100'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Hỏi Planora AI về môn {course.code}
              </h4>
            </div>
            <p className={`text-[11px] mb-3 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
              Trợ lý AI nắm vững cấu trúc và tài liệu môn học này. Hãy chọn câu hỏi nhanh hoặc nhập câu hỏi cụ thể:
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {[
                `Chiến lược ôn tập để đạt điểm ${course.targetGrade || 'A'} môn ${course.code}`,
                `Tóm tắt kiến thức trọng tâm các bài học môn ${course.code}`,
                `Gợi ý các bài tập thực hành nâng cao cho môn ${course.title}`
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAskAi(q)}
                  className={`text-[11px] px-2.5 py-1.5 rounded-xl border text-left transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isDark
                      ? 'bg-neutral-900 border-indigo-500/30 text-indigo-300 hover:bg-neutral-800'
                      : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  <ArrowRight className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span>{q}</span>
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!customAiQuestion.trim()) return;
                handleQuickAskAi(`Về môn học ${course.code} - ${course.title}: ${customAiQuestion.trim()}`);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={`Đặt câu hỏi cụ thể về môn ${course.code}...`}
                value={customAiQuestion}
                onChange={e => setCustomAiQuestion(e.target.value)}
                className={`flex-1 px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gửi câu hỏi</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
