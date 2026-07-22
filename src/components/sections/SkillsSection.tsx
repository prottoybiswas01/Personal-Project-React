import React from 'react';
import type { Skill } from '../../types/portfolio';
import { SkillsOrbCanvas } from '../3d/SkillsOrbCanvas';
import { Cpu } from 'lucide-react';

interface SkillsSectionProps {
  skills: Skill[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  return (
    <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-mono-code text-purple-300">
          <Cpu className="w-3.5 h-3.5" />
          <span>TECHNICAL MATRIX & SKILLS MATRIX</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
          Technologies & <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-sky-400">Design Arsenal</span>
        </h2>
        <p className="text-slate-400 text-sm font-sans">
          Interactive 3D skill node visualization. Rotate the 3D globe or filter skills by development, UI/UX design, database architecture, and tools.
        </p>
      </div>

      <SkillsOrbCanvas skills={skills} />
    </section>
  );
};
