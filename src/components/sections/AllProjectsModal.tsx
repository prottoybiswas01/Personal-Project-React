import React, { useState, useMemo } from 'react';
import type { Project } from '../../types/portfolio';
import { 
  X, 
  Search, 
  Trophy, 
  Layers, 
  GitCommit, 
  ExternalLink, 
  Box, 
  RefreshCw, 
  Filter,
  Grid,
  ArrowUpDown
} from 'lucide-react';
import { playSound } from '../../utils/storage';

interface AllProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onSyncGitHub: () => void;
  isSyncingGitHub?: boolean;
}

export const AllProjectsModal: React.FC<AllProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  onSelectProject,
  onSyncGitHub,
  isSyncingGitHub = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'commits' | 'title' | 'floors'>('commits');

  const categories = ['All', 'Full Stack', 'Frontend', 'Backend', 'UI/UX'];

  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.techStack.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'commits') {
        return b.commitsCount - a.commitsCount;
      }
      if (sortBy === 'floors') {
        const floorsA = Math.max(3, Math.floor(a.commitsCount / 2));
        const floorsB = Math.max(3, Math.floor(b.commitsCount / 2));
        return floorsB - floorsA;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [projects, selectedCategory, searchQuery, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-6xl max-h-[92vh] bg-slate-950 border border-sky-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden glow-cyan"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Grid className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">
                  All Repositories Directory
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-code bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  {projects.length} Repositories
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Full list of GitHub projects ranked by commit count & floors built in 3D City.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playSound('click');
                onSyncGitHub();
              }}
              disabled={isSyncingGitHub}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/30 text-xs font-mono-code transition-all"
              title="Sync latest GitHub repositories"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGitHub ? 'animate-spin text-emerald-400' : 'text-sky-400'}`} />
              <span>{isSyncingGitHub ? 'Syncing...' : 'Sync GitHub'}</span>
            </button>

            <button
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-900/40 border-b border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by repo title, technology (React, Node, etc.)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono-code text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-mono-code"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono-code text-slate-400 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" /> Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono-code text-sky-300 focus:outline-none focus:border-sky-500"
              >
                <option value="commits">Most Commits First</option>
                <option value="floors">Most 3D Floors</option>
                <option value="title">Alphabetical (A-Z)</option>
              </select>
            </div>

          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-mono-code text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-purple-400" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playSound('click');
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono-code transition-all border ${
                  selectedCategory === cat
                    ? 'bg-sky-500/20 text-sky-300 border-sky-400 font-bold glow-cyan'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Repositories Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
          {filteredAndSortedProjects.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-mono-code text-sm">
              No repositories match your criteria "{searchQuery}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAndSortedProjects.map((project, rank) => {
                const floors = Math.max(3, Math.floor(project.commitsCount / 2));
                return (
                  <div
                    key={project.id}
                    className="group glass-panel rounded-xl border border-slate-800 hover:border-sky-500/50 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Image & Badges */}
                      <div className="relative h-40 w-full overflow-hidden bg-slate-950">
                        {project.imageUrl ? (
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-700">
                            <Grid className="w-10 h-10" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-slate-950/90 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                            {rank < 3 && <Trophy className="w-3 h-3 text-amber-400" />}
                            #{rank + 1} • {project.category}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-purple-950/90 text-purple-300 border border-purple-500/40 flex items-center gap-1 shrink-0">
                            <Layers className="w-3 h-3 text-purple-400" />
                            {floors} Floors
                          </span>
                        </div>

                        {/* Commits Badge */}
                        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 text-[10px] font-mono-code text-emerald-400 bg-slate-950/90 px-2 py-0.5 rounded border border-emerald-500/30">
                          <GitCommit className="w-3 h-3" />
                          <span>{project.commitsCount} Commits</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <h3 className="text-base font-heading font-bold text-white group-hover:text-sky-300 transition-colors break-words">
                          {project.title}
                        </h3>
                        <p className="text-xs text-sky-400 font-mono-code truncate">{project.subtitle}</p>
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 font-sans">
                          {project.description}
                        </p>

                        {/* Tech stack */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {project.techStack.slice(0, 4).map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded text-[9px] font-mono-code bg-slate-900 text-slate-300 border border-slate-800"
                            >
                              #{tech}
                            </span>
                          ))}
                          {project.techStack.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-code bg-slate-900 text-slate-400">
                              +{project.techStack.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 pt-0 border-t border-slate-900/60 mt-3 flex items-center gap-2">
                      <button
                        onClick={() => {
                          playSound('click');
                          onClose();
                          onSelectProject(project);
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono-code font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Box className="w-3.5 h-3.5" />
                        <span>Inspect 3D</span>
                      </button>

                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => playSound('click')}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all shrink-0"
                        title="View GitHub Repository"
                      >
                        <GitCommit className="w-3.5 h-3.5" />
                      </a>

                      {project.liveUrl && project.liveUrl !== project.githubUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => playSound('click')}
                          className="p-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white border border-sky-400/40 transition-all shrink-0 shadow"
                          title="Launch Live App Demo"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs font-mono-code text-slate-400">
          <span>Showing {filteredAndSortedProjects.length} of {projects.length} Repositories</span>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
