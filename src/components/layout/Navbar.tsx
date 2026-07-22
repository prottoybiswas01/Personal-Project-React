import React, { useState } from 'react';
import { Volume2, VolumeX, Box, Menu, X, RefreshCw } from 'lucide-react';
import { isAudioMuted, toggleAudioMute, playSound } from '../../utils/storage';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onSyncGitHub: () => void;
  isSyncingGitHub?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  onSyncGitHub,
  isSyncingGitHub = false,
}) => {
  const [muted, setMuted] = useState(isAudioMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMuteToggle = () => {
    const nextMuted = toggleAudioMute();
    setMuted(nextMuted);
    if (!nextMuted) playSound('click');
  };

  const navItems = [
    { id: 'hero', label: '3D City', icon: '🌐' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'skills', label: 'Tech Stack', icon: '🛠' },
    { id: 'about', label: 'About', icon: '👨‍💻' },
    { id: 'hobbies', label: 'Hobbies & Movies', icon: '🎨' },
    { id: 'contact', label: 'Contact', icon: '✉️' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/90 border-b border-sky-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Brand Logo */}
        <div 
          onClick={() => {
            playSound('click');
            onNavigate('hero');
          }}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 p-0.5 glow-cyan transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center text-sky-400">
              <Box className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-sm sm:text-base text-white tracking-wide">
                PROTTOY BISWAS
              </span>
              <span className="px-1.5 py-0.2 text-[8px] font-mono-code rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                3D CITY
              </span>
            </div>
            <span className="text-[10px] font-mono-code text-slate-400 block -mt-0.5 truncate max-w-[170px] sm:max-w-none">
              MERN Stack Developer & UI/UX Designer
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-0.5 glass-panel px-2.5 py-1 rounded-xl border border-slate-800">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                playSound('click');
                onNavigate(item.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-code transition-all flex items-center gap-1 ${
                activeSection === item.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 glow-cyan font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right Header Controls */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          
          {/* Live GitHub Auto-Sync Button */}
          <button
            onClick={() => {
              playSound('click');
              onSyncGitHub();
            }}
            disabled={isSyncingGitHub}
            title="Live Sync with GitHub account (prottoybiswas01)"
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-400 border border-sky-500/30 text-[11px] font-mono-code font-semibold flex items-center gap-1.5 transition-all shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGitHub ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden md:inline">{isSyncingGitHub ? 'SYNCING...' : 'LIVE GITHUB SYNC'}</span>
          </button>

          {/* Audio Synthesizer Toggle */}
          <button
            onClick={handleMuteToggle}
            title={muted ? 'Unmute Audio Sound FX' : 'Mute Audio Sound FX'}
            className={`p-2 rounded-lg border transition-all ${
              muted 
                ? 'bg-slate-900 text-slate-500 border-slate-800' 
                : 'bg-sky-500/20 text-sky-300 border-sky-500/40 glow-cyan'
            }`}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 animate-pulse" />}
          </button>
        </div>

        {/* Mobile Menu Controls */}
        <div className="flex items-center gap-1.5 sm:hidden">
          <button
            onClick={() => {
              playSound('click');
              onSyncGitHub();
            }}
            disabled={isSyncingGitHub}
            className="p-1.5 rounded-lg bg-slate-900 text-sky-400 border border-slate-800"
            title="Live Sync GitHub"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGitHub ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
          <button
            onClick={handleMuteToggle}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-t border-slate-800 p-3 space-y-1.5 animate-fadeIn">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                playSound('click');
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2 rounded-lg text-xs font-mono-code text-left flex items-center gap-2 ${
                activeSection === item.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}

          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <button
              onClick={() => {
                playSound('click');
                onSyncGitHub();
                setMobileMenuOpen(false);
              }}
              disabled={isSyncingGitHub}
              className="w-full py-2 rounded-lg bg-slate-900 text-sky-400 border border-sky-500/30 font-mono-code text-xs font-bold flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGitHub ? 'animate-spin text-emerald-400' : ''}`} />
              <span>LIVE GITHUB SYNC (prottoybiswas01)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
