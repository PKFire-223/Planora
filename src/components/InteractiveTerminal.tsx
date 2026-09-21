import { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Sparkles, CornerDownLeft, RotateCcw } from 'lucide-react';
import { PERSONAL_INFO, PROJECTS } from '../data/portfolioData';

interface HistoryItem {
  id: string;
  command: string;
  output: string | string[];
}

export function InteractiveTerminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 'init-1',
      command: 'welcome',
      output: [
        `PKFire Interactive Console [Version 1.0.0]`,
        `Repository: ${PERSONAL_INFO.repository}`,
        `Type 'help' or click any prompt chip below to run commands.`
      ]
    }
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const executeCommand = (cmdText: string) => {
    const trimmed = cmdText.trim().toLowerCase();
    if (!trimmed) return;

    let output: string | string[] = '';

    switch (trimmed) {
      case 'help':
        output = [
          'Available commands:',
          '  about       - Overview of PKFire and current focus',
          '  projects    - List featured repositories & tools',
          '  repo        - Information about this imported repository',
          '  skills      - Core technical competencies',
          '  contact     - Display contact channels and email',
          '  clear       - Clear terminal session history',
          '  pkfire      - Special ability trigger (🔥)'
        ];
        break;
      case 'about':
        output = [
          `Name:    ${PERSONAL_INFO.name} (${PERSONAL_INFO.handle})`,
          `Role:    ${PERSONAL_INFO.title}`,
          `Status:  ${PERSONAL_INFO.status}`,
          `Bio:     ${PERSONAL_INFO.bio}`
        ];
        break;
      case 'projects':
        output = [
          'Featured projects:',
          ...PROJECTS.map(p => `  • ${p.title.padEnd(24)} [${p.category}] - ${p.tagline}`)
        ];
        break;
      case 'skills':
        output = [
          'Technical competencies:',
          '  • Languages:  TypeScript, JavaScript, HTML5, CSS3, SQL',
          '  • Frontend:   React, Next.js, Vite, Tailwind CSS, Motion',
          '  • Backend:    Node.js, Express, REST APIs, WebSockets',
          '  • Tooling:    Git, GitHub, Docker, Linux, CI/CD'
        ];
        break;
      case 'repo':
      case 'repository':
        output = [
          `Imported Repo: PKFire-223/WEBSITE`,
          `URL:           ${PERSONAL_INFO.repository}`,
          `Architecture:  Node.js 22 / Vite + React + TypeScript + Tailwind CSS`,
          `Port:          3000 (0.0.0.0)`
        ];
        break;
      case 'contact':
        output = [
          `Email:         ${PERSONAL_INFO.email}`,
          `GitHub:        ${PERSONAL_INFO.github}`,
          `Repository:    ${PERSONAL_INFO.repository}`
        ];
        break;
      case 'pkfire':
      case 'fire':
        output = [
          '🔥🔥🔥 PK FIRE! 🔥🔥🔥',
          'A burst of energy launched across the screen. Critical hit!'
        ];
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      default:
        output = `Command not recognized: "${trimmed}". Type 'help' to see valid commands.`;
    }

    setHistory(prev => [
      ...prev,
      {
        id: `cmd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        command: cmdText,
        output
      }
    ]);
    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(input);
  };

  const quickChips = ['about', 'projects', 'repo', 'skills', 'pkfire', 'help'];

  return (
    <section id="terminal" className="py-16 md:py-24 border-t border-neutral-900 bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Interactive Terminal
            </h2>
          </div>
          <button
            onClick={() => {
              setHistory([]);
              setInput('');
            }}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800"
            title="Reset terminal"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Quick prompt chips */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <span className="text-xs text-neutral-400 font-mono flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span>Suggestions:</span>
          </span>
          {quickChips.map((chip) => (
            <button
              key={chip}
              onClick={() => executeCommand(chip)}
              className="px-2.5 py-1 text-xs font-mono rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-colors"
            >
              ${chip}
            </button>
          ))}
        </div>

        {/* Terminal Window */}
        <div 
          onClick={() => inputRef.current?.focus()}
          className="rounded-2xl border border-neutral-800 bg-neutral-950/90 shadow-2xl overflow-hidden font-mono text-xs sm:text-sm cursor-text"
        >
          {/* Window Title Bar */}
          <div className="px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 text-xs text-neutral-400 font-medium">pkfire@terminal:~</span>
            </div>
            <span className="text-[11px] text-neutral-400">bash</span>
          </div>

          {/* Terminal Body */}
          <div className="p-4 sm:p-6 min-h-[260px] max-h-[380px] overflow-y-auto space-y-3">
            {history.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center gap-2 text-neutral-400">
                  <span className="text-rose-400 font-bold">pkfire@website:~$</span>
                  <span className="text-white font-medium">{item.command}</span>
                </div>
                <div className="text-neutral-300 pl-4 border-l border-neutral-800/80 space-y-0.5">
                  {Array.isArray(item.output) ? (
                    item.output.map((line, lIdx) => (
                      <div key={lIdx} className="leading-relaxed whitespace-pre-wrap">
                        {line}
                      </div>
                    ))
                  ) : (
                    <div className="leading-relaxed whitespace-pre-wrap">{item.output}</div>
                  )}
                </div>
              </div>
            ))}

            {/* Active Input Line */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
              <span className="text-rose-400 font-bold shrink-0">pkfire@website:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="type a command (e.g. help)..."
                className="w-full bg-transparent text-white outline-none placeholder-neutral-600 font-mono text-xs sm:text-sm"
              />
              <button
                type="submit"
                className="text-neutral-500 hover:text-white p-1"
                aria-label="Submit command"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </form>
            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
