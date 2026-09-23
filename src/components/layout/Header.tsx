import { Sparkles, Sun, Moon, LogIn, Menu, Languages } from 'lucide-react';
import { ActiveTab, NotificationItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
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
  onDeleteNotification?: (id: string) => void;
  onToggleMobileMenu?: () => void;
}

export function Header({ 
  activeTab, 
  onOpenAi, 
  onGoToLanding,
  onOpenAuth,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigate,
  onDeleteNotification,
  onToggleMobileMenu
}: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const title = t(`header.${activeTab}.title`, 'Planora');
  const subtitle = t(`header.${activeTab}.subtitle`, 'Smart Learning & Workspace Platform');

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };

  return (
    <header className={`h-16 border-b px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md transition-colors ${
      isDark 
        ? 'bg-neutral-950/80 border-neutral-800 text-neutral-100' 
        : 'bg-white/85 border-slate-200 text-slate-900 shadow-xs'
    }`}>
      {/* Title & Subtitle + Mobile Hamburger Menu */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="p-2 -ml-1 rounded-xl text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 lg:hidden cursor-pointer shrink-0 transition-colors"
            title="Mở menu điều hướng"
            aria-label="Mở menu điều hướng"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight truncate">
            {title}
          </h1>
          <p className={`text-xs hidden md:block truncate ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Quick Language Toggle */}
        <button
          type="button"
          onClick={toggleLanguage}
          title={language === 'en' ? 'Switch to Tiếng Việt' : 'Switch to English'}
          className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:bg-neutral-800 hover:text-white'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <Languages className="w-3.5 h-3.5 text-indigo-500" />
          <span className="uppercase tracking-wider font-bold text-[11px]">
            {language === 'en' ? 'EN' : 'VI'}
          </span>
        </button>

        {/* Ask AI button */}
        <button
          type="button"
          onClick={onOpenAi}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            isDark
              ? 'bg-indigo-950/40 border-indigo-700/50 text-indigo-300 hover:bg-indigo-900/50 hover:text-white'
              : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="hidden sm:inline">{t('nav.ai')}</span>
          <span className="sm:hidden">AI</span>
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Light Mode' : 'Dark Mode'}
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

        {/* Notification pop-up */}
        <NotificationPopover
          notifications={notifications}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          onNavigate={onNavigate}
          onDeleteNotification={onDeleteNotification}
        />

        <div className={`h-5 w-px ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`} />

        {/* User Account Menu Pop-up */}
        {user ? (
          <UserMenu onNavigate={onNavigate} onGoToLanding={onGoToLanding} />
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onOpenAuth ? onOpenAuth('login') : null}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:text-white hover:bg-neutral-800' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng nhập</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth ? onOpenAuth('register') : null}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
            >
              <span>Đăng ký</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

