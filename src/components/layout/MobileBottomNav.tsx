import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarDays, 
  CheckSquare, 
  Menu
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onToggleMenu: () => void;
  pendingTasksCount?: number;
}

export function MobileBottomNav({
  activeTab,
  onTabChange,
  onToggleMenu,
  pendingTasksCount = 0
}: MobileBottomNavProps) {
  const { isDark } = useTheme();

  const tabs: { id: ActiveTab; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'courses', label: 'Khoá học', icon: BookOpen },
    { id: 'timetable', label: 'Lịch học', icon: CalendarDays },
    { id: 'tasks', label: 'Nhiệm vụ', icon: CheckSquare, badge: pendingTasksCount },
  ];

  return (
    <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md transition-colors ${
      isDark 
        ? 'bg-neutral-950/95 border-neutral-800 text-neutral-300' 
        : 'bg-white/95 border-slate-200 text-slate-600 shadow-lg'
    }`}>
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto pb-safe">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center h-full py-1 px-1 transition-all cursor-pointer relative ${
                isActive
                  ? isDark ? 'text-indigo-400 font-bold' : 'text-indigo-600 font-bold'
                  : isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 px-1 min-w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 truncate max-w-[64px]">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-indigo-500 mt-0.5" />
              )}
            </button>
          );
        })}

        {/* Menu Toggle for goals, notes, AI, errors, profile, settings */}
        <button
          onClick={onToggleMenu}
          className={`flex-1 flex flex-col items-center justify-center h-full py-1 px-1 transition-all cursor-pointer ${
            isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Mở menu đầy đủ"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1">Menu</span>
        </button>
      </div>
    </div>
  );
}
