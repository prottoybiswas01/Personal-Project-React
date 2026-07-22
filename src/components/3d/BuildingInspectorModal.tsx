import React, { useState } from 'react';
import type { Project } from '../../types/portfolio';
import { X, ExternalLink, GitCommit, Layers, Sparkles, Copy, Check } from 'lucide-react';
import { playSound } from '../../utils/storage';

interface BuildingInspectorModalProps {
  project: Project | null;
  onClose: () => void;
}

export const BuildingInspectorModal: React.FC<BuildingInspectorModalProps> = ({
  project,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!project) return null;

  const floors = Math.max(3, Math.floor(project.commitsCount / 2));
  const activeUrl = project.liveUrl || project.githubUrl;

  const handleCopyLink = () => {
    playSound('click');
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto glass-panel border border-sky-500/30 rounded-2xl shadow-2xl p-6 text-slate-100">
        
        {/* Header with Title & Close Button */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-code bg-sky-500/20 text-sky-300 border border-sky-500/40">
                {project.category} 3D Skyscraper
              </span>
              <span 
                className="w-3 h-3 rounded-full shadow-lg animate-pulse" 
                style={{ backgroundColor: project.buildingColor || '#38bdf8' }}
              />
            </div>
            <h2 className="text-2xl font-heading font-bold text-white">
              {project.title}
            </h2>
            <p className="text-xs text-slate-400 font-mono-code">{project.subtitle}</p>
          </div>

          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Image */}
        {project.imageUrl && (
          <div className="relative mt-4 h-48 w-full rounded-xl overflow-hidden border border-slate-800 group">
            <img 
              src={project.imageUrl} 
              alt={project.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-3 left-3 flex items-center gap-2 font-mono-code text-xs text-sky-300 bg-slate-950/80 px-3 py-1 rounded-lg border border-sky-500/30">
              <Layers className="w-3.5 h-3.5" />
              <span>{floors} Floors Stacked ({project.commitsCount} Commits)</span>
            </div>
          </div>
        )}

        {/* 3D Building Stats Grid */}
        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="flex justify-center text-sky-400 mb-1">
              <GitCommit className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold text-white font-mono-code">{project.commitsCount}</div>
            <div className="text-[11px] text-slate-400">Total Commits</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="flex justify-center text-purple-400 mb-1">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold text-white font-mono-code">{floors}</div>
            <div className="text-[11px] text-slate-400">3D Building Floors</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="flex justify-center text-emerald-400 mb-1">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold text-white font-mono-code">
              {project.featured ? 'Featured' : 'Standard'}
            </div>
            <div className="text-[11px] text-slate-400">Status</div>
          </div>
        </div>

        {/* Overview */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono-code uppercase text-slate-400 tracking-wider">Project Overview</h4>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{project.description}</p>
        </div>

        {/* Tech Stack Tags */}
        <div className="mt-4">
          <h4 className="text-xs font-mono-code uppercase text-slate-400 tracking-wider mb-2">Technologies Used</h4>
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.map((tech, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs font-mono-code bg-slate-900 text-sky-300 border border-slate-800"
              >
                #{tech}
              </span>
            ))}
          </div>
        </div>

        {/* Direct Link & Copy Link Action Box */}
        <div className="mt-5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 font-mono-code">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Project URL:</span>
            <button
              onClick={handleCopyLink}
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-sky-300 truncate font-mono-code bg-slate-950 p-2 rounded-lg border border-slate-800/80">
            {activeUrl}
          </p>
        </div>

        {/* Direct Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-800">
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playSound('click')}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-mono-code text-xs font-bold flex items-center justify-center gap-2 shadow-lg glow-cyan transition-all"
            >
              <span>🚀 OPEN LIVE APPLICATION</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playSound('click')}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-mono-code text-xs font-bold flex items-center justify-center gap-2 shadow-lg glow-cyan transition-all"
            >
              <span>🚀 OPEN GITHUB REPOSITORY</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSound('click')}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono-code text-xs font-medium flex items-center justify-center gap-2 transition-all"
          >
            <GitCommit className="w-4 h-4 text-sky-400" />
            <span>GitHub Source</span>
          </a>
        </div>

      </div>
    </div>
  );
};
