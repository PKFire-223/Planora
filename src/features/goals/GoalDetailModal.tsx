import { useState } from 'react';
import {
  X,
  Target,
  Calendar,
  Award,
  Layers,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Plus,
  Minus,
  AlertCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { Goal } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface GoalDetailModalProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => Promise<void>;
  onUpdateProgress: (id: string, params: { increment?: number; currentValue?: number }) => Promise<void>;
}

export function GoalDetailModal({
  goal,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onUpdateProgress
}: GoalDetailModalProps) {
  const { isDark } = useTheme();

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [customValueInput, setCustomValueInput] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen || !goal) return null;

  const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  const isAchieved = goal.status === 'achieved' || percent >= 100;
  const remaining = Math.max(0, goal.targetValue - goal.currentValue);

  // Calculate days remaining
  const targetDateObj = new Date(goal.targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = targetDateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let deadlineLabel = '';
  let deadlineColor = '';
  if (diffDays < 0) {
    deadlineLabel = `Quá hạn ${Math.abs(diffDays)} ngày`;
    deadlineColor = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  } else if (diffDays === 0) {
    deadlineLabel = 'Hạn chót là hôm nay';
    deadlineColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  } else {
    deadlineLabel = `Còn ${diffDays} ngày nữa`;
    deadlineColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  }

  const handleIncrement = async (amount: number) => {
    setIsUpdating(true);
    try {
      await onUpdateProgress(goal.id, { increment: amount });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSetExactValue = async () => {
    const val = Number(customValueInput);
    if (isNaN(val) || val < 0) return;
    setIsUpdating(true);
    try {
      await onUpdateProgress(goal.id, { currentValue: val });
      setShowCustomInput(false);
      setCustomValueInput('');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkComplete = async () => {
    setIsUpdating(true);
    try {
      await onUpdateProgress(goal.id, { currentValue: goal.targetValue });
    } finally {
      setIsUpdating(false);
    }
  };

  const priorityColors = {
    high: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
    medium: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
    low: 'text-sky-600 bg-sky-500/10 border-sky-500/20'
  };

  const priorityLabels = {
    high: 'Ưu tiên cao',
    medium: 'Ưu tiên trung bình',
    low: 'Tiêu chuẩn'
  };

  return (
    <div
      id="goal-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) {
          setIsConfirmingDelete(false);
          onClose();
        }
      }}
    >
      <div
        id="goal-detail-modal-card"
        className={`w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'border-neutral-800 bg-neutral-900/90' : 'border-slate-100 bg-slate-50/70'
          }`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                isAchieved
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                  : isDark
                  ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {isAchieved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Đã Đạt Mục Tiêu</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Đang Thực Hiện</span>
                </>
              )}
            </span>

            {goal.category && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${
                  isDark
                    ? 'bg-neutral-800 text-neutral-300 border-neutral-700'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <Layers className="w-3 h-3 text-indigo-400" />
                <span>{goal.category}</span>
              </span>
            )}

            {goal.priority && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  priorityColors[goal.priority] || priorityColors.medium
                }`}
              >
                {priorityLabels[goal.priority] || 'Ưu tiên'}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsConfirmingDelete(false);
              onClose();
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Đóng chi tiết"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Goal Title */}
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-2">{goal.title}</h2>
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-neutral-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>Hạn chót: <strong>{goal.targetDate}</strong></span>
              </span>
              <span className={`px-2 py-0.5 rounded-md font-semibold border text-[11px] ${deadlineColor}`}>
                {deadlineLabel}
              </span>
              {goal.createdAt && (
                <span>Tạo ngày: {goal.createdAt}</span>
              )}
            </div>
          </div>

          {/* Progress Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isAchieved
                ? isDark
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                  : 'bg-emerald-50/80 border-emerald-200 text-emerald-950 shadow-xs'
                : isDark
                ? 'bg-neutral-800/50 border-neutral-700/80 text-white'
                : 'bg-slate-50/70 border-slate-200 text-slate-900 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <span>Tiến độ thực tế</span>
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {percent}%
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <div className="text-sm font-semibold">
                <span className="text-lg font-bold">{goal.currentValue}</span> / {goal.targetValue} {goal.unit}
              </div>
              <div className="text-xs text-slate-500 dark:text-neutral-400">
                {isAchieved ? (
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Đã về đích 100% 🎉</span>
                ) : (
                  <span>Còn thiếu {remaining} {goal.unit}</span>
                )}
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className={`w-full h-3 rounded-full overflow-hidden mb-3 ${isDark ? 'bg-neutral-700' : 'bg-slate-200'}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isAchieved
                    ? 'bg-emerald-500'
                    : percent > 60
                    ? 'bg-emerald-500'
                    : percent > 30
                    ? 'bg-indigo-500'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* Motivational message */}
            <p className="text-xs leading-relaxed text-slate-600 dark:text-neutral-300">
              {isAchieved ? (
                'Xuất sắc! Bạn đã hoàn thành chỉ tiêu đề ra. Hãy tiếp tục duy trì sự kiên trì hoặc đặt ra mục tiêu thử thách mới!'
              ) : remaining > 0 ? (
                `Hãy dành thêm thời gian hôm nay để hoàn thành ${remaining} ${goal.unit} còn lại trước ngày ${goal.targetDate}. Mỗi bước nhỏ đều tạo nên bước nhảy lớn.`
              ) : (
                'Mục tiêu đang trong quá trình thực hiện.'
              )}
            </p>
          </div>

          {/* Quick Progress Logger */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                Ghi nhận tiến độ nhanh:
              </span>
              <button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {showCustomInput ? 'Ẩn nhập tuỳ chỉnh' : 'Nhập số tuỳ chỉnh'}
              </button>
            </div>

            {showCustomInput && (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20">
                <input
                  type="number"
                  min="0"
                  placeholder={`Số ${goal.unit} hiện tại`}
                  value={customValueInput}
                  onChange={e => setCustomValueInput(e.target.value)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs border ${
                    isDark
                      ? 'bg-neutral-800 border-neutral-700 text-white'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleSetExactValue}
                  disabled={isUpdating || !customValueInput}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  Cập nhật
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {goal.currentValue > 0 && (
                <button
                  type="button"
                  onClick={() => handleIncrement(-1)}
                  disabled={isUpdating}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 ${
                    isDark
                      ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title={`Trừ bớt 1 ${goal.unit}`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>1 {goal.unit}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleIncrement(1)}
                disabled={isUpdating}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 ${
                  isDark
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-2xs'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-emerald-500" />
                <span>1 {goal.unit}</span>
              </button>

              <button
                type="button"
                onClick={() => handleIncrement(2)}
                disabled={isUpdating}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>2 {goal.unit}</span>
              </button>

              <button
                type="button"
                onClick={() => handleIncrement(5)}
                disabled={isUpdating}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 ${
                  isDark
                    ? 'bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 border-indigo-800/60'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>5 {goal.unit}</span>
              </button>

              {!isAchieved && (
                <button
                  type="button"
                  onClick={handleMarkComplete}
                  disabled={isUpdating}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 ml-auto"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Cán đích 100%</span>
                </button>
              )}
            </div>
          </div>

          {/* Description & Action Strategy */}
          <div>
            <span className={`text-xs font-semibold block mb-2 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
              Chiến lược & Ghi chú hành động
            </span>
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed whitespace-pre-wrap ${
                isDark ? 'bg-neutral-800/40 border-neutral-700 text-neutral-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              {goal.description ? (
                goal.description
              ) : (
                <span className="italic text-slate-400">
                  Chưa có mô tả chi tiết cho mục tiêu này. Bạn có thể bấm "Chỉnh sửa" bên dưới để bổ sung chiến lược học tập!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between shrink-0 ${
            isDark ? 'border-neutral-800 bg-neutral-900/90' : 'border-slate-100 bg-slate-50/70'
          }`}
        >
          {/* Delete action with safety confirm */}
          <div>
            {isConfirmingDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-500 font-medium">Xác nhận xoá?</span>
                <button
                  type="button"
                  onClick={async () => {
                    await onDelete(goal.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xoá vĩnh viễn</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
                    isDark ? 'text-neutral-400 hover:bg-neutral-800' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Huỷ
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200/60 dark:border-rose-900/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xoá mục tiêu</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onEdit(goal);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Chỉnh sửa mục tiêu</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsConfirmingDelete(false);
                onClose();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                isDark ? 'text-neutral-300 hover:bg-neutral-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
