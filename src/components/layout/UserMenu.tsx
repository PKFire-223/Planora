import { useState, useRef, useEffect } from 'react';
import { 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Shield, 
  GraduationCap, 
  Mail, 
  ChevronRight,
  Info,
  AlertCircle,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { ActiveTab } from '../../types';

interface UserMenuProps {
  onNavigate: (tab: ActiveTab) => void;
  onGoToLanding?: () => void;
}

export function UserMenu({ onNavigate, onGoToLanding }: UserMenuProps) {
  const { user, isAdmin, logout } = useAuth();
  const { isDark } = useTheme();
  const { language, t } = useLanguage();
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
      {/* Avatar button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={`Account: ${user.name}`}
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

      {/* User dropdown menu */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150 ${
          isDark 
            ? 'bg-neutral-900 border-neutral-800 text-white shadow-black/60' 
            : 'bg-white border-slate-200 text-slate-900 shadow-indigo-100'
        }`}>
          {/* User profile card */}
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
                  {isAdmin ? (language === 'vi' ? 'Quản Trị Viên' : 'Administrator') : (language === 'vi' ? 'Học Viên' : 'Student')}
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
                <span>{t('nav.profile')}</span>
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
                <span>{t('nav.settings')}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => {
                onNavigate('errors');
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                isDark 
                  ? 'hover:bg-neutral-800 text-neutral-200 hover:text-white' 
                  : 'hover:bg-indigo-50 text-slate-700 hover:text-indigo-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isDark ? 'bg-neutral-800 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <span>{language === 'vi' ? 'Báo lỗi & Phản hồi' : 'Report Issue & Bug'}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  onNavigate('users');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isDark 
                    ? 'hover:bg-neutral-800 text-indigo-300 hover:text-white' 
                    : 'hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${isDark ? 'bg-indigo-950/70 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span>{t('nav.users')} (Admin)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            )}
          </div>

          {/* Divider & Sign out */}
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
                <span>{language === 'vi' ? 'Đăng xuất tài khoản' : 'Sign Out'}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
