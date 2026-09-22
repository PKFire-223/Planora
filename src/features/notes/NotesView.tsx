import { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Tag,
  Pin,
  Search,
  Filter,
  X,
  ExternalLink,
  BookOpen,
  Calendar,
  Sparkles,
  StickyNote
} from 'lucide-react';
import { Note, Course } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { NoteDetailModal } from './NoteDetailModal';

interface NotesViewProps {
  notes: Note[];
  courses?: Course[];
  onCreateNote: (data: Partial<Note>) => Promise<void>;
  onUpdateNote?: (id: string, data: Partial<Note>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  initialSearchTerm?: string;
}

export function NotesView({
  notes,
  courses = [],
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  initialSearchTerm = ''
}: NotesViewProps) {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state for creating a new note
  const [form, setForm] = useState({
    title: '',
    content: '',
    tags: '',
    courseId: '',
    isPinned: false
  });

  // Calculate dynamically all unique tags from existing notes
  // If a note with a new tag is added, it will automatically appear here.
  // If a note is deleted or tags removed and no note has this tag, it automatically disappears.
  const allAvailableTags = useMemo(() => {
    const tagCountMap = new Map<string, number>();
    notes.forEach(note => {
      (note.tags || []).forEach(t => {
        const trimmed = t.trim().replace(/^#+/, '');
        if (trimmed) {
          tagCountMap.set(trimmed, (tagCountMap.get(trimmed) || 0) + 1);
        }
      });
    });

    return Array.from(tagCountMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [notes]);

  // If currently selected tag no longer exists in any note, reset filter to 'all'
  useEffect(() => {
    if (selectedTag !== 'all') {
      const exists = allAvailableTags.some(t => t.tag.toLowerCase() === selectedTag.toLowerCase());
      if (!exists) {
        setSelectedTag('all');
      }
    }
  }, [allAvailableTags, selectedTag]);

  // Keep selectedNote in sync if notes list updates (e.g. edited, pinned, deleted)
  useEffect(() => {
    if (selectedNote) {
      const updated = notes.find(n => n.id === selectedNote.id);
      if (updated) {
        setSelectedNote(updated);
      } else {
        setSelectedNote(null);
      }
    }
  }, [notes]);

  // Filter notes by search query AND selected tag
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return notes.filter(n => {
      const matchesSearch =
        !term ||
        n.title.toLowerCase().includes(term) ||
        n.content.toLowerCase().includes(term) ||
        (n.tags || []).some(t => t.replace(/^#+/, '').toLowerCase().includes(term));

      const matchesTag =
        selectedTag === 'all' ||
        (n.tags || []).some(t => t.replace(/^#+/, '').toLowerCase() === selectedTag.toLowerCase());

      return matchesSearch && matchesTag;
    });
  }, [notes, searchTerm, selectedTag]);

  // Pinned notes sorted to the top, then newest
  const sortedNotes = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.updatedAt || '').localeCompare(a.updatedAt || '');
    });
  }, [filtered]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    const parsedTags = form.tags
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    await onCreateNote({
      title: form.title.trim(),
      content: form.content.trim(),
      tags: parsedTags.length > 0 ? parsedTags : ['Chung'],
      courseId: form.courseId || undefined,
      isPinned: form.isPinned
    });

    setIsCreateModalOpen(false);
    setForm({
      title: '',
      content: '',
      tags: '',
      courseId: '',
      isPinned: false
    });
  };

  const handleAddTagToForm = (tag: string) => {
    const current = form.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    if (!current.includes(tag)) {
      setForm(prev => ({
        ...prev,
        tags: current.length > 0 ? `${current.join(', ')}, ${tag}` : tag
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search Bar & Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, nội dung, thẻ tag..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-9 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500'
                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-2xs'
            }`}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 rounded-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Ghi Chú Mới</span>
        </button>
      </div>

      {/* Dynamic Tag Filter Bar */}
      <div
        className={`p-3.5 rounded-2xl border transition-all ${
          isDark
            ? 'bg-neutral-900/60 border-neutral-800'
            : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-neutral-300">
            <Filter className="w-3.5 h-3.5 text-indigo-500" />
            <span>Lọc theo thẻ tag</span>
            <span className="text-[11px] font-normal text-slate-400 dark:text-neutral-500">
              ({allAvailableTags.length} thẻ đang có)
            </span>
          </div>

          {selectedTag !== 'all' && (
            <button
              onClick={() => setSelectedTag('all')}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Xoá lọc tag</span>
            </button>
          )}
        </div>

        {/* Tags horizontal list */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* 'All' button */}
          <button
            type="button"
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedTag === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : isDark
                ? 'bg-neutral-800/90 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-700/80'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
            }`}
          >
            <span>Tất cả</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                selectedTag === 'all'
                  ? 'bg-indigo-700 text-white'
                  : isDark
                  ? 'bg-neutral-700 text-neutral-300'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {notes.length}
            </span>
          </button>

          {/* Dynamic Tag Pills */}
          {allAvailableTags.map(({ tag, count }) => {
            const isCurrent = selectedTag.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(isCurrent ? 'all' : tag)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-500/30'
                    : isDark
                    ? 'bg-neutral-800/90 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-700/80'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                }`}
                title={`Lọc theo thẻ ${tag}`}
              >
                <Tag className={`w-3 h-3 ${isCurrent ? 'text-white' : 'text-indigo-500'}`} />
                <span>{tag}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-semibold ${
                    isCurrent
                      ? 'bg-indigo-700 text-white'
                      : isDark
                      ? 'bg-neutral-700 text-neutral-300'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {allAvailableTags.length === 0 && (
            <span className="text-xs text-slate-400 dark:text-neutral-500 italic py-1">
              Chưa có thẻ tag nào trong các ghi chú hiện tại. Hãy tạo ghi chú và gắn thẻ!
            </span>
          )}
        </div>

        {/* Selected tag filter notification banner */}
        {selectedTag !== 'all' && (
          <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 dark:border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-neutral-400 flex items-center gap-1.5">
              <span>Đang lọc theo thẻ:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedTag}</span>
              <span>({filtered.length} ghi chú phù hợp)</span>
            </span>
            <button
              onClick={() => setSelectedTag('all')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer"
            >
              Hiển thị tất cả
            </button>
          </div>
        )}
      </div>

      {/* Notes Grid */}
      {sortedNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sortedNotes.map(note => {
            const course = courses.find(c => c.id === note.courseId);
            return (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`group p-5 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer hover:scale-[1.008] active:scale-[0.998] relative ${
                  isDark
                    ? 'bg-neutral-900/60 border-neutral-800 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5'
                    : 'bg-white border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0 pr-2">
                      {note.isPinned && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold shrink-0 border border-amber-500/20">
                          <Pin className="w-2.5 h-2.5" />
                          <span>Ghim</span>
                        </span>
                      )}

                      {course && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${
                            isDark
                              ? 'bg-neutral-800 text-neutral-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          <BookOpen className="w-2.5 h-2.5 text-indigo-500" />
                          <span>{course.code}</span>
                        </span>
                      )}

                      <h3
                        className={`font-bold text-sm truncate transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400 ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                        title={note.title}
                      >
                        {note.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedNote(note);
                        }}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer opacity-80 group-hover:opacity-100 ${
                          isDark
                            ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                            : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        title="Mở xem chi tiết"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={async e => {
                          e.stopPropagation();
                          await onDeleteNote(note.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isDark
                            ? 'text-neutral-400 hover:text-rose-400 hover:bg-neutral-800'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                        }`}
                        title="Xoá ghi chú này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Note Content Preview */}
                  <div
                    className={`text-xs leading-relaxed whitespace-pre-wrap p-3.5 rounded-xl border mb-3 max-h-48 overflow-hidden relative ${
                      isDark
                        ? 'bg-neutral-950/60 border-neutral-800/80 text-neutral-300'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {note.content}
                    {note.content.length > 220 && (
                      <div
                        className={`absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t pointer-events-none flex items-end justify-center pb-1 ${
                          isDark
                            ? 'from-neutral-950 via-neutral-950/80 to-transparent'
                            : 'from-slate-50 via-slate-50/80 to-transparent'
                        }`}
                      >
                        <span className="text-[10px] text-indigo-500 font-semibold">
                          Bấm để xem đầy đủ...
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer: Tag badges and date */}
                <div
                  className={`flex items-center justify-between pt-3 border-t text-[11px] gap-2 ${
                    isDark ? 'border-neutral-800/80 text-neutral-400' : 'border-slate-100 text-slate-400'
                  }`}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {(note.tags || []).map((rawTag: string) => {
                      const tag = rawTag.trim().replace(/^#+/, '');
                      if (!tag) return null;
                      const isCurrent = selectedTag.toLowerCase() === tag.toLowerCase();
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedTag(tag);
                          }}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-indigo-600 text-white'
                              : isDark
                              ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                          }`}
                          title={`Lọc theo thẻ ${tag}`}
                        >
                          <Tag className="w-2.5 h-2.5" />
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>

                  <span className="inline-flex items-center gap-1 shrink-0 text-[10px]">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{note.updatedAt}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div
          className={`p-12 text-center rounded-2xl border ${
            isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <StickyNote className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold mb-1">Không tìm thấy ghi chú nào</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            {selectedTag !== 'all'
              ? `Không có ghi chú nào chứa thẻ tag "${selectedTag}".`
              : searchTerm
              ? `Không có ghi chú nào khớp với từ khoá "${searchTerm}".`
              : 'Bạn chưa tạo ghi chú nào. Hãy tạo ghi chú để lưu trữ kiến thức và mẹo học tập!'}
          </p>
          {selectedTag !== 'all' ? (
            <button
              onClick={() => setSelectedTag('all')}
              className="px-4 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Xoá bộ lọc tag
            </button>
          ) : (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo ghi chú đầu tiên</span>
            </button>
          )}
        </div>
      )}

      {/* Note Detail Modal */}
      {selectedNote && (
        <NoteDetailModal
          note={selectedNote}
          courses={courses}
          isOpen={Boolean(selectedNote)}
          onClose={() => setSelectedNote(null)}
          onUpdateNote={async (id, data) => {
            if (onUpdateNote) {
              await onUpdateNote(id, data);
            }
          }}
          onDeleteNote={async id => {
            await onDeleteNote(id);
            setSelectedNote(null);
          }}
          onSelectTag={tag => {
            setSelectedTag(tag);
          }}
        />
      )}

      {/* Create Note Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl border transition-all ${
              isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Tạo Ghi Chú Học Tập</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Tiêu đề ghi chú <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Mô hình MVC và các quy chuẩn phân lớp"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {courses.length > 0 && (
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                    Khoá học liên quan (tuỳ chọn)
                  </label>
                  <select
                    value={form.courseId}
                    onChange={e => setForm({ ...form, courseId: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
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
              )}

              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Thẻ tag (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Backend, Kiến trúc, Node.js"
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
                {allAvailableTags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[11px]">
                    <span className="text-slate-400">Gợi ý thẻ có sẵn:</span>
                    {allAvailableTags.slice(0, 5).map(({ tag }) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleAddTagToForm(tag)}
                        className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] hover:underline cursor-pointer"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Nội dung ghi chép <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Nội dung tóm tắt bài học, công thức, hoặc code mẫu..."
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pin-note"
                  checked={form.isPinned}
                  onChange={e => setForm({ ...form, isPinned: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="pin-note"
                  className={`text-xs cursor-pointer ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}
                >
                  Ghim ghi chú này lên đầu danh sách
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
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
                  Lưu Ghi Chú
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
