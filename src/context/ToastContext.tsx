import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { ActiveTab } from '../types';

export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'deadline';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  targetTab?: ActiveTab;
  duration?: number; // duration in ms, default 5000
  timestamp: string;
  undoAction?: () => void;
  undoLabel?: string;
}

export interface ToastInput {
  type?: ToastType;
  title: string;
  message: string;
  targetTab?: ActiveTab;
  duration?: number;
  undoAction?: () => void;
  undoLabel?: string;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (input: ToastInput) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Web Audio API soft notification chime generator (No external mp3 assets needed)
function playNotificationChime(type: ToastType) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.setValueAtTime(0.04, now); // subtle, pleasant volume

    if (type === 'success') {
      // 2 gentle ascending notes: E5 (659Hz) -> G#5 (830Hz)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      osc1.connect(gainNode);
      osc1.start(now);
      osc1.stop(now + 0.12);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(830.61, now + 0.08);
      osc2.connect(gainNode);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.25);

      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    } else if (type === 'deadline' || type === 'warning') {
      // Double attention pulse: A5 (880Hz) -> F5 (698Hz)
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(698.46, now + 0.12);
      osc.connect(gainNode);
      osc.start(now);
      osc.stop(now + 0.3);

      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    } else {
      // Soft gentle tap: C5 (523Hz)
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.connect(gainNode);
      osc.start(now);
      osc.stop(now + 0.15);

      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    }
  } catch {
    // Ignore audio context autoplay restrictions safely
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('planora_toast_muted') === 'true';
    } catch {
      return false;
    }
  });

  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
    try {
      localStorage.setItem('planora_toast_muted', String(isMuted));
    } catch {
      // ignore
    }
  }, [isMuted]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const showToast = useCallback((input: ToastInput): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastItem = {
      id,
      type: input.type || 'info',
      title: input.title,
      message: input.message,
      targetTab: input.targetTab,
      duration: input.duration !== undefined ? input.duration : 5000,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      undoAction: input.undoAction,
      undoLabel: input.undoLabel
    };

    // Play subtle audio cue if not muted
    if (!isMutedRef.current) {
      playNotificationChime(newToast.type);
    }

    // Keep at most 4 simultaneous toasts to avoid screen crowding
    setToasts(prev => [newToast, ...prev.slice(0, 3)]);

    return id;
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        clearAllToasts,
        isMuted,
        toggleMute
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
