import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarDays, 
  CheckSquare, 
  StickyNote, 
  Target, 
  Bot, 
  Home
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { PlanoraLogo } from '../common/PlanoraLogo';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  errorCount?: number;
  onGoToLanding?: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: any;
  highlight?: boolean;
  badge?: number;
}

export function Sidebar({ activeTab, onTabChange, errorCount, onGoToLanding }: SidebarProps) {
  const { isDark } = useTheme();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
    { id: 'courses', label: 'Khoá Học', icon: BookOpen },
    { id: 'timetable', label: 'Thời Khóa Biểu', icon: CalendarDays },
    { id: 'tasks', label: 'Nhiệm Vụ', icon: CheckSquare },
    { id: 'notes', label: 'Ghi Chú', icon: StickyNote },
    { id: 'goals', label: 'Mục Tiêu', icon: Target },
    { id: 'ai', label: 'Trợ Lý AI', icon: Bot, highlight: true },
  ];

  return (
    <aside className={`w-64 border-r flex flex-col shrink-0 h-screen sticky top-0 transition-colors ${
      isDark 
        ? 'bg-neutral-900 border-neutral-800 text-neutral-200' 
        : 'bg-white border-slate-200 text-slate-700'
    }`}>
      {/* Brand Header with official Planora Logo */}
      <div className={`p-4 border-b flex items-center justify-between ${
        isDark ? 'border-neutral-800' : 'border-slate-200'
      }`}>
        <PlanoraLogo size="md" onClick={onGoToLanding} />
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
          isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
        }`}>
          v1.0
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {onGoToLanding && (
          <button
            type="button"
            onClick={onGoToLanding}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold mb-3 border transition-all cursor-pointer ${
              isDark 
                ? 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800' 
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4 text-indigo-500" />
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
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 font-semibold'
                  : isDark
                    ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${
                  isActive 
                    ? 'text-white' 
                    : item.highlight 
                      ? 'text-indigo-500' 
                      : isDark ? 'text-neutral-400' : 'text-slate-400'
                }`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${
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
    </aside>
  );
}
