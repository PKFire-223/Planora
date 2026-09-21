import { useState, useEffect } from 'react';
import { X, BookOpen, GraduationCap, Calendar, Clock, Award } from 'lucide-react';
import { Course } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface CourseFormModalProps {
  initialCourse?: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Course>) => Promise<void>;
}

const COLOR_OPTIONS = [
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-600' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-600' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-600' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-600' },
  { id: 'sky', label: 'Sky', bg: 'bg-sky-600' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-600' }
];

const SEMESTER_OPTIONS = [
  'Học kỳ 1 - 2026-2027',
  'Học kỳ 2 - 2026-2027',
  'Học kỳ Hè 2026',
  'Học kỳ 1 - 2025-2026',
  'Học kỳ 2 - 2025-2026'
];

export function CourseFormModal({
  initialCourse,
  isOpen,
  onClose,
  onSubmit
}: CourseFormModalProps) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    credits: 3,
    semester: 'Học kỳ 1 - 2026-2027',
    instructor: '',
    schedule: '',
    room: '',
    targetGrade: 'A',
    currentGrade: '',
    midtermWeight: 30,
    finalWeight: 50,
    attendanceWeight: 20,
    totalLessons: 15,
    description: '',
    color: 'indigo'
  });

  useEffect(() => {
    if (initialCourse) {
      const attWeight = initialCourse.evaluationWeights?.find(w => w.label.toLowerCase().includes('chuyên cần') || w.label.toLowerCase().includes('lab'))?.weight ?? 20;
      const midWeight = initialCourse.evaluationWeights?.find(w => w.label.toLowerCase().includes('giữa kỳ'))?.weight ?? 30;
      const finWeight = initialCourse.evaluationWeights?.find(w => w.label.toLowerCase().includes('cuối kỳ'))?.weight ?? 50;

      setFormData({
        title: initialCourse.title,
        code: initialCourse.code,
        credits: initialCourse.credits || 3,
        semester: initialCourse.semester || 'Học kỳ 1 - 2026-2027',
        instructor: initialCourse.instructor || '',
        schedule: initialCourse.schedule || '',
        room: initialCourse.room || '',
        targetGrade: initialCourse.targetGrade || 'A',
        currentGrade: initialCourse.currentGrade !== undefined ? String(initialCourse.currentGrade) : '',
        attendanceWeight: attWeight,
        midtermWeight: midWeight,
        finalWeight: finWeight,
        totalLessons: initialCourse.totalLessons || 15,
        description: initialCourse.description || '',
        color: initialCourse.color || 'indigo'
      });
    } else {
      setFormData({
        title: '',
        code: '',
        credits: 3,
        semester: 'Học kỳ 1 - 2026-2027',
        instructor: '',
        schedule: 'Thứ 2 (07:30 - 09:30)',
        room: 'Phòng B1-405',
        targetGrade: 'A',
        currentGrade: '',
        midtermWeight: 30,
        finalWeight: 50,
        attendanceWeight: 20,
        totalLessons: 15,
        description: '',
        color: 'indigo'
      });
    }
  }, [initialCourse, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.code) return;

    setLoading(true);
    try {
      const evaluationWeights = [
        { label: 'Chuyên cần & Lab', weight: Number(formData.attendanceWeight) || 20 },
        { label: 'Giữa kỳ', weight: Number(formData.midtermWeight) || 30 },
        { label: 'Cuối kỳ', weight: Number(formData.finalWeight) || 50 }
      ];

      await onSubmit({
        title: formData.title,
        code: formData.code.toUpperCase().trim(),
        credits: Number(formData.credits) || 3,
        semester: formData.semester,
        instructor: formData.instructor.trim() || 'Chưa phân công',
        schedule: formData.schedule.trim(),
        room: formData.room.trim(),
        targetGrade: formData.targetGrade,
        currentGrade: formData.currentGrade ? Number(formData.currentGrade) : undefined,
        evaluationWeights,
        totalLessons: Math.max(1, Number(formData.totalLessons) || 12),
        description: formData.description.trim(),
        color: formData.color
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className={`w-full max-w-2xl rounded-2xl p-5 sm:p-6 shadow-2xl border transition-all my-6 ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {initialCourse ? 'Chỉnh Sửa Thông Tin Môn Học' : 'Thêm Môn Học Mới Vào Planora'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                {initialCourse ? `Cập nhật thông tin học vụ cho môn ${initialCourse.code}` : 'Điền đầy đủ thông tin để quản lý tiến độ và thời khóa biểu hiệu quả'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1: Code, Title, Credits */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-3">
              <label className={`block font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                Mã môn *
              </label>
              <input
                type="text"
                required
                placeholder="ARC-301"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className="sm:col-span-6">
              <label className={`block font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                Tên môn học *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Kiến Trúc Microservices & Node.js"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className="sm:col-span-3">
              <label className={`block font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                Số tín chỉ *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={formData.credits}
                  onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })}
                  className={`w-full pl-3 pr-8 py-2 rounded-xl border font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
                <span className={`absolute right-2.5 top-2 text-[10px] font-bold ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  TC
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Semester & Instructor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                Học kỳ / Niên khóa
              </label>
              <select
                value={formData.semester}
                onChange={e => setFormData({ ...formData, semester: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                {SEMESTER_OPTIONS.map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                Giảng viên phụ trách
              </label>
              <input
                type="text"
                placeholder="TS. Nguyễn Văn A hoặc ThS. Lê B"
                value={formData.instructor}
                onChange={e => setFormData({ ...formData, instructor: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Row 3: Schedule & Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block font-medium mb-1 flex items-center gap-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                <Clock className="w-3 h-3 text-indigo-500" />
                <span>Lịch học (Thứ & Tiết)</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Thứ 2 (07:30 - 09:30)"
                value={formData.schedule}
                onChange={e => setFormData({ ...formData, schedule: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block font-medium mb-1 flex items-center gap-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                <Calendar className="w-3 h-3 text-indigo-500" />
                <span>Địa điểm / Phòng học</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Phòng B1-405 hoặc Online qua LMS"
                value={formData.room}
                onChange={e => setFormData({ ...formData, room: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Row 4: Target Grade, Current Grade, Total Lessons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`block font-medium mb-1 flex items-center gap-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                <Award className="w-3 h-3 text-amber-500" />
                <span>Điểm mục tiêu (Target)</span>
              </label>
              <select
                value={formData.targetGrade}
                onChange={e => setFormData({ ...formData, targetGrade: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                {['A+', 'A', 'B+', 'B', 'C+', 'C', '10', '9.0', '8.5', '8.0'].map(g => (
                  <option key={g} value={g}>Mục tiêu: {g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                Điểm quá trình (nếu có)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="Ví dụ: 8.5"
                value={formData.currentGrade}
                onChange={e => setFormData({ ...formData, currentGrade: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                Tổng số bài giảng
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.totalLessons}
                onChange={e => setFormData({ ...formData, totalLessons: Number(e.target.value) })}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Row 5: Evaluation Weights */}
          <div>
            <label className={`block font-medium mb-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
              Trọng số đánh giá kết quả (%):
            </label>
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl border border-dashed border-neutral-700/60 bg-neutral-500/5">
              <div>
                <span className={`block text-[10px] mb-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>Chuyên cần & Lab (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.attendanceWeight}
                  onChange={e => setFormData({ ...formData, attendanceWeight: Number(e.target.value) })}
                  className={`w-full px-2.5 py-1.5 text-xs rounded-lg border text-center font-semibold ${
                    isDark ? 'bg-neutral-950 border-neutral-700' : 'bg-white border-slate-200'
                  }`}
                />
              </div>
              <div>
                <span className={`block text-[10px] mb-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>Giữa kỳ (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.midtermWeight}
                  onChange={e => setFormData({ ...formData, midtermWeight: Number(e.target.value) })}
                  className={`w-full px-2.5 py-1.5 text-xs rounded-lg border text-center font-semibold ${
                    isDark ? 'bg-neutral-950 border-neutral-700' : 'bg-white border-slate-200'
                  }`}
                />
              </div>
              <div>
                <span className={`block text-[10px] mb-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>Cuối kỳ (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.finalWeight}
                  onChange={e => setFormData({ ...formData, finalWeight: Number(e.target.value) })}
                  className={`w-full px-2.5 py-1.5 text-xs rounded-lg border text-center font-semibold ${
                    isDark ? 'bg-neutral-950 border-neutral-700' : 'bg-white border-slate-200'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Row 6: Description */}
          <div>
            <label className={`block font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
              Mô tả môn học
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mục tiêu kiến thức, tài liệu tham khảo, ghi chú quan trọng..."
              className={`w-full px-3 py-2 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          {/* Row 7: Color Selection */}
          <div>
            <label className={`block font-medium mb-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
              Màu sắc phân biệt
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c.id })}
                  className={`w-7 h-7 rounded-xl ${c.bg} transition-all cursor-pointer flex items-center justify-center ${
                    formData.color === c.id ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl cursor-pointer ${
                isDark ? 'text-neutral-400 hover:bg-neutral-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : initialCourse ? 'Cập Nhật Môn Học' : 'Thêm Môn Học'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
