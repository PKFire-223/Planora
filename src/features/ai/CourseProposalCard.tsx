import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Calendar,
  Layers,
  User,
  Award,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ListTodo
} from 'lucide-react';
import { Course, Task } from '../../types';

export interface CourseProposal {
  title: string;
  code: string;
  credits?: number;
  instructor?: string;
  color?: string;
  description: string;
  targetGrade?: string;
  semester?: string;
  syllabus?: { week: number; title: string; desc: string }[];
  initialTasks?: { title: string; estimatedMinutes?: number; priority?: 'low' | 'medium' | 'high' }[];
}

interface CourseProposalCardProps {
  proposal: CourseProposal;
  isDark: boolean;
  onCreateCourse?: (data: Partial<Course>) => Promise<void>;
  onCreateTask?: (data: Partial<Task>) => Promise<void>;
  onNavigate?: (tab: string) => void;
}

export function CourseProposalCard({
  proposal,
  isDark,
  onCreateCourse,
  onCreateTask,
  onNavigate
}: CourseProposalCardProps) {
  const [isCreated, setIsCreated] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showSyllabus, setShowSyllabus] = useState(false);

  // Map color names to Tailwind color classes
  const colorMap: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
    indigo: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-500/30',
      gradient: 'from-indigo-600 to-blue-600'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      gradient: 'from-emerald-600 to-teal-600'
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/30',
      gradient: 'from-amber-600 to-orange-600'
    },
    rose: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/30',
      gradient: 'from-rose-600 to-pink-600'
    },
    sky: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-600 dark:text-sky-400',
      border: 'border-sky-500/30',
      gradient: 'from-sky-600 to-indigo-600'
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/30',
      gradient: 'from-purple-600 to-indigo-600'
    }
  };

  const currentTheme = colorMap[proposal.color || 'indigo'] || colorMap.indigo;

  const handleCreate = async () => {
    if (!onCreateCourse || isCreated || isCreating) return;

    setIsCreating(true);
    try {
      // 1. Create Course
      const newCourseData: Partial<Course> = {
        title: proposal.title,
        code: proposal.code,
        credits: proposal.credits || 3,
        instructor: proposal.instructor || 'Hội đồng Cố vấn Planora AI',
        description: proposal.description,
        color: proposal.color || 'indigo',
        status: 'in_progress',
        progress: 0,
        totalLessons: proposal.syllabus?.length || 4,
        completedLessons: 0,
        targetGrade: proposal.targetGrade || 'A',
        semester: proposal.semester || 'Học kỳ 1 - 2026',
        syllabus: proposal.syllabus?.map(s => ({
          week: s.week,
          title: s.title,
          content: s.desc,
          completed: false
        }))
      };

      await onCreateCourse(newCourseData);

      // 2. Automatically create initial tasks if provided
      if (onCreateTask && proposal.initialTasks && proposal.initialTasks.length > 0) {
        for (let i = 0; i < proposal.initialTasks.length; i++) {
          const it = proposal.initialTasks[i];
          await onCreateTask({
            title: it.title,
            priority: it.priority || 'medium',
            status: 'todo',
            dueDate: new Date(Date.now() + (i + 1) * 3 * 86400000).toISOString().split('T')[0],
            estimatedMinutes: it.estimatedMinutes || 45,
            isAiGenerated: true
          });
        }
      }

      setIsCreated(true);
    } catch (err) {
      console.error('Error creating course from AI proposal:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={`mt-4 rounded-2xl border overflow-hidden shadow-sm transition-all ${
      isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-slate-200'
    }`}>
      {/* Header Banner */}
      <div className={`p-4 bg-gradient-to-r ${currentTheme.gradient} text-white relative`}>
        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            Khóa Học Được Đề Xuất Bởi Planora AI
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-black/25">
            {proposal.code}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">
          {proposal.title}
        </h3>

        <div className="flex items-center gap-3 mt-2 text-xs text-white/90 flex-wrap">
          <span className="flex items-center gap-1 font-medium">
            <Layers className="w-3.5 h-3.5 text-white/80" />
            {proposal.credits || 3} Tín chỉ
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-medium">
            <User className="w-3.5 h-3.5 text-white/80" />
            {proposal.instructor || 'Planora AI Mentor'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-medium">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            Mục tiêu: Điểm {proposal.targetGrade || 'A'}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-3">
        <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
          {proposal.description}
        </p>

        {/* Highlights Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border} font-medium`}>
            <Calendar className="w-3.5 h-3.5" />
            {proposal.syllabus?.length || 4} tuần học theo giáo trình
          </span>

          {proposal.initialTasks && proposal.initialTasks.length > 0 && (
            <span className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/50 text-slate-700 dark:text-neutral-300 flex items-center gap-1.5 font-medium">
              <ListTodo className="w-3.5 h-3.5 text-indigo-500" />
              {proposal.initialTasks.length} bài tập khởi động tự động
            </span>
          )}

          {/* Toggle Syllabus Details */}
          {proposal.syllabus && proposal.syllabus.length > 0 && (
            <button
              type="button"
              onClick={() => setShowSyllabus(!showSyllabus)}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 ml-auto cursor-pointer"
            >
              <span>{showSyllabus ? 'Thu gọn đề cương' : 'Xem chi tiết đề cương'}</span>
              {showSyllabus ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Expandable Syllabus Detail */}
        {showSyllabus && proposal.syllabus && (
          <div className={`mt-2 p-3 rounded-xl border space-y-2 text-xs animate-fade-in ${
            isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <p className="font-bold text-slate-900 dark:text-white mb-1.5">
              Đề cương giảng dạy theo tuần:
            </p>
            {proposal.syllabus.map(s => (
              <div key={s.week} className="flex gap-2">
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                  T{s.week}:
                </span>
                <div>
                  <p className="font-medium text-slate-800 dark:text-neutral-200">{s.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Button Row */}
        <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between gap-3 flex-wrap">
          {!isCreated ? (
            <button
              type="button"
              onClick={handleCreate}
              disabled={isCreating}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer bg-gradient-to-r ${currentTheme.gradient} hover:opacity-95 disabled:opacity-50`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isCreating ? 'Đang khởi tạo khóa học & bài tập...' : '✨ Kích Hoạt & Tạo Khóa Học Này Vào Planora'}</span>
            </button>
          ) : (
            <div className="w-full flex items-center justify-between gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Đã thêm môn học và bài tập vào hệ thống!</span>
              </div>

              <div className="flex items-center gap-2">
                {onNavigate && (
                  <>
                    <button
                      type="button"
                      onClick={() => onNavigate('courses')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Xem Khóa Học 🚀</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('tasks')}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isDark ? 'border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700' : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      <ListTodo className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Xem Nhiệm Vụ</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
