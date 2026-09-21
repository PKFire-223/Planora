import { Sparkles, Sun, Moon, LogIn } from 'lucide-react';
import { ActiveTab, NotificationItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { UserMenu } from './UserMenu';
import { NotificationPopover } from './NotificationPopover';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenAi: () => void;
  onGoToLanding?: () => void;
  onOpenAuth?: (tab: 'login' | 'register') => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigate: (tab: ActiveTab) => void;
}

export function Header({ 
  activeTab, 
  onOpenAi, 
  onGoToLanding,
  onOpenAuth,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigate
}: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  const titles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Bảng Điều Khiển Tổng Quan',
      subtitle: 'Theo dõi tiến độ học tập, bài tập cần xử lý và mục tiêu cá nhân.'
    },
    courses: {
      title: 'Khoá Học & Môn Học',
      subtitle: 'Danh sách môn học, tiến độ hoàn thành và phân bổ bài giảng.'
    },
    timetable: {
      title: 'Thời Khóa Biểu & Lịch Học',
      subtitle: 'Xếp lịch học Sáng/Chiều từ T2 đến CN bằng kéo thả trực quan và quản lý phòng học tự do.'
    },
    tasks: {
      title: 'Kế Hoạch & Bài Tập',
      subtitle: 'Quản lý danh sách việc cần làm, deadline và chia nhỏ bước bằng AI.'
    },
    notes: {
      title: 'Ghi Chú Học Tập',
      subtitle: 'Hệ thống tài liệu tóm tắt kiến thức, cú pháp và mẹo thực hành.'
    },
    goals: {
      title: 'Mục Tiêu & Chỉ Tiêu Tự Học',
      subtitle: 'Thiết lập KPI học tập cá nhân, số giờ học tập và bài tập giải quyết.'
    },
    ai: {
      title: 'Trợ Lý Học Tập AI (Planora Assistant)',
      subtitle: 'Hỏi đáp bài học, giải thích khái niệm phức tạp và gợi ý lộ trình.'
    },
    errors: {
      title: 'Trung Tâm Báo & Sửa Lỗi',
      subtitle: 'Ghi nhận sự cố, theo dõi trạng thái khắc phục và kiểm định chất lượng.'
    },
    structure: {
      title: 'Cấu Trúc Hệ Thống Planora',
      subtitle: 'Kiến trúc phân chia thư mục Full-Stack chuẩn mực mở rộng theo module.'
    },
    notifications: {
      title: 'Thông Báo & Nhắc Nhở',
      subtitle: 'Cập nhật deadline nộp bài, đề xuất tối ưu từ Gemini AI và hoạt động khóa học.'
    },
    profile: {
      title: 'Thông Tin Cá Nhân',
      subtitle: 'Hồ sơ học viên, thông tin liên hệ và chuyên ngành đào tạo.'
    },
    settings: {
      title: 'Cài Đặt & Tuỳ Chỉnh',
      subtitle: 'Quản lý giao diện, thông báo, mật khẩu và trải nghiệm cá nhân.'
    }
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className={`h-16 border-b px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md transition-colors ${
      isDark 
        ? 'bg-neutral-950/80 border-neutral-800 text-neutral-100' 
        : 'bg-white/85 border-slate-200 text-slate-900 shadow-xs'
    }`}>
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-base sm:text-lg font-bold tracking-tight">
          {current.title}
        </h1>
        <p className={`text-xs hidden sm:block ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
          {current.subtitle}
        </p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Ask AI button */}
        <button
          onClick={onOpenAi}
          className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            isDark
              ? 'bg-indigo-950/40 border-indigo-700/50 text-indigo-300 hover:bg-indigo-900/50 hover:text-white'
              : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="hidden sm:inline">Hỏi Trợ Lý AI</span>
          <span className="sm:hidden">AI</span>
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-amber-300 hover:bg-neutral-800 hover:text-amber-200'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          {isDark ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Icon thông báo pop-up */}
        <NotificationPopover
          notifications={notifications}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          onNavigate={onNavigate}
        />

        <div className={`h-5 w-px ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`} />

        {/* User Account Menu Pop-up (Logo duy nhất, bấm hiện pop-up hồ sơ, cài đặt, đăng xuất) */}
        {user ? (
          <UserMenu onNavigate={onNavigate} onGoToLanding={onGoToLanding} />
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAuth ? onOpenAuth('login') : null}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:text-white hover:bg-neutral-800' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>

            <button
              onClick={() => onOpenAuth ? onOpenAuth('register') : null}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
            >
              <span>Đăng ký</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
