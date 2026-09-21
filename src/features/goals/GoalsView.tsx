import { useState } from 'react';
import { Target, Plus, CheckCircle, Trophy, Calendar } from 'lucide-react';
import { Goal } from '../../types';

interface GoalsViewProps {
  goals: Goal[];
  onIncrementGoal: (id: string, amount: number) => Promise<void>;
}

export function GoalsView({ goals, onIncrementGoal }: GoalsViewProps) {
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
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-neutral-900 border border-neutral-800">
        <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-1">
          <Trophy className="w-4 h-4 text-emerald-400" />
          <span>Chiến Lược Hoàn Thành Mục Tiêu Cá Nhân</span>
        </h3>
        <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
          Đo lường sự tiến bộ mỗi ngày bằng các chỉ số định lượng (số giờ học, số bài tập đã giải, số khoá học hoàn thành). Bạn có thể bấm nút cộng tiến độ trực tiếp sau mỗi phiên học.
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
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-neutral-900/50 border-neutral-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isAchieved
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {isAchieved ? 'ĐÃ ĐẠT ĐƯỢC 🎉' : 'ĐANG THỰC HIỆN'}
                  </span>

                  <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Hạn: {goal.targetDate}</span>
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white mb-4">
                  {goal.title}
                </h4>

                {/* Meter */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-400">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                    <span className="font-bold text-emerald-400">{percent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400">Cập nhật tiến độ:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleIncrement(goal.id, 1)}
                    disabled={updatingId === goal.id || isAchieved}
                    className="px-2.5 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 text-white font-mono transition-colors disabled:opacity-50"
                  >
                    +1 {goal.unit}
                  </button>
                  <button
                    onClick={() => handleIncrement(goal.id, 2)}
                    disabled={updatingId === goal.id || isAchieved}
                    className="px-2.5 py-1 text-xs rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-mono transition-colors disabled:opacity-50"
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
