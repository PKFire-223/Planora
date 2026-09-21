import { useState, useRef, useEffect } from 'react';
import { 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Shield, 
  GraduationCap, 
  Mail, 
  ChevronRight,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ActiveTab } from '../../types';

interface UserMenuProps {
  onNavigate: (tab: ActiveTab) => void;
  onGoToLanding?: () => void;
}

export function UserMenu({ onNavigate, onGoToLanding }: UserMenuProps) {
  const { user, isAdmin, logout } = useAuth();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      {/* Rút gọn chỉ hiện mỗi hình logo / avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={`Tài khoản: ${user.name}`}
        className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer relative ${
          isOpen
            ? 'ring-2 ring-indigo-500/50 border-indigo-500 shadow-sm'
            : isDark
              ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800'
              : 'bg-white border-slate-200 hover:bg-slate-50 shadow-2xs'
        }`}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
          isAdmin 
            ? 'bg-rose-500/20 text-rose-500' 
            : 'bg-indigo-500/20 text-indigo-600'
        }`}>
          {isAdmin ? <Shield className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
        </div>

        {/* Small active badge */}
        <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-white dark:ring-neutral-900" />
      </button>

      {/* Pop-up menu tài khoản */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150 ${
          isDark 
            ? 'bg-neutral-900 border-neutral-800 text-white shadow-black/60' 
            : 'bg-white border-slate-200 text-slate-900 shadow-indigo-100'
        }`}>
          {/* Header Giới thiệu tài khoản */}
          <div className={`p-3 rounded-xl mb-1.5 border flex items-start gap-3 ${
            isDark ? 'bg-neutral-950/80 border-neutral-800' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
              isAdmin 
                ? 'bg-rose-500/20 text-rose-500' 
                : 'bg-indigo-500/20 text-indigo-600'
            }`}>
              {isAdmin ? <Shield className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm truncate block">{user.name}</span>
              </div>
              <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                {user.email}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  isAdmin 
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' 
                    : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                }`}>
                  {isAdmin ? 'Quản Trị Viên' : 'Học Viên'}
                </span>
                <span className={`text-[10px] ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                  • {user.studentCode || 'Planora LMS'}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items: Profile, Settings, Info */}
          <div className="space-y-0.5 py-1">
            <button
              onClick={() => {
                onNavigate('profile');
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                isDark 
                  ? 'hover:bg-neutral-800 text-neutral-200 hover:text-white' 
                  : 'hover:bg-indigo-50 text-slate-700 hover:text-indigo-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isDark ? 'bg-neutral-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <span>Thông tin cá nhân</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => {
                onNavigate('settings');
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                isDark 
                  ? 'hover:bg-neutral-800 text-neutral-200 hover:text-white' 
                  : 'hover:bg-indigo-50 text-slate-700 hover:text-indigo-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isDark ? 'bg-neutral-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                  <Settings className="w-3.5 h-3.5" />
                </div>
                <span>Cài đặt hệ thống</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>
          </div>

          {/* Divider & Đăng xuất được đem vô trong này luôn - Căn chỉnh đồng bộ 3 mục */}
          <div className={`pt-1.5 mt-1 border-t ${isDark ? 'border-neutral-800' : 'border-slate-100'}`}>
            <button
              onClick={async () => {
                setIsOpen(false);
                await logout();
                if (onGoToLanding) onGoToLanding();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                isDark 
                  ? 'hover:bg-rose-950/40 text-rose-400' 
                  : 'hover:bg-rose-50 text-rose-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isDark ? 'bg-rose-950/50 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
                  <LogOut className="w-3.5 h-3.5" />
                </div>
                <span>Đăng xuất tài khoản</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
