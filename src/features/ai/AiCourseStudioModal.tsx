import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  GraduationCap,
  Code2,
  Cpu,
  Globe,
  Database
} from 'lucide-react';

interface AiCourseStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onStartCourseGeneration: (topic: string, level: string, durationWeeks: number) => void;
}

const POPULAR_TOPICS = [
  {
    icon: Code2,
    title: 'Lập trình Fullstack Web (React, Node.js & TypeScript)',
    level: 'Người mới bắt đầu (Beginner)',
    weeks: 8
  },
  {
    icon: Database,
    title: 'Cấu Trúc Dữ Liệu & Giải Thuật Thực Chiến (LeetCode & Phỏng vấn)',
    level: 'Trung cấp (Intermediate)',
    weeks: 10
  },
  {
    icon: Cpu,
    title: 'Nhập Môn Trí Tuệ Nhân Tạo & Ứng Dụng LLMs (Gemini, LangChain)',
    level: 'Người mới bắt đầu (Beginner)',
    weeks: 6
  },
  {
    icon: Globe,
    title: 'Tiếng Anh Giao Tiếp & Kỹ Thuật Cho Dân IT',
    level: 'Mọi trình độ',
    weeks: 8
  }
];

export function AiCourseStudioModal({
  isOpen,
  onClose,
  isDark,
  onStartCourseGeneration
}: AiCourseStudioModalProps) {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Người mới bắt đầu (Beginner)');
  const [durationWeeks, setDurationWeeks] = useState(8);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onStartCourseGeneration(topic.trim(), level, durationWeeks);
    onClose();
  };

  const handlePickPopular = (item: typeof POPULAR_TOPICS[0]) => {
    setTopic(item.title);
    setLevel(item.level);
    setDurationWeeks(item.weeks);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Thiết Kế Khóa Học Bằng AI
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Planora AI tự động lập đề cương tuần, mục tiêu chuẩn đầu ra và tạo ngay môn học
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Topic Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5">
              Chủ đề hoặc Tên Môn Học Bạn Muốn Học:
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ví dụ: Lập trình Mobile Flutter, Khoa học Dữ liệu với Python, UI/UX Design..."
              className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          {/* Quick Popular Suggestions */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-neutral-400 mb-1.5">
              Gợi ý chủ đề phổ biến:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {POPULAR_TOPICS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePickPopular(item)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-start gap-2.5 ${
                      topic === item.title
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                        : isDark
                          ? 'border-neutral-800 hover:bg-neutral-800/60 text-neutral-300'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mt-0.5 text-indigo-500 shrink-0" />
                    <span className="line-clamp-2 leading-snug">{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level & Duration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5">
                Trình độ:
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="Người mới bắt đầu (Beginner)">Người mới bắt đầu (Beginner)</option>
                <option value="Trung cấp (Intermediate)">Trung cấp (Intermediate)</option>
                <option value="Nâng cao (Advanced)">Nâng cao (Advanced)</option>
                <option value="Mọi trình độ">Mọi trình độ (All levels)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5">
                Thời lượng khóa học:
              </label>
              <select
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value={4}>4 tuần (Khóa học cấp tốc / Chuyên đề)</option>
                <option value={6}>6 tuần (Tiêu chuẩn ngắn hạn)</option>
                <option value={8}>8 tuần (Lộ trình đầy đủ)</option>
                <option value={10}>10 tuần (Chuyên sâu)</option>
                <option value={12}>12 tuần (Học kỳ Đại học)</option>
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                isDark ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!topic.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>🚀 Bắt Đầu Thiết Kế Khóa Học</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
