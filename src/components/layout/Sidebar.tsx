import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarDays, 
  CheckSquare, 
  StickyNote, 
  Target, 
  Bot, 
  Home, 
  X, 
  Users,
  Settings as SettingsIcon,
  ShieldCheck
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PlanoraLogo } from '../common/PlanoraLogo';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  errorCount?: number;
  onGoToLanding?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  lastAutoSaveTime?: string | null;
  isAutoSaving?: boolean;
  onTriggerManualSave?: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: any;
  highlight?: boolean;
  badge?: number;
}

export function Sidebar({ 
  activeTab, 
  onTabChange, 
  errorCount, 
  onGoToLanding,
  isMobileOpen,
  onCloseMobile,
  lastAutoSaveTime,
  isAutoSaving,
  onTriggerManualSave
}: SidebarProps) {
  const { isDark } = useTheme();
  const { isAdmin } = useAuth();
  const { language, t } = useLanguage();

  const baseNavItems: NavItem[] = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'courses', label: t('nav.courses'), icon: BookOpen },
    { id: 'timetable', label: t('nav.timetable'), icon: CalendarDays },
    { id: 'tasks', label: t('nav.tasks'), icon: CheckSquare },
    { id: 'notes', label: t('nav.notes'), icon: StickyNote },
    { id: 'goals', label: t('nav.goals'), icon: Target },
    { id: 'ai', label: t('nav.ai'), icon: Bot, highlight: true }
  ];

  // Chỉ role admin mới có thêm menu là trang quản lý dữ liệu tài khoản và trạng thái online
  const navItems: NavItem[] = isAdmin 
    ? [
        ...baseNavItems,
        { id: 'users', label: t('nav.users'), icon: Users, highlight: true }
      ]
    : baseNavItems;

  const handleSelectTab = (tab: ActiveTab) => {
    onTabChange(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderContent = (isDrawer = false) => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
        isDark ? 'border-neutral-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <PlanoraLogo size="md" onClick={() => {
            if (onGoToLanding) onGoToLanding();
            if (isDrawer && onCloseMobile) onCloseMobile();
          }} />
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
            isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
          }`}>
            v1.5
          </span>
        </div>

        {isDrawer && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
            title="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {onGoToLanding && (
          <button
            type="button"
            onClick={() => {
              onGoToLanding();
              if (isDrawer && onCloseMobile) onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold mb-3 border transition-all cursor-pointer ${
              isDark 
                ? 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800' 
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Trang Giới Thiệu</span>
          </button>
        )}

        <div className={`px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider ${
          isDark ? 'text-neutral-400' : 'text-slate-400'
        }`}>
          Menu Quản Lý
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 font-semibold'
                  : isDark
                    ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${
                  isActive 
                    ? 'text-white' 
                    : item.highlight 
                      ? 'text-indigo-500' 
                      : isDark ? 'text-neutral-400' : 'text-slate-400'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-1.5 py-0.5 text-[10px] rounded-full shrink-0 ${
                  isActive 
                    ? 'bg-white text-indigo-700 font-bold' 
                    : isDark 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                      : 'bg-rose-100 text-rose-700 border border-rose-200'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System & Settings Link */}
      <div className={`p-3 border-t space-y-1 shrink-0 ${isDark ? 'border-neutral-800' : 'border-slate-200'}`}>
        <button
          type="button"
          onClick={() => handleSelectTab('settings')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-indigo-600 text-white font-bold shadow-xs'
              : isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <SettingsIcon className="w-4 h-4 shrink-0" />
            <span>{t('nav.settings')}</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
            activeTab === 'settings' ? 'bg-white/20 text-white' : 'bg-indigo-500/15 text-indigo-500'
          }`}>
            {language.toUpperCase()}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar (>= 1024px) */}
      <aside className={`hidden lg:flex w-64 min-w-[16rem] max-w-[16rem] border-r flex-col shrink-0 h-full select-none z-30 transition-colors ${
        isDark 
          ? 'bg-neutral-900 border-neutral-800 text-neutral-200' 
          : 'bg-white border-slate-200 text-slate-700'
      }`}>
        {renderContent(false)}
      </aside>

      {/* 2. Mobile & Tablet Slide-over Drawer (< 1024px) */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 flex flex-col border-r shadow-2xl transition-all duration-300 ease-in-out lg:hidden ${
        isMobileOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-full opacity-0 pointer-events-none invisible'
      } ${
        isDark 
          ? 'bg-neutral-900 border-neutral-800 text-neutral-200' 
          : 'bg-white border-slate-200 text-slate-700'
      }`}>
        {renderContent(true)}
      </aside>
    </>
  );
}
