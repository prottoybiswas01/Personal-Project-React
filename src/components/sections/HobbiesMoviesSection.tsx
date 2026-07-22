import React, { useState } from 'react';
import type { Hobby, Movie } from '../../types/portfolio';
import { Film, Palette, Star, Sparkles } from 'lucide-react';
import { playSound } from '../../utils/storage';

interface HobbiesMoviesSectionProps {
  hobbies: Hobby[];
  movies: Movie[];
}

export const HobbiesMoviesSection: React.FC<HobbiesMoviesSectionProps> = ({
  hobbies,
  movies,
}) => {
  const [activeTab, setActiveTab] = useState<'hobbies' | 'movies'>('movies');

  return (
    <section id="hobbies" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-xs font-mono-code text-pink-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PERSONAL PASSIONS & MEDIA INSPIRATION</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
          Creative Hobbies & <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400">Sci-Fi Cinema</span>
        </h2>
        <p className="text-slate-400 text-sm font-sans">
          The aesthetic universe behind Prottoy Biswas's design thinking—from cyberpunk movie visuals to UI prototyping & workspace setup.
        </p>
      </div>

      {/* Toggle View Tabs */}
      <div className="flex justify-center mb-10">
        <div className="p-1 rounded-2xl glass-panel border border-slate-800 flex gap-1">
          <button
            onClick={() => {
              playSound('click');
              setActiveTab('movies');
            }}
            className={`px-6 py-2.5 rounded-xl text-xs font-mono-code transition-all flex items-center gap-2 ${
              activeTab === 'movies'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg glow-purple'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Favorite Movies ({movies.length})</span>
          </button>
          <button
            onClick={() => {
              playSound('click');
              setActiveTab('hobbies');
            }}
            className={`px-6 py-2.5 rounded-xl text-xs font-mono-code transition-all flex items-center gap-2 ${
              activeTab === 'hobbies'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold shadow-lg glow-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Hobbies & Passions ({hobbies.length})</span>
          </button>
        </div>
      </div>

      {/* Movies Grid View */}
      {activeTab === 'movies' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="group glass-panel rounded-2xl border border-slate-800 hover:border-pink-500/40 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-64 w-full overflow-hidden bg-slate-950">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/90 border border-amber-500/40 text-amber-300 font-mono-code text-xs flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{movie.rating}/10</span>
                  </div>
                </div>

                <div className="p-6 space-y-2">
                  <span className="text-[10px] font-mono-code text-pink-400 uppercase tracking-wider">
                    {movie.genre}
                  </span>
                  <h3 className="text-xl font-heading font-bold text-white group-hover:text-pink-300 transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-sans pt-1">
                    "{movie.review}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hobbies Grid View */}
      {activeTab === 'hobbies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hobbies.map((hobby) => (
            <div
              key={hobby.id}
              className="p-6 glass-panel rounded-2xl border border-slate-800 hover:border-sky-500/40 transition-all duration-300 space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono-code text-slate-500 uppercase tracking-wider block">
                {hobby.category}
              </span>
              <h3 className="text-base font-heading font-bold text-white">{hobby.title}</h3>
              <p className="text-slate-400 text-xs font-sans leading-relaxed">
                {hobby.description}
              </p>
            </div>
          ))}
        </div>
      )}

    </section>
  );
};
