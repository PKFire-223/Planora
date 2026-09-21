import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './features/dashboard/DashboardView';
import { CoursesView } from './features/courses/CoursesView';
import { TasksView } from './features/tasks/TasksView';
import { NotesView } from './features/notes/NotesView';
import { GoalsView } from './features/goals/GoalsView';
import { AiAssistantView } from './features/ai/AiAssistantView';
import { ErrorReportsView } from './features/errorReports/ErrorReportsView';
import { ProjectStructureView } from './features/structure/ProjectStructureView';
import { api } from './services/api';
import { Course, Task, Note, Goal, ErrorReport, ActiveTab } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data from backend API
  const loadData = async () => {
    try {
      const [coursesRes, tasksRes, notesRes, goalsRes, errorsRes] = await Promise.all([
        api.getCourses(),
        api.getTasks(),
        api.getNotes(),
        api.getGoals(),
        api.getErrors()
      ]);

      if (coursesRes.success) setCourses(coursesRes.data);
      if (tasksRes.success) setTasks(tasksRes.data);
      if (notesRes.success) setNotes(notesRes.data);
      if (goalsRes.success) setGoals(goalsRes.data);
      if (errorsRes.success) setErrors(errorsRes.data);
    } catch (err) {
      console.error('Error loading initial data from API:', err);
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

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-row selection:bg-rose-500/20 selection:text-rose-200">
      {/* Persistent Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        errorCount={openErrorCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          onOpenAi={() => setActiveTab('ai')}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-neutral-400 text-xs font-mono">
              Đang kết nối hệ thống LMS...
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  courses={courses}
                  tasks={tasks}
                  goals={goals}
                  errors={errors}
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
                />
              )}

              {activeTab === 'notes' && (
                <NotesView
                  notes={notes}
                  onCreateNote={handleCreateNote}
                  onDeleteNote={handleDeleteNote}
                />
              )}

              {activeTab === 'goals' && (
                <GoalsView
                  goals={goals}
                  onIncrementGoal={handleIncrementGoal}
                />
              )}

              {activeTab === 'ai' && (
                <AiAssistantView />
              )}

              {activeTab === 'errors' && (
                <ErrorReportsView
                  errors={errors}
                  onReportError={handleReportError}
                  onResolveError={handleResolveError}
                />
              )}

              {activeTab === 'structure' && (
                <ProjectStructureView />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
