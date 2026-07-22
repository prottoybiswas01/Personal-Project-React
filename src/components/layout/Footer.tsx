import React from 'react';
import { Mail, MapPin } from 'lucide-react';
import type { ProfileInfo } from '../../types/portfolio';
import { playSound } from '../../utils/storage';

interface FooterProps {
  profile: ProfileInfo;
}

export const Footer: React.FC<FooterProps> = ({ profile }) => {
  return (
    <footer className="relative z-10 bg-slate-950 border-t border-slate-800 text-slate-400 font-mono-code pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-900">
          {/* Column 1: Profile & Bio */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-lg font-heading font-extrabold text-white">{profile.name}</h3>
            </div>
            <p className="text-xs text-sky-400">{profile.title}</p>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">{profile.bio}</p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{profile.location}</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">System Navigation</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><a href="#hero" className="hover:text-sky-300 transition-colors">🌐 3D City Skyscraper Matrix</a></li>
              <li><a href="#projects" className="hover:text-sky-300 transition-colors">🚀 Full-Stack Projects</a></li>
              <li><a href="#skills" className="hover:text-sky-300 transition-colors">🛠 Skills & Tech Stack</a></li>
              <li><a href="#about" className="hover:text-sky-300 transition-colors">👨‍💻 About Prottoy</a></li>
              <li><a href="#hobbies" className="hover:text-sky-300 transition-colors">🎨 UI/UX & Media Interests</a></li>
            </ul>
          </div>

          {/* Column 3: Social & Admin Trigger */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Connect & Admin Access</h4>
            <div className="flex items-center gap-2">
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click')}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all"
                title="GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click')}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all"
                title="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a
                href={`mailto:${profile.email}`}
                onClick={() => playSound('click')}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all"
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Prottoy Biswas. All Rights Reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with 3D WebGL, React & MERN Architecture</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
