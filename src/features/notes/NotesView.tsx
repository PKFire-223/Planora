import { useState } from 'react';
import { Plus, Trash2, Tag, Pin, Search } from 'lucide-react';
import { Note } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface NotesViewProps {
  notes: Note[];
  onCreateNote: (data: Partial<Note>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
}

export function NotesView({ notes, onCreateNote, onDeleteNote }: NotesViewProps) {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    tags: 'Backend, Architecture',
    isPinned: false
  });

  const filtered = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.tags.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    await onCreateNote({
      title: form.title,
      content: form.content,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      isPinned: form.isPinned
    });
    setIsModalOpen(false);
    setForm({ title: '', content: '', tags: 'Backend, Architecture', isPinned: false });
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề, nội dung, thẻ tag..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
              isDark 
                ? 'bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500' 
                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-2xs'
            }`}
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Ghi Chú Mới</span>
        </button>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(note => (
          <div
            key={note.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              isDark
                ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                : 'bg-white border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {note.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                  <span>{note.title}</span>
                </h3>
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                    isDark ? 'text-neutral-400 hover:text-rose-400 hover:bg-neutral-800' : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                  }`}
                  title="Xoá ghi chú"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Note Content */}
              <div className={`text-xs leading-relaxed whitespace-pre-wrap p-3.5 rounded-xl border mb-3 max-h-48 overflow-y-auto ${
                isDark 
                  ? 'bg-neutral-950/60 border-neutral-800/80 text-neutral-300' 
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                {note.content}
              </div>
            </div>

            <div className={`flex items-center justify-between pt-3 border-t text-[11px] ${
              isDark ? 'border-neutral-800/80 text-neutral-400' : 'border-slate-100 text-slate-400'
            }`}>
              <div className="flex flex-wrap gap-1.5">
                {note.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 ${
                      isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Tag className="w-2.5 h-2.5" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
              <span>{note.updatedAt}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl border transition-all ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-base font-bold mb-4">Tạo Ghi Chú Học Tập</h3>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Tiêu đề ghi chú
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

              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Thẻ tag (cách nhau bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: React, TypeScript, Architecture"
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Nội dung ghi chép
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Nội dung tóm tắt bài học hoặc code mẫu..."
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
                <label htmlFor="pin-note" className={`text-xs cursor-pointer ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Ghim ghi chú này lên đầu danh sách
                </label>
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
