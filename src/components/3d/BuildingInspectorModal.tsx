import React, { useState } from 'react';
import type { Project } from '../../types/portfolio';
import { X, ExternalLink, GitCommit, Layers, Sparkles, Plus, Terminal, Link } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../../utils/storage';

interface BuildingInspectorModalProps {
  project: Project | null;
  onClose: () => void;
  onAddCommit: (projectId: string, message: string) => void;
  onUpdateLiveUrl?: (projectId: string, liveUrl: string) => void;
}

export const BuildingInspectorModal: React.FC<BuildingInspectorModalProps> = ({
  project,
  onClose,
  onAddCommit,
  onUpdateLiveUrl,
}) => {
  const [commitMessage, setCommitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [inputUrl, setInputUrl] = useState(project?.liveUrl || '');

  if (!project) return null;

  const handleSimulateCommit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;

    setIsSubmitting(true);
    playSound('commit');

    // Trigger glowing confetti burst
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: [project.buildingColor || '#38bdf8', '#a855f7', '#10b981']
    });

    setTimeout(() => {
      onAddCommit(project.id, commitMessage.trim());
      setCommitMessage('');
      setIsSubmitting(false);
    }, 400);
  };

  const handleSaveLiveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateLiveUrl) {
      playSound('click');
      onUpdateLiveUrl(project.id, inputUrl.trim());
      setIsEditingUrl(false);
    }
  };

  const floors = Math.max(3, Math.floor(project.commitsCount / 2));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel border border-sky-500/30 rounded-2xl shadow-2xl p-6 text-slate-100">
        
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
            <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
              {project.title}
            </h2>
            <p className="text-sm text-slate-400 font-mono-code">{project.subtitle}</p>
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

        {/* Project Thumbnail Image */}
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
            <div className="text-[11px] text-slate-400">Skyscraper Status</div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono-code uppercase text-slate-400 tracking-wider">Project Overview</h4>
          <p className="text-slate-300 text-sm leading-relaxed">{project.description}</p>
        </div>

        {/* Tech Stack Tags */}
        <div className="mt-4">
          <h4 className="text-xs font-mono-code uppercase text-slate-400 tracking-wider mb-2">Technologies Used</h4>
          <div className="flex flex-wrap gap-2">
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

        {/* Quick Edit Live URL Drawer */}
        {isEditingUrl ? (
          <form onSubmit={handleSaveLiveUrl} className="mt-4 p-3 rounded-xl bg-slate-900 border border-sky-500/40 space-y-2 font-mono-code">
            <label className="block text-xs text-sky-300">Enter / Paste Live Demo URL:</label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://my-app.vercel.app"
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingUrl(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 flex items-center justify-between text-xs font-mono-code bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400">Live URL: {project.liveUrl || 'Not set yet'}</span>
            <button
              onClick={() => setIsEditingUrl(true)}
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1 underline"
            >
              <Link className="w-3 h-3" />
              <span>{project.liveUrl ? 'Edit URL' : 'Set Live URL'}</span>
            </button>
          </div>
        )}

        {/* Interactive Push Commit Simulator */}
        <div className="mt-6 p-4 rounded-xl bg-slate-900/80 border border-sky-500/30">
          <div className="flex items-center gap-2 text-xs font-mono-code text-sky-300 mb-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Interactive Git Commit Simulator (Build 3D Floor)</span>
          </div>
          <form onSubmit={handleSimulateCommit} className="flex gap-2">
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder='git commit -m "added 3D building floor"'
              className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-200 font-mono-code focus:outline-none focus:border-sky-400"
            />
            <button
              type="submit"
              disabled={isSubmitting || !commitMessage.trim()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-mono-code text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Push Commit</span>
            </button>
          </form>
          <p className="text-[11px] text-slate-500 mt-1 font-mono-code">
            * Pushing commits adds real-time 3D floors to this project skyscraper in the 3D City!
          </p>
        </div>

        {/* Action Links */}
        <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-slate-800">
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSound('click')}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono-code text-xs font-medium flex items-center justify-center gap-2 transition-all"
          >
            <GitCommit className="w-4 h-4 text-sky-400" />
            <span>View GitHub Repository</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playSound('click')}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-mono-code text-xs font-bold flex items-center justify-center gap-2 shadow-lg glow-cyan transition-all"
            >
              <span>Launch Live App Demo</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

      </div>
    </div>
  );
};
