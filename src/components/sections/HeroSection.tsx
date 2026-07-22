import React, { useState } from 'react';
import type { ProfileInfo, Project, CityConfig } from '../../types/portfolio';
import { CityCanvas } from '../3d/CityCanvas';
import { ArrowRight, Shield, RefreshCw } from 'lucide-react';
import { playSound } from '../../utils/storage';

interface HeroSectionProps {
  profile: ProfileInfo;
  projects: Project[];
  cityConfig: CityConfig;
  onUpdateCityConfig: (newConfig: Partial<CityConfig>) => void;
  onSelectProject: (project: Project) => void;
  onOpenAdmin: () => void;
  onSyncGitHub: () => void;
  isSyncingGitHub?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  projects,
  cityConfig,
  onUpdateCityConfig,
  onSelectProject,
  onOpenAdmin,
  onSyncGitHub,
  isSyncingGitHub = false,
}) => {
  const [hoveredProjId, setHoveredProjId] = useState<string | null>(null);

  const totalCommits = projects.reduce((sum, p) => sum + p.commitsCount, 0);
  const totalFloors = projects.reduce((sum, p) => sum + Math.max(3, Math.floor(p.commitsCount / 2)), 0);

  const themes: CityConfig['theme'][] = ['cyberpunk', 'matrix', 'sunset', 'diamond', 'neon-blue'];

  return (
    <section id="hero" className="relative min-h-[calc(100vh-80px)] pt-4 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center">
      
      {/* Background ambient lighting */}
      <div className="absolute top-20 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 right-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        
        {/* Left Column: Hero Headlines & Bio */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-sky-500/40 text-[11px] font-mono-code text-sky-300 glow-cyan">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>AVAILABLE FOR MERN & UI/UX ROLES</span>
            </div>

            <button
              onClick={() => {
                playSound('click');
                onSyncGitHub();
              }}
              disabled={isSyncingGitHub}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-purple-500/40 text-[11px] font-mono-code text-purple-300 hover:text-white transition-all"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncingGitHub ? 'animate-spin text-emerald-400' : 'text-purple-400'}`} />
              <span>{isSyncingGitHub ? 'Syncing...' : 'Live GitHub Auto-Sync'}</span>
            </button>
          </div>

          {/* Main Title */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-white tracking-tight leading-tight break-words">
              Hi, I'm <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-purple-400 to-pink-500 glow-text-cyan">
                {profile.name}
              </span>
            </h1>
            <p className="text-base sm:text-lg font-mono-code text-slate-300 font-medium leading-snug">
              {profile.title}
            </p>
          </div>

          {/* Bio text */}
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-sans">
            {profile.bio}
          </p>

          {/* Live Stats counters */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2.5 rounded-xl glass-panel border border-slate-800 text-center">
              <div className="text-xl font-bold font-mono-code text-sky-400">{projects.length}</div>
              <div className="text-[10px] text-slate-400 font-mono-code truncate">3D Buildings</div>
            </div>
            <div className="p-2.5 rounded-xl glass-panel border border-slate-800 text-center">
              <div className="text-xl font-bold font-mono-code text-purple-400">{totalCommits}</div>
              <div className="text-[10px] text-slate-400 font-mono-code truncate">Git Commits</div>
            </div>
            <div className="p-2.5 rounded-xl glass-panel border border-slate-800 text-center">
              <div className="text-xl font-bold font-mono-code text-emerald-400">{totalFloors}</div>
              <div className="text-[10px] text-slate-400 font-mono-code truncate">Floors Stacked</div>
            </div>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <a
              href="#projects"
              onClick={() => playSound('click')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-mono-code text-xs font-bold flex items-center gap-2 shadow-lg glow-cyan transition-all"
            >
              <span>EXPLORE PROJECTS</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={() => {
                playSound('admin');
                onOpenAdmin();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono-code text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Shield className="w-4 h-4 text-purple-400" />
              <span>ADMIN PANEL</span>
            </button>
          </div>

        </div>

        {/* Right Column: Interactive 3D GitHub City Skyscraper Viewport */}
        <div className="lg:col-span-7 h-[420px] sm:h-[500px] lg:h-[540px] relative">
          
          <CityCanvas
            projects={projects}
            cityConfig={cityConfig}
            onSelectProject={onSelectProject}
            hoveredProjectId={hoveredProjId}
            onHoverProject={setHoveredProjId}
          />

          {/* Theme Switcher Overlay Bar (positioned bottom-right cleanly) */}
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 p-1 rounded-xl glass-panel border border-slate-800 pointer-events-auto">
            <span className="text-[10px] font-mono-code text-slate-400 px-1 hidden sm:inline">
              Theme:
            </span>
            {themes.map((t) => (
              <button
                key={t}
                onClick={() => {
                  playSound('click');
                  onUpdateCityConfig({ theme: t });
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono-code capitalize transition-all border ${
                  cityConfig.theme === t
                    ? 'bg-sky-500/30 text-sky-300 border-sky-400 glow-cyan font-bold'
                    : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

        </div>

      </div>

    </section>
  );
};
