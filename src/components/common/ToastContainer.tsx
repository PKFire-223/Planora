import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Info,
  X,
  ArrowRight,
  RotateCcw,
  Volume2,
  VolumeX,
  BellRing
} from 'lucide-react';
import { ToastItem, useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { ActiveTab } from '../../types';

interface ToastContainerProps {
  onNavigate: (tab: ActiveTab) => void;
}

interface SingleToastProps {
  toast: ToastItem;
  onNavigate: (tab: ActiveTab) => void;
  onDismiss: (id: string) => void;
}

function SingleToast({ toast, onNavigate, onDismiss }: SingleToastProps) {
  const { isDark } = useTheme();
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  const duration = toast.duration || 5000;
  const remainingTimeRef = useRef(duration);
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    lastTickRef.current = Date.now();
    const interval = setInterval(() => {
      if (!isPaused) {
        const now = Date.now();
        const delta = now - lastTickRef.current;
        lastTickRef.current = now;

        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - delta);
        setProgress((remainingTimeRef.current / duration) * 100);

        if (remainingTimeRef.current <= 0) {
          clearInterval(interval);
          onDismiss(toast.id);
        }
      } else {
        lastTickRef.current = Date.now();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused, duration, toast.id, onDismiss]);

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if user clicked the close button or undo button
    const target = e.target as HTMLElement;
    if (target.closest('button[data-toast-action]')) return;

    if (toast.targetTab) {
      onNavigate(toast.targetTab);
    }
    onDismiss(toast.id);
  };

  const getStyleByType = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
          iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600',
          borderAccent: isDark ? 'border-emerald-500/40' : 'border-emerald-300',
          progressBar: 'bg-emerald-500',
          tabBadge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
        };
      case 'deadline':
        return {
          icon: <Clock className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />,
          iconBg: 'bg-rose-500/15 border-rose-500/30 text-rose-600',
          borderAccent: isDark ? 'border-rose-500/50 shadow-rose-950/40' : 'border-rose-300 shadow-rose-100',
          progressBar: 'bg-rose-500',
          tabBadge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
          iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-600',
          borderAccent: isDark ? 'border-amber-500/40' : 'border-amber-300',
          progressBar: 'bg-amber-500',
          tabBadge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
        };
      case 'error':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />,
          iconBg: 'bg-rose-500/15 border-rose-500/30 text-rose-600',
          borderAccent: isDark ? 'border-rose-500/40' : 'border-rose-300',
          progressBar: 'bg-rose-500',
          tabBadge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-4 h-4 text-indigo-500 shrink-0" />,
          iconBg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-600',
          borderAccent: isDark ? 'border-indigo-500/40' : 'border-indigo-300',
          progressBar: 'bg-indigo-500',
          tabBadge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
        };
    }
  };

  const style = getStyleByType();

  const tabLabels: Record<string, string> = {
    courses: 'Khoá học',
    timetable: 'Thời khoá biểu',
    tasks: 'Nhiệm vụ',
    notes: 'Ghi chú',
    goals: 'Mục tiêu',
    notifications: 'Thông báo',
    dashboard: 'Tổng quan'
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto w-full rounded-2xl border p-3.5 shadow-xl transition-all duration-200 cursor-pointer overflow-hidden relative group animate-in slide-in-from-right-8 fade-in duration-300 ${
        isDark
          ? 'bg-neutral-900/95 border-neutral-800 text-white shadow-black/60 hover:border-neutral-700'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/80 hover:border-slate-300'
      } ${style.borderAccent}`}
    >
      <div className="flex items-start gap-3">
        {/* Type Icon */}
        <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${style.iconBg}`}>
          {style.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="text-xs font-bold leading-snug truncate">{toast.title}</h4>
            {toast.targetTab && (
              <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${style.tabBadge}`}>
                {tabLabels[toast.targetTab] || toast.targetTab}
              </span>
            )}
          </div>

          <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? 'text-neutral-300' : 'text-slate-600'}`}>
            {toast.message}
          </p>

          {/* Navigation Hint & Undo button */}
          <div className="mt-2.5 flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-neutral-800/80">
            {toast.targetTab ? (
              <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-1">
                <span>Bấm để xem ngay</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">{toast.timestamp}</span>
            )}

            {toast.undoAction && (
              <button
                type="button"
                data-toast-action="undo"
                onClick={e => {
                  e.stopPropagation();
                  toast.undoAction?.();
                  onDismiss(toast.id);
                }}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{toast.undoLabel || 'Hoàn tác'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          data-toast-action="close"
          onClick={e => {
            e.stopPropagation();
            onDismiss(toast.id);
          }}
          className={`absolute top-3 right-3 p-1 rounded-lg transition-colors cursor-pointer ${
            isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
          title="Đóng thông báo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Auto-dismiss progress countdown bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-neutral-800' : 'bg-slate-100'}`}>
        <div
          className={`h-full transition-all duration-75 ${style.progressBar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastContainer({ onNavigate }: ToastContainerProps) {
  const { toasts, removeToast, clearAllToasts, isMuted, toggleMute } = useToast();
  const { isDark } = useTheme();

  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Thông báo hệ thống"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 w-full max-w-sm sm:max-w-md pointer-events-none px-3 sm:px-0"
    >
      {/* Utility Bar if multiple toasts */}
      {toasts.length > 1 && (
        <div className="flex items-center justify-between px-2 py-1 rounded-xl pointer-events-auto bg-black/40 backdrop-blur-md text-white text-[11px] animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 font-medium text-neutral-300">
            <BellRing className="w-3 h-3 text-indigo-400 animate-pulse" />
            <span>{toasts.length} thông báo mới</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              title={isMuted ? 'Bật âm thanh thông báo' : 'Tắt âm thanh thông báo'}
              className="p-1 rounded-md hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
            </button>
            <button
              type="button"
              onClick={clearAllToasts}
              className="text-[10px] px-2 py-0.5 rounded-md hover:bg-white/10 text-neutral-300 hover:text-white font-medium transition-colors cursor-pointer"
            >
              Đóng tất cả
            </button>
          </div>
        </div>
      )}

      {/* Render active toasts */}
      {toasts.map(toast => (
        <SingleToast
          key={toast.id}
          toast={toast}
          onNavigate={onNavigate}
          onDismiss={removeToast}
        />
      ))}
    </aside>
  );
}
