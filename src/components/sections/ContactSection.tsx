import React, { useState } from 'react';
import { Mail, Send, Terminal, CheckCircle2, MessageSquare, MapPin } from 'lucide-react';
import type { ProfileInfo, ContactMessage } from '../../types/portfolio';
import { playSound } from '../../utils/storage';

interface ContactSectionProps {
  profile: ProfileInfo;
  onSendMessage: (message: Omit<ContactMessage, 'id' | 'date' | 'read'>) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ profile, onSendMessage }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    playSound('click');
    onSendMessage(formData);

    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });

    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono-code text-emerald-400">
          <Terminal className="w-3.5 h-3.5" />
          <span>CYBERNETIC TRANSMISSION TERMINAL</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
          Get in Touch with <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-sky-400 to-purple-400">{profile.name}</span>
        </h2>
        <p className="text-slate-400 text-sm font-sans">
          Have a project inquiry, MERN opportunity, or UI/UX design collaboration? Send a direct transmission below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Direct Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 glass-panel rounded-3xl border border-slate-800 space-y-6">
            <h3 className="text-xl font-heading font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sky-400" />
              <span>Contact Channels</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3 text-xs font-mono-code">
                <div className="p-2.5 rounded-xl bg-slate-900 text-sky-400 border border-slate-800 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Email Address</span>
                  <a href={`mailto:${profile.email}`} className="text-slate-200 hover:text-sky-300 font-semibold">
                    {profile.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs font-mono-code">
                <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-400 border border-slate-800 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Current Location</span>
                  <span className="text-slate-200 font-semibold">{profile.location}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs font-mono-code">
                <div className="p-2.5 rounded-xl bg-slate-900 text-purple-400 border border-slate-800 shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">GitHub Profile</span>
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-purple-300 font-semibold">
                    github.com/{profile.githubUsername}
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] font-mono-code text-slate-400">
              ⚡ Instant response guaranteed. Messages delivered directly to Prottoy's Admin Terminal.
            </div>
          </div>
        </div>

        {/* Right Column: Terminal Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 glass-panel rounded-3xl border border-sky-500/30 glow-cyan relative overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs font-mono-code text-slate-400 ml-2">transmission_terminal.sh</span>
              </div>
              <span className="text-[10px] font-mono-code text-emerald-400">STATUS: ONLINE</span>
            </div>

            {submitted ? (
              <div className="py-12 text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg glow-cyan">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-white">Transmission Sent!</h3>
                <p className="text-sm font-mono-code text-slate-300 max-w-md mx-auto">
                  Thank you! Your message has been saved to Prottoy's Admin Inbox.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 font-mono-code">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. john@company.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. MERN Project / UI Design Collaboration"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Transmission Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write your message here..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-sky-500 to-purple-600 hover:from-emerald-400 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg glow-cyan transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>TRANSMIT MESSAGE NOW</span>
                </button>

              </form>
            )}

          </div>
        </div>

      </div>

    </section>
  );
};
