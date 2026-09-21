import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
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
import { api } from './services/api';
import { Course, Task, Note, Goal, ErrorReport, ActiveTab, NotificationItem } from './types';
import { FALLBACK_NOTIFICATIONS } from './data/fallbackData';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { isDark } = useTheme();
  const { user } = useAuth();

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

  const handleNavigateWithContext = (
    tab: ActiveTab,
    context?: { courseId?: string; courseCode?: string; aiPrompt?: string }
  ) => {
    if (context) {
      setCrossContext(context);
    }
    setActiveTab(tab);
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

  // Course handlers
  const handleCreateCourse = async (data: Partial<Course>) => {
    const res = await api.createCourse(data);
    if (res.success) {
      setCourses(prev => [res.data, ...prev]);
    }
  };

  const handleUpdateCourse = async (id: string, data: Partial<Course>) => {
    const res = await api.updateCourse(id, data);
    if (res.success) {
      setCourses(prev => prev.map(c => c.id === id ? res.data : c));
    }
  };

  const handleDeleteCourse = async (id: string) => {
    const res = await api.deleteCourse(id);
    if (res.success) {
      setCourses(prev => prev.filter(c => c.id !== id));
    }
  };

  // Task handlers
  const handleCreateTask = async (data: Partial<Task>) => {
    const res = await api.createTask(data);
    if (res.success) {
      setTasks(prev => [res.data, ...prev]);
    }
  };

  const handleToggleTask = async (id: string, currentStatus: Task['status']) => {
    const nextStatus = currentStatus === 'done' ? 'todo' : 'done';
    const res = await api.updateTaskStatus(id, nextStatus);
    if (res.success) {
      setTasks(prev => prev.map(t => t.id === id ? res.data : t));
    }
  };

  const handleDeleteTask = async (id: string) => {
    const res = await api.deleteTask(id);
    if (res.success) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleAiBreakdown = async (taskTitle: string, courseId?: string) => {
    const res = await api.breakdownTask(taskTitle, courseId);
    if (res.success && res.data) {
      setTasks(prev => [...res.data, ...prev]);
    }
  };

  // Note handlers
  const handleCreateNote = async (data: Partial<Note>) => {
    const res = await api.createNote(data);
    if (res.success) {
      setNotes(prev => [res.data, ...prev]);
    }
  };

  const handleDeleteNote = async (id: string) => {
    const res = await api.deleteNote(id);
    if (res.success) {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  // Goal handlers
  const handleIncrementGoal = async (id: string, amount: number) => {
    const res = await api.updateGoalProgress(id, amount);
    if (res.success) {
      setGoals(prev => prev.map(g => g.id === id ? res.data : g));
    }
  };

  // Error handlers
  const handleReportError = async (data: Partial<ErrorReport>) => {
    const res = await api.reportError(data);
    if (res.success) {
      setErrors(prev => [res.data, ...prev]);
    }
  };

  const handleResolveError = async (id: string, notes: string) => {
    const res = await api.resolveError(id, notes);
    if (res.success) {
      setErrors(prev => prev.map(e => e.id === id ? res.data : e));
    }
  };

  const openErrorCount = errors.filter(e => e.status !== 'resolved').length;

  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthTab(tab);
    setViewMode('auth');
  };

  // VIEW 1: Trang Giới Thiệu (Mở ra đầu tiên)
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
        onBackToLanding={() => setViewMode('landing')}
        onEnterApp={() => setViewMode('app')}
      />
    );
  }

  // VIEW 3: Không Gian Học Tập Planora LMS Workspace (Yêu cầu đăng nhập chuẩn như web bình thường)
  if (!user) {
    return (
      <AuthSplitView
        initialTab="login"
        onBackToLanding={() => setViewMode('landing')}
        onEnterApp={() => setViewMode('app')}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-row transition-colors duration-200 ${
      isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Persistent Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        errorCount={openErrorCount}
        onGoToLanding={() => setViewMode('landing')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          onOpenAi={() => setActiveTab('ai')}
          onGoToLanding={() => setViewMode('landing')}
          onOpenAuth={(tab) => handleOpenAuth(tab)}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onNavigate={setActiveTab}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto overflow-y-auto">
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
                />
              )}

              {activeTab === 'tasks' && (
                <TasksView
                  tasks={tasks}
                  courses={courses}
                  onCreateTask={handleCreateTask}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                  onAiBreakdown={handleAiBreakdown}
                  initialCourseId={crossContext.courseId}
                />
              )}

              {activeTab === 'notes' && (
                <NotesView
                  notes={notes}
                  onCreateNote={handleCreateNote}
                  onDeleteNote={handleDeleteNote}
                  initialSearchTerm={crossContext.courseCode}
                />
              )}

              {activeTab === 'goals' && (
                <GoalsView
                  goals={goals}
                  onIncrementGoal={handleIncrementGoal}
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
                <SettingsView />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
