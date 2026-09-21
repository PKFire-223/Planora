import { useState } from 'react';
import { AlertCircle, CheckCircle2, Plus, Bug, ShieldAlert, Check } from 'lucide-react';
import { ErrorReport } from '../../types';

interface ErrorReportsViewProps {
  errors: ErrorReport[];
  onReportError: (data: Partial<ErrorReport>) => Promise<void>;
  onResolveError: (id: string, notes: string) => Promise<void>;
}

export function ErrorReportsView({
  errors,
  onReportError,
  onResolveError
}: ErrorReportsViewProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('open');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    componentName: 'Frontend/Tasks',
    severity: 'medium' as ErrorReport['severity']
  });

  const filtered = filter === 'all'
    ? errors
    : filter === 'open'
    ? errors.filter(e => e.status !== 'resolved')
    : errors.filter(e => e.status === 'resolved');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) return;
    await onReportError(form);
    setIsModalOpen(false);
    setForm({
      title: '',
      description: '',
      componentName: 'Frontend/Tasks',
      severity: 'medium'
    });
  };

  const handleResolveSubmit = async (id: string) => {
    if (!resolutionNote) return;
    await onResolveError(id, resolutionNote);
    setResolvingId(null);
    setResolutionNote('');
  };

  return (
    <div className="space-y-6">
      {/* Information Banner */}
      <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Trung Tâm Báo Cáo & Sửa Lỗi (Error Management)</span>
          </div>
          <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
            Hệ thống ghi nhận ngoại lệ từ Backend API, lỗi Mongoose, và tiếp nhận phản hồi sự cố từ người dùng. Bạn có thể thêm báo cáo lỗi hoặc đánh dấu đã sửa xong (Resolved).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Báo Cáo Lỗi Mới</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {(['open', 'resolved', 'all'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === tab
                ? 'bg-neutral-800 text-white border border-neutral-700'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            {tab === 'open' ? 'Đang Xử Lý' : tab === 'resolved' ? 'Đã Khắc Phục' : 'Tất Cả'}
          </button>
        ))}
      </div>

      {/* Error Reports List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 bg-neutral-900/30 rounded-2xl border border-neutral-800 text-xs">
            Không có báo cáo lỗi nào trong danh mục này.
          </div>
        ) : (
          filtered.map(err => (
            <div
              key={err.id}
              className={`p-5 rounded-2xl border transition-all ${
                err.status === 'resolved'
                  ? 'bg-neutral-950/40 border-neutral-800/60 opacity-80'
                  : 'bg-neutral-900/50 border-neutral-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    err.status === 'resolved'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {err.status === 'resolved' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Bug className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{err.title}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        err.severity === 'critical'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : err.severity === 'high'
                          ? 'bg-rose-500/20 text-rose-300'
                          : err.severity === 'medium'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {err.severity.toUpperCase()}
                      </span>
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-1 font-mono">
                      <span>Module: {err.componentName}</span>
                      <span>Thời gian: {new Date(err.reportedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {err.status !== 'resolved' && (
                    <button
                      onClick={() => setResolvingId(resolvingId === err.id ? null : err.id)}
                      className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Xác nhận đã sửa</span>
                    </button>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-md font-mono ${
                    err.status === 'resolved'
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-amber-400 bg-amber-500/10'
                  }`}>
                    {err.status === 'resolved' ? 'Resolved' : 'Open'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-neutral-300 leading-relaxed pl-11 mb-2">
                {err.description}
              </p>

              {/* Resolution Notes */}
              {err.resolutionNotes && (
                <div className="ml-11 mt-2 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300">
                  <strong>Cách khắc phục:</strong> {err.resolutionNotes}
                </div>
              )}

              {/* Expandable Resolution Form */}
              {resolvingId === err.id && (
                <div className="ml-11 mt-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <label className="block text-[11px] font-mono text-neutral-400">
                    Ghi chú giải pháp (Mô tả bạn đã sửa lỗi này như thế nào):
                  </label>
                  <input
                    type="text"
                    value={resolutionNote}
                    onChange={e => setResolutionNote(e.target.value)}
                    placeholder="e.g. Đã bọc try-catch và bổ sung validate input ở controller..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setResolvingId(null)}
                      className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white"
                    >
                      Huỷ
                    </button>
                    <button
                      onClick={() => handleResolveSubmit(err.id)}
                      className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-medium"
                    >
                      Đánh Dấu Hoàn Tất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Gửi Báo Cáo Lỗi Mới</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Tiêu đề lỗi</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lỗi lưu ghi chú không cập nhật tag"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Mức độ nghiêm trọng</label>
                  <select
                    value={form.severity}
                    onChange={e => setForm({ ...form, severity: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white"
                  >
                    <option value="low">Thấp (Low)</option>
                    <option value="medium">Vừa (Medium)</option>
                    <option value="high">Cao (High)</option>
                    <option value="critical">Nghiêm trọng (Critical)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Vị trí / Module</label>
                  <input
                    type="text"
                    value={form.componentName}
                    onChange={e => setForm({ ...form, componentName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Mô tả chi tiết sự cố</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Hành vi thực tế, các bước tái hiện, thông báo lỗi nếu có..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white resize-none"
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
                  Gửi Báo Cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
