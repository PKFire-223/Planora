import { useState, useMemo } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Sparkles, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight,
  X,
  ExternalLink,
  CalendarDays,
  Target,
  StickyNote,
  AlertTriangle,
  Info,
  Users
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
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const filtered = useMemo(() => {
    return notifications.filter(item => {
      if (filter === 'unread') return !item.read;
      if (filter === 'deadline') return item.type === 'deadline' || item.type === 'warning';
      if (filter === 'ai') return item.type === 'ai';
      return true;
    });
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Resolve target tab and human-friendly label for any notification
  const resolveTarget = (item: NotificationItem): { tab: ActiveTab; label: string; icon: any } => {
    if (item.linkTab) {
      const tabMap: Record<ActiveTab, { label: string; icon: any }> = {
        dashboard: { label: 'Bảng Điều Khiển', icon: Bell },
        courses: { label: 'Khoá Học', icon: BookOpen },
        timetable: { label: 'Thời Khóa Biểu', icon: CalendarDays },
        tasks: { label: 'Nhiệm Vụ', icon: Clock },
        notes: { label: 'Ghi Chú', icon: StickyNote },
        goals: { label: 'Mục Tiêu', icon: Target },
        ai: { label: 'Trợ Lý AI', icon: Sparkles },
        errors: { label: 'Báo Cáo Lỗi', icon: AlertTriangle },
        notifications: { label: 'Thông Báo', icon: Bell },
        profile: { label: 'Thông Tin Cá Nhân', icon: Info },
        settings: { label: 'Cài Đặt', icon: Info },
        users: { label: 'Quản Trị Người Dùng', icon: Users }
      };
      const found = tabMap[item.linkTab];
      return { 
        tab: item.linkTab, 
        label: found ? found.label : 'Trang Liên Quan', 
        icon: found ? found.icon : ArrowRight 
      };
    }

    const text = `${item.title} ${item.message}`.toLowerCase();
    if (item.type === 'deadline' || item.type === 'warning' || text.includes('nhiệm vụ') || text.includes('hạn chót') || text.includes('bài tập') || text.includes('deadline')) {
      return { tab: 'tasks', label: 'Nhiệm Vụ', icon: Clock };
    }
    if (item.type === 'ai' || text.includes('ai') || text.includes('trợ lý') || text.includes('gemini')) {
      return { tab: 'ai', label: 'Trợ Lý AI', icon: Sparkles };
    }
    if (text.includes('thời khóa biểu') || text.includes('lịch học') || text.includes('tiết học') || text.includes('phòng học')) {
      return { tab: 'timetable', label: 'Thời Khóa Biểu', icon: CalendarDays };
    }
    if (text.includes('môn học') || text.includes('khoá học') || text.includes('khóa học') || text.includes('bài giảng')) {
      return { tab: 'courses', label: 'Khoá Học', icon: BookOpen };
    }
    if (text.includes('ghi chú') || text.includes('note') || text.includes('tài liệu')) {
      return { tab: 'notes', label: 'Ghi Chú', icon: StickyNote };
    }
    if (text.includes('mục tiêu') || text.includes('kpi') || text.includes('chỉ tiêu')) {
      return { tab: 'goals', label: 'Mục Tiêu', icon: Target };
    }
    return { tab: 'dashboard', label: 'Tổng Quan', icon: Bell };
  };

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

  const getTypeMeta = (type: NotificationItem['type']) => {
    switch (type) {
      case 'ai':
        return { label: 'Đề xuất Trợ lý AI', badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' };
      case 'deadline':
      case 'warning':
        return { label: 'Hạn chót & Nhắc nhở', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      case 'success':
        return { label: 'Thành công & Tiến độ', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      case 'info':
      default:
        return { label: 'Thông tin hệ thống', badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' };
    }
  };

  const handleOpenNotification = (item: NotificationItem) => {
    onMarkAsRead(item.id);
    setSelectedNotification(item);
  };

  const handleGoToPage = (item: NotificationItem) => {
    onMarkAsRead(item.id);
    const target = resolveTarget(item);
    setSelectedNotification(null);
    onNavigate(target.tab);
  };

  const handleDeleteFromModal = (item: NotificationItem) => {
    onDeleteNotification(item.id);
    setSelectedNotification(null);
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
              Bấm vào từng thông báo để xem chi tiết đầy đủ, chuyển nhanh tới trang xử lý hoặc xoá thông báo.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        {unreadCount > 0 && (
          <button
            type="button"
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
            type="button"
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
          filtered.map(item => {
            const target = resolveTarget(item);
            const meta = getTypeMeta(item.type);

            return (
              <div
                key={item.id}
                onClick={() => handleOpenNotification(item)}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 cursor-pointer group ${
                  !item.read
                    ? isDark
                      ? 'bg-indigo-950/20 border-indigo-800/60 shadow-xs hover:border-indigo-700'
                      : 'bg-indigo-50/40 border-indigo-200/80 shadow-2xs hover:border-indigo-300'
                    : isDark
                      ? 'bg-neutral-900 border-neutral-800/80 hover:border-neutral-700'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    !item.read
                      ? isDark ? 'bg-indigo-900/60 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                      : isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {getTypeIcon(item.type)}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${meta.badge}`}>
                        {meta.label}
                      </span>

                      <h2 className={`text-xs sm:text-sm font-bold truncate ${
                        !item.read 
                          ? isDark ? 'text-white' : 'text-slate-900' 
                          : isDark ? 'text-neutral-300' : 'text-slate-700'
                      }`}>
                        {item.title}
                      </h2>

                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" title="Chưa đọc" />
                      )}
                    </div>

                    <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                      {item.message}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 dark:text-neutral-500 flex-wrap">
                      <span>{item.timestamp}</span>
                      <span>•</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium group-hover:underline">
                        Bấm để xem chi tiết
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Quick navigation button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGoToPage(item);
                    }}
                    title={`Đi tới ${target.label}`}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      isDark
                        ? 'bg-neutral-800 hover:bg-indigo-600 hover:text-white text-neutral-300'
                        : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700'
                    }`}
                  >
                    <span className="hidden md:inline text-[11px]">Đi tới {target.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Quick delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNotification(item.id);
                    }}
                    title="Xoá thông báo này"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isDark 
                        ? 'text-neutral-400 hover:bg-neutral-800 hover:text-rose-400' 
                        : 'text-slate-400 hover:bg-slate-100 hover:text-rose-600'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && (() => {
        const target = resolveTarget(selectedNotification);
        const meta = getTypeMeta(selectedNotification.type);
        const TargetIcon = target.icon;

        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setSelectedNotification(null)}
          >
            <div 
              className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
                isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-slate-200 text-slate-900'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
                isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-slate-50/80 border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    {getTypeIcon(selectedNotification.type)}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400">
                      Thông Báo Hệ Thống
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border ${meta.badge}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-neutral-500">
                        {selectedNotification.timestamp}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                  title="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {selectedNotification.title}
                  </h3>
                  <p className={`mt-2.5 text-xs sm:text-sm leading-relaxed ${
                    isDark ? 'text-neutral-300' : 'text-slate-600'
                  }`}>
                    {selectedNotification.message}
                  </p>
                </div>

                {/* Target Information Card */}
                <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  isDark ? 'bg-neutral-950/60 border-neutral-800 text-neutral-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <TargetIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-400 dark:text-neutral-400 block">Trang liên kết</span>
                      <span className="text-xs font-bold truncate block">{target.label}</span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 dark:text-neutral-500 hidden sm:inline">
                    Bấm nút bên dưới để mở ngay
                  </span>
                </div>
              </div>

              {/* Modal footer actions */}
              <div className={`p-4 sm:p-5 border-t flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 ${
                isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-slate-50/80 border-slate-200'
              }`}>
                {/* Delete notification trigger */}
                <button
                  type="button"
                  onClick={() => handleDeleteFromModal(selectedNotification)}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isDark
                      ? 'border-rose-900/60 bg-rose-950/30 text-rose-400 hover:bg-rose-900/50 hover:text-white'
                      : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-900'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa thông báo</span>
                </button>

                {/* Navigation and close triggers */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedNotification(null)}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      isDark
                        ? 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Đóng
                  </button>

                  {/* Navigate to linked section */}
                  <button
                    type="button"
                    onClick={() => handleGoToPage(selectedNotification)}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <span>Đi tới {target.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
