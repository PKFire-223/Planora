import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  Sun, 
  Sunset, 
  X, 
  Search, 
  PanelLeftClose, 
  PanelLeftOpen, 
  AlertCircle,
  RefreshCw,
  GraduationCap,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { TimetableEntry, DayOfWeek, DaySession, Course, ActiveTab } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { FALLBACK_TIMETABLE } from '../../data/fallbackData';
import { 
  syncCoursesToTimetable, 
  formatCourseSchedule, 
  parseCourseSchedule, 
  mapCourseColor 
} from '../../utils/courseTimetableSync';

interface TimetableViewProps {
  courses?: Course[];
  onUpdateCourse?: (id: string, data: Partial<Course>) => Promise<void>;
  onNavigateToCourses?: () => void;
  onNavigateToTab?: (tab: ActiveTab, context?: { courseId?: string; courseCode?: string; aiPrompt?: string }) => void;
  initialHighlightCourseId?: string;
}

const DAYS: { key: DayOfWeek; label: string; fullLabel: string }[] = [
  { key: 'mon', label: 'T2', fullLabel: 'Thứ Hai' },
  { key: 'tue', label: 'T3', fullLabel: 'Thứ Ba' },
  { key: 'wed', label: 'T4', fullLabel: 'Thứ Tư' },
  { key: 'thu', label: 'T5', fullLabel: 'Thứ Năm' },
  { key: 'fri', label: 'T6', fullLabel: 'Thứ Sáu' },
  { key: 'sat', label: 'T7', fullLabel: 'Thứ Bảy' },
  { key: 'sun', label: 'CN', fullLabel: 'Chủ Nhật' },
];

const HOURS_24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES_60 = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

function parseTimeString(timeStr?: string): { 
  startHour: string; 
  startMinute: string; 
  endHour: string; 
  endMinute: string;
} {
  if (!timeStr) {
    return { startHour: '07', startMinute: '30', endHour: '09', endMinute: '30' };
  }
  const parts = timeStr.split('-').map(s => s.trim());
  const parsePart = (val: string | undefined, defH: string, defM: string) => {
    if (!val) return { h: defH, m: defM };
    const match = val.match(/^(\d{1,2}):(\d{1,2})/);
    if (match) {
      const h = String(Math.min(23, Math.max(0, parseInt(match[1], 10)))).padStart(2, '0');
      const m = String(Math.min(59, Math.max(0, parseInt(match[2], 10)))).padStart(2, '0');
      return { h, m };
    }
    return { h: defH, m: defM };
  };
  const start = parsePart(parts[0], '07', '30');
  const end = parsePart(parts[1], '09', '30');
  return {
    startHour: start.h,
    startMinute: start.m,
    endHour: end.h,
    endMinute: end.m
  };
}

function formatRoom(room?: string): string {
  if (!room) return '';
  const cleaned = room.replace(/^(phòng|phong)\s*:?\s*/i, '').trim();
  return cleaned || room;
}

