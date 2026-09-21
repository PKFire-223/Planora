import { Sparkles, Sun, Moon, LogIn, LogOut, Shield, GraduationCap, Home } from 'lucide-react';
import { ActiveTab } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenAi: () => void;
  onGoToLanding?: () => void;
  onOpenAuth?: (tab: 'login' | 'register') => void;
}

export function Header({ activeTab, onOpenAi, onGoToLanding, onOpenAuth }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const { user, isAdmin, logout } = useAuth();

  const titles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Bảng Điều Khiển Tổng Quan',
      subtitle: 'Theo dõi tiến độ học tập, bài tập cần xử lý và mục tiêu cá nhân.'
    },
    courses: {
      title: 'Khoá Học & Môn Học',
      subtitle: 'Danh sách môn học, tiến độ hoàn thành và phân bổ bài giảng.'
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
        <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
          <span>{current.title}</span>
        </h2>
        <p className={`text-xs hidden sm:block ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
          {current.subtitle}
        </p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Go to Landing page */}
        {onGoToLanding && (
          <button
            onClick={onGoToLanding}
            title="Quay lại trang giới thiệu Planora"
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
                : 'bg-white border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-slate-50 shadow-2xs'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="hidden sm:inline">Trang Giới Thiệu</span>
          </button>
        )}

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

        <div className={`h-5 w-px ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`} />

        {/* Auth Section */}
        {user ? (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs ${
              isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                isAdmin 
                  ? 'bg-rose-500/20 text-rose-500' 
                  : 'bg-indigo-500/20 text-indigo-600'
              }`}>
                {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="font-semibold text-xs leading-none">{user.name}</span>
                <span className={`text-[10px] leading-tight font-medium ${isAdmin ? 'text-rose-500' : 'text-slate-500'}`}>
                  {isAdmin ? 'Quản Trị Viên' : 'Học Viên'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                if (onGoToLanding) onGoToLanding();
              }}
              title="Đăng xuất khỏi tài khoản"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800' 
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-200'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
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
