import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit2, 
  GripVertical, 
  Sun, 
  Sunset, 
  X, 
  RotateCcw, 
  Check, 
  Search, 
  Sparkles,
  Info,
  CalendarDays
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

const COLOR_MAP: Record<TimetableEntry['color'], {
  bg: string;
  darkBg: string;
  border: string;
  darkBorder: string;
  text: string;
  darkText: string;
  accent: string;
}> = {
  indigo: {
    bg: 'bg-indigo-50/90',
    darkBg: 'bg-indigo-950/60',
    border: 'border-indigo-200',
    darkBorder: 'border-indigo-800/80',
    text: 'text-indigo-950',
    darkText: 'text-indigo-200',
    accent: 'bg-indigo-500'
  },
  sky: {
    bg: 'bg-sky-50/90',
    darkBg: 'bg-sky-950/60',
    border: 'border-sky-200',
    darkBorder: 'border-sky-800/80',
    text: 'text-sky-950',
    darkText: 'text-sky-200',
    accent: 'bg-sky-500'
  },
  emerald: {
    bg: 'bg-emerald-50/90',
    darkBg: 'bg-emerald-950/60',
    border: 'border-emerald-200',
    darkBorder: 'border-emerald-800/80',
    text: 'text-emerald-950',
    darkText: 'text-emerald-200',
    accent: 'bg-emerald-500'
  },
  amber: {
    bg: 'bg-amber-50/90',
    darkBg: 'bg-amber-950/60',
    border: 'border-amber-200',
    darkBorder: 'border-amber-800/80',
    text: 'text-amber-950',
    darkText: 'text-amber-200',
    accent: 'bg-amber-500'
  },
  rose: {
    bg: 'bg-rose-50/90',
    darkBg: 'bg-rose-950/60',
    border: 'border-rose-200',
    darkBorder: 'border-rose-800/80',
    text: 'text-rose-950',
    darkText: 'text-rose-200',
    accent: 'bg-rose-500'
  },
  purple: {
    bg: 'bg-purple-50/90',
    darkBg: 'bg-purple-950/60',
    border: 'border-purple-200',
    darkBorder: 'border-purple-800/80',
    text: 'text-purple-950',
    darkText: 'text-purple-200',
    accent: 'bg-purple-500'
  },
  teal: {
    bg: 'bg-teal-50/90',
    darkBg: 'bg-teal-950/60',
    border: 'border-teal-200',
    darkBorder: 'border-teal-800/80',
    text: 'text-teal-950',
    darkText: 'text-teal-200',
    accent: 'bg-teal-500'
  }
};

