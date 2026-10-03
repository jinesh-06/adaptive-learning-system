import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthenticationCardProps {
  isRegister: boolean;
  onToggleMode: (register: boolean) => void;
  onSubmit: (formData: {
    email: string;
    password: string;
    name?: string;
    confirmPassword?: string;
    rememberMe: boolean;
  }) => Promise<void>;
  onOAuthLogin: (provider: 'github' | 'google') => Promise<void>;
  onForgotPassword: (email: string) => void;
  loading: boolean;
  oauthLoading: 'github' | 'google' | null;
  error: string | null;
  successMsg: string | null;
  initialEmail?: string;
  isExactRatioContainer?: boolean;
  onQuickDemoLogin?: () => void;
}

export const AuthenticationCard: React.FC<AuthenticationCardProps> = ({
  isRegister,
  onToggleMode,
  onSubmit,
  onOAuthLogin,
  onForgotPassword,
  loading,
  oauthLoading,
  error,
  successMsg,
  initialEmail = '',
  isExactRatioContainer = false,
  onQuickDemoLogin
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      email,
      password,
      name: isRegister ? name : undefined,
      confirmPassword: isRegister ? confirmPassword : undefined,
      rememberMe
    });
  };

  return (
    <div className={`w-full ${isExactRatioContainer ? 'h-full flex flex-col justify-center' : 'max-w-[400px] lg:max-w-[420px] mx-auto'}`}>
      {/* Outer Glow Card Container */}
      <div className={`relative ${isExactRatioContainer ? 'h-full rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 lg:p-4 xl:p-6 overflow-y-auto custom-scrollbar flex flex-col justify-between' : 'rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 lg:p-5 xl:p-7'} bg-[#030c1f]/80 border border-cyan-500/40 backdrop-blur-2xl shadow-[0_0_35px_rgba(0,212,232,0.2),0_15px_40px_rgba(0,0,0,0.65)] hover:border-cyan-400/70 transition-all duration-300`}>
        
        {/* Subtle Top Inner Edge Highlight */}
        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

        {/* Card Header */}
        <div className="mb-3.5 sm:mb-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {isRegister ? (
              <>
                Create <span className="text-[#00D4E8]">Account</span>
              </>
            ) : (
              <>
                Welcome <span className="text-[#00D4E8]">Back</span>
              </>
            )}
          </h2>
          <p className="text-xs text-[#A5B4CC] mt-0.5 sm:mt-1 leading-snug">
            {isRegister
              ? 'Sign up to continue your personalized learning journey'
              : 'Sign in to continue your learning journey'}
          </p>
        </div>

        {/* Error Feedback Banner */}
        {error && (
          <div className="mb-2.5 p-2 sm:p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Success Feedback Banner */}
        {successMsg && (
          <div className="mb-2.5 p-2 sm:p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs flex items-center gap-2 animate-pop-in">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* Main Authentication Form */}
        <form onSubmit={handleFormSubmit} className="space-y-2.5 sm:space-y-3">
          
          {/* Full Name Field (Register Mode Only) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-[#A5B4CC] absolute left-3 top-2.5 sm:top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-[#030B1A]/90 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 sm:py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4E8] focus:ring-1 focus:ring-[#00D4E8]/40 transition-all"
                />
              </div>
            </div>
          )}

          {/* Email Address Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#A5B4CC] absolute left-3 top-2.5 sm:top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-[#030B1A]/90 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 sm:py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4E8] focus:ring-1 focus:ring-[#00D4E8]/40 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-[#A5B4CC] absolute left-3 top-2.5 sm:top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#030B1A]/90 border border-slate-800 rounded-xl pl-9 pr-9 py-2 sm:py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4E8] focus:ring-1 focus:ring-[#00D4E8]/40 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 sm:top-3 text-[#A5B4CC] hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field (Register Mode Only) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#A5B4CC] absolute left-3 top-2.5 sm:top-3 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full bg-[#030B1A]/90 border border-slate-800 rounded-xl pl-9 pr-9 py-2 sm:py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4E8] focus:ring-1 focus:ring-[#00D4E8]/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 sm:top-3 text-[#A5B4CC] hover:text-white transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Remember Me Checkbox & Forgot Password Link */}
          {!isRegister && (
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-cyan-500/40 bg-[#030B1A] text-[#00D4E8] focus:ring-0 focus:ring-offset-0 transition-colors accent-[#00D4E8]"
                />
                <span className="text-xs text-slate-300">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => onForgotPassword(email)}
                className="text-xs text-[#00D4E8] hover:text-cyan-300 transition-colors hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Prominent Primary Submit Button */}
          <button
            type="submit"
            disabled={loading || !!oauthLoading}
            className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#00D4E8] to-[#2563EB] hover:from-[#32e1f2] hover:to-[#3b82f6] text-[#020B1F] font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(0,212,232,0.35)] hover:shadow-[0_0_30px_rgba(0,212,232,0.55)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#020B1F]" />
                <span>{isRegister ? 'Creating Account...' : 'Signing In...'}</span>
              </>
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Divider with "OR" */}
        <div className="relative my-2.5 sm:my-3.5 flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#06142B] px-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest absolute">
            OR
          </span>
        </div>

        {/* Social Authentication Buttons */}
        <div className="space-y-2">
          {/* Continue with GitHub Button */}
          <button
            type="button"
            onClick={() => onOAuthLogin('github')}
            disabled={loading || !!oauthLoading}
            className="w-full py-2 sm:py-2.5 px-3.5 rounded-xl bg-[#030B1A]/80 hover:bg-[#081836] border border-slate-800 hover:border-cyan-500/40 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-2.5 shadow-sm group cursor-pointer disabled:opacity-50"
          >
            {oauthLoading === 'github' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              /* GitHub SVG Logo */
              <svg className="w-3.5 h-3.5 text-white fill-current group-hover:text-cyan-400 transition-colors" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            )}
            <span>{oauthLoading === 'github' ? 'Authenticating with GitHub...' : 'Continue with GitHub'}</span>
          </button>

          {/* Continue with Google Button */}
          <button
            type="button"
            onClick={() => onOAuthLogin('google')}
            disabled={loading || !!oauthLoading}
            className="w-full py-2 sm:py-2.5 px-3.5 rounded-xl bg-[#030B1A]/80 hover:bg-[#081836] border border-slate-800 hover:border-cyan-500/40 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-2.5 shadow-sm group cursor-pointer disabled:opacity-50"
          >
            {oauthLoading === 'google' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              /* Google 4-Color SVG Logo */
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>{oauthLoading === 'google' ? 'Authenticating with Google...' : 'Continue with Google'}</span>
          </button>
        </div>


        {/* Toggle Mode Footer (Sign Up / Sign In) */}
        <div className="mt-3 text-center">
          <p className="text-xs text-slate-400">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => onToggleMode(!isRegister)}
              className="text-[#00D4E8] font-bold hover:underline transition-all ml-1 cursor-pointer"
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
