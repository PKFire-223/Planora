import { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { LandingPageView } from './features/landing/LandingPageView';
import { AuthSplitView } from './features/auth/AuthSplitView';
import { DashboardView } from './features/dashboard/DashboardView';
import { CoursesView } from './features/courses/CoursesView';
import { TimetableView } from './features/timetable/TimetableView';
import { TasksView } from './features/tasks/TasksView';
import { NotesView } from './features/notes/NotesView';
import { GoalsView } from './features/goals/GoalsView';
import { AiAssistantView } from './features/ai/AiAssistantView';
import { ErrorReportsView } from './features/errorReports/ErrorReportsView';
import { NotificationsView } from './features/notifications/NotificationsView';
import { ProfileView } from './features/profile/ProfileView';
import { SettingsView } from './features/settings/SettingsView';
import { AdminUsersView } from './features/admin/AdminUsersView';
import { ToastContainer } from './components/common/ToastContainer';
import { ToastProvider, useToast } from './context/ToastContext';
import { api } from './services/api';
import { Course, Task, Note, Goal, ErrorReport, ActiveTab, NotificationItem, TimetableEntry } from './types';
import { FALLBACK_NOTIFICATIONS } from './data/fallbackData';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';

function PlanoraWorkspace() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { showToast, clearAllToasts } = useToast();

  // Primary view navigation: 'landing' (first view), 'auth' (split-screen), 'app' (LMS workspace)
  const [viewMode, setViewMode] = useState<'landing' | 'auth' | 'app'>('landing');
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('planora_notifications');
      return saved ? JSON.parse(saved) : FALLBACK_NOTIFICATIONS;
    } catch {
      return FALLBACK_NOTIFICATIONS;
    }
  });
  const [crossContext, setCrossContext] = useState<{
    courseId?: string;
    courseCode?: string;
    aiPrompt?: string;
  }>({});
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('planora_last_backup_time');
      if (saved) {
        return new Date(saved).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      }
      return null;
    } catch {
      return null;
    }
  });
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Track already-notified deadline task IDs to avoid repeat spamming
  const notifiedDeadlinesRef = useRef<Set<string>>(new Set());

  // 5-Minute Auto-Save Periodic Trigger (courses, tasks, goals -> MongoDB & localStorage)
  const handleTriggerAutoSave = useCallback(async (isManual = false) => {
    // Only auto-save if there is loaded data in state
    if (courses.length === 0 && tasks.length === 0 && goals.length === 0) return;

    setIsAutoSaving(true);
    try {
      const res = await api.autoSaveData({ courses, tasks, goals });
      const nowTimeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setLastAutoSaveTime(nowTimeStr);

      if (isManual) {
        showToast({
          type: 'success',
          title: 'Đã sao lưu an toàn',
          message: `Đã lưu trạng thái (${res.counts?.courses ?? courses.length} môn, ${res.counts?.tasks ?? tasks.length} nhiệm vụ, ${res.counts?.goals ?? goals.length} mục tiêu).`,
          duration: 3500
        });
      }
    } catch (err: any) {
      console.warn('[AutoSave] Backup warning:', err);
      if (isManual) {
        showToast({
          type: 'warning',
          title: 'Đã lưu cục bộ',
          message: 'Dữ liệu đã được lưu an toàn vào bộ nhớ trình duyệt!',
          duration: 3500
        });
      }
    } finally {
      setIsAutoSaving(false);
    }
  }, [courses, tasks, goals, showToast]);

  // Periodic Auto-Save every 5 minutes (300,000 ms)
  useEffect(() => {
    // Run interval only if in LMS app mode
    if (viewMode !== 'app') return;

    const intervalId = setInterval(() => {
      handleTriggerAutoSave(false);
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [viewMode, handleTriggerAutoSave]);

  // Network connection listener to safeguard against sudden offline disconnections
  useEffect(() => {
    const handleOffline = () => {
      // Immediately backup current state to localStorage
      api.autoSaveData({ courses, tasks, goals });
      showToast({
        type: 'warning',
        title: 'Mất kết nối Internet',
        message: 'Chế độ ngoại tuyến: Dữ liệu (courses, tasks, goals) đã được tự động lưu an toàn trong máy!',
        duration: 5000
      });
    };

    const handleOnline = () => {
      showToast({
        type: 'info',
        title: 'Đã khôi phục Internet',
        message: 'Đang tự động đồng bộ lại toàn bộ dữ liệu lên MongoDB...',
        duration: 4000
      });
      handleTriggerAutoSave(false);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [courses, tasks, goals, handleTriggerAutoSave, showToast]);

  const handleToastNavigate = (tab: ActiveTab) => {
    setViewMode('app');
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleNavigateWithContext = (
    tab: ActiveTab,
    context?: { courseId?: string; courseCode?: string; aiPrompt?: string }
  ) => {
    if (context) {
      setCrossContext(context);
    }
    setActiveTab(tab);
  };

  // Helper to sync toasts with persistent Notification Center history
  const addSystemNotification = (item: {
    title: string;
    message: string;
    type: NotificationItem['type'];
    linkTab?: ActiveTab;
  }) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: item.title,
      message: item.message,
      type: item.type,
      timestamp: 'Vừa xong',
      read: false,
      linkTab: item.linkTab
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Persist notifications on change
  useEffect(() => {
    try {
      localStorage.setItem('planora_notifications', JSON.stringify(notifications));
    } catch {
      // ignore storage error
    }
  }, [notifications]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Load initial data from backend API with automatic fallback
  const loadData = async () => {
    try {
      const [coursesRes, tasksRes, notesRes, goalsRes, errorsRes] = await Promise.all([
        api.getCourses(),
        api.getTasks(),
        api.getNotes(),
        api.getGoals(),
        api.getErrors()
      ]);

      if (coursesRes?.success && coursesRes.data) setCourses(coursesRes.data);
      if (tasksRes?.success && tasksRes.data) setTasks(tasksRes.data);
      if (notesRes?.success && notesRes.data) setNotes(notesRes.data);
      if (goalsRes?.success && goalsRes.data) setGoals(goalsRes.data);
      if (errorsRes?.success && errorsRes.data) setErrors(errorsRes.data);
    } catch {
      // Fallbacks are safely applied inside api.ts
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Automated 24h Deadline Detector - only runs inside LMS workspace ('app')
  useEffect(() => {
    if (viewMode !== 'app') return;
    if (tasks.length === 0) return;

    const now = new Date();
    // 24 hours in the future
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    tasks.forEach(task => {
      if (task.status === 'done') return;
      if (!task.dueDate) return;

      const due = new Date(task.dueDate);
      if (isNaN(due.getTime())) return;

      // Check if due is within next 24 hours or overdue
      const isWithin24h = due.getTime() <= next24Hours.getTime();

      if (isWithin24h && !notifiedDeadlinesRef.current.has(task.id)) {
        notifiedDeadlinesRef.current.add(task.id);

        const isOverdue = due.getTime() < now.getTime();
        const title = isOverdue
          ? `⚠️ Quá hạn nộp: "${task.title}"`
          : `⏰ Deadline gấp trong 24h: "${task.title}"`;
        const message = isOverdue
          ? `Nhiệm vụ này đã quá hạn nộp (${task.dueDate}). Hãy kiểm tra và hoàn thành sớm!`
          : `Hạn chót vào ${task.dueDate}. Chỉ còn dưới 24h nữa để nộp bài!`;

        showToast({
          type: 'deadline',
          title,
          message,
          targetTab: 'tasks',
          duration: 7500
        });

        // Also add to notification center history
        addSystemNotification({
          title,
          message,
          type: 'deadline',
          linkTab: 'tasks'
        });
      }
    });
  }, [tasks, viewMode, showToast]);

  // Course handlers
  const handleCreateCourse = async (data: Partial<Course>) => {
    const res = await api.createCourse(data);
    if (res.success) {
      setCourses(prev => [res.data, ...prev]);
      showToast({
        type: 'success',
        title: 'Thêm khoá học thành công',
        message: `Khoá học "${res.data.title}" (${res.data.code}) đã được kích hoạt`,
        targetTab: 'courses'
      });
      addSystemNotification({
        title: `Khoá học mới: ${res.data.title}`,
        message: `Đã thêm môn ${res.data.code} vào danh mục học kỳ.`,
        type: 'success',
        linkTab: 'courses'
      });
    }
  };

  const handleUpdateCourse = async (id: string, data: Partial<Course>) => {
    const res = await api.updateCourse(id, data);
    if (res.success) {
      setCourses(prev => prev.map(c => c.id === id ? res.data : c));
      showToast({
        type: 'info',
        title: 'Cập nhật khoá học',
        message: `Đã lưu các thay đổi của "${res.data.title}"`,
        targetTab: 'courses'
      });
    }
  };

  const handleDeleteCourse = async (id: string) => {
    const courseToDelete = courses.find(c => c.id === id);
    const res = await api.deleteCourse(id);
    if (res.success) {
      setCourses(prev => prev.filter(c => c.id !== id));
      showToast({
        type: 'warning',
        title: 'Đã xoá khoá học',
        message: `Đã xoá khoá học "${courseToDelete?.title || ''}"`,
        targetTab: 'courses'
      });
    }
  };

  // Timetable entry changes
  const handleTimetableEntryChange = (action: 'create' | 'update' | 'delete', entry: TimetableEntry) => {
    if (action === 'create') {
      showToast({
        type: 'success',
        title: 'Thêm thời khoá biểu thành công',
        message: `Đã xếp lịch môn "${entry.name}" (${entry.time})`,
        targetTab: 'timetable'
      });
      addSystemNotification({
        title: `Lịch học mới: ${entry.name}`,
        message: `Môn ${entry.name} (${entry.time}) đã được thêm vào thời khoá biểu.`,
        type: 'info',
        linkTab: 'timetable'
      });
    } else if (action === 'update') {
      showToast({
        type: 'info',
        title: 'Cập nhật thời khoá biểu',
        message: `Đã lưu thay đổi thông tin môn "${entry.name}"`,
        targetTab: 'timetable'
      });
    } else if (action === 'delete') {
      showToast({
        type: 'warning',
        title: 'Đã xoá khỏi thời khoá biểu',
        message: `Đã xoá môn "${entry.name}" khỏi lịch học`,
        targetTab: 'timetable'
      });
    }
  };

  // Task handlers
  const handleCreateTask = async (data: Partial<Task>) => {
    const res = await api.createTask(data);
    if (res.success) {
      setTasks(prev => [res.data, ...prev]);
      showToast({
        type: 'success',
        title: 'Thêm nhiệm vụ thành công',
        message: `Nhiệm vụ "${res.data.title}" đã được tạo`,
        targetTab: 'tasks'
      });
      addSystemNotification({
        title: `Nhiệm vụ mới: ${res.data.title}`,
        message: `Hạn chót: ${res.data.dueDate || 'Chưa đặt'}. Ưu tiên: ${res.data.priority}`,
        type: 'info',
        linkTab: 'tasks'
      });
    }
  };

  const handleUpdateTask = async (id: string, data: Partial<Task>) => {
    const res = await api.updateTask(id, data);
    if (res.success) {
      setTasks(prev => prev.map(t => t.id === id ? res.data : t));
      showToast({
        type: 'info',
        title: 'Cập nhật nhiệm vụ',
        message: `Đã lưu các thay đổi cho "${res.data.title}"`,
        targetTab: 'tasks'
      });
    }
  };

  const handleToggleTask = async (id: string, currentStatus: Task['status']) => {
    const nextStatus = currentStatus === 'done' ? 'todo' : 'done';
    const res = await api.updateTaskStatus(id, nextStatus);
    if (res.success) {
      setTasks(prev => prev.map(t => t.id === id ? res.data : t));
      showToast({
        type: nextStatus === 'done' ? 'success' : 'info',
        title: nextStatus === 'done' ? '🎉 Hoàn thành nhiệm vụ!' : 'Đã mở lại nhiệm vụ',
        message: `Nhiệm vụ "${res.data.title}" đã chuyển sang ${nextStatus === 'done' ? 'Hoàn thành' : 'Cần làm'}`,
        targetTab: 'tasks'
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    const res = await api.deleteTask(id);
    if (res.success) {
      setTasks(prev => prev.filter(t => t.id !== id));
      showToast({
        type: 'warning',
        title: 'Đã xoá nhiệm vụ',
        message: `Đã xoá "${taskToDelete?.title || 'nhiệm vụ'}"`,
        targetTab: 'tasks',
        undoLabel: 'Hoàn tác',
        undoAction: taskToDelete ? async () => {
          const restoreRes = await api.createTask(taskToDelete);
          if (restoreRes.success) {
            setTasks(prev => [restoreRes.data, ...prev]);
            showToast({
              type: 'success',
              title: 'Đã khôi phục nhiệm vụ',
              message: `Nhiệm vụ "${taskToDelete.title}" đã được phục hồi!`,
              targetTab: 'tasks'
            });
          }
        } : undefined
      });
    }
  };

  const handleAiBreakdown = async (taskTitle: string, courseId?: string) => {
    const res = await api.breakdownTask(taskTitle, courseId);
    if (res.success && res.data) {
      setTasks(prev => [...res.data, ...prev]);
      showToast({
        type: 'info',
        title: 'AI Phân tách nhiệm vụ',
        message: `Đã chia nhỏ "${taskTitle}" thành ${res.data.length} công việc cụ thể`,
        targetTab: 'tasks'
      });
    }
  };

  // Note handlers
  const handleCreateNote = async (data: Partial<Note>) => {
    const res = await api.createNote(data);
    if (res.success) {
      setNotes(prev => [res.data, ...prev]);
      showToast({
        type: 'success',
        title: 'Tạo ghi chú thành công',
        message: `Ghi chú "${res.data.title}" đã được lưu`,
        targetTab: 'notes'
      });
      addSystemNotification({
        title: `Ghi chú mới: ${res.data.title}`,
        message: `Đã thêm vào kho tài liệu học tập.`,
        type: 'info',
        linkTab: 'notes'
      });
    }
  };

  const handleUpdateNote = async (id: string, data: Partial<Note>) => {
    const res = await api.updateNote(id, data);
    if (res.success) {
      setNotes(prev => prev.map(n => n.id === id ? res.data : n));
      showToast({
        type: 'info',
        title: 'Cập nhật ghi chú',
        message: `Đã lưu thay đổi ghi chú "${res.data.title}"`,
        targetTab: 'notes'
      });
    }
  };

  const handleDeleteNote = async (id: string) => {
    const noteToDelete = notes.find(n => n.id === id);
    const res = await api.deleteNote(id);
    if (res.success) {
      setNotes(prev => prev.filter(n => n.id !== id));
      showToast({
        type: 'warning',
        title: 'Đã xoá ghi chú',
        message: `Đã xoá ghi chú "${noteToDelete?.title || ''}"`,
        targetTab: 'notes',
        undoLabel: 'Hoàn tác',
        undoAction: noteToDelete ? async () => {
          const restoreRes = await api.createNote(noteToDelete);
          if (restoreRes.success) {
            setNotes(prev => [restoreRes.data, ...prev]);
            showToast({
              type: 'success',
              title: 'Đã khôi phục ghi chú',
              message: `Ghi chú "${noteToDelete.title}" đã được phục hồi!`,
              targetTab: 'notes'
            });
          }
        } : undefined
      });
    }
  };

  // Goal handlers
  const handleCreateGoal = async (data: Partial<Goal>) => {
    const res = await api.createGoal(data);
    if (res.success) {
      setGoals(prev => [res.data, ...prev]);
      showToast({
        type: 'success',
        title: 'Tạo mục tiêu thành công',
        message: `Mục tiêu "${res.data.title}" (${res.data.targetValue} ${res.data.unit}) đã được kích hoạt`,
        targetTab: 'goals'
      });
      addSystemNotification({
        title: `Mục tiêu mới: ${res.data.title}`,
        message: `Mục tiêu tự học ${res.data.targetValue} ${res.data.unit} đã được kích hoạt.`,
        type: 'success',
        linkTab: 'goals'
      });
    }
  };

  const handleUpdateGoal = async (id: string, data: Partial<Goal>) => {
    const res = await api.updateGoal(id, data);
    if (res.success) {
      setGoals(prev => prev.map(g => g.id === id ? res.data : g));
      showToast({
        type: 'info',
        title: 'Cập nhật mục tiêu',
        message: `Đã cập nhật thông tin "${res.data.title}"`,
        targetTab: 'goals'
      });
    }
  };

  const handleDeleteGoal = async (id: string) => {
    const goalToDelete = goals.find(g => g.id === id);
    const res = await api.deleteGoal(id);
    if (res.success) {
      setGoals(prev => prev.filter(g => g.id !== id));
      showToast({
        type: 'warning',
        title: 'Đã xoá mục tiêu',
        message: `Đã xoá mục tiêu "${goalToDelete?.title || ''}"`,
        targetTab: 'goals',
        undoLabel: 'Hoàn tác',
        undoAction: goalToDelete ? async () => {
          const restoreRes = await api.createGoal(goalToDelete);
          if (restoreRes.success) {
            setGoals(prev => [restoreRes.data, ...prev]);
            showToast({
              type: 'success',
              title: 'Đã khôi phục mục tiêu',
              message: `Mục tiêu "${goalToDelete.title}" đã được phục hồi!`,
              targetTab: 'goals'
            });
          }
        } : undefined
      });
    }
  };

  const handleIncrementGoal = async (id: string, amount: number) => {
    const res = await api.updateGoalProgress(id, amount);
    if (res.success) {
      setGoals(prev => prev.map(g => g.id === id ? res.data : g));
      const isCompleted = res.data.currentValue >= res.data.targetValue;
      showToast({
        type: isCompleted ? 'success' : 'info',
        title: isCompleted ? '🎯 Hoàn thành mục tiêu!' : 'Cập nhật tiến độ',
        message: `"${res.data.title}": ${res.data.currentValue}/${res.data.targetValue} ${res.data.unit}`,
        targetTab: 'goals'
      });
    }
  };

  const handleUpdateGoalProgress = async (id: string, params: { increment?: number; currentValue?: number }) => {
    const res = await api.updateGoalProgress(id, params);
    if (res.success) {
      setGoals(prev => prev.map(g => g.id === id ? res.data : g));
      const isCompleted = res.data.currentValue >= res.data.targetValue;
      showToast({
        type: isCompleted ? 'success' : 'info',
        title: isCompleted ? '🎯 Cán đích 100% mục tiêu!' : 'Cập nhật tiến độ',
        message: `"${res.data.title}": ${res.data.currentValue}/${res.data.targetValue} ${res.data.unit}`,
        targetTab: 'goals'
      });
    }
  };

  // Error handlers
  const handleReportError = async (data: Partial<ErrorReport>) => {
    const res = await api.reportError(data);
    if (res.success) {
      setErrors(prev => [res.data, ...prev]);
      showToast({
        type: 'info',
        title: 'Đã gửi báo cáo lỗi',
        message: `Báo cáo "${res.data.title}" đã được ghi nhận vào hệ thống`,
        targetTab: 'errors'
      });
    }
  };

  const handleResolveError = async (id: string, notes: string) => {
    const res = await api.resolveError(id, notes);
    if (res.success) {
      setErrors(prev => prev.map(e => e.id === id ? res.data : e));
      showToast({
        type: 'success',
        title: 'Đã giải quyết vấn đề',
        message: `Vấn đề đã được đánh dấu là đã giải quyết`,
        targetTab: 'errors'
      });
    }
  };

  const openErrorCount = errors.filter(e => e.status !== 'resolved').length;

  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    clearAllToasts();
    setAuthTab(tab);
    setViewMode('auth');
  };

  const handleGoToLanding = () => {
    clearAllToasts();
    setViewMode('landing');
  };

  // VIEW 1: Trang Giới Thiệu (Mở ra đầu tiên) - KHÔNG hiện thông báo Toast ở đây
  if (viewMode === 'landing') {
    return (
      <LandingPageView
        onOpenAuth={handleOpenAuth}
        onEnterApp={() => {
          if (user) {
            setViewMode('app');
          } else {
            handleOpenAuth('login');
          }
        }}
      />
    );
  }

  // VIEW 2: Trang Đăng Nhập & Đăng Ký Split-Screen (Không dùng Pop-up)
  if (viewMode === 'auth') {
    return (
      <AuthSplitView
        initialTab={authTab}
        onBackToLanding={handleGoToLanding}
        onEnterApp={() => setViewMode('app')}
      />
    );
  }

  // VIEW 3: Không Gian Học Tập Planora LMS Workspace (Yêu cầu đăng nhập chuẩn như web bình thường)
  if (!user) {
    return (
      <AuthSplitView
        initialTab="login"
        onBackToLanding={handleGoToLanding}
        onEnterApp={() => setViewMode('app')}
      />
    );
  }

  return (
    <>
      <ToastContainer onNavigate={handleToastNavigate} />
      <div className={`min-h-screen flex flex-row transition-colors duration-200 overflow-x-hidden ${
        isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-slate-50 text-slate-900'
      }`}>
        {/* Responsive Sidebar (Desktop persistent + Mobile slide-over drawer) */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }}
          errorCount={openErrorCount}
          onGoToLanding={handleGoToLanding}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          lastAutoSaveTime={lastAutoSaveTime}
          isAutoSaving={isAutoSaving}
          onTriggerManualSave={() => handleTriggerAutoSave(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
          <Header
            activeTab={activeTab}
            onOpenAi={() => setActiveTab('ai')}
            onGoToLanding={handleGoToLanding}
            onOpenAuth={(tab) => handleOpenAuth(tab)}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onNavigate={(tab) => {
              setActiveTab(tab);
              setIsMobileMenuOpen(false);
            }}
            onDeleteNotification={handleDeleteNotification}
            onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
          />

          <main className="flex-1 p-3 sm:p-5 md:p-6 pb-36 sm:pb-40 lg:pb-12 max-w-7xl w-full mx-auto overflow-y-auto min-w-0">
            {loading ? (
              <div className={`flex items-center justify-center h-64 text-xs font-medium ${
                isDark ? 'text-neutral-400' : 'text-slate-500'
              }`}>
                Đang kết nối hệ thống Planora LMS...
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <DashboardView
                    courses={courses}
                    tasks={tasks}
                    goals={goals}
                    errors={errors}
                    notes={notes}
                    onNavigate={setActiveTab}
                    onToggleTask={handleToggleTask}
                  />
                )}

                {activeTab === 'courses' && (
                  <CoursesView
                    courses={courses}
                    onCreateCourse={handleCreateCourse}
                    onUpdateCourse={handleUpdateCourse}
                    onDeleteCourse={handleDeleteCourse}
                    onNavigateToTab={handleNavigateWithContext}
                  />
                )}

                {activeTab === 'timetable' && (
                  <TimetableView
                    onNavigateToCourses={() => setActiveTab('courses')}
                    onEntryChange={handleTimetableEntryChange}
                  />
                )}

                {activeTab === 'tasks' && (
                  <TasksView
                    tasks={tasks}
                    courses={courses}
                    onCreateTask={handleCreateTask}
                    onUpdateTask={handleUpdateTask}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                    onAiBreakdown={handleAiBreakdown}
                    initialCourseId={crossContext.courseId}
                  />
                )}

                {activeTab === 'notes' && (
                  <NotesView
                    notes={notes}
                    courses={courses}
                    onCreateNote={handleCreateNote}
                    onUpdateNote={handleUpdateNote}
                    onDeleteNote={handleDeleteNote}
                    initialSearchTerm={crossContext.courseCode}
                  />
                )}

                {activeTab === 'goals' && (
                  <GoalsView
                    goals={goals}
                    onCreateGoal={handleCreateGoal}
                    onUpdateGoal={handleUpdateGoal}
                    onDeleteGoal={handleDeleteGoal}
                    onIncrementGoal={handleIncrementGoal}
                    onUpdateProgress={handleUpdateGoalProgress}
                  />
                )}

                {activeTab === 'ai' && (
                  <AiAssistantView initialPrompt={crossContext.aiPrompt} />
                )}

                {activeTab === 'errors' && (
                  <ErrorReportsView
                    errors={errors}
                    onReportError={handleReportError}
                    onResolveError={handleResolveError}
                  />
                )}

                {activeTab === 'notifications' && (
                  <NotificationsView
                    notifications={notifications}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    onDeleteNotification={handleDeleteNotification}
                    onNavigate={setActiveTab}
                  />
                )}

                {activeTab === 'profile' && (
                  <ProfileView />
                )}

                {activeTab === 'settings' && (
                  <SettingsView 
                    lastAutoSaveTime={lastAutoSaveTime}
                    isAutoSaving={isAutoSaving}
                    onTriggerManualSave={() => handleTriggerAutoSave(true)}
                    courses={courses}
                    tasks={tasks}
                    goals={goals}
                    notes={notes}
                  />
                )}

                {activeTab === 'users' && (
                  <AdminUsersView />
                )}
              </>
            )}

            {/* Explicit clearance spacer for mobile and tablet floating bottom nav bar */}
            <div className="h-28 sm:h-32 lg:hidden w-full shrink-0" aria-hidden="true" />
          </main>
        </div>

        {/* Mobile & Tablet Bottom Navigation Bar (< 1024px) */}
        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }}
          onToggleMenu={() => setIsMobileMenuOpen(true)}
          pendingTasksCount={tasks.filter(t => t.status !== 'done').length}
        />
      </div>
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <PlanoraWorkspace />
    </ToastProvider>
  );
}
