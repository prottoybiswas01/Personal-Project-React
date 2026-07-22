import React from 'react';
import type { ProfileInfo } from '../../types/portfolio';
import { BookOpen, CheckCircle2, Code2, Layout } from 'lucide-react';
import { playSound } from '../../utils/storage';

interface AboutSectionProps {
  profile: ProfileInfo;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ profile }) => {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Avatar & Quick Info Card */}
        <div className="lg:col-span-5 relative">
          <div className="relative mx-auto max-w-md glass-panel p-6 rounded-3xl border border-sky-500/30 glow-cyan">
            
            <div className="relative h-72 w-full rounded-2xl overflow-hidden border border-slate-700 mb-6">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-sky-500/30 flex items-center gap-2 text-xs font-mono-code text-sky-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{profile.location}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-heading font-extrabold text-white">{profile.name}</h3>
              <p className="text-xs text-sky-400 font-mono-code">{profile.title}</p>
              
              <div className="pt-2 border-t border-slate-800 space-y-2 text-xs text-slate-300 font-mono-code">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Focus:</span>
                  <span className="text-purple-300 font-semibold">{profile.focusArea}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Experience:</span>
                  <span className="text-emerald-400 font-semibold">{profile.yearsExperience}+ Years Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">GitHub:</span>
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
                    @{profile.githubUsername}
                  </a>
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playSound('click')}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-mono-code text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all"
                >
                  <svg className="w-4 h-4 fill-current text-sky-400" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>GitHub Profile</span>
                </a>
              </div>

            </div>

          </div>
        </div>

        {/* Right Column: Detailed Story & Learning Goals */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono-code text-emerald-400">
            <span>BIOGRAPHY & LEARNING ARCHITECTURE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
            Engineering Modern Web Apps with <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-purple-400 to-emerald-400">Clean Design & Code</span>
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed font-sans">
            {profile.bio}
          </p>

          {/* Two Core Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-heading font-bold text-base">
                <Code2 className="w-5 h-5 text-sky-400" />
                <span>MERN Stack Architecture</span>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Building RESTful microservices, stateful React client interfaces, MongoDB schemas, and scalable Node.js backend controllers.
              </p>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-heading font-bold text-base">
                <Layout className="w-5 h-5 text-purple-400" />
                <span>UI/UX & Design Systems</span>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Creating intuitive Figma prototypes, responsive Tailwind components, high-contrast dark modes, and micro-interactions.
              </p>
            </div>
          </div>

          {/* Current Learning & Growth Goals */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-mono-code font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Current Learning & Technical Expansion</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {profile.learningGoals.map((goal, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs font-mono-code text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{goal}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
