import React, { useState } from 'react';
import { Shield, KeyRound, Lock, User, AlertCircle, X } from 'lucide-react';
import { playSound } from '../../utils/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'admin' && (password === 'admin123' || password === 'admin')) {
      playSound('admin');
      setError('');
      onLoginSuccess();
    } else {
      playSound('error');
      setError('Invalid Credentials! (Default Username: admin, Password: admin123)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 glow-purple">
        
        <button
          onClick={() => {
            playSound('click');
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center mx-auto shadow-lg glow-purple">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-white">ADMIN SECURITY ACCESS</h2>
          <p className="text-xs font-mono-code text-slate-400">
            Prottoy Biswas Portfolio Management Console
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-xs font-mono-code text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono-code">
          <div>
            <label className="block text-xs text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Admin Username</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Security Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (default: admin123)"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-400"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg glow-purple transition-all"
          >
            <KeyRound className="w-4 h-4" />
            <span>UNLOCK ADMIN DASHBOARD</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono-code text-slate-400 text-center">
          🔑 Default Credentials — Username: <strong className="text-sky-300">admin</strong> | Password: <strong className="text-purple-300">admin123</strong>
        </div>

      </div>
    </div>
  );
};
