import { useState } from 'react';
import { AlertCircle, CheckCircle2, Plus, Bug, ShieldAlert, Check, Lock } from 'lucide-react';
import { ErrorReport } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

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
  const { isDark } = useTheme();
  const { isAdmin } = useAuth();
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
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
        isDark 
          ? 'bg-neutral-900/60 border-neutral-800 text-white' 
          : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm mb-1">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Trung Tâm Báo Cáo & Xử Lý Sự Cố (Error Tracker)</span>
          </div>
          <p className={`text-xs max-w-xl leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
            {isAdmin 
              ? 'Quyền Quản Trị Viên (Admin): Bạn có toàn quyền ghi nhận, kiểm tra giải pháp và đánh dấu xác nhận đã khắc phục sự cố.'
              : 'Quyền Học Viên / Thành Viên: Bạn có thể gửi báo cáo sự cố mới và theo dõi tiến độ xử lý của kỹ thuật viên. Chỉ Quản trị viên mới có thể xác nhận đã khắc phục.'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Báo Cáo Sự Cố Mới</span>
        </button>
      </div>

      {/* Tabs */}
      <div className={`inline-flex p-1 rounded-xl border text-xs font-medium ${
        isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-100 border-slate-200'
      }`}>
        {(['open', 'resolved', 'all'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              filter === tab
                ? isDark
                  ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                  : 'bg-white text-indigo-700 font-semibold shadow-xs'
                : isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'open' ? 'Đang Xử Lý' : tab === 'resolved' ? 'Đã Khắc Phục' : 'Tất Cả'}
          </button>
        ))}
      </div>

      {/* Error Reports List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl border text-xs ${
            isDark ? 'bg-neutral-900/30 border-neutral-800 text-neutral-400' : 'bg-white border-slate-200 text-slate-500 shadow-xs'
          }`}>
            Không có báo cáo lỗi nào trong danh mục này.
          </div>
        ) : (
          filtered.map(err => (
            <div
              key={err.id}
              className={`p-5 rounded-2xl border transition-all ${
                err.status === 'resolved'
                  ? isDark 
                    ? 'bg-neutral-950/40 border-neutral-800/60 opacity-80' 
                    : 'bg-slate-50 border-slate-200 opacity-80'
                  : isDark
                    ? 'bg-neutral-900/50 border-neutral-800'
                    : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    err.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                  }`}>
                    {err.status === 'resolved' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Bug className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <span>{err.title}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        err.severity === 'critical'
                          ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border border-red-200 dark:border-red-500/30'
                          : err.severity === 'high'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                          : err.severity === 'medium'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}>
                        {err.severity === 'critical' ? 'Nghiêm trọng' : err.severity === 'high' ? 'Cao' : err.severity === 'medium' ? 'Trung bình' : 'Nhẹ'}
                      </span>
                    </h4>
                    <div className={`flex items-center gap-3 text-[11px] mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                      <span>Module: {err.componentName}</span>
                      <span>Thời gian: {new Date(err.reportedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {err.status !== 'resolved' && (
                    isAdmin ? (
                      <button
                        onClick={() => setResolvingId(resolvingId === err.id ? null : err.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Xác nhận đã sửa</span>
                      </button>
                    ) : (
                      <span className={`text-[11px] px-2 py-1 rounded-md flex items-center gap-1 ${
                        isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Chỉ Admin phê duyệt</span>
                      </span>
                    )
                  )}
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    err.status === 'resolved'
                      ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10'
                      : 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/10'
                  }`}>
                    {err.status === 'resolved' ? 'Đã khắc phục' : 'Đang xử lý'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className={`text-xs leading-relaxed pl-11 mb-2 ${isDark ? 'text-neutral-300' : 'text-slate-600'}`}>
                {err.description}
              </p>

              {/* Resolution Notes */}
              {err.resolutionNotes && (
                <div className={`ml-11 mt-2 p-3 rounded-xl border text-xs leading-relaxed ${
                  isDark 
                    ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <strong>Phương án xử lý:</strong> {err.resolutionNotes}
                </div>
              )}

              {/* Expandable Resolution Form */}
              {resolvingId === err.id && (
                <div className={`ml-11 mt-3 p-3.5 rounded-xl border space-y-2.5 ${
                  isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <label className={`block text-xs font-medium ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                    Ghi chú giải pháp (Mô tả cách thức sửa đổi và kiểm tra):
                  </label>
                  <input
                    type="text"
                    value={resolutionNote}
                    onChange={e => setResolutionNote(e.target.value)}
                    placeholder="Ví dụ: Đã bổ sung validate middleware và xử lý try-catch fallback..."
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                      isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setResolvingId(null)}
                      className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer ${
                        isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Huỷ
                    </button>
                    <button
                      onClick={() => handleResolveSubmit(err.id)}
                      className="px-3.5 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium cursor-pointer shadow-xs"
                    >
                      Lưu Giải Pháp
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border transition-all ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-base font-bold mb-4">Báo Cáo Sự Cố / Bug Kỹ Thuật</h3>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Tiêu đề sự cố
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: MongoDB query timeout khi tải danh sách"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Phân vùng xảy ra lỗi (Module)
                </label>
                <select
                  value={form.componentName}
                  onChange={e => setForm({ ...form, componentName: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="Backend/Auth">Backend/Auth (Đăng nhập & JWT)</option>
                  <option value="Backend/Database">Backend/Database (MongoDB / Mongoose)</option>
                  <option value="Backend/Courses">Backend/Courses API</option>
                  <option value="Backend/Tasks">Backend/Tasks API</option>
                  <option value="Backend/AI">Backend/AI Service</option>
                  <option value="Frontend/UI">Frontend/Giao diện người dùng</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Mức độ nghiêm trọng
                </label>
                <select
                  value={form.severity}
                  onChange={e => setForm({ ...form, severity: e.target.value as ErrorReport['severity'] })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="low">Nhẹ (Low)</option>
                  <option value="medium">Trung bình (Medium)</option>
                  <option value="high">Cao (High)</option>
                  <option value="critical">Nghiêm trọng (Critical)</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Mô tả chi tiết & Các bước tái hiện lỗi
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Mô tả hành động dẫn đến lỗi và thông báo lỗi hiển thị..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
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
                  className="px-4 py-2 text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-xs cursor-pointer"
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
