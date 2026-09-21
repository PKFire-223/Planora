import { ArrowDown, Code2, Sparkles, Terminal, Layers, Send } from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';

export function Hero() {
  return (
    <section id="about" className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Availability pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{PERSONAL_INFO.status}</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
          Building tactile interfaces &{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-rose-300">
            resilient web systems.
          </span>
        </h1>

        {/* Bio */}
        <p className="text-base sm:text-lg text-neutral-400 leading-relaxed max-w-2xl mb-8">
          Hi, I'm <strong className="text-neutral-200 font-semibold">{PERSONAL_INFO.name}</strong> ({PERSONAL_INFO.handle}). {PERSONAL_INFO.bio}
        </p>

        {/* Call to action buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-14">
          <a
            id="hero-explore-projects-btn"
            href="#projects"
            className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition-all shadow-sm shadow-rose-900/30 flex items-center gap-2"
          >
            <span>Explore Projects</span>
            <ArrowDown className="w-4 h-4" />
          </a>

          <a
            id="hero-contact-btn"
            href="#contact"
            className="px-5 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4 text-neutral-400" />
            <span>Get in Touch</span>
          </a>

          <a
            id="hero-terminal-btn"
            href="#terminal"
            className="px-4 py-2.5 rounded-lg bg-neutral-900/50 hover:bg-neutral-800/80 text-neutral-300 border border-neutral-800/80 font-mono text-xs transition-colors flex items-center gap-2"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Launch CLI</span>
          </a>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-neutral-900 pt-8">
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
            <div className="flex items-center gap-2 text-rose-400 mb-1.5">
              <Code2 className="w-4 h-4" />
              <span className="text-xs font-mono font-medium uppercase tracking-wider">Frontend</span>
            </div>
            <p className="text-sm font-medium text-neutral-200">React, TypeScript & Tailwind</p>
            <p className="text-xs text-neutral-500 mt-0.5">High-fidelity UI, accessible interactions</p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
            <div className="flex items-center gap-2 text-amber-400 mb-1.5">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-mono font-medium uppercase tracking-wider">Systems</span>
            </div>
            <p className="text-sm font-medium text-neutral-200">Node.js, Express & APIs</p>
            <p className="text-xs text-neutral-500 mt-0.5">Scalable backends, WebSocket telemetry</p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
            <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-mono font-medium uppercase tracking-wider">Workflow</span>
            </div>
            <p className="text-sm font-medium text-neutral-200">Modern Developer Tooling</p>
            <p className="text-xs text-neutral-500 mt-0.5">Fast builds, automated quality & testing</p>
          </div>
        </div>
      </div>
    </section>
  );
}
