import { useState } from 'react';
import { Flame, Github, Menu, X, Terminal, ExternalLink } from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';

interface NavbarProps {
  onOpenTerminal?: () => void;
}

export function Navbar({ onOpenTerminal }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Projects', href: '#projects' },
    { label: 'Skills', href: '#skills' },
    { label: 'Terminal', href: '#terminal' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-neutral-950/80 border-b border-neutral-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <a 
          id="nav-brand"
          href="#about" 
          className="flex items-center gap-2.5 group transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 p-0.5 shadow-sm shadow-rose-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-neutral-950 rounded-[7px] flex items-center justify-center">
              <Flame className="w-4 h-4 text-rose-400 group-hover:text-amber-400 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-neutral-100 text-sm sm:text-base tracking-tight group-hover:text-rose-400 transition-colors">
              {PERSONAL_INFO.name}
            </span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">
              WEBSITE
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {navLinks.map((link) => (
            <a
              key={link.href}
              id={`nav-link-${link.label.toLowerCase()}`}
              href={link.href}
              className="px-3 py-1.5 rounded-md text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {onOpenTerminal && (
            <button
              id="nav-terminal-trigger"
              onClick={onOpenTerminal}
              className="px-2.5 py-1.5 text-xs font-mono text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-md flex items-center gap-1.5 transition-colors"
              title="Launch interactive terminal"
            >
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>CLI</span>
            </button>
          )}

          <a
            id="nav-github-link"
            href={PERSONAL_INFO.repository}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-md transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          id="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-800 bg-neutral-950/95 px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-neutral-800 flex items-center gap-3">
            <a
              href={PERSONAL_INFO.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-neutral-300 hover:text-white"
            >
              <Github className="w-4 h-4" />
              <span>PKFire-223/WEBSITE</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
