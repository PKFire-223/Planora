import { useState } from 'react';
import { ExternalLink, Github, Sparkles, CheckCircle2 } from 'lucide-react';
import { PROJECTS } from '../data/portfolioData';
import { Project } from '../types';

export function ProjectsSection() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const categories = [
    { id: 'all', label: 'All Projects' },
    { id: 'web', label: 'Web Applications' },
    { id: 'tools', label: 'Developer Tools' },
    { id: 'opensource', label: 'Open Source' },
    { id: 'systems', label: 'Systems & Edge' },
  ];

  const filteredProjects = activeCategory === 'all'
    ? PROJECTS
    : PROJECTS.filter(p => p.category === activeCategory);

  return (
    <section id="projects" className="py-16 md:py-24 border-t border-neutral-900 bg-neutral-950/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-rose-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Selected Works</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Featured Projects & Tools
            </h2>
            <p className="text-neutral-400 text-sm mt-1 max-w-xl">
              A curated collection of web apps, developer utilities, and architecture experiments.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                id={`filter-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              id={`project-card-${project.id}`}
              className="group relative flex flex-col justify-between p-6 rounded-2xl bg-neutral-900/50 hover:bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-700 transition-all duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-rose-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {project.tagline}
                    </p>
                  </div>
                  {project.metrics && (
                    <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-neutral-800 text-amber-300 border border-neutral-700/80 shrink-0">
                      {project.metrics.value}
                    </span>
                  )}
                </div>

                <p className="text-sm text-neutral-300 leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Highlights */}
                <div className="space-y-1.5 mb-5">
                  {project.highlights.map((highlight: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-neutral-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-500/80 mt-0.5 shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {project.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-[11px] font-mono rounded bg-neutral-950/80 text-neutral-400 border border-neutral-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex items-center gap-3 pt-3 border-t border-neutral-800/60">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Source Code</span>
                    </a>
                  )}

                  <button
                    onClick={() => setSelectedProject(project)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors ml-auto"
                  >
                    <span>View Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Project Detail Modal */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-lg p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedProject.title}</h3>
                  <p className="text-xs text-neutral-400 mt-1">{selectedProject.tagline}</p>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-neutral-300 leading-relaxed mb-5">
                {selectedProject.description}
              </p>

              <div className="mb-5">
                <h4 className="text-xs font-mono uppercase text-neutral-400 tracking-wider mb-2">Key Highlights</h4>
                <ul className="space-y-2">
                  {selectedProject.highlights.map((h: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-6">
                {selectedProject.tags.map((t: string) => (
                  <span key={t} className="px-2 py-0.5 text-xs font-mono bg-neutral-950 text-neutral-300 rounded border border-neutral-800">
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 text-xs rounded-lg font-medium text-neutral-300 hover:bg-neutral-800"
                >
                  Close
                </button>
                {selectedProject.githubUrl && (
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-xs rounded-lg font-medium bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>View Repository</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
