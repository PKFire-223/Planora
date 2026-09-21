import { useState } from 'react';
import { CheckSquare, Plus, Trash2, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { Task, Course } from '../../types';

interface TasksViewProps {
  tasks: Task[];
  courses: Course[];
  onCreateTask: (data: Partial<Task>) => Promise<void>;
  onToggleTask: (id: string, currentStatus: Task['status']) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onAiBreakdown: (taskTitle: string, courseId?: string) => Promise<void>;
}

export function TasksView({
  tasks,
  courses,
  onCreateTask,
  onToggleTask,
  onDeleteTask,
  onAiBreakdown
}: TasksViewProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [breakingDownId, setBreakingDownId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    courseId: '',
    priority: 'medium' as Task['priority'],
    dueDate: new Date().toISOString().split('T')[0],
    estimatedMinutes: 45
  });

  const filteredTasks = statusFilter === 'all'
    ? tasks
    : tasks.filter(t => t.status === statusFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    await onCreateTask(form);
    setIsModalOpen(false);
    setForm({
      title: '',
      courseId: '',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      estimatedMinutes: 45
    });
  };

  const handleBreakdown = async (task: Task) => {
    setBreakingDownId(task.id);
    try {
      await onAiBreakdown(task.title, task.courseId);
    } finally {
      setBreakingDownId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'todo', 'in_progress', 'done'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {st === 'all' ? 'Tất Cả' : st === 'todo' ? 'Chưa Làm' : st === 'in_progress' ? 'Đang Làm' : 'Đã Xong'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Task Mới</span>
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 bg-neutral-900/30 rounded-2xl border border-neutral-800 text-xs">
            Không có nhiệm vụ nào trong mục này.
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                task.status === 'done'
                  ? 'bg-neutral-950/40 border-neutral-800/50 opacity-70'
                  : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <input
                  type="checkbox"
                  checked={task.status === 'done'}
                  onChange={() => onToggleTask(task.id, task.status)}
                  className="mt-0.5 w-4 h-4 rounded border-neutral-700 bg-neutral-950 text-rose-600 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium ${task.status === 'done' ? 'line-through text-neutral-500' : 'text-white'}`}>
                      {task.title}
                    </span>
                    {task.isAiGenerated && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px] flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>AI Subtask</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-neutral-400">
                    {task.courseName && (
                      <span className="font-mono text-neutral-300 px-1.5 py-0.2 rounded bg-neutral-800">
                        {task.courseName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      <span>{task.dueDate} (~{task.estimatedMinutes}p)</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {/* AI Breakdown Button */}
                {task.status !== 'done' && !task.isAiGenerated && (
                  <button
                    onClick={() => handleBreakdown(task)}
                    disabled={breakingDownId === task.id}
                    className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] flex items-center gap-1 transition-colors"
                    title="Tự động chia nhỏ task thành 3 bước với AI"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{breakingDownId === task.id ? 'Đang chia...' : 'Chia nhỏ AI'}</span>
                  </button>
                )}

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  task.priority === 'urgent'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : task.priority === 'high'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {task.priority.toUpperCase()}
                </span>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Tạo Bài Tập / Nhiệm Vụ Mới</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Tên nhiệm vụ</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Làm bài tập Mongoose Schema"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Khoá học liên quan (tuỳ chọn)</label>
                <select
                  value={form.courseId}
                  onChange={e => setForm({ ...form, courseId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white"
                >
                  <option value="">-- Không gắn môn học --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Mức độ ưu tiên</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white"
                  >
                    <option value="low">Thấp (Low)</option>
                    <option value="medium">Bình thường (Medium)</option>
                    <option value="high">Cao (High)</option>
                    <option value="urgent">Khẩn cấp (Urgent)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Thời gian dự kiến (phút)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={form.estimatedMinutes}
                    onChange={e => setForm({ ...form, estimatedMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Hạn nộp (Due Date)</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 rounded-lg"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white rounded-lg"
                >
                  Thêm Nhiệm Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
