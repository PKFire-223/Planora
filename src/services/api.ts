import { Course, Task, Note, Goal, ErrorReport } from '../types';

export const api = {
  // Health
  async getHealth() {
    const res = await fetch('/api/health');
    return res.json();
  },

  // Courses
  async getCourses(status?: string): Promise<{ success: boolean; data: Course[] }> {
    const url = status ? `/api/courses?status=${status}` : '/api/courses';
    const res = await fetch(url);
    return res.json();
  },

  async createCourse(data: Partial<Course>): Promise<{ success: boolean; data: Course }> {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateCourse(id: string, data: Partial<Course>): Promise<{ success: boolean; data: Course }> {
    const res = await fetch(`/api/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteCourse(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Tasks
  async getTasks(status?: string): Promise<{ success: boolean; data: Task[] }> {
    const url = status ? `/api/tasks?status=${status}` : '/api/tasks';
    const res = await fetch(url);
    return res.json();
  },

  async createTask(data: Partial<Task>): Promise<{ success: boolean; data: Task }> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateTaskStatus(id: string, status: Task['status']): Promise<{ success: boolean; data: Task }> {
    const res = await fetch(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async deleteTask(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Notes
  async getNotes(search?: string, tag?: string): Promise<{ success: boolean; data: Note[] }> {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (tag) params.set('tag', tag);
    const res = await fetch(`/api/notes?${params.toString()}`);
    return res.json();
  },

  async createNote(data: Partial<Note>): Promise<{ success: boolean; data: Note }> {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteNote(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Goals
  async getGoals(): Promise<{ success: boolean; data: Goal[] }> {
    const res = await fetch('/api/goals');
    return res.json();
  },

  async updateGoalProgress(id: string, increment: number): Promise<{ success: boolean; data: Goal }> {
    const res = await fetch(`/api/goals/${id}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ increment })
    });
    return res.json();
  },

  // AI Assistant
  async askAi(question: string, context?: string): Promise<{ success: boolean; answer: string; source?: string }> {
    const res = await fetch('/api/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context })
    });
    return res.json();
  },

  async breakdownTask(taskTitle: string, courseId?: string): Promise<{ success: boolean; message: string; data: Task[] }> {
    const res = await fetch('/api/ai/breakdown-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskTitle, courseId })
    });
    return res.json();
  },

  // Errors / Issue Reports
  async getErrors(status?: string): Promise<{ success: boolean; data: ErrorReport[] }> {
    const url = status ? `/api/errors?status=${status}` : '/api/errors';
    const res = await fetch(url);
    return res.json();
  },

  async reportError(data: Partial<ErrorReport>): Promise<{ success: boolean; data: ErrorReport }> {
    const res = await fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async resolveError(id: string, resolutionNotes: string): Promise<{ success: boolean; data: ErrorReport }> {
    const res = await fetch(`/api/errors/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved', resolutionNotes })
    });
    return res.json();
  }
};
