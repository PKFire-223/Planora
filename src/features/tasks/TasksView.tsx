import { useState } from 'react';
import { Plus, Trash2, Clock, Sparkles } from 'lucide-react';
import { Task, Course } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { TaskDetailModal } from './TaskDetailModal';

interface TasksViewProps {
  tasks: Task[];
  courses: Course[];
  onCreateTask: (data: Partial<Task>) => Promise<void>;
  onUpdateTask: (id: string, data: Partial<Task>) => Promise<void>;
  onToggleTask: (id: string, currentStatus: Task['status']) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onAiBreakdown: (taskTitle: string, courseId?: string) => Promise<void>;
  initialCourseId?: string;
}

export function TasksView({
  tasks,
  courses,
  onCreateTask,
  onUpdateTask,
  onToggleTask,
  onDeleteTask,
  onAiBreakdown,
  initialCourseId = 'all'
}: TasksViewProps) {
  const { isDark } = useTheme();
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [courseFilter, setCourseFilter] = useState<string>(initialCourseId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [breakingDownId, setBreakingDownId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    courseId: initialCourseId !== 'all' ? initialCourseId : '',
    priority: 'medium' as Task['priority'],
    dueDate: new Date().toISOString().split('T')[0],
    estimatedMinutes: 45
  });

  const filteredTasks = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (courseFilter !== 'all' && t.courseId !== courseFilter) return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    const selectedCourse = courses.find(c => c.id === form.courseId);
    await onCreateTask({
      ...form,
      courseName: selectedCourse ? selectedCourse.code : undefined
    });
    setIsModalOpen(false);
    setForm({
      title: '',
      description: '',
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
        <div className="flex flex-wrap items-center gap-2">
          <div className={`inline-flex p-1 rounded-xl border text-xs font-medium ${
            isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {(['all', 'todo', 'in_progress', 'done'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === st
                    ? isDark
                      ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                      : 'bg-white text-indigo-700 font-semibold shadow-xs'
                    : isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? 'Tất Cả' : st === 'todo' ? 'Chưa Làm' : st === 'in_progress' ? 'Đang Thực Hiện' : 'Đã Hoàn Thành'}
              </button>
            ))}
          </div>

          <select
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
              isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <option value="all">Tất cả môn học</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>Môn: {c.code} - {c.title}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Nhiệm Vụ</span>
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl border text-xs ${
            isDark ? 'bg-neutral-900/30 border-neutral-800 text-neutral-400' : 'bg-white border-slate-200 text-slate-500 shadow-xs'
          }`}>
            Không có nhiệm vụ nào trong mục lọc này.
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                task.status === 'done'
                  ? isDark 
                    ? 'bg-neutral-950/40 border-neutral-800/60 opacity-60' 
                    : 'bg-slate-50 border-slate-200 opacity-60'
                  : isDark
                    ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                    : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <input
                  type="checkbox"
                  checked={task.status === 'done'}
                  onChange={() => onToggleTask(task.id, task.status)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer shrink-0"
                />

                {/* Clickable content area opens detail view */}
                <div 
                  onClick={() => setSelectedTask(task)}
                  className="flex-1 min-w-0 cursor-pointer group"
                  title="Bấm để xem chi tiết và các bước thực hiện nhiệm vụ"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400 ${
                      task.status === 'done' 
                        ? 'line-through text-slate-400 dark:text-neutral-500' 
                        : isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {task.title}
                    </span>
                    {task.isAiGenerated && (
                      <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 text-[10px] flex items-center gap-1 font-medium">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>AI Subtask</span>
                      </span>
                    )}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 font-medium border border-slate-200/60 dark:border-neutral-700/60">
                        {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} bước
                      </span>
                    )}
                  </div>

                  <div className={`flex items-center gap-3 mt-1.5 text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {task.courseName && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {task.courseName}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 leading-none">
                      <Clock className="w-3.5 h-3.5 shrink-0 -translate-y-[0.5px] text-slate-400 dark:text-neutral-400" />
                      <span className="leading-none">Hạn: {task.dueDate} (~{task.estimatedMinutes} phút)</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {/* AI Breakdown Button */}
                {task.status !== 'done' && !task.isAiGenerated && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBreakdown(task);
                    }}
                    disabled={breakingDownId === task.id}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-indigo-950/40 border-indigo-800 text-indigo-300 hover:bg-indigo-900/50'
                        : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                    }`}
                    title="Tự động chia nhỏ nhiệm vụ thành các bước hành động bằng AI"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span>{breakingDownId === task.id ? 'Đang chia...' : 'Chia nhỏ AI'}</span>
                  </button>
                )}

                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  task.priority === 'urgent'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                    : task.priority === 'high'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                    : 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-400 border border-slate-200 dark:border-transparent'
                }`}>
                  {task.priority === 'urgent' ? 'Khẩn cấp' : task.priority === 'high' ? 'Ưu tiên cao' : task.priority === 'medium' ? 'Bình thường' : 'Thấp'}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(task.id);
                  }}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isDark ? 'text-neutral-400 hover:text-rose-400 hover:bg-neutral-800' : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                  }`}
                  title="Xoá nhiệm vụ"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border transition-all ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-base font-bold mb-4">Tạo Nhiệm Vụ Mới</h3>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Tên nhiệm vụ
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cài đặt Mongoose Schema và test validation"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Mô tả / Yêu cầu chi tiết (tuỳ chọn)
                </label>
                <textarea
                  rows={2}
                  placeholder="Nhập ghi chú yêu cầu, liên kết đề bài..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Môn học liên quan (tuỳ chọn)
                </label>
                <select
                  value={form.courseId}
                  onChange={e => setForm({ ...form, courseId: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="">-- Không chọn (Nhiệm vụ độc lập) --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value as Task['priority'] })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Bình thường</option>
                    <option value="high">Ưu tiên cao</option>
                    <option value="urgent">Khẩn cấp</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                    Thời gian dự kiến (phút)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={form.estimatedMinutes}
                    onChange={e => setForm({ ...form, estimatedMinutes: Number(e.target.value) })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Hạn hoàn thành (Deadline)
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-3.5 py-2 text-xs rounded-xl cursor-pointer ${
                    isDark ? 'text-neutral-300 hover:bg-neutral-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Tạo Nhiệm Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        courses={courses}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={async (id, data) => {
          await onUpdateTask(id, data);
          if (selectedTask && selectedTask.id === id) {
            setSelectedTask(prev => prev ? { ...prev, ...data } : null);
          }
        }}
        onDeleteTask={async (id) => {
          await onDeleteTask(id);
          setSelectedTask(null);
        }}
        onToggleStatus={async (id, currentStatus) => {
          await onToggleTask(id, currentStatus);
          if (selectedTask && selectedTask.id === id) {
            setSelectedTask(prev => prev ? { ...prev, status: currentStatus === 'done' ? 'todo' : 'done' } : null);
          }
        }}
        onAiBreakdown={onAiBreakdown}
      />
    </div>
  );
}
