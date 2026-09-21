import { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Sparkles, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  CheckCheck, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { NotificationItem, ActiveTab } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface NotificationPopoverProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigate: (tab: ActiveTab) => void;
}

export function NotificationPopover({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigate
}: NotificationPopoverProps) {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'ai':
        return <Sparkles className="w-3.5 h-3.5 text-cyan-500" />;
      case 'deadline':
      case 'warning':
        return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'info':
      default:
        return <BookOpen className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Nút chuông thông báo trong Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Thông báo hệ thống"
        className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
          isOpen
            ? 'ring-2 ring-indigo-500/50 border-indigo-500 shadow-sm'
            : isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
        }`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Pop-up hiện thông báo */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
          isDark 
            ? 'bg-neutral-900 border-neutral-800 text-white shadow-black/60' 
            : 'bg-white border-slate-200 text-slate-900 shadow-indigo-100'
        }`}>
          {/* Header */}
          <div className={`px-4 py-3 border-b flex items-center justify-between ${
            isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm">Thông Báo</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Đã đọc tất cả</span>
              </button>
            )}
          </div>

          {/* List items (Max 4-5 recent) */}
          <div className="max-h-80 overflow-y-auto divide-y dark:divide-neutral-800/80 divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                Chưa có thông báo nào
              </div>
            ) : (
              notifications.slice(0, 5).map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    onMarkAsRead(item.id);
                    if (item.linkTab) {
                      onNavigate(item.linkTab);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3.5 text-xs transition-colors cursor-pointer flex items-start gap-3 ${
                    !item.read
                      ? isDark
                        ? 'bg-indigo-950/20 hover:bg-indigo-950/40'
                        : 'bg-indigo-50/40 hover:bg-indigo-50/80'
                      : isDark
                        ? 'hover:bg-neutral-800/60'
                        : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    !item.read
                      ? isDark ? 'bg-indigo-900/60' : 'bg-indigo-100'
                      : isDark ? 'bg-neutral-800' : 'bg-slate-100'
                  }`}>
                    {getTypeIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`font-semibold truncate block ${!item.read ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                        {item.title}
                      </span>
                      {!item.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      )}
                    </div>
                    <p className={`text-[11px] line-clamp-2 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                      {item.message}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-neutral-500 block mt-1">
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer: Xem tất cả thông báo */}
          <div className={`p-2.5 border-t text-center ${
            isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <button
              onClick={() => {
                onNavigate('notifications');
                setIsOpen(false);
              }}
              className="w-full py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Xem tất cả thông báo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
