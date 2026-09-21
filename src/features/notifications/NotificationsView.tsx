import { useState, useMemo } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Sparkles, 
  Clock, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  Filter,
  ArrowRight
} from 'lucide-react';
import { NotificationItem, ActiveTab } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onNavigate: (tab: ActiveTab) => void;
}

export function NotificationsView({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onNavigate
}: NotificationsViewProps) {
  const { isDark } = useTheme();
  const [filter, setFilter] = useState<'all' | 'unread' | 'deadline' | 'ai'>('all');

  const filtered = useMemo(() => {
    return notifications.filter(item => {
      if (filter === 'unread') return !item.read;
      if (filter === 'deadline') return item.type === 'deadline' || item.type === 'warning';
      if (filter === 'ai') return item.type === 'ai';
      return true;
    });
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'ai':
        return <Sparkles className="w-4 h-4 text-cyan-500" />;
      case 'deadline':
      case 'warning':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'info':
      default:
        return <BookOpen className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Trung Tâm Thông Báo
              </h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-600 text-white">
                  {unreadCount} mới
                </span>
              )}
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Cập nhật hạn nộp bài, đề xuất tối ưu từ Gemini AI và hoạt động khóa học.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              isDark 
                ? 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800' 
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-slate-100'
            }`}
          >
            <CheckCheck className="w-4 h-4 text-indigo-500" />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Tất Cả', count: notifications.length },
          { id: 'unread', label: 'Chưa Đọc', count: unreadCount },
          { id: 'deadline', label: 'Hạn Chót & Cảnh Báo', count: notifications.filter(n => n.type === 'deadline' || n.type === 'warning').length },
          { id: 'ai', label: 'Gợi Ý AI', count: notifications.filter(n => n.type === 'ai').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              filter === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : isDark
                  ? 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
              filter === tab.id ? 'bg-white/20 text-white' : isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl border ${
            isDark ? 'bg-neutral-900/50 border-neutral-800 text-neutral-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30 text-indigo-500" />
            <p className="text-sm font-semibold">Không có thông báo nào trong mục này</p>
            <p className="text-xs mt-1 opacity-75">Mọi cập nhật mới của hệ thống sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              onClick={() => onMarkAsRead(item.id)}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                !item.read
                  ? isDark
                    ? 'bg-indigo-950/20 border-indigo-800/60 shadow-xs'
                    : 'bg-indigo-50/40 border-indigo-200/80 shadow-2xs'
                  : isDark
                    ? 'bg-neutral-900 border-neutral-800/80 hover:border-neutral-700'
                    : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  !item.read
                    ? isDark ? 'bg-indigo-900/60 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                    : isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-slate-100 text-slate-500'
                }`}>
                  {getTypeIcon(item.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className={`text-xs sm:text-sm font-bold ${
                      !item.read 
                        ? isDark ? 'text-white' : 'text-slate-900' 
                        : isDark ? 'text-neutral-300' : 'text-slate-700'
                    }`}>
                      {item.title}
                    </h2>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    )}
                  </div>

                  <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                    {item.message}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 dark:text-neutral-500">
                    <span>{item.timestamp}</span>

                    {item.linkTab && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(item.id);
                          onNavigate(item.linkTab!);
                        }}
                        className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        <span>Đi tới trang</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNotification(item.id);
                }}
                title="Xoá thông báo"
                className={`p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-colors shrink-0 cursor-pointer ${
                  isDark ? 'hover:bg-neutral-800 hover:text-rose-400' : 'hover:bg-slate-100 hover:text-rose-600'
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
