import { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Sparkles, 
  Edit3, 
  Save, 
  FileText, 
  CheckSquare
} from 'lucide-react';
import { Task, Course, TaskSubtask } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface TaskDetailModalProps {
  task: Task | null;
  courses: Course[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (id: string, data: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onToggleStatus: (id: string, currentStatus: Task['status']) => Promise<void>;
  onAiBreakdown: (taskTitle: string, courseId?: string) => Promise<void>;
}

export function TaskDetailModal({
  task,
  courses,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onToggleStatus,
  onAiBreakdown
}: TaskDetailModalProps) {
  const { isDark } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    title: '',
    courseId: '',
    priority: 'medium' as Task['priority'],
    status: 'todo' as Task['status'],
    dueDate: '',
    estimatedMinutes: 30,
    description: '',
    notes: '',
    subtasks: [] as TaskSubtask[]
  });

  useEffect(() => {
    if (task) {
      setEditForm({
        title: task.title,
        courseId: task.courseId || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        estimatedMinutes: task.estimatedMinutes,
        description: task.description || '',
        notes: task.notes || '',
        subtasks: task.subtasks ? [...task.subtasks] : []
      });
      setIsEditing(false);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const currentCourse = courses.find(c => c.id === (isEditing ? editForm.courseId : task.courseId));

  const completedSubtasksCount = (editForm.subtasks || []).filter(st => st.completed).length;
  const totalSubtasksCount = (editForm.subtasks || []).length;
  const progressPercent = totalSubtasksCount > 0 
    ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100) 
    : task.status === 'done' ? 100 : 0;

  // Toggle individual subtask completed state
  const handleToggleSubtask = async (subtaskId: string) => {
    const updatedSubtasks = editForm.subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    setEditForm(prev => ({ ...prev, subtasks: updatedSubtasks }));
    
    // Auto sync to parent
    await onUpdateTask(task.id, { subtasks: updatedSubtasks });
  };

  // Add new subtask
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: TaskSubtask = {
      id: `subtask-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };

    const updatedSubtasks = [...editForm.subtasks, newSubtask];
    setEditForm(prev => ({ ...prev, subtasks: updatedSubtasks }));
    setNewSubtaskTitle('');

    await onUpdateTask(task.id, { subtasks: updatedSubtasks });
  };

  // Delete individual subtask
  const handleDeleteSubtask = async (subtaskId: string) => {
    const updatedSubtasks = editForm.subtasks.filter(st => st.id !== subtaskId);
    setEditForm(prev => ({ ...prev, subtasks: updatedSubtasks }));
    await onUpdateTask(task.id, { subtasks: updatedSubtasks });
  };

  // Save all changes
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const selectedCourse = courses.find(c => c.id === editForm.courseId);
      await onUpdateTask(task.id, {
        title: editForm.title.trim() || task.title,
        courseId: editForm.courseId || undefined,
        courseName: selectedCourse ? selectedCourse.code : undefined,
        priority: editForm.priority,
        status: editForm.status,
        dueDate: editForm.dueDate,
        estimatedMinutes: Number(editForm.estimatedMinutes) || 30,
        description: editForm.description,
        notes: editForm.notes,
        subtasks: editForm.subtasks
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  // AI Breakdown inside modal
  const handleTriggerAiBreakdown = async () => {
    setIsBreakingDown(true);
    try {
      await onAiBreakdown(task.title, task.courseId);
      onClose();
    } finally {
      setIsBreakingDown(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="task-detail-modal"
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border transition-all overflow-hidden ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-neutral-800 bg-neutral-900/90' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Chi Tiết Nhiệm Vụ</span>
            </div>

            {currentCourse && (
              <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-white text-slate-700 border border-slate-200 shadow-2xs'
              }`}>
                {currentCourse.code} - {currentCourse.title}
              </span>
            )}

            {task.isAiGenerated && (
              <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs flex items-center gap-1 font-medium border border-indigo-500/20">
                <Sparkles className="w-3 h-3" />
                <span>AI Subtask</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  isDark 
                    ? 'border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800' 
                    : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Chỉnh sửa chi tiết nhiệm vụ"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chỉnh sửa</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isSaving}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu lại'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Title and Status Bar */}
          <div className="space-y-3">
            {!isEditing ? (
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => onToggleStatus(task.id, task.status)}
                  className="mt-0.5 cursor-pointer text-indigo-600 dark:text-indigo-400 shrink-0 hover:scale-110 transition-transform"
                  title={task.status === 'done' ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
                >
                  {task.status === 'done' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 hover:text-indigo-600" />
                  )}
                </button>
                <div>
                  <h2 className={`text-base sm:text-lg font-bold leading-snug ${
                    task.status === 'done' 
                      ? 'line-through text-slate-400 dark:text-neutral-500' 
                      : isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {task.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      task.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                        : task.priority === 'high'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                        : task.priority === 'medium'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30'
                        : 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}>
                      Độ ưu tiên: {task.priority === 'urgent' ? 'Khẩn cấp' : task.priority === 'high' ? 'Ưu tiên cao' : task.priority === 'medium' ? 'Bình thường' : 'Thấp'}
                    </span>

                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      task.status === 'done'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200'
                        : task.status === 'in_progress'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-200'
                        : 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}>
                      {task.status === 'done' ? 'Đã hoàn thành' : task.status === 'in_progress' ? 'Đang thực hiện' : 'Chưa làm'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                    Tên nhiệm vụ
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    className={`w-full px-3 py-2 text-sm font-semibold rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                      Trạng thái
                    </label>
                    <select
                      value={editForm.status}
                      onChange={e => setEditForm({ ...editForm, status: e.target.value as Task['status'] })}
                      className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="todo">Chưa làm</option>
                      <option value="in_progress">Đang thực hiện</option>
                      <option value="done">Đã hoàn thành</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                      Mức độ ưu tiên
                    </label>
                    <select
                      value={editForm.priority}
                      onChange={e => setEditForm({ ...editForm, priority: e.target.value as Task['priority'] })}
                      className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="urgent">Khẩn cấp</option>
                      <option value="high">Ưu tiên cao</option>
                      <option value="medium">Bình thường</option>
                      <option value="low">Thấp</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Metadata Info Grid */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border text-xs ${
              isDark ? 'bg-neutral-950/60 border-neutral-800/80' : 'bg-slate-50/70 border-slate-200/80'
            }`}>
              {/* Due Date */}
              <div className="space-y-1">
                <span className={`text-[11px] font-medium flex items-center gap-1.5 leading-none ${
                  isDark ? 'text-neutral-400' : 'text-slate-500'
                }`}>
                  <Calendar className="w-3.5 h-3.5 shrink-0 -translate-y-[0.5px] text-indigo-500" />
                  <span>Hạn chót:</span>
                </span>
                {!isEditing ? (
                  <p className="font-semibold text-xs leading-tight">
                    {task.dueDate}
                  </p>
                ) : (
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className={`w-full px-2 py-1 text-xs rounded-lg border ${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200'
                    }`}
                  />
                )}
              </div>

              {/* Estimated Time - clock perfectly aligned */}
              <div className="space-y-1">
                <span className={`text-[11px] font-medium flex items-center gap-1.5 leading-none ${
                  isDark ? 'text-neutral-400' : 'text-slate-500'
                }`}>
                  <Clock className="w-3.5 h-3.5 shrink-0 -translate-y-[0.5px] text-amber-500" />
                  <span>Thời gian ước tính:</span>
                </span>
                {!isEditing ? (
                  <p className="font-semibold text-xs leading-tight">
                    ~{task.estimatedMinutes} phút
                  </p>
                ) : (
                  <input
                    type="number"
                    min="5"
                    max="600"
                    step="5"
                    value={editForm.estimatedMinutes}
                    onChange={e => setEditForm({ ...editForm, estimatedMinutes: Number(e.target.value) })}
                    className={`w-full px-2 py-1 text-xs rounded-lg border ${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200'
                    }`}
                  />
                )}
              </div>

              {/* Course selection */}
              <div className="space-y-1">
                <span className={`text-[11px] font-medium flex items-center gap-1.5 leading-none ${
                  isDark ? 'text-neutral-400' : 'text-slate-500'
                }`}>
                  <BookOpen className="w-3.5 h-3.5 shrink-0 -translate-y-[0.5px] text-emerald-500" />
                  <span>Môn học:</span>
                </span>
                {!isEditing ? (
                  <p className="font-semibold text-xs leading-tight truncate">
                    {currentCourse ? `${currentCourse.code} (${currentCourse.title})` : 'Chưa phân môn'}
                  </p>
                ) : (
                  <select
                    value={editForm.courseId}
                    onChange={e => setEditForm({ ...editForm, courseId: e.target.value })}
                    className={`w-full px-2 py-1 text-xs rounded-lg border ${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200'
                    }`}
                  >
                    <option value="">-- Không chọn --</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? 'text-neutral-400' : 'text-slate-500'
            }`}>
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              <span>Nội Dung Chi Tiết & Yêu Cầu</span>
            </h3>

            {!isEditing ? (
              <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                isDark ? 'bg-neutral-950/40 border-neutral-800 text-neutral-200' : 'bg-slate-50/70 border-slate-200 text-slate-700'
              }`}>
                {task.description ? (
                  <p className="whitespace-pre-line">{task.description}</p>
                ) : (
                  <p className="italic text-slate-400 dark:text-neutral-500">
                    Chưa có mô tả chi tiết cho nhiệm vụ này. Bạn có thể nhấn nút "Chỉnh sửa" để cập nhật nội dung yêu cầu bài tập.
                  </p>
                )}
              </div>
            ) : (
              <textarea
                rows={3}
                placeholder="Nhập yêu cầu chi tiết của bài tập, liên kết đề bài, hoặc tài liệu cần xem..."
                value={editForm.description}
                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                className={`w-full p-3 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            )}
          </div>

          {/* Subtasks / Checklist Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isDark ? 'text-neutral-400' : 'text-slate-500'
              }`}>
                <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                <span>Các Bước Thực Hiện ({completedSubtasksCount}/{totalSubtasksCount})</span>
              </h3>

              {totalSubtasksCount > 0 && (
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {progressPercent}% hoàn thành
                </span>
              )}
            </div>

            {/* Progress bar */}
            {totalSubtasksCount > 0 && (
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`}>
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            {/* List of subtasks */}
            <div className="space-y-2">
              {editForm.subtasks.map((st) => (
                <div 
                  key={st.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                    st.completed
                      ? isDark ? 'bg-neutral-950/30 border-neutral-800/50 opacity-70' : 'bg-slate-50/60 border-slate-200/60 opacity-75'
                      : isDark ? 'bg-neutral-950/80 border-neutral-800' : 'bg-white border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(st.id)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <span className={`truncate font-medium ${
                      st.completed 
                        ? 'line-through text-slate-400 dark:text-neutral-500' 
                        : isDark ? 'text-neutral-200' : 'text-slate-800'
                    }`}>
                      {st.title}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(st.id)}
                    className={`p-1 rounded-md transition-colors cursor-pointer shrink-0 ${
                      isDark ? 'text-neutral-500 hover:text-rose-400 hover:bg-neutral-800' : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                    }`}
                    title="Xoá bước này"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {editForm.subtasks.length === 0 && (
                <div className={`p-4 text-center rounded-xl border border-dashed text-xs ${
                  isDark ? 'border-neutral-800 text-neutral-500' : 'border-slate-200 text-slate-500'
                }`}>
                  Chưa có các bước nhỏ. Bạn có thể tự thêm hoặc dùng tính năng "Chia nhỏ bằng AI" bên dưới!
                </div>
              )}
            </div>

            {/* Add Subtask Form */}
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                type="text"
                placeholder="Thêm một bước thực hiện cụ thể..."
                value={newSubtaskTitle}
                onChange={e => setNewSubtaskTitle(e.target.value)}
                className={`flex-1 px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                }`}
              />
              <button
                type="submit"
                disabled={!newSubtaskTitle.trim()}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            </form>
          </div>

          {/* Personal Notes Section */}
          <div className="space-y-2">
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? 'text-neutral-400' : 'text-slate-500'
            }`}>
              <Edit3 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Ghi Chú & Mẹo Học Tập</span>
            </h3>

            {!isEditing ? (
              <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                isDark ? 'bg-neutral-950/40 border-neutral-800 text-neutral-300' : 'bg-slate-50/70 border-slate-200 text-slate-600'
              }`}>
                {task.notes ? (
                  <p className="whitespace-pre-line">{task.notes}</p>
                ) : (
                  <p className="italic text-slate-400 dark:text-neutral-500">
                    Chưa có ghi chú riêng cho nhiệm vụ này.
                  </p>
                )}
              </div>
            ) : (
              <textarea
                rows={2}
                placeholder="Thêm ghi chú cá nhân, link tham khảo tài liệu..."
                value={editForm.notes}
                onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                className={`w-full p-3 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            )}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 ${
          isDark ? 'border-neutral-800 bg-neutral-900/90' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Toggle Status Quick Button */}
            <button
              type="button"
              onClick={() => onToggleStatus(task.id, task.status)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                task.status === 'done'
                  ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                  : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{task.status === 'done' ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}</span>
            </button>

            {/* AI Breakdown button */}
            {!task.isAiGenerated && task.status !== 'done' && (
              <button
                type="button"
                onClick={handleTriggerAiBreakdown}
                disabled={isBreakingDown}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>{isBreakingDown ? 'AI đang phân tích...' : 'Chia nhỏ AI'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Bạn có chắc chắn muốn xoá nhiệm vụ này không?')) {
                  await onDeleteTask(task.id);
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xoá</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                isDark 
                  ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' 
                  : 'border-slate-200 text-slate-700 hover:bg-slate-100'
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
