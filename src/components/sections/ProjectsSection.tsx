import React, { useState, useMemo } from 'react';
import type { Project } from '../../types/portfolio';
import { Layers, GitCommit, ExternalLink, Box, Code, RefreshCw, Trophy, Search, ArrowUpDown, Filter } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'commits' | 'floors' | 'title'>('commits');

  const categories = ['All', 'Full Stack', 'Frontend', 'Backend', 'UI/UX'];

  // Process sorting and filtering
  const filteredProjects = useMemo(() => {
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

  // Display top 6 by default or all when expanded
  const displayedProjects = showAllGrid ? filteredProjects : filteredProjects.slice(0, 6);

  const toggleShowAll = () => {
    playSound('click');
    const nextState = !showAllGrid;
    setShowAllGrid(nextState);
    
    // Smooth scroll to projects section header
    const projElem = document.getElementById('projects');
    if (projElem) {
      projElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="projects" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-xs font-mono-code text-sky-400">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>{showAllGrid ? `DISPLAYING ALL ${filteredProjects.length} OF ${projects.length} GITHUB REPOSITORIES` : 'TOP 6 MOST COMMITTED PROJECTS'}</span>
        </div>
        
        <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-white">
          All GitHub <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-purple-500">Repositories & Live Applications</span>
        </h2>
        
        <p className="text-slate-400 text-xs sm:text-sm font-sans leading-relaxed">
          Repositories are ranked live by real Git commit history. Explore all {projects.length} public projects with live previews and 3D architectural floor counts!
        </p>

        {/* Action Controls Header */}
        <div className="pt-2 flex justify-center gap-3 flex-wrap">
          <button
            onClick={toggleShowAll}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600/80 to-purple-600/80 hover:from-sky-500 hover:to-purple-500 text-white border border-sky-400/50 text-xs font-mono-code font-bold flex items-center gap-2 shadow-lg glow-cyan transition-all"
          >
            <Layers className="w-4 h-4 text-sky-300" />
            <span>{showAllGrid ? 'SHOW TOP 6 FEATURED ONLY' : `EXPLORE FULL DIRECTORY (${projects.length} REPOS)`}</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              onSyncGitHub();
            }}
            disabled={isSyncingGitHub}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/40 text-xs font-mono-code font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingGitHub ? 'animate-spin text-emerald-400' : 'text-sky-400'}`} />
            <span>{isSyncingGitHub ? 'SYNCING LIVE REPOS...' : 'REFRESH GITHUB SYNC'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="space-y-4 mb-10 glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono-code text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-purple-400" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playSound('click');
                  setSelectedCategory(cat);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono-code transition-all border ${
                  selectedCategory === cat
                    ? 'bg-sky-500/20 text-sky-300 border-sky-400 glow-cyan font-bold'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono-code text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono-code text-sky-300 focus:outline-none focus:border-sky-500"
            >
              <option value="commits">Most Commits First</option>
              <option value="floors">Most 3D Floors</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>

        </div>

        {/* Live Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search all 48 repositories by name, technology (React, Node, Tailwind, TypeScript)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value && !showAllGrid) setShowAllGrid(true);
            }}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-sky-500/30 text-xs font-mono-code text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-mono-code"
            >
              Clear
            </button>
          )}
        </div>

      </div>

      {/* Projects Grid */}
      {displayedProjects.length === 0 ? (
        <div className="py-16 text-center text-slate-400 font-mono-code text-sm">
          No repositories found matching "{searchQuery}". Try clearing filters.
        </div>
      ) : (
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
      )}

      {/* Bottom Page Expansion Button (Direct Page Expand - No Modal Popups!) */}
      <div className="mt-12 text-center space-y-2">
        <button
          onClick={toggleShowAll}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500/20 via-purple-500/20 to-pink-500/20 hover:from-sky-500/30 hover:to-purple-500/30 border border-sky-400/50 text-sky-300 font-mono-code text-xs font-bold transition-all shadow-xl glow-cyan hover:scale-[1.02]"
        >
          <Layers className="w-4 h-4 text-sky-400" />
          <span>{showAllGrid ? `SHOW TOP 6 FEATURED PROJECTS ONLY` : `EXPLORE FULL REPOSITORY DIRECTORY (${projects.length})`}</span>
        </button>
        <p className="text-[11px] font-mono-code text-slate-400">
          {showAllGrid ? `Displaying all ${displayedProjects.length} public repositories directly on page` : `Click to load all ${projects.length} GitHub repositories directly on page`}
        </p>
      </div>

    </section>
  );
};
