import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  GripVertical, 
  Sun, 
  Sunset, 
  X, 
  Search, 
  CalendarDays,
  PanelLeftClose,
  PanelLeftOpen,
  AlertCircle
} from 'lucide-react';
import { TimetableEntry, DayOfWeek, DaySession } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { FALLBACK_TIMETABLE } from '../../data/fallbackData';

interface TimetableViewProps {
  onNavigateToCourses?: () => void;
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
    return { startHour: '07', startMinute: '00', endHour: '09', endMinute: '15' };
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
  const start = parsePart(parts[0], '07', '00');
  const end = parsePart(parts[1], '09', '15');
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

export function TimetableView({ onNavigateToCourses }: TimetableViewProps) {
  const { isDark } = useTheme();

  const [timetable, setTimetable] = useState<TimetableEntry[]>(() => {
    try {
      const saved = localStorage.getItem('planora_timetable');
      return saved ? JSON.parse(saved) : FALLBACK_TIMETABLE;
    } catch {
      return FALLBACK_TIMETABLE;
    }
  });

  // Panel collapse toggle for easy screenshot capture
  const [isPoolOpen, setIsPoolOpen] = useState(true);

  // Search & Filter for left panel
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'unassigned' | 'all'>('all');

  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [isDraggingNow, setIsDraggingNow] = useState(false);

  // Max 4 subjects per session warning alert
  const [slotLimitAlert, setSlotLimitAlert] = useState<string | null>(null);

  const triggerLimitAlert = (msg: string) => {
    setSlotLimitAlert(msg);
    setTimeout(() => {
      setSlotLimitAlert(null);
    }, 4000);
  };

  // Modal / Form state for Add or Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimetableEntry | null>(null);

  // Form inputs (strictly 24-hour 00-23 and 00-59, no AM/PM)
  const [formName, setFormName] = useState('');
  const [formStartHour, setFormStartHour] = useState('07');
  const [formStartMinute, setFormStartMinute] = useState('00');
  const [formEndHour, setFormEndHour] = useState('09');
  const [formEndMinute, setFormEndMinute] = useState('15');
  const [formRoom, setFormRoom] = useState('');
  const [formInstructor, setFormInstructor] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formDay, setFormDay] = useState<DayOfWeek | ''>('');
  const [formSession, setFormSession] = useState<DaySession>('morning');
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

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormName('');
    setFormStartHour('07');
    setFormStartMinute('00');
    setFormEndHour('09');
    setFormEndMinute('15');
    setFormRoom('');
    setFormInstructor('');
    setFormNotes('');
    setFormDay('');
    setFormSession('morning');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (item: TimetableEntry) => {
    setEditingItem(item);
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
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle Save Form
  const handleSaveForm = (e: React.FormEvent) => {
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

    if (editingItem) {
      setTimetable(prev => prev.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            name: formName.trim(),
            time: formattedTime,
            room: cleanedRoom || undefined,
            instructor: formInstructor.trim() || undefined,
            notes: formNotes.trim() || undefined,
            color: 'indigo',
            day: formDay ? formDay : undefined,
            session: formDay ? formSession : undefined
          };
        }
        return item;
      }));
    } else {
      const newItem: TimetableEntry = {
        id: `tt-${Date.now()}`,
        name: formName.trim(),
        time: formattedTime,
        room: cleanedRoom || undefined,
        instructor: formInstructor.trim() || undefined,
        notes: formNotes.trim() || undefined,
        color: 'indigo',
        day: formDay ? formDay : undefined,
        session: formDay ? formSession : undefined
      };
      setTimetable(prev => [newItem, ...prev]);
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
    setTimeout(() => setIsDraggingNow(false), 150);
  };

  const handleDragOver = (e: React.DragEvent, targetKey: string, day: DayOfWeek, session: DaySession) => {
    e.preventDefault();
    const id = draggedId;
    const currentCount = timetable.filter(item => item.day === day && item.session === session && item.id !== id).length;
    if (currentCount >= 4) {
      e.dataTransfer.dropEffect = 'none';
    } else {
      e.dataTransfer.dropEffect = 'move';
    }
    if (dragOverTarget !== targetKey) {
      setDragOverTarget(targetKey);
    }
  };

  const handleDragLeave = (e: React.DragEvent, targetKey: string) => {
    if (dragOverTarget === targetKey) {
      setDragOverTarget(null);
    }
  };

  const handleDrop = (e: React.DragEvent, day: DayOfWeek, session: DaySession) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedId;
    if (!id) return;

    const currentCount = timetable.filter(item => item.day === day && item.session === session && item.id !== id).length;
    if (currentCount >= 4) {
      triggerLimitAlert('Một buổi chỉ xếp tối đa 4 môn học, không thể kéo thêm vào!');
      setDraggedId(null);
      setDragOverTarget(null);
      return;
    }

    setTimetable(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, day, session };
      }
      return item;
    }));

    setDraggedId(null);
    setDragOverTarget(null);
  };

  const handleDropToPool = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedId;
    if (!id) return;

    handleUnassign(id);
    setDraggedId(null);
    setDragOverTarget(null);
  };

  // Filtered left panel items
  const filteredItems = timetable.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.room && item.room.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.time.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterTab === 'unassigned') {
      return matchesSearch && (!item.day || !item.session);
    }
    return matchesSearch;
  });

  const unassignedCount = timetable.filter(item => !item.day || !item.session).length;
  const assignedCount = timetable.length - unassignedCount;

  // Unified Card Style for clean, soothing reading and screenshots
  const cardBaseStyle = isDark
    ? 'bg-neutral-900/95 border-neutral-800 text-neutral-100 hover:border-neutral-700 shadow-2xs'
    : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300 shadow-2xs';

  // Render a cell inside the grid
  const renderCellContent = (day: DayOfWeek, session: DaySession) => {
    const itemsInSlot = timetable.filter(item => item.day === day && item.session === session);
    const count = itemsInSlot.length;
    const targetKey = `${day}-${session}`;
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

              // 1 item in slot: full height, clear spacious layout showing room prominently
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
                    className={`h-full flex flex-col justify-between p-2.5 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] group relative ${cardBaseStyle}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <span className={`text-xs font-bold leading-snug line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {item.name}
                        </span>
                        <button
                          title="Gỡ khỏi TKB"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnassign(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-neutral-400">
                        <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{item.time}</span>
                      </div>
                    </div>

                    {/* Room is explicitly shown clearly without 'Phòng: ' and WITHOUT 'Chỉnh sửa' */}
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-neutral-800 text-[11px]">
                      {cleanRoom ? (
                        <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 truncate w-full">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                          <span className="truncate">{cleanRoom}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-neutral-500 text-[10px] italic">
                          (Chưa có phòng)
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              // 2 items in slot: 50% height, time pushed UP to its own row, room on its own row below it (never on same row)
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
                    className={`h-[calc(50%-3px)] flex flex-col justify-between p-2 rounded-lg border transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] group relative ${cardBaseStyle}`}
                  >
                    {/* Hàng 1: Tên môn & nút gỡ */}
                    <div className="flex items-start justify-between gap-1">
                      <span className={`text-[11px] font-bold leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {item.name}
                      </span>
                      <button
                        title="Gỡ khỏi TKB"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnassign(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Đẩy giờ lên trên, phòng ở bên dưới (2 hàng riêng biệt) */}
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

              // 3 items in slot: 3 distinct rows (Name, Time, Room)
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
                      <p className={`text-[10px] font-bold leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {item.name}
                      </p>
                      <button
                        title="Gỡ khỏi TKB"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnassign(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-all cursor-pointer shrink-0"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <div className="space-y-0.5 mt-auto">
                      <div className="flex items-center gap-1 text-[9px] text-slate-500 dark:text-neutral-400 font-medium">
                        <Clock className="w-2.5 h-2.5 shrink-0 text-indigo-500" />
                        <span className="truncate">{item.time}</span>
                      </div>
                      {cleanRoom && (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                          <MapPin className="w-2.5 h-2.5 shrink-0 text-indigo-500" />
                          <span className="truncate">{cleanRoom}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // 4 items in slot: compact strip (maximum 4 items per session)
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
                  className={`h-[calc(25%-3px)] min-h-[46px] flex flex-col justify-between px-2 py-1 rounded-md border transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] group relative ${cardBaseStyle}`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className={`text-[10px] font-bold leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {item.name}
                    </p>
                    <button
                      title="Gỡ khỏi TKB"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnassign(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-all cursor-pointer shrink-0"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-slate-500 dark:text-neutral-400 truncate">
                    <Clock className="w-2.5 h-2.5 shrink-0 text-indigo-500" />
                    <span className="truncate">{item.time}</span>
                    {cleanRoom && (
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 truncate flex items-center gap-0.5 shrink-0">
                        <span className="mx-0.5 text-slate-300 dark:text-neutral-600">•</span>
                        <MapPin className="w-2.5 h-2.5 shrink-0 text-indigo-500" />
                        <span className="truncate">{cleanRoom}</span>
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
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Thời Khóa Biểu & Lịch Học
            </h2>
          </div>
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            Kéo thả môn học vào các buổi từ T2 đến CN. Phòng học và giờ học luôn hiển thị trực quan, rõ ràng.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Toggle button to collapse left pool so timetable expands to full screen width */}
          <button
            onClick={() => setIsPoolOpen(!isPoolOpen)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDark 
                ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
            }`}
            title={isPoolOpen ? 'Thu gọn kho môn để mở rộng TKB' : 'Mở lại kho môn bên trái'}
          >
            {isPoolOpen ? (
              <>
                <PanelLeftClose className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Thu gọn kho môn</span>
              </>
            ) : (
              <>
                <PanelLeftOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Hiện kho môn</span>
              </>
            )}
          </button>

          {/* Add Subject Button */}
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Môn Mới</span>
          </button>
        </div>
      </div>

      {/* Max 4 subjects slot limit warning alert toast */}
      {slotLimitAlert && (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 animate-fade-in ${
          isDark ? 'bg-amber-950/70 border-amber-800 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-semibold">{slotLimitAlert}</span>
          </div>
          <button 
            onClick={() => setSlotLimitAlert(null)}
            className="text-xs font-semibold underline cursor-pointer shrink-0"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Main Split Layout: Left Pool (Kho Môn) & Right Timetable Grid */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        
        {/* ========================================================================= */}
        {/* CỘT TRÁI: KHO MÔN HỌC (Có thể thu gọn để TKB mở rộng tối đa)              */}
        {/* ========================================================================= */}
        {isPoolOpen && (
          <div 
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
            onDrop={handleDropToPool}
            className={`w-full lg:w-72 shrink-0 p-4 rounded-2xl border transition-all flex flex-col ${
              isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            {/* Header left panel */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Kho Môn & Nội Dung
                </h3>
                <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  {unassignedCount} chưa xếp • {assignedCount} đã lên TKB
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
                placeholder="Tìm môn, phòng, giờ..."
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
                className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900'
                }`}
              >
                Tất cả ({timetable.length})
              </button>
              <button
                onClick={() => setFilterTab('unassigned')}
                className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterTab === 'unassigned'
                    ? 'bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900'
                }`}
              >
                Chưa xếp ({unassignedCount})
              </button>
            </div>

            {/* List of Draggable Items (Clean uniform color) */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-neutral-500">
                  Không tìm thấy môn nào. Nhấn "+ Thêm Môn Mới" ở trên!
                </div>
              ) : (
                filteredItems.map(item => {
                  const isAssigned = Boolean(item.day && item.session);
                  const dayObj = DAYS.find(d => d.key === item.day);
                  const sessionLabel = item.session === 'morning' ? 'Sáng' : 'Chiều';

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        if (!isDraggingNow) handleOpenEdit(item);
                      }}
                      title="Bấm để chỉnh sửa môn học"
                      className={`p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] group relative ${cardBaseStyle}`}
                    >
                      {/* Top row: Title, Actions */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0 flex-1">
                          <span className={`text-xs font-bold truncate block ${isDark ? 'text-white' : 'text-slate-900'}`}>
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
                          <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                            <GripVertical className="w-3 h-3" />
                            <span>Kéo sang TKB</span>
                          </span>
                        )}

                        {/* Quick Assign / Unassign Button */}
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          {isAssigned ? (
                            <button
                              onClick={() => handleUnassign(item.id)}
                              className="px-2 py-0.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold cursor-pointer"
                            >
                              Gỡ lịch
                            </button>
                          ) : (
                            <button
                              onClick={() => setAssigningId(assigningId === item.id ? null : item.id)}
                              className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-semibold cursor-pointer"
                            >
                              Xếp lịch ▼
                            </button>
                          )}

                          {/* Quick Assign Dropdown */}
                          {assigningId === item.id && (
                            <div className={`absolute right-0 bottom-full mb-1 z-30 w-52 p-2 rounded-xl border shadow-xl ${
                              isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-slate-200'
                            }`}>
                              <div className="text-[11px] font-bold mb-1.5 text-slate-700 dark:text-neutral-300">
                                Chọn buổi học:
                              </div>
                              <div className="space-y-1 max-h-48 overflow-y-auto">
                                {DAYS.map(d => {
                                  const morningFull = timetable.filter(t => t.day === d.key && t.session === 'morning' && t.id !== item.id).length >= 4;
                                  const afternoonFull = timetable.filter(t => t.day === d.key && t.session === 'afternoon' && t.id !== item.id).length >= 4;
                                  return (
                                    <div key={d.key} className="flex items-center justify-between text-[11px] p-1 rounded hover:bg-slate-100 dark:hover:bg-neutral-800">
                                      <span className="font-medium">{d.fullLabel}</span>
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => !morningFull && handleQuickAssign(item.id, d.key, 'morning')}
                                          disabled={morningFull}
                                          title={morningFull ? 'Đã đủ 4 môn (tối đa)' : 'Xếp vào buổi Sáng'}
                                          className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
                                            morningFull 
                                              ? 'bg-slate-200 dark:bg-neutral-800 text-slate-400 cursor-not-allowed'
                                              : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 cursor-pointer'
                                          }`}
                                        >
                                          {morningFull ? 'Sáng (Đầy)' : 'Sáng'}
                                        </button>
                                        <button
                                          onClick={() => !afternoonFull && handleQuickAssign(item.id, d.key, 'afternoon')}
                                          disabled={afternoonFull}
                                          title={afternoonFull ? 'Đã đủ 4 môn (tối đa)' : 'Xếp vào buổi Chiều'}
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
              <span>Kéo thả môn vào từng buổi học, tối đa 4 môn mỗi buổi và tự thu gọn vừa vặn.</span>
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

          {/* Grid Container with wide columns so Subject & Room never get cramped */}
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
                    isDark 
                      ? 'bg-neutral-950 border-neutral-800 text-white' 
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold">{day.label}</div>
                  <div className={`text-[10px] font-medium ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {day.fullLabel}
                  </div>
                </div>
              ))}
            </div>

            {/* Row 1: BUỔI SÁNG */}
            <div className="grid grid-cols-[105px_repeat(7,minmax(130px,1fr))] gap-2.5 mb-3">
              {/* Session indicator */}
              <div className={`h-[195px] p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 ${
                isDark 
                  ? 'bg-neutral-950 border-neutral-800 text-amber-400' 
                  : 'bg-amber-50/70 border-amber-200 text-amber-800'
              }`}>
                <Sun className="w-6 h-6 text-amber-500" />
                <span className="text-xs font-bold tracking-tight">BUỔI SÁNG</span>
                <span className="text-[10px] font-medium opacity-80">07:00 - 12:00</span>
              </div>

              {/* 7 Days cells for Morning */}
              {DAYS.map(day => (
                <React.Fragment key={`morning-${day.key}`}>
                  {renderCellContent(day.key, 'morning')}
                </React.Fragment>
              ))}
            </div>

            {/* Row 2: BUỔI CHIỀU */}
            <div className="grid grid-cols-[105px_repeat(7,minmax(130px,1fr))] gap-2.5">
              {/* Session indicator */}
              <div className={`h-[195px] p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 ${
                isDark 
                  ? 'bg-neutral-950 border-neutral-800 text-indigo-400' 
                  : 'bg-indigo-50/70 border-indigo-200 text-indigo-800'
              }`}>
                <Sunset className="w-6 h-6 text-indigo-500" />
                <span className="text-xs font-bold tracking-tight">BUỔI CHIỀU</span>
                <span className="text-[10px] font-medium opacity-80">12:30 - 18:30</span>
              </div>

              {/* 7 Days cells for Afternoon */}
              {DAYS.map(day => (
                <React.Fragment key={`afternoon-${day.key}`}>
                  {renderCellContent(day.key, 'afternoon')}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: THÊM / CHỈNH SỬA MÔN HỌC & GIỜ VÀO                                 */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200 dark:border-neutral-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>{editingItem ? 'Chỉnh Sửa Môn & Giờ Học' : 'Thêm Môn / Nội Dung Mới'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              {/* Tên môn / Nội dung học: Không có chữ giải thích thừa gây vướng */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-200">
                  Tên môn / Nội dung học tập <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Kiến Trúc Microservices, Tự học thư viện, Họp đồ án..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-colors ${
                    isDark 
                      ? 'bg-neutral-950 border-neutral-800 focus:border-indigo-500 text-white' 
                      : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'
                  }`}
                />
              </div>

              {/* Giờ học (0-23h không dùng AM/PM) & Phòng học (Tùy chọn) ngang hàng hoàn hảo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                {/* Giờ học: 2 ô chọn 24 giờ (00-23) bắt đầu & kết thúc */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-200">
                    Giờ học (00:00 - 23:59) <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Bắt đầu */}
                    <div className={`flex items-center justify-between px-2.5 py-2 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-neutral-950 border-neutral-800 text-white' 
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}>
                      <select
                        value={formStartHour}
                        onChange={(e) => setFormStartHour(e.target.value)}
                        title="Giờ bắt đầu (0-23)"
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
                        title="Phút bắt đầu (0-59)"
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
                      isDark 
                        ? 'bg-neutral-950 border-neutral-800 text-white' 
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}>
                      <select
                        value={formEndHour}
                        onChange={(e) => setFormEndHour(e.target.value)}
                        title="Giờ kết thúc (0-23)"
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
                        title="Phút kết thúc (0-59)"
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

                {/* Phòng học: chỉ để (Tùy chọn), không có chữ thừa bên dưới */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-200">
                    Phòng học <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Lab A2-302, H1..."
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
                    placeholder="VD: TS. Nguyễn Văn Toàn"
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
                    placeholder="VD: Kiểm tra giữa kỳ, mang laptop..."
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
                      <option value="">(Chưa xếp - Để ở kho môn kéo thả)</option>
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
                      className={`w-full px-3 py-2 rounded-lg border text-xs outline-none disabled:opacity-50 ${
                        isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="morning">Buổi Sáng (07:00 - 12:00)</option>
                      <option value="afternoon">Buổi Chiều (12:30 - 18:30)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                    isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  {editingItem ? 'Lưu Thay Đổi' : 'Thêm Môn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
