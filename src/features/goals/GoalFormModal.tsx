import { useState, useEffect } from 'react';
import { X, Target, Sparkles, Calendar, Clock, Layers, Award, FileText } from 'lucide-react';
import { Goal } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Goal>) => Promise<void>;
  initialGoal?: Goal | null;
}

const CATEGORY_OPTIONS = [
  'Học tập',
  'Thuật toán & Kỹ năng',
  'Dự án',
  'Kỷ luật & Tập trung',
  'Chứng chỉ & Ngoại ngữ',
  'Khác'
];

const UNIT_PRESETS = ['giờ', 'bài tập', 'khoá', 'môn', 'chương', 'dự án', 'trang sách'];

const GOAL_TEMPLATES = [
  {
    title: 'Hoàn thành 50 giờ tự học Pomodoro trong tháng',
    targetValue: 50,
    unit: 'giờ',
    category: 'Kỷ luật & Tập trung',
    priority: 'high' as const,
    description: 'Dành tối thiểu 2 giờ tự học tập trung mỗi ngày, bật chế độ không làm phiền và ghi chép sau mỗi phiên học.'
  },
  {
    title: 'Giải quyết 40 bài tập thuật toán DSA',
    targetValue: 40,
    unit: 'bài tập',
    category: 'Thuật toán & Kỹ năng',
    priority: 'high' as const,
    description: 'Luyện các bài toán LeetCode / HackerRank về Đồ thị, Cây nhị phân và Quy hoạch động.'
  },
  {
    title: 'Hoàn thành 2 khoá học kỳ này với điểm A',
    targetValue: 2,
    unit: 'khoá',
    category: 'Học tập',
    priority: 'medium' as const,
    description: 'Hoàn thành đầy đủ bài tập lớn, nộp đúng hạn và ôn thi giữa kỳ, cuối kỳ nghiêm túc.'
  },
  {
    title: 'Xây dựng 1 dự án Fullstack thực chiến đưa lên GitHub',
    targetValue: 1,
    unit: 'dự án',
    category: 'Dự án',
    priority: 'high' as const,
    description: 'Xây dựng ứng dụng hoàn chỉnh từ backend RESTful API đến frontend giao diện responsive và deploy.'
  }
];

