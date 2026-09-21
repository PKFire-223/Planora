import { Flame, Github, ArrowUp } from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-neutral-900 bg-neutral-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 p-0.5">
              <div className="w-full h-full bg-neutral-950 rounded-[6px] flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
              </div>
            </div>
            <div>
              <span className="text-sm font-semibold text-white">{PERSONAL_INFO.name}</span>
              <span className="text-xs text-neutral-400 ml-2 font-mono">
                migrated from PKFire-223/WEBSITE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={PERSONAL_INFO.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Source Repository</span>
            </a>

            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
              title="Scroll to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400 font-mono">
          <p>© {new Date().getFullYear()} PKFire. All rights reserved.</p>
          <p>Built with React, Vite & Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
}
