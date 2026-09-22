import { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Lightbulb,
  Copy,
  Check,
  Plus,
  BookOpen,
  RefreshCw,
  Trash2,
  GraduationCap,
  Code,
  Calendar,
  HelpCircle,
  Layers,
  SlidersHorizontal,
  ChevronDown,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Course, Task, Goal, Note } from '../../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  source?: string;
  model?: string;
  time: string;
  suggestedAction?: {
    type: 'task' | 'note';
    title: string;
    content?: string;
  };
}

export type PersonaType = 'general' | 'socratic' | 'coder' | 'planner' | 'quiz';

interface AiAssistantViewProps {
  initialPrompt?: string;
  courses?: Course[];
  tasks?: Task[];
  goals?: Goal[];
  notes?: Note[];
  onCreateTask?: (data: Partial<Task>) => Promise<void>;
  onCreateNote?: (data: Partial<Note>) => Promise<void>;
}

export function AiAssistantView({
  initialPrompt,
  courses = [],
  tasks = [],
  goals = [],
  notes = [],
  onCreateTask,
  onCreateNote
}: AiAssistantViewProps) {
  const { isDark } = useTheme();
  const { language, t } = useLanguage();

  const [persona, setPersona] = useState<PersonaType>('general');
  const [attachUserContext, setAttachUserContext] = useState<boolean>(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: language === 'vi'
        ? 'Xin chào! Tôi là Trợ Lý Học Tập Planora AI. Tôi được kết nối trực tiếp với dữ liệu môn học, bài tập và tiến độ của bạn. Bạn muốn giải thích khái niệm, lên kế hoạch ôn thi, chia nhỏ bài tập hay luyện giải bài hôm nay?'
        : 'Hello! I am your Planora AI Study Assistant. I am directly connected with your courses, pending tasks, and study goals. How can I help you excel today?',
      source: 'gemini',
      model: 'gemini-3.8-flash',
      time: 'Vừa xong'
    }
  ]);

  const [input, setInput] = useState(initialPrompt || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setInput(initialPrompt);
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Persona configurations
  const personas: { id: PersonaType; labelVi: string; labelEn: string; icon: any; descVi: string; descEn: string }[] = [
    {
      id: 'general',
      labelVi: 'Tổng quát',
      labelEn: 'General',
      icon: Sparkles,
      descVi: 'Trợ lý học tập đa năng, giải thích dễ hiểu',
      descEn: 'All-round friendly study assistant'
    },
    {
      id: 'socratic',
      labelVi: 'Gia sư Socrates',
      labelEn: 'Socratic Tutor',
      icon: GraduationCap,
      descVi: 'Gợi mở tư duy phản biện, hướng dẫn từng bước',
      descEn: 'Guides through inquiry & critical thinking'
    },
    {
      id: 'coder',
      labelVi: 'Kỹ sư Lập trình',
      labelEn: 'Code Mentor',
      icon: Code,
      descVi: 'Clean Architecture, review code, debug',
      descEn: 'Software architecture & coding specialist'
    },
    {
      id: 'planner',
      labelVi: 'Lập lịch học',
      labelEn: 'Study Planner',
      icon: Calendar,
      descVi: 'Chia nhỏ bài tập, tối ưu thời gian Pomodoro',
      descEn: 'Time management & task breakdown'
    },
    {
      id: 'quiz',
      labelVi: 'Ôn thi & Quiz',
      labelEn: 'Exam & Quiz',
      icon: HelpCircle,
      descVi: 'Tạo câu hỏi trắc nghiệm kiểm tra kiến thức',
      descEn: 'Interactive practice questions & flash tests'
    }
  ];

  // Dynamic sample questions based on selected persona
  const sampleQuestionsByPersona: Record<PersonaType, { vi: string[]; en: string[] }> = {
    general: {
      vi: [
        'Dựa trên các bài tập của tôi, hôm nay tôi nên ưu tiên làm gì trước?',
        'Giải thích khái niệm Dependency Injection cho người mới bắt đầu',
        'Làm thế nào để duy trì kỷ luật học tập khi có quá nhiều deadline?'
      ],
      en: [
        'Based on my current tasks, what should I prioritize today?',
        'Explain Dependency Injection simply with real-world analogy',
        'How to maintain study discipline during heavy exam weeks?'
      ]
    },
    socratic: {
      vi: [
        'Hãy hướng dẫn tôi cách tự giải quyết lỗi Mongoose validation error',
        'Làm sao để biết khi nào nên dùng Relational DB thay vì NoSQL?',
        'Gợi mở cho tôi cách phân tích bài toán chia để trị (Divide and Conquer)'
      ],
      en: [
        'Guide me through debugging a MongoDB validation error step-by-step',
        'How can I determine when to pick Relational DB vs Document NoSQL?',
        'Help me explore divide-and-conquer principles through questions'
      ]
    },
    coder: {
      vi: [
        'Thiết kế Mongoose Schema chuẩn cho khóa học và bài tập kèm index',
        'Cách tổ chức Global Error Middleware bắt lỗi 500 trong Express v5',
        'So sánh Promise.all vs Promise.allSettled khi gọi nhiều API song song'
      ],
      en: [
        'Design a robust Mongoose schema with proper indexes and relationships',
        'Implement Global Error Handling middleware in Express TypeScript',
        'Compare Promise.all vs Promise.allSettled with production code examples'
      ]
    },
    planner: {
      vi: [
        'Lập lịch ôn thi cuối kỳ trong 7 ngày tới dựa trên các môn tôi đang học',
        'Chia nhỏ đồ án tốt nghiệp thành các mốc Sprint 1 tuần',
        'Thiết kế chu trình Pomodoro 3 tiếng cho buổi chiều nay'
      ],
      en: [
        'Build a 7-day revision schedule based on my enrolled courses',
        'Break down my term project into manageable weekly sprints',
        'Design a 3-hour Pomodoro study flow for this afternoon'
      ]
    },
    quiz: {
      vi: [
        'Tạo 3 câu trắc nghiệm kiểm tra kiến thức về React Hooks và Virtual DOM',
        'Đưa ra 1 bài tập tình huống về Database Deadlock và giải thích',
        'Đố tôi về các mã HTTP Status Code thông dụng (401, 403, 429, 503)'
      ],
      en: [
        'Generate 3 multiple choice questions on React Hooks and reconciliation',
        'Create a scenario question about database deadlock and its remedy',
        'Quiz me on common HTTP status codes (401, 403, 429, 503)'
      ]
    }
  };

  const sampleQuestions = language === 'vi'
    ? sampleQuestionsByPersona[persona].vi
    : sampleQuestionsByPersona[persona].en;

  // Build live context summary to feed into Gemini
  const buildUserContextSummary = (): string => {
    if (!attachUserContext) return '';

    const activeCourses = selectedCourseId === 'all'
      ? courses
      : courses.filter(c => c.id === selectedCourseId);

    const pendingTasks = tasks.filter(t => t.status !== 'done').slice(0, 6);
    const activeGoals = goals.filter(g => g.status === 'active').slice(0, 3);

    const parts: string[] = [];

    if (activeCourses.length > 0) {
      parts.push(`Khóa học đang học (${activeCourses.length}): ${activeCourses.map(c => `${c.title} (${c.code || ''})`).join(', ')}`);
    }

    if (pendingTasks.length > 0) {
      parts.push(`Nhiệm vụ sắp tới (${pendingTasks.length}): ${pendingTasks.map(t => `"${t.title}" (Hạn: ${t.dueDate || 'Chưa set'}, Ưu tiên: ${t.priority})`).join('; ')}`);
    }

    if (activeGoals.length > 0) {
      parts.push(`Mục tiêu hiện tại: ${activeGoals.map(g => `"${g.title}" (Tiến độ: ${g.currentValue}/${g.targetValue} ${g.unit})`).join('; ')}`);
    }

    return parts.join('\n');
  };

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const userContextStr = buildUserContextSummary();
    const courseContextName = selectedCourseId === 'all'
      ? 'Tất cả môn học'
      : courses.find(c => c.id === selectedCourseId)?.title || 'Môn học chọn lọc';

    try {
      const res = await api.askAi(q, {
        context: `Chủ đề môn học: ${courseContextName}`,
        persona,
        userContext: userContextStr
      });

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.answer,
        source: res.source,
        model: res.model || 'gemini-3.8-flash',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: {
          type: persona === 'planner' ? 'task' : 'note',
          title: q.length > 50 ? q.slice(0, 47) + '...' : q,
          content: res.answer
        }
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: language === 'vi'
          ? 'Hệ thống đang điều hướng lưu lượng truy cập. Vui lòng bấm "Thử lại" hoặc tiếp tục hỏi các câu hỏi khác, bộ máy thông minh Planora luôn sẵn sàng hỗ trợ bạn.'
          : 'High traffic detected. Please click "Retry" or ask your question again; Planora intelligent assistant is ready.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleCreateTaskFromAi = async (msg: Message) => {
    if (!onCreateTask) return;
    try {
      const title = msg.suggestedAction?.title || 'Nhiệm vụ từ gợi ý Planora AI';
      await onCreateTask({
        title: `[AI] ${title}`,
        priority: 'high',
        status: 'todo',
        courseId: selectedCourseId !== 'all' ? selectedCourseId : courses[0]?.id,
        dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
        estimatedMinutes: 45
      });
      setActionNotice(language === 'vi' ? 'Đã thêm nhiệm vụ mới vào trang Tasks!' : 'Added new task to your Tasks board!');
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNoteFromAi = async (msg: Message) => {
    if (!onCreateNote) return;
    try {
      const title = msg.suggestedAction?.title || 'Ghi chú học tập Planora AI';
      await onCreateNote({
        title: `[AI Note] ${title}`,
        content: msg.text,
        courseId: selectedCourseId !== 'all' ? selectedCourseId : courses[0]?.id,
        tags: ['AI-Assistant', persona]
      });
      setActionNotice(language === 'vi' ? 'Đã lưu nội dung vào trang Ghi Chú (Notes)!' : 'Saved to your Notes archive!');
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: language === 'vi'
          ? 'Đã bắt đầu phiên hội thoại mới. Bạn muốn tìm hiểu hoặc giải quyết vấn đề học tập nào?'
          : 'Started a fresh session. What would you like to explore or solve today?',
        source: 'gemini',
        model: 'gemini-3.8-flash',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-125px)]">
      {/* Toast Notice for Quick Action */}
      {actionNotice && (
        <div className="mb-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-xs hover:underline cursor-pointer">
            {language === 'vi' ? 'Đóng' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Control & Persona Bar */}
      <div className={`rounded-2xl border p-3 mb-3 transition-colors ${
        isDark ? 'bg-neutral-900/70 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Persona selector tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 mr-1 hidden sm:inline-block">
              {language === 'vi' ? 'Vai trò:' : 'Role:'}
            </span>
            {personas.map(p => {
              const Icon = p.icon;
              const isActive = persona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPersona(p.id)}
                  title={language === 'vi' ? p.descVi : p.descEn}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isDark
                        ? 'bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{language === 'vi' ? p.labelVi : p.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Context Options Toggle & Clear */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                showConfig || attachUserContext
                  ? isDark ? 'bg-neutral-800 border-indigo-500/50 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : isDark ? 'border-neutral-800 text-neutral-400 hover:text-white' : 'border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Ngữ cảnh học tập' : 'Study Context'}</span>
              <span className={`w-2 h-2 rounded-full ${attachUserContext ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            </button>

            <button
              onClick={handleClearHistory}
              title={language === 'vi' ? 'Bắt đầu cuộc trò chuyện mới' : 'Start new chat'}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsible Context Config Panel */}
        {showConfig && (
          <div className={`mt-3 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-fade-in ${
            isDark ? 'border-neutral-800 text-neutral-300' : 'border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-500/5 border border-slate-500/10">
              <div>
                <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{language === 'vi' ? 'Đọc dữ liệu học tập cá nhân' : 'Inject personal study records'}</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {language === 'vi'
                    ? `Kết nối ${courses.length} môn học, ${tasks.filter(t => t.status !== 'done').length} nhiệm vụ và ${goals.length} mục tiêu.`
                    : `Connects ${courses.length} courses, ${tasks.filter(t => t.status !== 'done').length} pending tasks, and ${goals.length} goals.`}
                </p>
              </div>
              <input
                type="checkbox"
                checked={attachUserContext}
                onChange={e => setAttachUserContext(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-500/5 border border-slate-500/10">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <div className="flex-1">
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                  {language === 'vi' ? 'Tập trung vào môn học:' : 'Focus on specific course:'}
                </label>
                <select
                  value={selectedCourseId}
                  onChange={e => setSelectedCourseId(e.target.value)}
                  className={`w-full px-2 py-1 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="all">
                    {language === 'vi' ? '📚 Tất cả môn học (Tổng hợp)' : '📚 All courses (Comprehensive)'}
                  </option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} {c.code ? `(${c.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions Bar */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
        <span className={`text-xs flex items-center gap-1 mr-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-medium">{language === 'vi' ? 'Gợi ý câu hỏi:' : 'Suggested Prompts:'}</span>
        </span>
        {sampleQuestions.map(sq => (
          <button
            key={sq}
            onClick={() => handleSend(sq)}
            className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer text-left ${
              isDark
                ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border-neutral-800 hover:border-neutral-700'
                : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200 shadow-2xs'
            }`}
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Chat Messages Window */}
      <div className={`flex-1 rounded-2xl border p-4 sm:p-5 overflow-y-auto space-y-4 transition-colors ${
        isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed transition-all ${
              msg.sender === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-sm shadow-xs'
                : isDark
                  ? 'bg-neutral-950/80 border border-neutral-800 text-neutral-200 rounded-tl-sm'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm shadow-2xs'
            }`}>
              {/* Message Content */}
              {msg.sender === 'ai' ? (
                <MarkdownRenderer content={msg.text} />
              ) : (
                <div className="whitespace-pre-wrap">{msg.text}</div>
              )}

              {/* Footer and Interactive Actions for AI Messages */}
              {msg.sender === 'ai' && (
                <div className={`mt-3 pt-2.5 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] ${
                  isDark ? 'border-neutral-850 text-neutral-400' : 'border-slate-200 text-slate-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium">
                      <Sparkles className="w-3 h-3" />
                      {msg.source === 'gemini' ? (msg.model || 'gemini-3.8-flash') : 'Planora Smart Engine'}
                    </span>
                    <span>{msg.time}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.id, msg.text)}
                      className={`p-1.5 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                        copiedMsgId === msg.id
                          ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10'
                          : isDark
                            ? 'border-neutral-800 hover:bg-neutral-850 text-neutral-300'
                            : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                      }`}
                      title={language === 'vi' ? 'Sao chép nội dung' : 'Copy answer'}
                    >
                      {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* Quick Add Task */}
                    {onCreateTask && (
                      <button
                        type="button"
                        onClick={() => handleCreateTaskFromAi(msg)}
                        className={`px-2 py-1 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                          isDark
                            ? 'border-neutral-800 hover:bg-neutral-850 text-neutral-300 hover:text-white'
                            : 'border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                        title={language === 'vi' ? 'Tạo nhanh nhiệm vụ từ gợi ý này' : 'Create task from this suggestion'}
                      >
                        <Plus className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-[10px] font-medium">{language === 'vi' ? '+ Task' : '+ Task'}</span>
                      </button>
                    )}

                    {/* Quick Add Note */}
                    {onCreateNote && (
                      <button
                        type="button"
                        onClick={() => handleCreateNoteFromAi(msg)}
                        className={`px-2 py-1 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                          isDark
                            ? 'border-neutral-800 hover:bg-neutral-850 text-neutral-300 hover:text-white'
                            : 'border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                        title={language === 'vi' ? 'Lưu nội dung vào Ghi Chú' : 'Save answer to Notes'}
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] font-medium">{language === 'vi' ? 'Lưu Note' : 'Save Note'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {msg.sender === 'user' && (
                <div className="mt-1 text-[10px] text-right text-indigo-200">
                  {msg.time}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center text-xs text-indigo-600 dark:text-indigo-400 animate-fade-in pl-1">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
              isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <Sparkles className="w-4 h-4 animate-spin text-indigo-500" />
            </div>
            <div className="space-y-0.5">
              <span className="animate-pulse font-medium block">
                {language === 'vi' ? 'Trợ lý Planora AI đang phân tích và chuẩn bị câu trả lời...' : 'Planora AI is analyzing your study context...'}
              </span>
              <span className="text-[10px] text-neutral-500 block">
                {attachUserContext && (language === 'vi' ? 'Đã liên kết dữ liệu thời khóa biểu & bài tập thực tế' : 'Attached personal study schedule & tasks')}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            language === 'vi'
              ? persona === 'coder'
                ? 'Nhờ giải thích code, review lỗi, thiết kế schema Mongoose...'
                : persona === 'planner'
                  ? 'Nhờ chia nhỏ bài tập, sắp xếp thời gian ôn thi...'
                  : persona === 'quiz'
                    ? 'Yêu cầu trắc nghiệm, kiểm tra kiến thức môn học...'
                    : 'Nhập câu hỏi học tập, giải thích khái niệm, nhờ cố vấn...'
              : 'Ask a study question, request code review, plan a schedule...'
          }
          className={`flex-1 px-4 py-3 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500'
              : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-xs'
          }`}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors shrink-0 shadow-sm cursor-pointer"
        >
          <span>{language === 'vi' ? 'Gửi' : 'Send'}</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
