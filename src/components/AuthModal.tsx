import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, Lock, Mail, User, Sparkles, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const data = await api.register({ name, email, password });
        login(data.token, data.user);
        onClose();
      } else {
        const data = await api.login({ email, password });
        login(data.token, data.user, data.preferences);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'learner' | 'admin') => {
    setError(null);
    setLoading(true);
    try {
      const demoEmail = role === 'admin' ? 'admin@cognitive.edu' : 'learner@cognitive.edu';
      const demoPass = 'adaptive123';
      const demoName = role === 'admin' ? 'Curriculum Admin' : 'Alex Turing';

      // Try login or register if not existing
      try {
        const data = await api.login({ email: demoEmail, password: demoPass });
        login(data.token, data.user, data.preferences);
        onClose();
      } catch {
        const data = await api.register({ name: demoName, email: demoEmail, password: demoPass, role });
        login(data.token, data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/20">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">
            {isRegister ? 'Create Your Learning Account' : 'Welcome to CognitiveLoad Engine'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Personalized programming instruction calibrated to your mental model
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ada Lovelace"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="learner@university.edu"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Processing...' : isRegister ? 'Register & Begin' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Options */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <p className="text-[11px] text-slate-400 text-center mb-2.5">
            Instant One-Click Demo Access:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('learner')}
              disabled={loading}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Demo Learner</span>
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-400 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            {isRegister
              ? 'Already have an account? Sign in'
              : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
};
