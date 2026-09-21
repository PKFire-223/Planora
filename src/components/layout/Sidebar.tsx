import { 
  LayoutDashboard, 
  BookOpen, 
  CheckSquare, 
  StickyNote, 
  Target, 
  Bot, 
  AlertCircle, 
  FolderTree,
  Flame,
  GraduationCap
} from 'lucide-react';
import { ActiveTab } from '../../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  errorCount: number;
}

export function Sidebar({ activeTab, onTabChange, errorCount }: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Tổng Quan', icon: LayoutDashboard },
    { id: 'courses' as ActiveTab, label: 'Khoá Học', icon: BookOpen },
    { id: 'tasks' as ActiveTab, label: 'Bài Tập & Task', icon: CheckSquare },
    { id: 'notes' as ActiveTab, label: 'Ghi Chú', icon: StickyNote },
    { id: 'goals' as ActiveTab, label: 'Mục Tiêu', icon: Target },
    { id: 'ai' as ActiveTab, label: 'AI Assistant', icon: Bot, highlight: true },
    { id: 'errors' as ActiveTab, label: 'Báo & Sửa Lỗi', icon: AlertCircle, badge: errorCount },
    { id: 'structure' as ActiveTab, label: 'Cấu Trúc Dự Án', icon: FolderTree },
  ];

  return (
    <aside className="w-64 bg-neutral-900/90 border-r border-neutral-800 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-neutral-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shadow-md shadow-rose-500/10">
          <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-rose-400" />
          </div>
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
            <span>Personal LMS</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono">
              DACN
            </span>
          </h1>
          <p className="text-[11px] text-neutral-400">Full Stack & MongoDB</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
          Quản Lý Học Tập
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-950 font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-1.5 py-0.5 text-[10px] font-mono rounded-full ${
                  isActive ? 'bg-white text-rose-600' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Database Status */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-950/40 text-xs">
        <div className="flex items-center justify-between text-neutral-400 text-[11px] mb-1">
          <span>Hệ thống Data:</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            MongoDB
          </span>
        </div>
        <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
          <Flame className="w-3 h-3 text-amber-400" />
          <span>PKFire Architecture Tree</span>
        </div>
      </div>
    </aside>
  );
}