export function GoalFormModal({ isOpen, onClose, onSave, initialGoal }: GoalFormModalProps) {
  const { isDark } = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Học tập');
  const [targetValue, setTargetValue] = useState<number>(10);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [unit, setUnit] = useState('giờ');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'active' | 'achieved' | 'missed'>('active');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset or populate fields when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (initialGoal) {
      setTitle(initialGoal.title || '');
      setDescription(initialGoal.description || '');
      setCategory(initialGoal.category || 'Học tập');
      setTargetValue(initialGoal.targetValue || 10);
      setCurrentValue(initialGoal.currentValue || 0);
      setUnit(initialGoal.unit || 'giờ');
      setTargetDate(initialGoal.targetDate || '');
      setPriority(initialGoal.priority || 'medium');
      setStatus(initialGoal.status || 'active');
    } else {
      setTitle('');
      setDescription('');
      setCategory('Học tập');
      setTargetValue(20);
      setCurrentValue(0);
      setUnit('giờ');
      // Default deadline: 30 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      setTargetDate(defaultDate.toISOString().split('T')[0]);
      setPriority('medium');
      setStatus('active');
    }
    setErrorMsg('');
  }, [isOpen, initialGoal]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl: typeof GOAL_TEMPLATES[0]) => {
    setTitle(tmpl.title);
    setTargetValue(tmpl.targetValue);
    setUnit(tmpl.unit);
    setCategory(tmpl.category);
    setPriority(tmpl.priority);
    setDescription(tmpl.description);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên mục tiêu.');
      return;
    }
    if (!targetValue || targetValue <= 0) {
      setErrorMsg('Mục tiêu định lượng phải lớn hơn 0.');
      return;
    }
    if (!targetDate) {
      setErrorMsg('Vui lòng chọn ngày hoàn thành mục tiêu.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        category,
        targetValue: Number(targetValue),
        currentValue: Number(currentValue) || 0,
        unit: unit.trim() || 'đơn vị',
        targetDate,
        priority,
        status: currentValue >= targetValue ? 'achieved' : status
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu mục tiêu.';
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="goal-form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="goal-form-modal-card"
        className={`w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'border-neutral-800 bg-neutral-900/90' : 'border-slate-100 bg-slate-50/70'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {initialGoal ? 'Chỉnh Sửa Mục Tiêu' : 'Tạo Mục Tiêu Học Tập Mới'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                {initialGoal ? 'Cập nhật chỉ tiêu số liệu và thời hạn' : 'Thiết lập chỉ tiêu định lượng rõ ràng để theo dõi tiến độ'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Quick template suggestions for new goals */}
          {!initialGoal && (
            <div className={`p-3.5 rounded-xl border ${
              isDark ? 'bg-indigo-950/20 border-indigo-900/40' : 'bg-indigo-50/70 border-indigo-100'
            }`}>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gợi ý mẫu mục tiêu phổ biến:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {GOAL_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all text-left cursor-pointer ${
                      isDark
                        ? 'bg-neutral-800/80 hover:bg-indigo-900/40 text-neutral-300 border-neutral-700 hover:border-indigo-600'
                        : 'bg-white hover:bg-indigo-50 text-slate-700 border-slate-200 hover:border-indigo-300 shadow-2xs'
                    }`}
                  >
                    + {tmpl.title.split(' ')[0]} {tmpl.title.split(' ')[1]} ({tmpl.targetValue} {tmpl.unit})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
              Tên mục tiêu / Chỉ tiêu <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="VD: Hoàn thành 50 giờ tự học có tập trung trong tháng"
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 transition-all ${
                isDark
                  ? 'bg-neutral-800/80 border-neutral-700 text-white placeholder-neutral-500'
                  : 'bg-slate-50/50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Danh mục</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-white'
                    : 'bg-slate-50/50 border-slate-200 text-slate-900'
                }`}
              >
                {CATEGORY_OPTIONS.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Mức độ ưu tiên</span>
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-white'
                    : 'bg-slate-50/50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="high">🔥 Ưu tiên cao</option>
                <option value="medium">⚡ Ưu tiên trung bình</option>
                <option value="low">🌱 Tiêu chuẩn / Thấp</option>
              </select>
            </div>
          </div>

          {/* Quantitative Target & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                <Target className="w-3.5 h-3.5 text-emerald-500" />
                <span>Mục tiêu định lượng <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={targetValue}
                onChange={e => setTargetValue(Number(e.target.value))}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 transition-all ${
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-white'
                    : 'bg-slate-50/50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span>Đã đạt hiện tại</span>
              </label>
              <input
                type="number"
                min="0"
                value={currentValue}
                onChange={e => setCurrentValue(Number(e.target.value))}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border focus:outline-hidden focus:ring-2 focus:ring-sky-500/30 transition-all ${
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-white'
                    : 'bg-slate-50/50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                Đơn vị tính
              </label>
              <input
                type="text"
                required
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="VD: giờ, bài tập"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 transition-all ${
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-white'
                    : 'bg-slate-50/50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Unit preset chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400">Chọn nhanh đơn vị:</span>
            {UNIT_PRESETS.map(u => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                  unit.toLowerCase() === u.toLowerCase()
                    ? 'bg-indigo-600 text-white'
                    : isDark
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {u}
              </button>
            ))}
          </div>

          {/* Target Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>Hạn chót hoàn thành <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-white'
                    : 'bg-slate-50/50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                Trạng thái mục tiêu
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as 'active' | 'achieved' | 'missed')}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-white'
                    : 'bg-slate-50/50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="active">🏃 Đang thực hiện</option>
                <option value="achieved">🏆 Đã đạt mục tiêu</option>
                <option value="missed">⏳ Tạm hoãn / Chưa đạt</option>
              </select>
            </div>
          </div>

          {/* Description & Plan */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              <span>Mô tả chiến lược & Ghi chú hành động</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="VD: Phân chia 2 tiếng mỗi tối, sử dụng kĩ thuật Feynman giải thích lại cho bạn học..."
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 transition-all resize-none ${
                isDark
                  ? 'bg-neutral-800/80 border-neutral-700 text-white placeholder-neutral-500'
                  : 'bg-slate-50/50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Modal Footer */}
          <div
            className={`pt-4 border-t flex items-center justify-end gap-3 ${
              isDark ? 'border-neutral-800' : 'border-slate-100'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                isDark ? 'text-neutral-300 hover:bg-neutral-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Huỷ bỏ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  <span>{initialGoal ? 'Cập nhật mục tiêu' : 'Thiết lập mục tiêu'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
