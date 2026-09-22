import { useState, useEffect } from 'react';
import {
  X,
  Pin,
  Trash2,
  Edit3,
  Save,
  Tag,
  Copy,
  Check,
  Calendar,
  BookOpen,
  StickyNote,
  Plus
} from 'lucide-react';
import { Note, Course } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface NoteDetailModalProps {
  note: Note | null;
  courses: Course[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateNote: (id: string, data: Partial<Note>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onSelectTag?: (tag: string) => void;
}

export function NoteDetailModal({
  note,
  courses,
  isOpen,
  onClose,
  onUpdateNote,
  onDeleteNote,
  onSelectTag
}: NoteDetailModalProps) {
  const { isDark } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    courseId: '',
    isPinned: false
  });

  useEffect(() => {
    if (note) {
      setEditForm({
        title: note.title,
        content: note.content,
        tags: [...note.tags],
        courseId: note.courseId || '',
        isPinned: Boolean(note.isPinned)
      });
      setIsEditing(false);
      setCopied(false);
      setIsConfirmingDelete(false);
      setNewTagInput('');
    }
  }, [note]);

  if (!isOpen || !note) return null;

  const currentCourse = courses.find(c => c.id === (isEditing ? editForm.courseId : note.courseId));

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTogglePin = async () => {
    const nextPinned = !note.isPinned;
    await onUpdateNote(note.id, { isPinned: nextPinned });
    setEditForm(prev => ({ ...prev, isPinned: nextPinned }));
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagInput.trim().replace(/^#/, '');
    if (!tag) return;
    if (!editForm.tags.includes(tag)) {
      setEditForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const handleSave = async () => {
    if (!editForm.title.trim() || !editForm.content.trim()) return;
    setIsSaving(true);
    try {
      await onUpdateNote(note.id, {
        title: editForm.title.trim(),
        content: editForm.content.trim(),
        tags: editForm.tags,
        courseId: editForm.courseId || undefined,
        isPinned: editForm.isPinned
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Word count & stats
  const wordCount = (isEditing ? editForm.content : note.content).trim().split(/\s+/).filter(Boolean).length;
  const charCount = (isEditing ? editForm.content : note.content).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="note-detail-modal"
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border transition-all overflow-hidden ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'border-neutral-800 bg-neutral-900/90' : 'border-slate-100 bg-slate-50/50'
          }`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <StickyNote className="w-3.5 h-3.5" />
              <span>Chi Tiết Ghi Chú</span>
            </div>

            {currentCourse && (
              <span
                className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                  isDark
                    ? 'bg-neutral-800 text-neutral-300'
                    : 'bg-white text-slate-700 border border-slate-200 shadow-2xs'
                }`}
              >
                <BookOpen className="w-3 h-3 text-indigo-500" />
                <span>{currentCourse.code}</span>
              </span>
            )}

            {note.isPinned && !isEditing && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-1 font-semibold border border-amber-500/20">
                <Pin className="w-3 h-3" />
                <span>Đã ghim</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {!isEditing && (
              <>
                <button
                  type="button"
                  onClick={handleCopyContent}
                  className={`p-1.5 px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    copied
                      ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 text-emerald-600 dark:text-emerald-300'
                      : isDark
                      ? 'border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800'
                      : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Sao chép nội dung"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copied ? 'Đã chép!' : 'Sao chép'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTogglePin}
                  className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                    note.isPinned
                      ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400'
                      : isDark
                      ? 'border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                      : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                  title={note.isPinned ? 'Bỏ ghim ghi chú' : 'Ghim ghi chú lên đầu'}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={`p-1.5 px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isDark
                    ? 'border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800'
                    : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Chỉnh sửa nội dung"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chỉnh sửa</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu lại'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {!isEditing ? (
            /* View Mode */
            <div className="space-y-4">
              {/* Title & metadata */}
              <div>
                <h2 className={`text-lg sm:text-xl font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {note.title}
                </h2>
                <div className={`flex items-center gap-4 mt-2 text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  <span className="inline-flex items-center gap-1.5 leading-none">
                    <Calendar className="w-3.5 h-3.5 shrink-0 -translate-y-[0.5px] text-indigo-500" />
                    <span>Cập nhật: {note.updatedAt}</span>
                  </span>
                  <span>•</span>
                  <span>{wordCount} từ ({charCount} ký tự)</span>
                </div>
              </div>

              {/* Tags list */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className={`text-[11px] font-semibold mr-1 flex items-center gap-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    <Tag className="w-3 h-3" />
                    <span>Thẻ:</span>
                  </span>
                  {note.tags.map(t => {
                    const cleanTag = t.replace(/^#+/, '');
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          if (onSelectTag) {
                            onSelectTag(cleanTag);
                            onClose();
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                          isDark
                            ? 'bg-neutral-800 hover:bg-neutral-700 text-indigo-300 border border-neutral-700'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                        }`}
                        title={`Lọc danh sách theo thẻ ${cleanTag}`}
                      >
                        <span>{cleanTag}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Note Content (Reader view) */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans ${
                  isDark
                    ? 'bg-neutral-950/60 border-neutral-800 text-neutral-200'
                    : 'bg-slate-50/70 border-slate-200 text-slate-800'
                }`}
              >
                {note.content}
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Tiêu đề ghi chú
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Nhập tiêu đề ghi chú..."
                  className={`w-full px-3 py-2 text-sm font-semibold rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                    Môn học liên quan
                  </label>
                  <select
                    value={editForm.courseId}
                    onChange={e => setEditForm({ ...editForm, courseId: e.target.value })}
                    className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="">-- Không phân môn (Ghi chú chung) --</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isPinned}
                      onChange={e => setEditForm({ ...editForm, isPinned: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <span className={isDark ? 'text-neutral-300' : 'text-slate-700'}>
                      Ghim ghi chú này lên đầu danh sách
                    </span>
                  </label>
                </div>
              </div>

              {/* Tags Editor */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Quản lý thẻ tag (Tags)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {editForm.tags.map(t => {
                    const cleanTag = t.replace(/^#+/, '');
                    return (
                      <span
                        key={t}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                          isDark
                            ? 'bg-neutral-800 text-indigo-300 border border-neutral-700'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        <span>{cleanTag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-rose-500 cursor-pointer"
                          title="Xoá thẻ này"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                  {editForm.tags.length === 0 && (
                    <span className="text-xs text-slate-400 italic">Chưa có thẻ nào.</span>
                  )}
                </div>

                <form onSubmit={handleAddTag} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập tên thẻ tag (ví dụ: MongoDB, Hook, Kiến trúc)..."
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark
                        ? 'bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={!newTagInput.trim()}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm thẻ</span>
                  </button>
                </form>
              </div>

              {/* Content Editor */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`block text-xs font-semibold ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                    Nội dung chi tiết
                  </label>
                  <span className={`text-[11px] ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                    {wordCount} từ ({charCount} ký tự)
                  </span>
                </div>
                <textarea
                  rows={10}
                  value={editForm.content}
                  onChange={e => setEditForm({ ...editForm, content: e.target.value })}
                  placeholder="Nhập nội dung ghi chép, code mẫu, kiến thức..."
                  className={`w-full p-3.5 text-xs sm:text-sm leading-relaxed rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between gap-3 shrink-0 ${
            isDark ? 'border-neutral-800 bg-neutral-900/90' : 'border-slate-100 bg-slate-50/50'
          }`}
        >
          <div>
            {isConfirmingDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-500 font-medium">Xác nhận xoá ghi chú này?</span>
                <button
                  type="button"
                  onClick={async () => {
                    await onDeleteNote(note.id);
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
                <span>Xoá ghi chú</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
                  isDark ? 'text-neutral-400 hover:bg-neutral-800' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Huỷ sửa
              </button>
            )}

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
