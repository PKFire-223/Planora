import { useState } from 'react';
import { Cpu, Terminal, Wrench, Check } from 'lucide-react';
import { SKILL_CATEGORIES } from '../data/portfolioData';

export function SkillsSection() {
  const [copiedSkill, setCopiedSkill] = useState<string | null>(null);

  const handleCopy = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopiedSkill(name);
    setTimeout(() => setCopiedSkill(null), 1500);
  };

  const getCategoryIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Cpu className="w-4 h-4 text-rose-400" />;
      case 1:
        return <Terminal className="w-4 h-4 text-amber-400" />;
      default:
        return <Wrench className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <section id="skills" className="py-16 md:py-24 border-t border-neutral-900 bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 uppercase tracking-wider mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Core Competencies</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Technical Stack & Ecosystem
          </h2>
          <p className="text-neutral-400 text-sm mt-2">
            Tools, languages, and frameworks used to craft resilient digital software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SKILL_CATEGORIES.map((cat, idx) => (
            <div
              key={cat.title}
              className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                    {getCategoryIcon(idx)}
                  </div>
                  <h3 className="font-semibold text-white text-base">
                    {cat.title}
                  </h3>
                </div>

                <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                  {cat.description}
                </p>

                <div className="space-y-2.5">
                  {cat.skills.map((skill: { name: string; level: string; iconName?: string; years?: string }) => (
                    <div
                      key={skill.name}
                      onClick={() => handleCopy(skill.name)}
                      className="group flex items-center justify-between p-2.5 rounded-lg bg-neutral-950/60 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 cursor-pointer transition-all"
                      title="Click to copy name"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-200 group-hover:text-white">
                          {skill.name}
                        </span>
                        {copiedSkill === skill.name && (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                            <Check className="w-3 h-3" />
                            <span>copied</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-neutral-400">
                          {skill.years}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-neutral-800 text-neutral-300">
                          {skill.level}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-900 text-right">
                <span className="text-[11px] text-neutral-400 font-mono">
                  {cat.skills.length} core technologies
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
