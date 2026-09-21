import { useState } from 'react';
import { StickyNote, Plus, Trash2, Tag, Pin, Search } from 'lucide-react';
import { Note } from '../../types';

interface NotesViewProps {
  notes: Note[];
  onCreateNote: (data: Partial<Note>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
}

export function NotesView({ notes, onCreateNote, onDeleteNote }: NotesViewProps) {
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
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề, nội dung, thẻ tag..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-neutral-900/80 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi Chú Mới</span>
        </button>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(note => (
          <div
            key={note.id}
            className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  {note.isPinned && <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  <span>{note.title}</span>
                </h3>
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="p-1 text-neutral-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Note Content */}
              <div className="text-xs text-neutral-300 leading-relaxed font-mono whitespace-pre-wrap bg-neutral-950/60 p-3 rounded-lg border border-neutral-800/80 mb-3 max-h-48 overflow-y-auto">
                {note.content}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-[10px]">
              <div className="flex flex-wrap gap-1">
                {note.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono flex items-center gap-0.5"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
              <span className="text-neutral-400 font-mono">{note.updatedAt}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Tạo Ghi Chú Học Tập</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Tiêu đề ghi chú</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tổng quan mô hình MVC trong Express"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Thẻ tag (ngăn cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  placeholder="e.g. Node.js, Express, CleanCode"
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Nội dung ghi chép (Markdown / Code / Text)</label>
                <textarea
                  rows={6}
                  required
                  placeholder="# Ghi chú bài giảng..."
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-neutral-950 border border-neutral-800 text-white resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pin-note"
                  checked={form.isPinned}
                  onChange={e => setForm({ ...form, isPinned: e.target.checked })}
                  className="rounded border-neutral-700 bg-neutral-950 text-rose-600"
                />
                <label htmlFor="pin-note" className="text-xs text-neutral-300 cursor-pointer">
                  Ghim ghi chú quan trọng này lên đầu
                </label>
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
