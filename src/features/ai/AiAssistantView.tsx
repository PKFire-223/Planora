import { useState, useEffect } from 'react';
import { Bot, Send, Sparkles, Lightbulb, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  source?: string;
  time: string;
}

interface AiAssistantViewProps {
  initialPrompt?: string;
}

export function AiAssistantView({ initialPrompt }: AiAssistantViewProps) {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ Lý Học Tập Planora AI. Tôi có thể giúp bạn giải thích khái niệm lập trình, lên kế hoạch ôn thi, chia nhỏ bài tập phức tạp hoặc gợi ý giải pháp kỹ thuật. Bạn cần hỗ trợ vấn đề gì hôm nay?',
      source: 'local-assistant',
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

  const sampleQuestions = [
    'Thiết kế Mongoose Schema chuẩn cho khoá học & bài tập',
    'Lộ trình tự học Node.js Express & Clean Architecture',
    'Cách xử lý Global Error Middleware bắt lỗi 500',
    'Chiến lược chia nhỏ task bài tập lớn để hoàn thành đúng hạn'
  ];

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

    try {
      const res = await api.askAi(q);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.answer,
        source: res.source,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'Đã có lỗi khi liên lạc với máy chủ AI. Bạn hãy thử lại trong giây lát.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-130px)]">
      {/* Suggestions */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className={`text-xs flex items-center gap-1 mr-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-medium">Gợi ý câu hỏi:</span>
        </span>
        {sampleQuestions.map(sq => (
          <button
            key={sq}
            onClick={() => handleSend(sq)}
            className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${
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
      <div className={`flex-1 rounded-2xl border p-4 sm:p-6 overflow-y-auto space-y-4 transition-colors ${
        isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-sm shadow-xs'
                : isDark
                  ? 'bg-neutral-950/80 border border-neutral-800 text-neutral-200 rounded-tl-sm whitespace-pre-wrap'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm whitespace-pre-wrap'
            }`}>
              {msg.text}
              <div className={`mt-1.5 text-[10px] text-right ${msg.sender === 'user' ? 'text-indigo-200' : isDark ? 'text-neutral-400' : 'text-slate-400'}`}>
                {msg.time} {msg.source === 'gemini' ? '• Planora AI Engine' : ''}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center text-xs text-indigo-600 dark:text-indigo-400">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
              isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <span className="animate-pulse font-medium">Trợ lý Planora AI đang xử lý câu trả lời...</span>
          </div>
        )}
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
          placeholder="Nhập câu hỏi học tập, nhờ giải thích khái niệm, lập lộ trình..."
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
          <span>Gửi</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
