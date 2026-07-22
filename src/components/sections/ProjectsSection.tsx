import React, { useState } from 'react';
import type { Project } from '../../types/portfolio';
import { Layers, GitCommit, ExternalLink, Box, Code, RefreshCw, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { playSound } from '../../utils/storage';

interface ProjectsSectionProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onSyncGitHub: () => void;
  isSyncingGitHub?: boolean;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  onSelectProject,
  onSyncGitHub,
  isSyncingGitHub = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAllGrid, setShowAllGrid] = useState<boolean>(false);

  // 1. Sort projects descending by commits count (most committed projects rank highest!)
  const sortedProjects = [...projects].sort((a, b) => b.commitsCount - a.commitsCount);

  // 2. Filter by category
  const filteredProjects = selectedCategory === 'All'
    ? sortedProjects
    : sortedProjects.filter(p => p.category === selectedCategory);

  // 3. Grid display logic: Show top 6 or expand to show all projects!
  const displayedProjects = showAllGrid ? filteredProjects : filteredProjects.slice(0, 6);

  const categories = ['All', 'Full Stack', 'Frontend', 'Backend', 'UI/UX'];

  return (
    <section id="projects" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-xs font-mono-code text-sky-400">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>{showAllGrid ? `ALL ${projects.length} GITHUB REPOSITORIES` : 'TOP 6 MOST COMMITTED PROJECTS'}</span>
        </div>
        
        <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-white">
          Featured <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-purple-500">Repositories & Applications</span>
        </h2>
        
        <p className="text-slate-400 text-xs sm:text-sm font-sans leading-relaxed">
          Repositories are ranked by real Git commit activity. Repositories with the highest commit history rank first!
        </p>

        <div className="pt-2 flex justify-center gap-3 flex-wrap">
          <button
            onClick={() => {
              playSound('click');
              onSyncGitHub();
            }}
            disabled={isSyncingGitHub}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/40 text-xs font-mono-code font-bold flex items-center gap-2 shadow-lg glow-cyan transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingGitHub ? 'animate-spin text-emerald-400' : 'text-sky-400'}`} />
            <span>{isSyncingGitHub ? 'SYNCING LIVE REPOS...' : 'REFRESH & SYNC GITHUB REPOSITORIES'}</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              playSound('click');
              setSelectedCategory(cat);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono-code transition-all border ${
              selectedCategory === cat
                ? 'bg-sky-500/20 text-sky-300 border-sky-400 glow-cyan font-bold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {displayedProjects.map((project, rank) => {
          const floors = Math.max(3, Math.floor(project.commitsCount / 2));
          return (
            <div
              key={project.id}
              className="group glass-panel rounded-2xl border border-slate-800 hover:border-sky-500/50 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-950">
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-700">
                      <Code className="w-12 h-12" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Top Rank & Category Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none gap-1">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono-code bg-slate-950/90 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                      {rank < 3 && <Trophy className="w-3 h-3 text-amber-400" />}
                      #{rank + 1} • {project.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono-code bg-purple-950/90 text-purple-300 border border-purple-500/40 flex items-center gap-1 shrink-0">
                      <Layers className="w-3 h-3 text-purple-400" />
                      {floors} Floors
                    </span>
                  </div>

                  {/* Bottom Commit Badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono-code text-emerald-400 bg-slate-950/80 px-2.5 py-1 rounded-md border border-emerald-500/30">
                    <GitCommit className="w-3.5 h-3.5" />
                    <span>{project.commitsCount} Commits</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 space-y-2.5">
                  <h3 className="text-lg sm:text-xl font-heading font-bold text-white group-hover:text-sky-300 transition-colors break-words">
                    {project.title}
                  </h3>
                  <p className="text-xs text-sky-400 font-mono-code truncate">{project.subtitle}</p>
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 font-sans">
                    {project.description}
                  </p>

                  {/* Tech stack tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        #{tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-5 sm:p-6 pt-0 border-t border-slate-900/60 mt-4 flex items-center gap-2">
                <button
                  onClick={() => {
                    playSound('click');
                    onSelectProject(project);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono-code font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>Inspect 3D Building</span>
                </button>

                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playSound('click')}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all shrink-0"
                  title="View GitHub Repository"
                >
                  <GitCommit className="w-4 h-4" />
                </a>

                {project.liveUrl && project.liveUrl !== project.githubUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => playSound('click')}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white border border-sky-400/40 transition-all shrink-0 shadow"
                    title="Launch Live App Demo"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Expand/Collapse Toggle Button for All 48 Projects */}
      <div className="mt-12 text-center">
        <button
          onClick={() => {
            playSound('click');
            setShowAllGrid(!showAllGrid);
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-sky-500/40 text-sky-300 font-mono-code text-xs font-bold transition-all shadow-lg glow-cyan"
        >
          <span>{showAllGrid ? 'SHOW TOP 6 PROJECTS ONLY' : `VIEW ALL ${projects.length} REPOSITORIES IN GRID`}</span>
          {showAllGrid ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

    </section>
  );
};
