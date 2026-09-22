import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Database, 
  Cpu, 
  CheckCircle2, 
  Key, 
  Smartphone,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface SettingsViewProps {
  lastAutoSaveTime?: string | null;
  isAutoSaving?: boolean;
  onTriggerManualSave?: () => void;
}

export function SettingsView({
  lastAutoSaveTime,
  isAutoSaving,
  onTriggerManualSave
}: SettingsViewProps = {}) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  // Notification toggles
  const [notifyDeadline, setNotifyDeadline] = useState(true);
  const [notifyAiTips, setNotifyAiTips] = useState(true);
  const [notifyCourseUpdates, setNotifyCourseUpdates] = useState(false);

  // AI & Study settings
  const [aiBreakdownDepth, setAiBreakdownDepth] = useState<'standard' | 'detailed'>('detailed');
  const [defaultTaskMinutes, setDefaultTaskMinutes] = useState(45);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu xác nhận không trùng khớp.' });
      return;
    }
    setPasswordMsg({ type: 'success', text: 'Đổi mật khẩu thành công! Mật khẩu mới đã được cập nhật.' });
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setTimeout(() => setPasswordMsg(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border flex items-center justify-between gap-4 transition-colors ${
        isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Cài Đặt Hệ Thống & Trải Nghiệm
            </h1>
            <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Tùy chỉnh giao diện, thông báo, thông số AI và bảo mật tài khoản cá nhân.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Giao diện & Chủ đề */}
      <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${
        isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="flex items-center gap-2.5 pb-3 border-b dark:border-neutral-800 border-slate-200">
          <Sun className="w-5 h-5 text-indigo-500" />
          <h2 className="text-base font-bold">Chế Độ Hiển Thị & Giao Diện</h2>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <div className="font-semibold text-xs sm:text-sm">Chế độ giao diện (Dark / Light Mode)</div>
            <div className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Hiện tại bạn đang sử dụng chế độ {isDark ? 'Tối (Dark Theme)' : 'Sáng (Light Theme)'}
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              isDark 
                ? 'bg-neutral-800 border-neutral-700 text-amber-300 hover:bg-neutral-700' 
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>Chuyển sang {isDark ? 'Chế độ Sáng' : 'Chế độ Tối'}</span>
          </button>
        </div>
      </div>

      {/* 2. Cài đặt Thông Báo */}
      <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${
        isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="flex items-center gap-2.5 pb-3 border-b dark:border-neutral-800 border-slate-200">
          <Bell className="w-5 h-5 text-indigo-500" />
          <h2 className="text-base font-bold">Tùy Chọn Thông Báo</h2>
        </div>

        <div className="space-y-3.5">
          <label className="flex items-center justify-between cursor-pointer py-1.5">
            <div>
              <div className="font-semibold text-xs sm:text-sm">Nhắc nhở hạn chót bài tập (Deadlines)</div>
              <div className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Nhận cảnh báo khi bài tập đến gần hạn hoàn thành trong 24 giờ.
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifyDeadline}
              onChange={e => setNotifyDeadline(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-1.5">
            <div>
              <div className="font-semibold text-xs sm:text-sm">Đề xuất tối ưu hóa từ Gemini AI</div>
              <div className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Nhận phân tích gợi ý chia nhỏ subtask tự động khi bài tập có độ phức tạp cao.
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifyAiTips}
              onChange={e => setNotifyAiTips(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-1.5">
            <div>
              <div className="font-semibold text-xs sm:text-sm">Cập nhật tài liệu & bài giảng khóa học</div>
              <div className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Thông báo khi giảng viên cập nhật tài liệu hoặc thay đổi lịch trình.
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifyCourseUpdates}
              onChange={e => setNotifyCourseUpdates(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* 3. Đổi Mật Khẩu */}
      <form onSubmit={handlePasswordSubmit} className={`p-6 rounded-2xl border space-y-4 transition-colors ${
        isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b dark:border-neutral-800 border-slate-200">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold">Bảo Mật & Đổi Mật Khẩu</h2>
          </div>
          {passwordMsg && (
            <div className={`text-xs font-bold px-3 py-1 rounded-full border ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
            }`}>
              {passwordMsg.text}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
              Mật khẩu mới
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
              Nhập lại mật khẩu mới
            </label>
            <input
              type="password"
              required
              value={confirmNewPassword}
              onChange={e => setConfirmNewPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu"
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-1">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition-colors"
          >
            Cập Nhật Mật Khẩu
          </button>
        </div>
      </form>

      {/* 4. Tự Động Lưu & Sao Lưu Dữ Liệu Định Kỳ */}
      <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${
        isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b dark:border-neutral-800 border-slate-200">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-bold">Sao Lưu & Bảo Vệ Dữ Liệu Tự Động</h2>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Chu kỳ 5 phút/lần</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-1">
          <div>
            <div className="font-semibold text-xs sm:text-sm">Trạng thái đồng bộ tự động</div>
            <div className={`text-xs mt-0.5 max-w-xl leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Hệ thống tự động lưu toàn bộ dữ liệu khoá học, nhiệm vụ và mục tiêu học tập định kỳ mỗi 5 phút để bảo vệ dữ liệu khi mất kết nối mạng đột ngột.
              {lastAutoSaveTime && (
                <span className="block mt-1 font-medium text-emerald-600 dark:text-emerald-400">
                  Lần sao lưu gần nhất: {lastAutoSaveTime}
                </span>
              )}
            </div>
          </div>

          {onTriggerManualSave && (
            <button
              type="button"
              onClick={onTriggerManualSave}
              disabled={isAutoSaving}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                isAutoSaving
                  ? 'bg-indigo-500/20 text-indigo-400 cursor-not-allowed border-indigo-500/30'
                  : isDark
                    ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isAutoSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                  <span>Đang đồng bộ...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Sao lưu ngay bây giờ</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
