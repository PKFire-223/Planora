import { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Award,
  TrendingUp,
  Clock,
  Layers,
  Edit3,
  Trash2,
  Filter,
  Sparkles,
  ArrowUpDown,
  ChevronRight,
  Flame,
  AlertCircle
} from 'lucide-react';
import { Goal } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { GoalFormModal } from './GoalFormModal';
import { GoalDetailModal } from './GoalDetailModal';

interface GoalsViewProps {
  goals: Goal[];
  onCreateGoal: (data: Partial<Goal>) => Promise<Goal | void>;
  onUpdateGoal: (id: string, data: Partial<Goal>) => Promise<Goal | void>;
  onDeleteGoal: (id: string) => Promise<void>;
  onIncrementGoal: (id: string, amount: number) => Promise<void>;
  onUpdateProgress?: (id: string, params: { increment?: number; currentValue?: number }) => Promise<void>;
}

export function GoalsView({
  goals,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
  onIncrementGoal,
  onUpdateProgress
}: GoalsViewProps) {
  const { isDark } = useTheme();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'achieved' | 'urgent'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'progress_desc' | 'deadline_asc' | 'created_desc'>('progress_desc');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedGoalDetail, setSelectedGoalDetail] = useState<Goal | null>(null);

  // Quick updating loading indicator
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Extract all available categories from goals
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    goals.forEach(g => {
      if (g.category) cats.add(g.category);
    });
    return Array.from(cats);
  }, [goals]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = goals.length;
    const achieved = goals.filter(g => g.status === 'achieved' || g.currentValue >= g.targetValue).length;
    const active = total - achieved;
    const avgPercent = total > 0
      ? Math.round(
          goals.reduce((acc, g) => acc + Math.min(100, (g.currentValue / Math.max(1, g.targetValue)) * 100), 0) / total
        )
      : 0;

    return { total, achieved, active, avgPercent };
  }, [goals]);

  // Filter & Sort logic
  const filteredGoals = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return goals
      .filter(goal => {
        const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
        const isAchieved = goal.status === 'achieved' || percent >= 100;

        // Search match
        const term = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !term ||
          goal.title.toLowerCase().includes(term) ||
          (goal.description && goal.description.toLowerCase().includes(term)) ||
          (goal.category && goal.category.toLowerCase().includes(term));

        // Category match
        const matchesCategory = selectedCategory === 'all' || goal.category === selectedCategory;

        // Status filter
        let matchesStatus = true;
        if (statusFilter === 'active') {
          matchesStatus = !isAchieved;
        } else if (statusFilter === 'achieved') {
          matchesStatus = isAchieved;
        } else if (statusFilter === 'urgent') {
          const targetDateObj = new Date(goal.targetDate);
          const diffDays = Math.ceil((targetDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          matchesStatus = !isAchieved && diffDays <= 7;
        }

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'progress_desc') {
          const percentA = (a.currentValue / a.targetValue) * 100;
          const percentB = (b.currentValue / b.targetValue) * 100;
          return percentB - percentA;
        }
        if (sortBy === 'deadline_asc') {
          return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        }
        if (sortBy === 'created_desc') {
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        }
        return 0;
      });
  }, [goals, searchTerm, selectedCategory, statusFilter, sortBy]);

  // Sync selected goal detail if goals list is updated
  const currentDetailGoal = useMemo(() => {
    if (!selectedGoalDetail) return null;
    return goals.find(g => g.id === selectedGoalDetail.id) || selectedGoalDetail;
  }, [goals, selectedGoalDetail]);

  const handleOpenCreateModal = () => {
    setGoalToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (goal: Goal) => {
    setGoalToEdit(goal);
    setIsFormOpen(true);
  };

  const handleOpenDetailModal = (goal: Goal) => {
    setSelectedGoalDetail(goal);
    setIsDetailOpen(true);
  };

  const handleSaveGoal = async (data: Partial<Goal>) => {
    if (goalToEdit) {
      await onUpdateGoal(goalToEdit.id, data);
    } else {
      await onCreateGoal(data);
    }
  };

  const handleIncrement = async (e: React.MouseEvent, id: string, amount: number) => {
    e.stopPropagation();
    setUpdatingId(id);
    try {
      if (onUpdateProgress) {
        await onUpdateProgress(id, { increment: amount });
      } else {
        await onIncrementGoal(id, amount);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await onDeleteGoal(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div id="goals-view-container" className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
              <Target className="w-5 h-5" />
            </span>
            <span>Mục Tiêu & Chỉ Tiêu Tự Học</span>
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            Thiết lập KPI học tập định lượng, đo lường sự tiến bộ mỗi ngày và duy trì thói quen học tập bền bỉ.
          </p>
        </div>

        <button
          id="btn-create-goal"
          type="button"
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Mục Tiêu Mới</span>
        </button>
      </div>

      {/* KPI Overview Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Tổng số mục tiêu
            </span>
            <Target className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-1">Chỉ tiêu đã thiết lập</div>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Đã hoàn thành
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.achieved}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {stats.total > 0 ? `${Math.round((stats.achieved / stats.total) * 100)}% tổng mục tiêu` : '0%'}
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Đang thực hiện
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.active}</div>
          <div className="text-[11px] text-slate-400 mt-1">Đang cần nỗ lực</div>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Tiến độ trung bình
            </span>
            <TrendingUp className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{stats.avgPercent}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Tỷ lệ hoàn thành chung</div>
        </div>
      </div>

      {/* Motivational Strategy Banner */}
      <div
        className={`p-4 rounded-2xl border transition-colors flex items-start gap-3 ${
          isDark
            ? 'bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-indigo-950/20 border-neutral-800 text-white'
            : 'bg-gradient-to-r from-emerald-50/80 via-white to-indigo-50/50 border-emerald-200 text-slate-900 shadow-xs'
        }`}
      >
        <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
          <Award className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-xs flex items-center gap-1.5 mb-1">
            <span>Chiến Lược Hoàn Thành Mục Tiêu Cá Nhân</span>
            <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-normal">
              Mẹo kỷ luật
            </span>
          </h3>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
            Đo lường sự tiến bộ định lượng mỗi ngày (số giờ tự học, số bài tập đã nộp, số môn học đã hoàn thành). 
            Bấm vào bất kỳ thẻ mục tiêu nào để xem chi tiết, điều chỉnh tiến độ hoặc cập nhật chiến lược!
          </p>
        </div>
      </div>

      {/* Filter, Search & Sort Toolbar */}
      <div
        className={`p-3.5 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${
          isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm mục tiêu theo tiêu đề, danh mục..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-3.5 py-1.5 rounded-xl text-xs border focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 transition-all ${
              isDark
                ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả ({goals.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-indigo-600 text-white'
                : isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Đang thực hiện ({stats.active})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('achieved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'achieved'
                ? 'bg-emerald-600 text-white'
                : isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Đã đạt ({stats.achieved})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('urgent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'urgent'
                ? 'bg-rose-600 text-white'
                : isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Gần đến hạn
          </button>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className={`text-xs px-2.5 py-1.5 rounded-xl border focus:outline-hidden cursor-pointer ${
              isDark
                ? 'bg-neutral-800 border-neutral-700 text-neutral-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value="progress_desc">Tiến độ: Cao → Thấp</option>
            <option value="deadline_asc">Hạn chót: Gần nhất</option>
            <option value="created_desc">Mới tạo nhất</option>
          </select>
        </div>
      </div>

      {/* Category Pills (if available) */}
      {availableCategories.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Phân loại:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                : isDark
                ? 'bg-neutral-800/80 text-neutral-400 hover:text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả
          </button>
          {availableCategories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : isDark
                  ? 'bg-neutral-800/80 text-neutral-400 hover:text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Goals Grid */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map(goal => {
            const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
            const isAchieved = goal.status === 'achieved' || percent >= 100;

            // Target date relative
            const targetDateObj = new Date(goal.targetDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((targetDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            let deadlineBadge = '';
            if (diffDays < 0) {
              deadlineBadge = `Quá hạn ${Math.abs(diffDays)} ngày`;
            } else if (diffDays === 0) {
              deadlineBadge = 'Hôm nay';
            } else {
              deadlineBadge = `Còn ${diffDays} ngày`;
            }

            return (
              <div
                key={goal.id}
                onClick={() => handleOpenDetailModal(goal)}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group hover:scale-[1.01] ${
                  isAchieved
                    ? isDark
                      ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500/60'
                      : 'bg-emerald-50/60 border-emerald-300 hover:border-emerald-400 shadow-xs'
                    : isDark
                    ? 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  {/* Top Bar: Status & Deadline */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isAchieved
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-semibold'
                          : isDark
                          ? 'bg-neutral-800 text-neutral-400'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {isAchieved ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Đã Đạt Mục Tiêu</span>
                        </>
                      ) : (
                        <span>Đang Thực Hiện</span>
                      )}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1 ${
                          diffDays < 0
                            ? 'bg-rose-500/10 text-rose-500'
                            : diffDays <= 7
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : isDark
                            ? 'text-neutral-400'
                            : 'text-slate-400'
                        }`}
                        title={`Hạn chót: ${goal.targetDate}`}
                      >
                        <Calendar className="w-3 h-3" />
                        <span>{deadlineBadge}</span>
                      </span>

                      {/* Card Menu Actions */}
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleOpenEditModal(goal);
                        }}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isDark
                            ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                            : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                        title="Chỉnh sửa mục tiêu"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={e => handleDelete(e, goal.id)}
                        disabled={deletingId === goal.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Xoá mục tiêu này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Category Pill */}
                  {goal.category && (
                    <div className="mb-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                        {goal.category}
                      </span>
                    </div>
                  )}

                  {/* Goal Title */}
                  <h4 className={`font-bold text-sm mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {goal.title}
                  </h4>

                  {/* Description Preview */}
                  {goal.description && (
                    <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2 mb-3 leading-relaxed">
                      {goal.description}
                    </p>
                  )}

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

                {/* Actions Bottom Bar */}
                <div
                  className={`pt-3 border-t flex items-center justify-between gap-2 ${
                    isDark ? 'border-neutral-800' : 'border-slate-100'
                  }`}
                >
                  <span className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    Cập nhật tiến độ:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={e => handleIncrement(e, goal.id, 1)}
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
                      type="button"
                      onClick={e => handleIncrement(e, goal.id, 2)}
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
      ) : (
        /* Empty State */
        <div
          className={`p-10 rounded-2xl border text-center ${
            isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold mb-1">Không tìm thấy mục tiêu nào phù hợp</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            {searchTerm
              ? `Không có mục tiêu nào khớp với từ khoá "${searchTerm}".`
              : statusFilter !== 'all'
              ? 'Không có mục tiêu nào trong bộ lọc này.'
              : 'Bạn chưa tạo mục tiêu học tập nào. Hãy bắt đầu bằng cách đặt mục tiêu định lượng đầu tiên!'}
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo mục tiêu ngay</span>
          </button>
        </div>
      )}

      {/* Goal Form Modal (Create / Edit) */}
      <GoalFormModal
        isOpen={isFormOpen}
        initialGoal={goalToEdit}
        onClose={() => {
          setIsFormOpen(false);
          setGoalToEdit(null);
        }}
        onSave={handleSaveGoal}
      />

      {/* Goal Detail Modal (View / Adjust Progress / Delete) */}
      <GoalDetailModal
        isOpen={isDetailOpen}
        goal={currentDetailGoal}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedGoalDetail(null);
        }}
        onEdit={goal => {
          handleOpenEditModal(goal);
        }}
        onDelete={async id => {
          await onDeleteGoal(id);
        }}
        onUpdateProgress={async (id, params) => {
          if (onUpdateProgress) {
            await onUpdateProgress(id, params);
          } else if (params.increment) {
            await onIncrementGoal(id, params.increment);
          }
        }}
      />
    </div>
  );
}