const COLOR_OPTIONS: TimetableEntry['color'][] = [
  'indigo', 'sky', 'emerald', 'amber', 'rose', 'purple', 'teal'
];

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

  // Search & Filter for left panel
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'unassigned' | 'all'>('all');

  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  // Modal / Form state for Add or Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimetableEntry | null>(null);

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formTime, setFormTime] = useState('07:00 - 09:15');
  const [formRoom, setFormRoom] = useState('');
  const [formInstructor, setFormInstructor] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formColor, setFormColor] = useState<TimetableEntry['color']>('indigo');
  const [formDay, setFormDay] = useState<DayOfWeek | ''>('');
  const [formSession, setFormSession] = useState<DaySession>('morning');

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
    setFormTime('07:00 - 09:15');
    setFormRoom('');
    setFormInstructor('');
    setFormNotes('');
    setFormColor('indigo');
    setFormDay('');
    setFormSession('morning');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (item: TimetableEntry) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormTime(item.time);
    setFormRoom(item.room || '');
    setFormInstructor(item.instructor || '');
    setFormNotes(item.notes || '');
    setFormColor(item.color);
    setFormDay(item.day || '');
    setFormSession(item.session || 'morning');
    setIsModalOpen(true);
  };

  // Handle Save Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingItem) {
      setTimetable(prev => prev.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            name: formName.trim(),
            time: formTime.trim() || 'Tự do',
            room: formRoom.trim() || undefined,
            instructor: formInstructor.trim() || undefined,
            notes: formNotes.trim() || undefined,
            color: formColor,
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
        time: formTime.trim() || 'Tự do',
        room: formRoom.trim() || undefined,
        instructor: formInstructor.trim() || undefined,
        notes: formNotes.trim() || undefined,
        color: formColor,
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
    setTimetable(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, day, session };
      }
      return item;
    }));
    setAssigningId(null);
  };

  // Reset to default
  const handleResetDefault = () => {
    setTimetable(FALLBACK_TIMETABLE);
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverTarget(null);
  };

  const handleDragOver = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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

  // Render a cell inside the grid
  const renderCellContent = (day: DayOfWeek, session: DaySession) => {
    const itemsInSlot = timetable.filter(item => item.day === day && item.session === session);
    const count = itemsInSlot.length;
    const targetKey = `${day}-${session}`;
    const isOver = dragOverTarget === targetKey;

    return (
      <div
        onDragOver={(e) => handleDragOver(e, targetKey)}
        onDragLeave={(e) => handleDragLeave(e, targetKey)}
        onDrop={(e) => handleDrop(e, day, session)}
        className={`h-[180px] p-1.5 flex flex-col gap-1.5 rounded-xl border transition-all duration-150 relative ${
          isOver
            ? isDark
              ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30'
              : 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200'
            : isDark
              ? 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
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
              const colors = COLOR_MAP[item.color] || COLOR_MAP.indigo;

              // MULTI-ITEM SCALING BEHAVIOR:
              // If 1 item: full height card with generous display
              // If 2 items: 50% height card with compact info
              // If 3 items: 33% height card with mini chip
              // If 4+ items: micro strip
              if (count === 1) {
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragEnd={handleDragEnd}
                    className={`h-full flex flex-col justify-between p-2 rounded-lg border shadow-2xs transition-all cursor-grab active:cursor-grabbing group relative ${
                      isDark ? `${colors.darkBg} ${colors.darkBorder}` : `${colors.bg} ${colors.border}`
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className={`text-xs font-bold leading-tight line-clamp-2 ${isDark ? colors.darkText : colors.text}`}>
                          {item.name}
                        </span>
                        <button
                          title="Gỡ khỏi TKB"
                          onClick={() => handleUnassign(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-rose-500 transition-opacity cursor-pointer shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-medium opacity-80">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{item.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-black/5 dark:border-white/10 text-[10px]">
                      {item.room ? (
                        <span className="inline-flex items-center gap-1 font-semibold truncate">
                          <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate">{item.room}</span>
                        </span>
                      ) : (
                        <span className="opacity-40 italic text-[9px]">Chưa đặt phòng</span>
                      )}
                      <button
                        title="Chỉnh sửa"
                        onClick={() => handleOpenEdit(item)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                  </div>
                );
              }

              if (count === 2) {
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragEnd={handleDragEnd}
                    className={`h-[calc(50%-3px)] flex flex-col justify-between p-1.5 rounded-lg border shadow-2xs transition-all cursor-grab active:cursor-grabbing group relative ${
                      isDark ? `${colors.darkBg} ${colors.darkBorder}` : `${colors.bg} ${colors.border}`
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className={`text-[11px] font-bold leading-tight truncate ${isDark ? colors.darkText : colors.text}`}>
                        {item.name}
                      </span>
                      <button
                        title="Gỡ khỏi TKB"
                        onClick={() => handleUnassign(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-rose-500 transition-opacity cursor-pointer shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-medium opacity-85">
                      <span className="flex items-center gap-0.5 truncate">
                        <Clock className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{item.time}</span>
                      </span>
                      {item.room && (
                        <span className="font-semibold truncate max-w-[45%] text-right">
                          {item.room}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              // count >= 3
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragEnd={handleDragEnd}
                  className={`h-[calc(${Math.floor(100 / count)}%-3px)] min-h-[36px] flex items-center justify-between px-1.5 py-1 rounded-md border shadow-2xs transition-all cursor-grab active:cursor-grabbing group relative ${
                    isDark ? `${colors.darkBg} ${colors.darkBorder}` : `${colors.bg} ${colors.border}`
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <p className={`text-[10px] font-bold leading-tight truncate ${isDark ? colors.darkText : colors.text}`}>
                      {item.name}
                    </p>
                    <p className="text-[9px] opacity-75 truncate flex items-center gap-1">
                      <span>{item.time}</span>
                      {item.room && <span>• {item.room}</span>}
                    </p>
                  </div>
                  <button
                    title="Gỡ khỏi TKB"
                    onClick={() => handleUnassign(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-500 cursor-pointer shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
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
      <div className={`p-5 rounded-2xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Thời Khóa Biểu & Lịch Học Cá Nhân
            </h2>
          </div>
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            Kéo thả các môn bên trái vào các buổi Sáng/Chiều từ Thứ 2 đến Chủ Nhật. Các ô sẽ tự động thu nhỏ hợp lý khi có nhiều môn!
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetDefault}
            title="Đặt lại mẫu lịch học chuẩn"
            className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDark 
                ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mẫu chuẩn</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Môn Mới</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Pool (Môn học) & Right Timetable Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* CỘT TRÁI: DANH SÁCH MÔN / NỘI DUNG TỰ DO                                  */}
        {/* ========================================================================= */}
        <div 
          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
          onDrop={handleDropToPool}
          className={`w-full lg:w-80 shrink-0 p-4 rounded-2xl border transition-colors flex flex-col ${
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

          {/* List of Draggable Items */}
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-neutral-500">
                Không tìm thấy môn nào. Hãy nhấn "+ Thêm Môn Mới" ở trên!
              </div>
            ) : (
              filteredItems.map(item => {
                const colors = COLOR_MAP[item.color] || COLOR_MAP.indigo;
                const isAssigned = Boolean(item.day && item.session);
                const dayObj = DAYS.find(d => d.key === item.day);
                const sessionLabel = item.session === 'morning' ? 'Sáng' : 'Chiều';

                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragEnd={handleDragEnd}
                    className={`p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing group relative ${
                      isDark 
                        ? 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700' 
                        : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Top row: Color dot, Grip handle, Title, Actions */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors.accent}`} />
                        <span className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          title="Chỉnh sửa"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 rounded text-slate-400 hover:text-indigo-500 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          title="Xóa môn"
                          onClick={() => handleDelete(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
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
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{item.room}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">
                          (Không cố định phòng)
                        </span>
                      )}
                    </div>

                    {/* Bottom: Schedule Status & Quick Assign Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-neutral-800/60 text-[10px]">
                      {isAssigned ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{dayObj?.fullLabel} • Buổi {sessionLabel}</span>
                        </div>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                          <GripVertical className="w-3 h-3" />
                          <span>Kéo sang khung bên phải</span>
                        </span>
                      )}

                      {/* Quick Assign / Unassign Button */}
                      <div className="relative">
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
                              {DAYS.map(d => (
                                <div key={d.key} className="flex items-center justify-between text-[11px] p-1 rounded hover:bg-slate-100 dark:hover:bg-neutral-800">
                                  <span className="font-medium">{d.fullLabel}</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleQuickAssign(item.id, d.key, 'morning')}
                                      className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-bold"
                                    >
                                      Sáng
                                    </button>
                                    <button
                                      onClick={() => handleQuickAssign(item.id, d.key, 'afternoon')}
                                      className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 font-bold"
                                    >
                                      Chiều
                                    </button>
                                  </div>
                                </div>
                              ))}
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

        {/* ========================================================================= */}
        {/* CỘT PHẢI: KHUNG THỜI KHÓA BIỂU (T2 -> CN, SÁNG & CHIỀU)                  */}
        {/* ========================================================================= */}
        <div className={`flex-1 min-w-0 p-4 sm:p-5 rounded-2xl border transition-colors overflow-x-auto ${
          isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          {/* Legend / Info bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-neutral-400">
              <Info className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Kéo môn từ cột trái thả trực tiếp vào từng ô. Ô sẽ tự động co giãn kích thước hài hòa khi có 2-3 môn cùng buổi.</span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Sáng: 07:00 - 12:00</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Sunset className="w-3.5 h-3.5 text-indigo-500" />
                <span>Chiều: 12:30 - 18:30</span>
              </span>
            </div>
          </div>

          {/* Grid Container with minimum width to allow full responsive horizontal scroll on mobile */}
          <div className="min-w-[760px]">
            {/* Table Header: Days of week */}
            <div className="grid grid-cols-8 gap-2 mb-2 text-center">
              {/* Corner / Session header */}
              <div className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center ${
                isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-400' : 'bg-slate-100 border-slate-200 text-slate-600'
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
                  <div className={`text-[10px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {day.fullLabel}
                  </div>
                </div>
              ))}
            </div>

            {/* Row 1: BUỔI SÁNG */}
            <div className="grid grid-cols-8 gap-2 mb-3">
              {/* Session indicator */}
              <div className={`h-[180px] p-2 rounded-xl border flex flex-col items-center justify-center text-center gap-1 ${
                isDark 
                  ? 'bg-neutral-950 border-neutral-800 text-amber-400' 
                  : 'bg-amber-50/50 border-amber-200/70 text-amber-800'
              }`}>
                <Sun className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold">BUỔI SÁNG</span>
                <span className="text-[10px] opacity-75">07:00 - 12:00</span>
              </div>

              {/* 7 Days cells for Morning */}
              {DAYS.map(day => (
                <React.Fragment key={`morning-${day.key}`}>
                  {renderCellContent(day.key, 'morning')}
                </React.Fragment>
              ))}
            </div>

            {/* Row 2: BUỔI CHIỀU */}
            <div className="grid grid-cols-8 gap-2">
              {/* Session indicator */}
              <div className={`h-[180px] p-2 rounded-xl border flex flex-col items-center justify-center text-center gap-1 ${
                isDark 
                  ? 'bg-neutral-950 border-neutral-800 text-indigo-400' 
                  : 'bg-indigo-50/50 border-indigo-200/70 text-indigo-800'
              }`}>
                <Sunset className="w-5 h-5 text-indigo-500" />
                <span className="text-xs font-bold">BUỔI CHIỀU</span>
                <span className="text-[10px] opacity-75">12:30 - 18:30</span>
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
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-neutral-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>{editingItem ? 'Chỉnh Sửa Môn & Giờ Học' : 'Thêm Môn / Nội Dung Mới'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              {/* Tên môn / Nội dung học: "nhập gì cũng được luôn" */}
              <div>
                <label className="block font-semibold mb-1">
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
                <span className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1 block">
                  Nội dung tự do: có thể là môn học trên trường, tự học, seminar hoặc họp nhóm.
                </span>
              </div>

              {/* Giờ học & Phòng học */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">
                    Giờ học / Ca học <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 07:00 - 09:15"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-colors ${
                      isDark 
                        ? 'bg-neutral-950 border-neutral-800 focus:border-indigo-500 text-white' 
                        : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'
                    }`}
                  />
                  {/* Quick suggestion buttons */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['07:00 - 09:15', '09:30 - 11:45', '13:00 - 15:15', '15:30 - 17:45'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormTime(t)}
                        className={`text-[9px] px-1.5 py-0.5 rounded border ${
                          formTime === t
                            ? 'bg-indigo-500 text-white border-indigo-500'
                            : 'bg-slate-100 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phòng học: "có thể tự do thêm phòng nhập gì cũng được và không ép buộc phải nhập lúc tạo thời khóa biểu" */}
                <div>
                  <label className="block font-semibold mb-1">
                    Phòng học / Địa điểm <span className="text-slate-400 font-normal">(Tuỳ chọn, không bắt buộc)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Lab A2-302, Hội trường H1, Zoom..."
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-colors ${
                      isDark 
                        ? 'bg-neutral-950 border-neutral-800 focus:border-indigo-500 text-white' 
                        : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1 block">
                    Không ép buộc phải nhập, có thể để trống.
                  </span>
                </div>
              </div>

              {/* Giảng viên & Ghi chú */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Giảng viên / Phụ trách</label>
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
                  <label className="block font-semibold mb-1">Ghi chú thêm</label>
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

              {/* Chọn màu sắc đại diện */}
              <div>
                <label className="block font-semibold mb-1.5">Màu sắc phân biệt</label>
                <div className="flex items-center gap-3">
                  {COLOR_OPTIONS.map(c => {
                    const colorStyle = COLOR_MAP[c];
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormColor(c)}
                        className={`w-6 h-6 rounded-full ${colorStyle.accent} transition-transform flex items-center justify-center cursor-pointer ${
                          formColor === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-neutral-900' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {formColor === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tùy chọn xếp lịch ngay (hoặc để trống để xếp bằng kéo thả sau) */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-950/50 space-y-2">
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
                      <option value="">(Chưa xếp - Để ở cột trái kéo thả)</option>
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
                  {editingItem ? 'Lưu Thay Đổi' : 'Thêm Vào Danh Sách'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