export function TimetableView({ 
  courses = [], 
  onUpdateCourse, 
  onNavigateToCourses,
  onNavigateToTab,
  initialHighlightCourseId 
}: TimetableViewProps) {
  const { isDark } = useTheme();

  // Load timetable from localStorage or fallback, and immediately sync with courses
  const [timetable, setTimetable] = useState<TimetableEntry[]>(() => {
    try {
      const saved = localStorage.getItem('planora_timetable');
      const base = saved ? JSON.parse(saved) : FALLBACK_TIMETABLE;
      const synced = courses.length > 0 ? syncCoursesToTimetable(courses, base) : base;
      try {
        localStorage.setItem('planora_timetable', JSON.stringify(synced));
      } catch {}
      return synced;
    } catch {
      return FALLBACK_TIMETABLE;
    }
  });

  // Panel collapse toggle
  const [isPoolOpen, setIsPoolOpen] = useState(true);

  // Search & Filter for left panel
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unassigned'>('all');

  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [isDraggingNow, setIsDraggingNow] = useState(false);

  // Max 4 subjects per session warning alert
  const [slotLimitAlert, setSlotLimitAlert] = useState<string | null>(null);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const triggerLimitAlert = (msg: string) => {
    setSlotLimitAlert(msg);
    setTimeout(() => {
      setSlotLimitAlert(null);
    }, 4000);
  };

  const triggerSyncToast = (msg: string) => {
    setSyncToast(msg);
    setTimeout(() => {
      setSyncToast(null);
    }, 3500);
  };

  // Synchronize courses whenever courses prop updates
  useEffect(() => {
    if (courses && courses.length > 0) {
      setTimetable(prev => syncCoursesToTimetable(courses, prev));
    }
  }, [courses]);

  // Manual Synchronize button handler
  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setTimetable(prev => {
        const synced = syncCoursesToTimetable(courses, prev);
        try {
          localStorage.setItem('planora_timetable', JSON.stringify(synced));
        } catch {}
        return synced;
      });
      setIsSyncing(false);
      triggerSyncToast(`Đã đồng bộ ${courses.length} môn học với Thời Khóa Biểu thành công!`);
    }, 400);
  };

  // Modal / Form state for Add or Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimetableEntry | null>(null);

  // Form inputs
  const [formCourseId, setFormCourseId] = useState<string>('');
  const [formName, setFormName] = useState('');
  const [formStartHour, setFormStartHour] = useState('07');
  const [formStartMinute, setFormStartMinute] = useState('30');
  const [formEndHour, setFormEndHour] = useState('09');
  const [formEndMinute, setFormEndMinute] = useState('30');
  const [formRoom, setFormRoom] = useState('');
  const [formInstructor, setFormInstructor] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formDay, setFormDay] = useState<DayOfWeek | ''>('');
  const [formSession, setFormSession] = useState<DaySession>('morning');
  const [formSyncToCourse, setFormSyncToCourse] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Quick Assign Dropdown for Mobile / Direct Assignment
  const [assigningId, setAssigningId] = useState<string | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('planora_timetable', JSON.stringify(timetable));
    } catch {
      // ignore
    }
  }, [timetable]);

  // When user selects a course from dropdown in Add/Edit modal
  const handleSelectCourseLink = (courseId: string) => {
    setFormCourseId(courseId);
    if (!courseId) return;

    const matchedCourse = courses.find(c => c.id === courseId);
    if (matchedCourse) {
      setFormName(matchedCourse.title);
      setFormInstructor(matchedCourse.instructor || '');
      setFormRoom(formatRoom(matchedCourse.room) || '');

      if (matchedCourse.schedule) {
        const parsed = parseCourseSchedule(matchedCourse.schedule);
        if (parsed.day) setFormDay(parsed.day);
        if (parsed.session) setFormSession(parsed.session);
        const timeParsed = parseTimeString(parsed.time);
        setFormStartHour(timeParsed.startHour);
        setFormStartMinute(timeParsed.startMinute);
        setFormEndHour(timeParsed.endHour);
        setFormEndMinute(timeParsed.endMinute);
      }
    }
  };

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormCourseId('');
    setFormName('');
    setFormStartHour('07');
    setFormStartMinute('30');
    setFormEndHour('09');
    setFormEndMinute('30');
    setFormRoom('');
    setFormInstructor('');
    setFormNotes('');
    setFormDay('');
    setFormSession('morning');
    setFormSyncToCourse(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (item: TimetableEntry) => {
    setEditingItem(item);
    setFormCourseId(item.courseId || '');
    setFormName(item.name);
    const parsed = parseTimeString(item.time);
    setFormStartHour(parsed.startHour);
    setFormStartMinute(parsed.startMinute);
    setFormEndHour(parsed.endHour);
    setFormEndMinute(parsed.endMinute);
    setFormRoom(formatRoom(item.room) || '');
    setFormInstructor(item.instructor || '');
    setFormNotes(item.notes || '');
    setFormDay(item.day || '');
    setFormSession(item.session || 'morning');
    setFormSyncToCourse(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle Save Form
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (formDay && formSession) {
      const currentInSlot = timetable.filter(
        item => item.day === formDay && item.session === formSession && (!editingItem || item.id !== editingItem.id)
      );
      if (currentInSlot.length >= 4) {
        setFormError('Buổi bạn chọn đã có đủ tối đa 4 môn học. Vui lòng chọn buổi khác!');
        return;
      }
    }

    const formattedTime = `${formStartHour}:${formStartMinute} - ${formEndHour}:${formEndMinute}`;
    const cleanedRoom = formatRoom(formRoom);
    const linkedCourse = courses.find(c => c.id === formCourseId);

    if (editingItem) {
      setTimetable(prev => prev.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            courseId: formCourseId || item.courseId,
            courseCode: linkedCourse?.code || item.courseCode,
            credits: linkedCourse?.credits || item.credits,
            name: formName.trim(),
            time: formattedTime,
            room: cleanedRoom || undefined,
            instructor: formInstructor.trim() || undefined,
            notes: formNotes.trim() || undefined,
            color: linkedCourse?.color ? mapCourseColor(linkedCourse.color) : item.color,
            day: formDay ? formDay : undefined,
            session: formDay ? formSession : undefined
          };
        }
        return item;
      }));
    } else {
      const newItem: TimetableEntry = {
        id: `tt-${Date.now()}`,
        courseId: formCourseId || undefined,
        courseCode: linkedCourse?.code,
        credits: linkedCourse?.credits,
        name: formName.trim(),
        time: formattedTime,
        room: cleanedRoom || undefined,
        instructor: formInstructor.trim() || undefined,
        notes: formNotes.trim() || undefined,
        color: linkedCourse?.color ? mapCourseColor(linkedCourse.color) : 'indigo',
        day: formDay ? formDay : undefined,
        session: formDay ? formSession : undefined
      };
      setTimetable(prev => [newItem, ...prev]);
    }

    // Bidirectional sync back to Course if linked
    if (formCourseId && formSyncToCourse && onUpdateCourse) {
      const newSchedule = formDay ? formatCourseSchedule(formDay, formattedTime) : '';
      await onUpdateCourse(formCourseId, {
        schedule: newSchedule,
        room: cleanedRoom || undefined,
        instructor: formInstructor.trim() || undefined
      });
    }

    setIsModalOpen(false);
  };

  // Delete subject
  const handleDelete = (id: string) => {
    setTimetable(prev => prev.filter(item => item.id !== id));
  };

  // Unassign subject from timetable back to unassigned pool
  const handleUnassign = (id: string) => {
    setTimetable(prev => prev.map(item => {
      if (item.id === id) {
        if (item.courseId && onUpdateCourse) {
          onUpdateCourse(item.courseId, { schedule: '' });
        }
        return { ...item, day: undefined, session: undefined };
      }
      return item;
    }));
  };

  // Assign directly via quick menu
  const handleQuickAssign = (id: string, day: DayOfWeek, session: DaySession) => {
    const currentCount = timetable.filter(item => item.day === day && item.session === session && item.id !== id).length;
    if (currentCount >= 4) {
      triggerLimitAlert(`Buổi này đã đủ tối đa 4 môn học, không thể xếp thêm!`);
      return;
    }
    setTimetable(prev => prev.map(item => {
      if (item.id === id) {
        if (item.courseId && onUpdateCourse) {
          const newSchedule = formatCourseSchedule(day, item.time);
          onUpdateCourse(item.courseId, { schedule: newSchedule, room: item.room });
        }
        return { ...item, day, session };
      }
      return item;
    }));
    setAssigningId(null);
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    setIsDraggingNow(true);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverTarget(null);
    setIsDraggingNow(false);
  };

  const handleDragOver = (e: React.DragEvent, targetKey: string, day: DayOfWeek, session: DaySession) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTarget !== targetKey) {
      setDragOverTarget(targetKey);
    }
  };

  const handleDragLeave = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (dragOverTarget === targetKey) {
      setDragOverTarget(null);
    }
  };

  const handleDrop = (e: React.DragEvent, day: DayOfWeek, session: DaySession) => {
    e.preventDefault();
    setDragOverTarget(null);
    if (!draggedId) return;

    const itemsInTarget = timetable.filter(
      item => item.day === day && item.session === session && item.id !== draggedId
    );

    if (itemsInTarget.length >= 4) {
      triggerLimitAlert(`Buổi này đã đủ tối đa 4 môn học, không thể xếp thêm!`);
      setDraggedId(null);
      setIsDraggingNow(false);
      return;
    }

    setTimetable(prev => prev.map(item => {
      if (item.id === draggedId) {
        if (item.courseId && onUpdateCourse) {
          const newSchedule = formatCourseSchedule(day, item.time);
          onUpdateCourse(item.courseId, { schedule: newSchedule, room: item.room });
        }
        return { ...item, day, session };
      }
      return item;
    }));

    setDraggedId(null);
    setIsDraggingNow(false);
  };

  // Left drawer filtered items
  const filteredItems = useMemo(() => {
    return timetable.filter(item => {
      const matchSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.room && item.room.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.courseCode && item.courseCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.instructor && item.instructor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.time.includes(searchTerm);

      if (!matchSearch) return false;

      if (filterTab === 'unassigned') {
        return !item.day || !item.session;
      }
      return true;
    });
  }, [timetable, searchTerm, filterTab]);

  const unassignedCount = timetable.filter(i => !i.day || !i.session).length;
  const courseLinkedCount = timetable.filter(i => Boolean(i.courseId || i.courseCode)).length;

  const cardBaseStyle = isDark 
    ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 shadow-2xs' 
    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs';

  // Helper to render each slot on the timetable grid
  const renderSlot = (day: DayOfWeek, session: DaySession) => {
    const targetKey = `${day}-${session}`;
    const itemsInSlot = timetable.filter(item => item.day === day && item.session === session);
    const count = itemsInSlot.length;
    const isOver = dragOverTarget === targetKey;
    const isFull = count >= 4;

    return (
      <div
        onDragOver={(e) => handleDragOver(e, targetKey, day, session)}
        onDragLeave={(e) => handleDragLeave(e, targetKey)}
        onDrop={(e) => handleDrop(e, day, session)}
        className={`min-h-[220px] p-2 flex flex-col gap-1.5 rounded-xl border transition-all duration-150 relative ${
          isOver
            ? isFull
              ? isDark
                ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30 cursor-not-allowed'
                : 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-200 cursor-not-allowed'
              : isDark
                ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30'
                : 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200'
            : isDark
              ? 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700'
              : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300'
        }`}
      >
        {count === 0 ? (
          <div className="h-full w-full rounded-lg border border-dashed border-slate-200 dark:border-neutral-800 flex flex-col items-center justify-center text-center p-2 text-slate-400 dark:text-neutral-500 transition-colors group">
            <span className="text-[11px] font-medium opacity-60 group-hover:opacity-100">
              Kéo môn vào đây
            </span>
          </div>
        ) : (
          <div className="h-full w-full flex flex-col gap-1.5 overflow-hidden">
            {itemsInSlot.map((item) => {
              const cleanRoom = formatRoom(item.room);
              const matchedCourse = courses.find(c => c.id === item.courseId || c.code === item.courseCode);
              const isHighlighted = initialHighlightCourseId && item.courseId === initialHighlightCourseId;

              // 1 item in slot: full height, spacious layout
              if (count === 1) {
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      if (!isDraggingNow) handleOpenEdit(item);
                    }}
                    title="Bấm vào để chỉnh sửa thông tin môn học"
                    className={`h-full flex flex-col justify-between p-2.5 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] group relative ${cardBaseStyle} ${
                      isHighlighted ? 'ring-2 ring-indigo-500 ring-offset-2 animate-pulse' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1 flex-wrap">
                          {item.courseCode && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
                              {item.courseCode}
                            </span>
                          )}
                          <span className={`text-xs font-bold leading-snug line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {item.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            title="Gỡ khỏi TKB"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnassign(item.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-neutral-400">
                        <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{item.time}</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-neutral-800 text-[11px] flex items-center justify-between">
                      {cleanRoom ? (
                        <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 truncate flex-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                          <span className="truncate">{cleanRoom}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-neutral-500 text-[10px] italic">
                          (Chưa có phòng)
                        </span>
                      )}

                      {item.instructor && (
                        <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-medium truncate max-w-[120px]" title={item.instructor}>
                          {item.instructor}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              // 2 items in slot: 50% height
              if (count === 2) {
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      if (!isDraggingNow) handleOpenEdit(item);
                    }}
                    title="Bấm vào để chỉnh sửa thông tin môn học"
                    className={`h-[calc(50%-3px)] flex flex-col justify-between p-2 rounded-lg border transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] group relative ${cardBaseStyle} ${
                      isHighlighted ? 'ring-2 ring-indigo-500 animate-pulse' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
                        {item.courseCode && (
                          <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shrink-0">
                            {item.courseCode}
                          </span>
                        )}
                        <span className={`text-[11px] font-bold leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          title="Gỡ khỏi TKB"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnassign(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 mt-auto pt-1">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-neutral-400 font-medium">
                        <Clock className="w-3 h-3 shrink-0 text-indigo-500" />
                        <span className="truncate">{item.time}</span>
                      </div>
                      {cleanRoom ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                          <MapPin className="w-3 h-3 shrink-0 text-indigo-500" />
                          <span className="truncate">{cleanRoom}</span>
                        </div>
                      ) : (
                        <div className="text-[9px] text-slate-400 dark:text-neutral-500 italic pl-4">
                          (Chưa có phòng)
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // 3 items in slot
              if (count === 3) {
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      if (!isDraggingNow) handleOpenEdit(item);
                    }}
                    title="Bấm vào để chỉnh sửa thông tin môn học"
                    className={`h-[calc(33.33%-3px)] flex flex-col justify-between px-2 py-1.5 rounded-lg border transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] group relative ${cardBaseStyle}`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
                        {item.courseCode && (
                          <span className="px-1 text-[8px] font-mono font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shrink-0">
                            {item.courseCode}
                          </span>
                        )}
                        <p className={`text-[10px] font-bold leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {item.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          title="Gỡ khỏi TKB"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnassign(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-all cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-0.5 mt-auto">
                      <div className="flex items-center gap-1 text-[9px] text-slate-500 dark:text-neutral-400 font-medium">
                        <Clock className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{item.time}</span>
                      </div>
                      {cleanRoom ? (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                          <MapPin className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
                          <span className="truncate">{cleanRoom}</span>
                        </div>
                      ) : (
                        <div className="text-[8px] text-slate-400 italic pl-3.5">
                          (Chưa phòng)
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // 4 items in slot
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    if (!isDraggingNow) handleOpenEdit(item);
                  }}
                  title="Bấm vào để chỉnh sửa môn học"
                  className={`h-[calc(25%-3px)] flex flex-col justify-between px-1.5 py-1 rounded-md border transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] group relative ${cardBaseStyle}`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-[9px] font-bold leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {item.courseCode ? `[${item.courseCode}] ` : ''}{item.name}
                    </p>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        title="Gỡ khỏi TKB"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnassign(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-500 rounded cursor-pointer"
                      >
                        <X className="w-2 h-2" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[8px] gap-1">
                    <span className="text-slate-500 dark:text-neutral-400 truncate flex items-center gap-0.5 font-medium">
                      <Clock className="w-2 h-2 text-indigo-500 shrink-0" />
                      {item.time}
                    </span>
                    {cleanRoom && (
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 truncate flex items-center gap-0.5">
                        <MapPin className="w-2 h-2 text-indigo-500 shrink-0" />
                        {cleanRoom}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Alert / Notification banners */}
      {slotLimitAlert && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{slotLimitAlert}</span>
        </div>
      )}

      {syncToast && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{syncToast}</span>
          </div>
          <button 
            onClick={() => setSyncToast(null)}
            className="p-1 text-emerald-600 hover:text-emerald-800 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Timetable Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPoolOpen(!isPoolOpen)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              isDark 
                ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
            }`}
            title={isPoolOpen ? 'Thu gọn kho môn học' : 'Mở kho môn học'}
          >
            {isPoolOpen ? (
              <>
                <PanelLeftClose className="w-4 h-4 text-indigo-500" />
                <span>Ẩn kho môn</span>
              </>
            ) : (
              <>
                <PanelLeftOpen className="w-4 h-4 text-indigo-500" />
                <span>Hiện kho môn ({unassignedCount})</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
              Đã đồng bộ: <strong className="text-indigo-600 dark:text-indigo-400">{courseLinkedCount}/{courses.length} môn học</strong>
            </span>
          </div>
        </div>

        {/* Action Buttons: Sync Courses & Add Subject */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-neutral-200'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs'
            }`}
            title="Đồng bộ lại tất cả môn học và lịch từ danh sách khóa học"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Đồng bộ từ Khóa Học</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Môn Học</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Left Drawer (Pool) + Right Grid */}
      <div className="flex flex-col lg:flex-row gap-4 items-start w-full">
        {/* ========================================================================= */}
        {/* CỘT TRÁI: KHO MÔN HỌC / DANH SÁCH CHỜ XẾP                                  */}
        {/* ========================================================================= */}
        {isPoolOpen && (
          <div className={`w-full lg:w-80 shrink-0 p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>Kho Môn Học ({timetable.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                  Kéo thả vào thứ & ca học mong muốn
                </p>
              </div>

              <button
                onClick={handleOpenCreate}
                className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors cursor-pointer"
                title="Thêm môn mới"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm môn, mã môn, phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs outline-none transition-colors ${
                  isDark 
                    ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:border-indigo-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                }`}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-neutral-950 mb-3 text-xs font-semibold">
              <button
                onClick={() => setFilterTab('all')}
                className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer text-center ${
                  filterTab === 'all'
                    ? 'bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900'
                }`}
              >
                Tất cả ({timetable.length})
              </button>
              <button
                onClick={() => setFilterTab('unassigned')}
                className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer text-center ${
                  filterTab === 'unassigned'
                    ? 'bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900'
                }`}
              >
                Chưa xếp ({unassignedCount})
              </button>
            </div>

            {/* List of Draggable Items */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-neutral-500">
                  Không tìm thấy môn nào. Nhấn "+ Thêm Môn Học" hoặc "Đồng bộ từ Khóa Học"!
                </div>
              ) : (
                filteredItems.map(item => {
                  const isAssigned = Boolean(item.day && item.session);
                  const dayObj = DAYS.find(d => d.key === item.day);
                  const sessionLabel = item.session === 'morning' ? 'Sáng' : 'Chiều';
                  const matchedCourse = courses.find(c => c.id === item.courseId || c.code === item.courseCode);

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        if (!isDraggingNow) handleOpenEdit(item);
                      }}
                      title="Kéo thả hoặc bấm để chỉnh sửa môn học"
                      className={`p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] group relative ${cardBaseStyle}`}
                    >
                      {/* Top row: Title, Actions */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            {item.courseCode && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                {item.courseCode}
                              </span>
                            )}
                            {item.credits && (
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-neutral-400">
                                {item.credits} TC
                              </span>
                            )}
                          </div>
                          <span className={`text-xs font-bold block leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {item.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            title="Xóa môn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Middle: Time & Room */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] mb-2 text-slate-600 dark:text-neutral-400">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span>{item.time}</span>
                        </span>

                        {item.room ? (
                          <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{formatRoom(item.room)}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">
                            (Chưa có phòng)
                          </span>
                        )}
                      </div>

                      {/* Bottom: Schedule Status & Quick Assign Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-neutral-800 text-[10px]">
                        {isAssigned ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{dayObj?.label} • Buổi {sessionLabel}</span>
                          </div>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            Chưa xếp lên TKB
                          </span>
                        )}

                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssigningId(assigningId === item.id ? null : item.id);
                            }}
                            className="px-2 py-0.5 rounded-lg border text-slate-600 dark:text-neutral-300 hover:text-indigo-600 border-slate-200 dark:border-neutral-700 hover:border-indigo-400 cursor-pointer font-semibold transition-colors"
                          >
                            {isAssigned ? 'Đổi ca' : 'Xếp ngay'}
                          </button>

                          {assigningId === item.id && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className={`absolute right-0 bottom-full mb-1 w-52 p-2 rounded-xl shadow-xl border z-30 ${
                                isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="text-[11px] font-bold mb-1.5 text-slate-700 dark:text-neutral-200">
                                Chọn Buổi Để Xếp:
                              </div>
                              <div className="space-y-1 max-h-48 overflow-y-auto">
                                {DAYS.map(d => {
                                  const morningCount = timetable.filter(t => t.day === d.key && t.session === 'morning' && t.id !== item.id).length;
                                  const afternoonCount = timetable.filter(t => t.day === d.key && t.session === 'afternoon' && t.id !== item.id).length;
                                  const morningFull = morningCount >= 4;
                                  const afternoonFull = afternoonCount >= 4;

                                  return (
                                    <div key={d.key} className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-50 dark:hover:bg-neutral-800 text-[10px]">
                                      <span className="font-semibold">{d.fullLabel}:</span>
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => !morningFull && handleQuickAssign(item.id, d.key, 'morning')}
                                          disabled={morningFull}
                                          className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
                                            morningFull 
                                              ? 'bg-slate-200 dark:bg-neutral-800 text-slate-400 cursor-not-allowed'
                                              : 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 cursor-pointer'
                                          }`}
                                        >
                                          {morningFull ? 'Sáng (Đầy)' : 'Sáng'}
                                        </button>
                                        <button
                                          onClick={() => !afternoonFull && handleQuickAssign(item.id, d.key, 'afternoon')}
                                          disabled={afternoonFull}
                                          className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
                                            afternoonFull 
                                              ? 'bg-slate-200 dark:bg-neutral-800 text-slate-400 cursor-not-allowed'
                                              : 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 cursor-pointer'
                                          }`}
                                        >
                                          {afternoonFull ? 'Chiều (Đầy)' : 'Chiều'}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CỘT PHẢI: KHUNG THỜI KHÓA BIỂU RỘNG RÃI (T2 -> CN, SÁNG & CHIỀU)         */}
        {/* ========================================================================= */}
        <div className={`flex-1 min-w-0 w-full p-4 sm:p-5 rounded-2xl border transition-colors overflow-x-auto ${
          isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          {/* Legend / Session info bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
              <span>Kéo thả môn vào từng buổi học, tối đa 4 môn mỗi buổi. Nội dung đồng bộ tự động với môn học.</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Sáng: 07:00 - 12:00</span>
              </span>
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                <Sunset className="w-3.5 h-3.5 text-indigo-500" />
                <span>Chiều: 12:30 - 18:30</span>
              </span>
            </div>
          </div>

          {/* Grid Container with wide columns */}
          <div className="min-w-[1020px]">
            {/* Table Header: Ca/Buổi + 7 Days of week */}
            <div className="grid grid-cols-[105px_repeat(7,minmax(130px,1fr))] gap-2.5 mb-2.5 text-center">
              {/* Corner label */}
              <div className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center ${
                isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-400' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                Ca / Buổi
              </div>

              {DAYS.map(day => (
                <div 
                  key={day.key}
                  className={`p-2.5 rounded-xl border text-center transition-colors ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                    {day.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
                    {day.fullLabel}
                  </div>
                </div>
              ))}
            </div>

            {/* Table Row 1: Buổi Sáng */}
            <div className="grid grid-cols-[105px_repeat(7,minmax(130px,1fr))] gap-2.5 mb-2.5">
              {/* Row Header: Sáng */}
              <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1 ${
                isDark 
                  ? 'bg-amber-950/20 border-amber-900/30 text-amber-400' 
                  : 'bg-amber-50/70 border-amber-200 text-amber-800'
              }`}>
                <Sun className="w-5 h-5 text-amber-500" />
                <span className="font-bold text-xs">SÁNG</span>
                <span className="text-[10px] opacity-80">07:00 - 12:00</span>
              </div>

              {/* 7 Days: Sáng */}
              {DAYS.map(day => (
                <React.Fragment key={`morning-${day.key}`}>
                  {renderSlot(day.key, 'morning')}
                </React.Fragment>
              ))}
            </div>

            {/* Table Row 2: Buổi Chiều */}
            <div className="grid grid-cols-[105px_repeat(7,minmax(130px,1fr))] gap-2.5">
              {/* Row Header: Chiều */}
              <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1 ${
                isDark 
                  ? 'bg-indigo-950/20 border-indigo-900/30 text-indigo-400' 
                  : 'bg-indigo-50/70 border-indigo-200 text-indigo-800'
              }`}>
                <Sunset className="w-5 h-5 text-indigo-500" />
                <span className="font-bold text-xs">CHIỀU</span>
                <span className="text-[10px] opacity-80">12:30 - 18:30</span>
              </div>

              {/* 7 Days: Chiều */}
              {DAYS.map(day => (
                <React.Fragment key={`afternoon-${day.key}`}>
                  {renderSlot(day.key, 'afternoon')}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: THÊM HOẶC CHỈNH SỬA MÔN HỌC (VỚI LIÊN KẾT KHÓA HỌC)                */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between ${
              isDark ? 'border-neutral-800 bg-neutral-950/40' : 'border-slate-100 bg-slate-50/50'
            }`}>
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>{editingItem ? 'Chỉnh Sửa Lịch Môn Học' : 'Thêm Môn Vào Thời Khóa Biểu'}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-4 space-y-3.5 text-xs">
              {/* Linked Course Dropdown */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-200 flex items-center justify-between">
                  <span>Liên kết với Khóa Học</span>
                  <span className="text-[11px] font-normal text-indigo-500">(Tự động đồng bộ nội dung)</span>
                </label>
                <select
                  value={formCourseId}
                  onChange={(e) => handleSelectCourseLink(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-colors cursor-pointer ${
                    isDark 
                      ? 'bg-neutral-950 border-neutral-800 focus:border-indigo-500 text-white' 
                      : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'
                  }`}
                >
                  <option value="">-- Môn tự do / Hoạt động khác (Không liên kết) --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.code}] {c.title} {c.credits ? `(${c.credits} TC)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tên môn học */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-200">
                  Tên môn học / Hoạt động <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Kiến Trúc Microservices & Node.js"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-colors ${
                    isDark 
                      ? 'bg-neutral-950 border-neutral-800 focus:border-indigo-500 text-white' 
                      : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'
                  }`}
                />
              </div>

              {/* Giờ học & Phòng học */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-200">
                    Khung giờ (24h)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Bắt đầu */}
                    <div className={`flex items-center justify-between px-2.5 py-2 rounded-xl border transition-colors ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}>
                      <select
                        value={formStartHour}
                        onChange={(e) => setFormStartHour(e.target.value)}
                        className="bg-transparent font-bold text-xs outline-none cursor-pointer text-slate-900 dark:text-white"
                      >
                        {HOURS_24.map(h => (
                          <option key={h} value={h} className={isDark ? 'bg-neutral-900 text-white' : 'bg-white text-slate-900'}>
                            {h}h
                          </option>
                        ))}
                      </select>
                      <span className="font-bold text-slate-400 dark:text-neutral-500">:</span>
                      <select
                        value={formStartMinute}
                        onChange={(e) => setFormStartMinute(e.target.value)}
                        className="bg-transparent font-bold text-xs outline-none cursor-pointer text-slate-900 dark:text-white"
                      >
                        {MINUTES_60.map(m => (
                          <option key={m} value={m} className={isDark ? 'bg-neutral-900 text-white' : 'bg-white text-slate-900'}>
                            {m}p
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Kết thúc */}
                    <div className={`flex items-center justify-between px-2.5 py-2 rounded-xl border transition-colors ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}>
                      <select
                        value={formEndHour}
                        onChange={(e) => setFormEndHour(e.target.value)}
                        className="bg-transparent font-bold text-xs outline-none cursor-pointer text-slate-900 dark:text-white"
                      >
                        {HOURS_24.map(h => (
                          <option key={h} value={h} className={isDark ? 'bg-neutral-900 text-white' : 'bg-white text-slate-900'}>
                            {h}h
                          </option>
                        ))}
                      </select>
                      <span className="font-bold text-slate-400 dark:text-neutral-500">:</span>
                      <select
                        value={formEndMinute}
                        onChange={(e) => setFormEndMinute(e.target.value)}
                        className="bg-transparent font-bold text-xs outline-none cursor-pointer text-slate-900 dark:text-white"
                      >
                        {MINUTES_60.map(m => (
                          <option key={m} value={m} className={isDark ? 'bg-neutral-900 text-white' : 'bg-white text-slate-900'}>
                            {m}p
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-200">
                    Phòng học <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Phòng B1-405, Lab..."
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-colors ${
                      isDark 
                        ? 'bg-neutral-950 border-neutral-800 focus:border-indigo-500 text-white' 
                        : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Giảng viên & Ghi chú */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-200">
                    Giảng viên / Phụ trách
                  </label>
                  <input
                    type="text"
                    placeholder="VD: TS. Nguyễn Văn A"
                    value={formInstructor}
                    onChange={(e) => setFormInstructor(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-colors ${
                      isDark 
                        ? 'bg-neutral-950 border-neutral-800 focus:border-indigo-500 text-white' 
                        : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-200">
                    Ghi chú thêm
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Kiểm tra giữa kỳ..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-colors ${
                      isDark 
                        ? 'bg-neutral-950 border-neutral-800 focus:border-indigo-500 text-white' 
                        : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Tùy chọn xếp lịch ngay */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-950/60 space-y-2">
                <div className="font-semibold text-slate-700 dark:text-neutral-300">
                  Xếp lịch lên TKB ngay (Tuỳ chọn):
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] mb-1 opacity-80">Chọn Thứ</label>
                    <select
                      value={formDay}
                      onChange={(e) => setFormDay(e.target.value as DayOfWeek | '')}
                      className={`w-full px-3 py-2 rounded-lg border text-xs outline-none ${
                        isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="">(Chưa xếp - Để ở kho môn)</option>
                      {DAYS.map(d => (
                        <option key={d.key} value={d.key}>{d.fullLabel}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] mb-1 opacity-80">Chọn Buổi</label>
                    <select
                      value={formSession}
                      onChange={(e) => setFormSession(e.target.value as DaySession)}
                      disabled={!formDay}
                      className={`w-full px-3 py-2 rounded-lg border text-xs outline-none ${
                        !formDay ? 'opacity-50 cursor-not-allowed' : ''
                      } ${
                        isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="morning">Buổi Sáng (07:00 - 12:00)</option>
                      <option value="afternoon">Buổi Chiều (12:30 - 18:30)</option>
                    </select>
                  </div>
                </div>

                {/* Sync to Course Checkbox */}
                {formCourseId && (
                  <label className="flex items-center gap-2 pt-1 cursor-pointer text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                    <input
                      type="checkbox"
                      checked={formSyncToCourse}
                      onChange={(e) => setFormSyncToCourse(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Tự động cập nhật lịch & phòng vào thông tin Khóa Học</span>
                  </label>
                )}
              </div>

              {/* Footer buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  {editingItem ? 'Lưu Thay Đổi' : 'Thêm Vào TKB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
