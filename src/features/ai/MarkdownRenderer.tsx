import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { isDark } = useTheme();
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Split content by code blocks: ```lang ... ```
  const parts = content.split(/(```[\s\S]*?```)/g);

  let codeBlockCounter = 0;

  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
      {parts.map((part, pIdx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const currentIdx = codeBlockCounter++;
          const firstLineEnd = part.indexOf('\n');
          let language = 'code';
          let codeText = '';

          if (firstLineEnd !== -1) {
            language = part.slice(3, firstLineEnd).trim() || 'code';
            codeText = part.slice(firstLineEnd + 1, -3);
          } else {
            codeText = part.slice(3, -3);
          }

          return (
            <div
              key={pIdx}
              className={`rounded-xl border overflow-hidden my-3 text-xs font-mono transition-colors ${
                isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-900 text-slate-100 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-neutral-950/60 border-b border-neutral-800/80 text-[11px] text-neutral-400">
                <span className="font-semibold uppercase tracking-wider">{language}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeText, currentIdx)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="Sao chép mã nguồn"
                >
                  {copiedCodeIdx === currentIdx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-sans text-[10px]">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="font-sans text-[10px]">Sao chép code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto text-[12px] leading-relaxed text-slate-200">
                <code>{codeText}</code>
              </pre>
            </div>
          );
        }

        // Regular text formatting (lines, bold, bullets, inline code)
        const lines = part.split('\n');
        return (
          <div key={pIdx} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) {
                return <div key={lIdx} className="h-1.5" />;
              }

              // Heading levels
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lIdx} className="font-bold text-sm sm:text-base mt-2 mb-1 text-indigo-500 dark:text-indigo-400">
                    {formatInline(trimmed.slice(4), isDark)}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={lIdx} className="font-bold text-base sm:text-lg mt-3 mb-1.5 text-indigo-600 dark:text-indigo-300">
                    {formatInline(trimmed.slice(3), isDark)}
                  </h3>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h2 key={lIdx} className="font-bold text-lg sm:text-xl mt-3 mb-2 text-indigo-700 dark:text-indigo-200">
                    {formatInline(trimmed.slice(2), isDark)}
                  </h2>
                );
              }

              // Bullet points
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-indigo-500 font-bold mt-0.5">•</span>
                    <span className="flex-1">{formatInline(trimmed.slice(2), isDark)}</span>
                  </div>
                );
              }

              // Numbered list
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-indigo-500 font-semibold font-mono text-xs mt-0.5 min-w-[16px]">
                      {numMatch[1]}.
                    </span>
                    <span className="flex-1">{formatInline(numMatch[2], isDark)}</span>
                  </div>
                );
              }

              return (
                <p key={lIdx} className="leading-relaxed">
                  {formatInline(line, isDark)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function formatInline(text: string, isDark: boolean) {
  // Regex to match **bold** and `code`
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return tokens.map((token, i) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-slate-900 dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code
          key={i}
          className={`px-1.5 py-0.5 rounded text-xs font-mono ${
            isDark ? 'bg-neutral-800 text-indigo-300' : 'bg-slate-200/80 text-indigo-700'
          }`}
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return token;
  });
}
