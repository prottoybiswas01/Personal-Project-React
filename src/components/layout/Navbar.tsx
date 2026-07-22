import React, { useState } from 'react';
import { Volume2, VolumeX, Shield, Box, Menu, X } from 'lucide-react';
import { isAudioMuted, toggleAudioMute, playSound } from '../../utils/storage';

interface NavbarProps {
  onOpenAdmin: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAdmin,
  activeSection,
  onNavigate
}) => {
  const [muted, setMuted] = useState(isAudioMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMuteToggle = () => {
    const nextMuted = toggleAudioMute();
    setMuted(nextMuted);
    if (!nextMuted) playSound('click');
  };

  const navItems = [
    { id: 'hero', label: '3D City World', icon: '🌐' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'skills', label: 'Tech Stack', icon: '🛠' },
    { id: 'about', label: 'About Me', icon: '👨‍💻' },
    { id: 'hobbies', label: 'Hobbies & Movies', icon: '🎨' },
    { id: 'contact', label: 'Contact', icon: '✉️' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-sky-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => {
            playSound('click');
            onNavigate('hero');
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 p-0.5 glow-cyan transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-sky-400">
              <Box className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-lg text-white tracking-wide">
                PROTTOY BISWAS
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono-code rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                3D PORTFOLIO
              </span>
            </div>
            <span className="text-[11px] font-mono-code text-slate-400 block -mt-0.5">
              MERN Stack Developer & UI/UX Designer
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 glass-panel px-3 py-1.5 rounded-2xl border border-slate-800">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                playSound('click');
                onNavigate(item.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono-code transition-all flex items-center gap-1.5 ${
                activeSection === item.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 glow-cyan'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right Header Controls: Audio Toggle & Admin Button */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Audio Synthesizer Toggle */}
          <button
            onClick={handleMuteToggle}
            title={muted ? 'Unmute Audio Sound FX' : 'Mute Audio Sound FX'}
            className={`p-2.5 rounded-xl border transition-all ${
              muted 
                ? 'bg-slate-900 text-slate-500 border-slate-800' 
                : 'bg-sky-500/20 text-sky-300 border-sky-500/40 glow-cyan'
            }`}
          >
            {muted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5 animate-pulse" />}
          </button>

          {/* Admin Panel Launch Button */}
          <button
            onClick={() => {
              playSound('admin');
              onOpenAdmin();
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white font-mono-code text-xs font-bold flex items-center gap-2 shadow-lg glow-purple transition-all border border-purple-400/30"
          >
            <Shield className="w-4 h-4 text-sky-300" />
            <span>ADMIN PANEL (/admin)</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={handleMuteToggle}
            className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-t border-slate-800 p-4 space-y-2 animate-fadeIn">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                playSound('click');
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-mono-code text-left flex items-center gap-2 ${
                activeSection === item.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                playSound('admin');
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-sky-500 text-white font-mono-code text-xs font-bold flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>ACCESS ADMIN PANEL (/admin)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
