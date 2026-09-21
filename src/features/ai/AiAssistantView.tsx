import { useState } from 'react';
import { Bot, Send, Sparkles, CornerDownLeft, BookOpen, Lightbulb, Code } from 'lucide-react';
import { api } from '../../services/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  source?: string;
  time: string;
}

export function AiAssistantView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Chào bạn! Mình là AI Study Assistant của nền tảng Personal LMS. Mình có thể giúp bạn giải thích khái niệm lập trình, tối ưu thiết kế MongoDB, chia nhỏ bài tập, hoặc lập kế hoạch ôn tập. Bạn muốn hỏi gì hôm nay?',
      source: 'local-assistant',
      time: 'Vừa xong'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    'Thiết kế Mongoose Schema cho khoá học & bài học',
    'Lộ trình học Node.js & Clean Architecture',
    'Cách viết Global Error Handler bắt lỗi 500',
    'Mẹo chia nhỏ task bài tập lớn với AI'
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
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'Rất tiếc, đã có lỗi khi liên lạc với máy chủ AI. Bạn hãy kiểm tra lại kết nối mạng.',
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
        <span className="text-xs text-neutral-400 font-mono flex items-center gap-1 mr-1">
          <Lightbulb className="w-3 h-3 text-amber-400" />
          <span>Gợi ý câu hỏi:</span>
        </span>
        {sampleQuestions.map(sq => (
          <button
            key={sq}
            onClick={() => handleSend(sq)}
            className="px-2.5 py-1 text-xs rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-colors"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Chat Messages Window */}
      <div className="flex-1 rounded-2xl bg-neutral-900/50 border border-neutral-800 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 p-0.5 shrink-0">
                <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-amber-400" />
                </div>
              </div>
            )}

            <div className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-rose-600 text-white rounded-tr-sm'
                : 'bg-neutral-950/80 border border-neutral-800 text-neutral-200 rounded-tl-sm whitespace-pre-wrap'
            }`}>
              {msg.text}
              <div className="mt-1 text-[10px] text-neutral-400 text-right font-mono">
                {msg.time} {msg.source === 'gemini' ? '• Gemini 2.5' : ''}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center text-xs text-amber-400">
            <div className="w-8 h-8 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
            </div>
            <span className="animate-pulse">Trợ lý AI đang xử lý câu trả lời...</span>
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
          placeholder="Nhập câu hỏi học tập, giải thích code, nhờ chia nhỏ bài tập..."
          className="flex-1 px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-rose-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors shrink-0 shadow-sm shadow-rose-950"
        >
          <span>Gửi</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
