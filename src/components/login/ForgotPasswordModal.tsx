import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, X, ArrowRight, Loader2 } from 'lucide-react';
import { firebaseAuth, formatFirebaseAuthError } from '../../services/firebaseAuth';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onUseDemoLearner?: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
  onUseDemoLearner
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed || !emailTrimmed.includes('@') || !emailTrimmed.includes('.')) {
      setError('Please provide a valid email address format.');
      return;
    }

    setLoading(true);
    try {
      const res = await firebaseAuth.resetPassword(emailTrimmed);
      setSuccess(
        res?.message ||
          `A password reset link has been dispatched to ${emailTrimmed}. Please check your inbox.`
      );
    } catch (err: any) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-[#06142B]/95 border border-cyan-500/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,212,232,0.2)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(0,212,232,0.3)]">
            <Mail className="w-6 h-6 text-[#00D4E8]" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Reset Your <span className="text-[#00D4E8]">Password</span>
          </h3>
          <p className="text-xs text-[#A5B4CC] mt-1.5 max-w-xs mx-auto">
            Enter your email and we'll send you an instant secure verification link to regain access.
          </p>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Feedback */}
        {success ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Reset Link Dispatched</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {success}
              </p>
              <p className="text-[10px] text-cyan-300/80 font-mono">
                💡 Tip: Check your spam folder or use the instant One-Click Demo Learner button below to enter immediately.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {onUseDemoLearner && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onUseDemoLearner();
                  }}
                  className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs transition-colors"
                >
                  ⚡ Instant Demo Learner Access
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A5B4CC] absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-[#030B1A] border border-cyan-500/30 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4E8] focus:ring-1 focus:ring-[#00D4E8]/40 transition-all"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00D4E8] to-[#2563EB] hover:from-[#38e1f2] hover:to-[#3b82f6] text-[#020B1F] font-bold text-xs shadow-[0_0_20px_rgba(0,212,232,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#020B1F]" />
                  <span>Sending Instructions...</span>
                </>
              ) : (
                <>
                  <span>Send Recovery Instructions</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
              >
                Remember your password? <span className="text-[#00D4E8] font-semibold">Sign In</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
