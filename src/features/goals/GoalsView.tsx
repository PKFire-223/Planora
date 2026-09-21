import { useState } from 'react';
import { Target, CheckCircle2, Calendar, Award } from 'lucide-react';
import { Goal } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface GoalsViewProps {
  goals: Goal[];
  onIncrementGoal: (id: string, amount: number) => Promise<void>;
}

export function GoalsView({ goals, onIncrementGoal }: GoalsViewProps) {
  const { isDark } = useTheme();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleIncrement = async (id: string, amount: number) => {
    setUpdatingId(id);
    try {
      await onIncrementGoal(id, amount);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`p-5 rounded-2xl border transition-colors ${
        isDark 
          ? 'bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-indigo-950/20 border-neutral-800 text-white' 
          : 'bg-gradient-to-r from-emerald-50/80 via-white to-indigo-50/50 border-emerald-200 text-slate-900 shadow-xs'
      }`}>
        <h3 className="font-bold text-sm flex items-center gap-2 mb-1">
          <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Chiến Lược Hoàn Thành Mục Tiêu Cá Nhân</span>
        </h3>
        <p className={`text-xs max-w-2xl leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
          Đo lường sự tiến bộ định lượng mỗi ngày (số giờ học tập, số bài tập đã giải, số môn học hoàn thành). Bạn có thể cộng trực tiếp tiến độ sau mỗi phiên học để hệ thống tự động ghi nhận.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map(goal => {
          const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
          const isAchieved = goal.status === 'achieved' || percent >= 100;

          return (
            <div
              key={goal.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isAchieved
                  ? isDark 
                    ? 'bg-emerald-950/20 border-emerald-500/40' 
                    : 'bg-emerald-50/60 border-emerald-300 shadow-xs'
                  : isDark
                    ? 'bg-neutral-900/60 border-neutral-800'
                    : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                    isAchieved
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-semibold'
                      : isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {isAchieved ? 'Đã Đạt Mục Tiêu' : 'Đang Thực Hiện'}
                  </span>

                  <span className={`text-[11px] flex items-center gap-1 ${isDark ? 'text-neutral-400' : 'text-slate-400'}`}>
                    <Calendar className="w-3 h-3" />
                    <span>Hạn: {goal.targetDate}</span>
                  </span>
                </div>

                <h4 className={`font-bold text-sm mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {goal.title}
                </h4>

                {/* Meter */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{percent}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`}>
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className={`pt-3 border-t flex items-center justify-between ${
                isDark ? 'border-neutral-800' : 'border-slate-100'
              }`}>
                <span className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Cập nhật tiến độ:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleIncrement(goal.id, 1)}
                    disabled={updatingId === goal.id || isAchieved}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                      isDark
                        ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                    }`}
                  >
                    +1 {goal.unit}
                  </button>
                  <button
                    onClick={() => handleIncrement(goal.id, 2)}
                    disabled={updatingId === goal.id || isAchieved}
                    className="px-2.5 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    +2 {goal.unit}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
