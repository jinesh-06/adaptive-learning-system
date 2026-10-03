import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Brain, CheckCircle2, ArrowRight, LogOut, Sparkles } from 'lucide-react';
import { AnimatedBackground } from '../components/login/AnimatedBackground';
import { FeatureHighlights } from '../components/login/FeatureHighlights';
import { AuthenticationCard } from '../components/login/AuthenticationCard';
import { ForgotPasswordModal } from '../components/login/ForgotPasswordModal';

interface LoginPageProps {
  initialMode?: 'login' | 'register';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    login,
    logout,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithGithub,
    sendPasswordReset
  } = useAuth();

  // Mode state: sync with URL or prop
  const queryParams = new URLSearchParams(location.search);
  const modeParam = queryParams.get('mode');
  const isRegisterInitial =
    modeParam === 'register' || initialMode === 'register' || location.pathname === '/register';

  const [isRegister, setIsRegister] = useState<boolean>(isRegisterInitial);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  // Mouse tracking state for 3D parallax effect across background, robot, and floating badges
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });

  // Sync mode with route changes
  useEffect(() => {
    if (location.pathname === '/register') {
      setIsRegister(true);
    } else if (location.pathname === '/login' || location.pathname === '/signin') {
      setIsRegister(false);
    }
  }, [location.pathname]);

  // Track pointer movements with requestAnimationFrame for smooth parallax
  useEffect(() => {
    let rafId: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        setMousePos({ x, y });
        rafId = null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Form submission handler (Email & Password login or registration via Firebase)
  const handleAuthSubmit = async (formData: {
    email: string;
    password: string;
    name?: string;
    confirmPassword?: string;
    rememberMe: boolean;
  }) => {
    setError(null);
    setSuccessMsg(null);

    const emailTrimmed = formData.email.trim();
    if (!emailTrimmed || !emailTrimmed.includes('@') || !emailTrimmed.includes('.')) {
      setError('Please provide a valid email address format.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (isRegister) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }
      if (!formData.name?.trim()) {
        setError('Please provide your full name.');
        return;
      }
    }

    setLoading(true);

    try {
      if (formData.rememberMe) {
        localStorage.setItem('cognitive_saved_email', emailTrimmed);
        localStorage.setItem('cognitive_remember_me', 'true');
      } else {
        localStorage.removeItem('cognitive_saved_email');
        localStorage.removeItem('cognitive_remember_me');
      }

      const redirectPath =
        (location.state as any)?.from?.pathname || (location.state as any)?.from || '/catalog';

      if (isRegister) {
        const res = await signUpWithEmail(formData.name!.trim(), emailTrimmed, formData.password);
        if (!res.success) {
          setError(res.error || 'Failed to create account.');
          return;
        }

        setSuccessMsg(
          res.verificationSent
            ? 'Account created! Verification link sent to your email. Redirecting...'
            : 'Account created successfully! Redirecting...'
        );

        setTimeout(() => {
          navigate(redirectPath);
        }, 700);
      } else {
        const res = await signInWithEmail(emailTrimmed, formData.password);
        if (!res.success) {
          setError(res.error || 'Failed to sign in. Please verify your credentials.');
          return;
        }

        setSuccessMsg('Signed in successfully! Redirecting...');
        setTimeout(() => {
          navigate(redirectPath);
        }, 600);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // OAuth authentication handler (GitHub & Google via Firebase)
  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    setError(null);
    setSuccessMsg(null);
    setOauthLoading(provider);

    try {
      const redirectPath =
        (location.state as any)?.from?.pathname || (location.state as any)?.from || '/catalog';
      const providerLabel = provider === 'github' ? 'GitHub' : 'Google';

      const res = provider === 'google' ? await signInWithGoogle() : await signInWithGithub();

      if (!res.success) {
        setError(res.error || `Failed to authenticate with ${providerLabel}.`);
        return;
      }

      setSuccessMsg(`Authenticated successfully with ${providerLabel}! Welcome back.`);
      setTimeout(() => {
        navigate(redirectPath);
      }, 600);
    } catch (err: any) {
      setError(err?.message || `Failed to authenticate with ${provider}. Please try again.`);
    } finally {
      setOauthLoading(null);
    }
  };

  // Quick Demo Access Login
  const handleDemoLogin = async (role: 'learner' | 'admin') => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const demoEmail = role === 'admin' ? 'admin@cognitive.edu' : 'learner@cognitive.edu';
      const demoPass = 'adaptive123';
      const demoName = role === 'admin' ? 'Curriculum Admin' : 'Alex Turing';

      try {
        const data = await api.login({ email: demoEmail, password: demoPass });
        login(data.token, data.user, data.preferences);
      } catch {
        const data = await api.register({ name: demoName, email: demoEmail, password: demoPass, role });
        login(data.token, data.user);
      }

      setSuccessMsg(`Welcome, ${role === 'admin' ? 'Admin' : 'Learner'}! Redirecting...`);
      setTimeout(() => {
        navigate('/catalog');
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForgotPassword = (email: string) => {
    setForgotPasswordEmail(email);
    setForgotPasswordOpen(true);
  };

  const handleToggleMode = (register: boolean) => {
    setIsRegister(register);
    setError(null);
    setSuccessMsg(null);
    if (register) {
      navigate('/register', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };


// Already Signed In Card View
interface AlreadySignedInCardProps {
  user: any;
  navigate: (path: string) => void;
  logout: () => void;
  setSuccessMsg: (msg: string | null) => void;
  isExactRatioContainer?: boolean;
}

const AlreadySignedInCard: React.FC<AlreadySignedInCardProps> = ({
  user,
  navigate,
  logout,
  setSuccessMsg,
  isExactRatioContainer = false
}) => (
  <div
    className={`w-full ${
      isExactRatioContainer ? 'h-full flex flex-col justify-between p-5 sm:p-6 lg:p-5 xl:p-7' : 'max-w-[400px] lg:max-w-[420px] mx-auto p-6 sm:p-8'
    } rounded-[24px] sm:rounded-[28px] bg-[#030c1f]/80 border border-cyan-500/40 backdrop-blur-2xl shadow-[0_0_35px_rgba(0,212,232,0.2),0_15px_40px_rgba(0,0,0,0.65)] text-center space-y-4 animate-pop-in`}
  >
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center mx-auto text-white shadow-xl shadow-emerald-500/20">
      <CheckCircle2 className="w-7 h-7" />
    </div>
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Already Signed In</h2>
      <p className="text-xs text-[#A5B4CC] mt-1.5 leading-relaxed">
        You are currently authenticated as <span className="text-[#00D4E8] font-semibold">{user.name}</span>
        <br />
        <span className="font-mono text-[11px] text-slate-400">({user.email})</span>
      </p>
    </div>
    <div className="pt-2 flex flex-col gap-2.5">
      <button
        onClick={() => navigate('/catalog')}
        className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#00D4E8] to-[#2563EB] hover:from-[#32e1f2] hover:to-[#3b82f6] text-[#020B1F] font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(0,212,232,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>Continue to Learning Platform</span>
        <ArrowRight className="w-4 h-4" />
      </button>
      <button
        onClick={() => navigate('/dashboard')}
        className="w-full py-2.5 rounded-xl bg-[#030B1A] hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
      >
        View Learner Dashboard
      </button>
      <button
        onClick={() => {
          logout();
          setSuccessMsg('Logged out successfully.');
        }}
        className="w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Sign Out & Switch Account</span>
      </button>
    </div>
  </div>
);

  return (
    <div className="relative min-h-screen w-full bg-[#020B1F] text-[#F8FAFC] selection:bg-[#00D4E8]/30 selection:text-white overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. EDGE-TO-EDGE FULL VIEWPORT BACKGROUND (100vw × 100vh)                  */}
      {/* ========================================================================= */}
      <div
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        style={{
          backgroundImage: `url('/images/login-bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* ========================================================================= */}
      {/* 2. DESKTOP VIEW (>= 1024px): FULL-SCREEN TWO-COLUMN EDGE-TO-EDGE LAYOUT  */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex relative z-10 w-full min-h-screen lg:h-screen flex-col justify-between p-6 xl:px-12 xl:py-7 2xl:px-16 select-none overflow-hidden">
        {/* Top Header: Brand Logo on Left, Tagline Badge on Right */}
        <header className="w-full flex items-center justify-between shrink-0 z-20">
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none pointer-events-auto"
            title="CognitiveLoad Adaptive Learning - Return to Homepage"
            aria-label="CognitiveLoad Homepage"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#061838]/85 border border-[#00D4E8]/60 flex items-center justify-center shadow-[0_0_18px_rgba(0,212,232,0.4)] backdrop-blur-md group-hover:scale-105 group-hover:border-[#00D4E8] transition-all">
              <Brain className="w-5 h-5 text-[#00D4E8]" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white tracking-tight leading-none block">
                Cognitive<span className="text-[#00D4E8]">Load</span>
              </span>
              <span className="block text-[9px] text-[#00D4E8] font-bold tracking-[0.2em] uppercase mt-1">
                ADAPTIVE LEARNING
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#030c1f]/75 border border-cyan-500/30 text-cyan-200 text-xs font-semibold backdrop-blur-md shadow-[0_0_15px_rgba(0,212,232,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-[#00D4E8]" />
            <span>Better Learning ✦ Brighter Future</span>
          </div>
        </header>

        {/* Main Two-Column Content: Left = Hero & Features, Center = Unobstructed Robot Artwork, Right = Auth Card */}
        <main className="w-full flex-1 flex items-center justify-between gap-8 z-20 py-2 min-h-0">
          {/* Left Column: Hero Text + Feature Highlights + Status */}
          <div className="w-full max-w-[360px] xl:max-w-[400px] 2xl:max-w-[430px] flex flex-col justify-between h-full max-h-[620px] pointer-events-auto shrink-0 py-1">
            {/* Hero Headline */}
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D4E8]/10 border border-[#00D4E8]/30 text-[#00D4E8] text-[11px] font-semibold tracking-wide backdrop-blur-sm shadow-[0_0_12px_rgba(0,212,232,0.15)]">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>AI-Powered Adaptive Platform</span>
              </div>
              <h1 className="text-2xl xl:text-3xl 2xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Learn Smarter.<br />
                <span className="bg-gradient-to-r from-[#00D4E8] via-[#38bdf8] to-[#2563EB] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(0,212,232,0.4)]">
                  Build Better.
                </span>
              </h1>
              <p className="text-xs xl:text-sm text-[#A5B4CC] leading-relaxed">
                Personalized coding paths calibrating in real-time to your problem-solving pace and cognitive fatigue.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="my-auto py-2">
              <FeatureHighlights />
            </div>

            {/* Calibrator Status Indicator */}
            <div className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#030c1f]/70 border border-slate-800/80 backdrop-blur-sm text-[11px] text-[#A5B4CC] w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span>AI Fatigue & Mastery Calibration Active</span>
            </div>
          </div>

          {/* Center Space: Open corridor allowing the robot, floating language badges, and glowing road to shine */}
          <div className="hidden lg:block flex-1 min-w-[200px] pointer-events-none" />

          {/* Right Column: Semi-Transparent Glassmorphic Auth Card */}
          <div className="w-full max-w-[390px] xl:max-w-[420px] 2xl:max-w-[440px] flex flex-col justify-center pointer-events-auto shrink-0 z-20">
            {user ? (
              <AlreadySignedInCard
                user={user}
                navigate={navigate}
                logout={logout}
                setSuccessMsg={setSuccessMsg}
                isExactRatioContainer={false}
              />
            ) : (
              <AuthenticationCard
                isRegister={isRegister}
                onToggleMode={handleToggleMode}
                onSubmit={handleAuthSubmit}
                onOAuthLogin={handleOAuthLogin}
                onForgotPassword={handleOpenForgotPassword}
                onQuickDemoLogin={() => handleDemoLogin('learner')}
                loading={loading}
                oauthLoading={oauthLoading}
                error={error}
                successMsg={successMsg}
                initialEmail={localStorage.getItem('cognitive_saved_email') || ''}
                isExactRatioContainer={false}
              />
            )}
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE / TABLET VIEW (< 1024px): RESPONSIVE STACKED LAYOUT             */}
      {/* ========================================================================= */}
      <div className="lg:hidden flex flex-col min-h-screen w-full relative z-10 justify-between overflow-x-hidden">
        {/* Mobile Ambient Tint Overlay */}
        <div className="fixed inset-0 bg-[#020B1F]/75 backdrop-blur-[2px] pointer-events-none z-0" />

        {/* Mobile Header Navigation */}
        <header className="relative z-20 w-full px-5 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B254E] border-2 border-[#00D4E8] flex items-center justify-center shadow-[0_0_15px_rgba(0,212,232,0.4)]">
              <Brain className="w-5 h-5 text-[#00D4E8]" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-white leading-none">
                Cognitive<span className="text-[#00D4E8]">Load</span>
              </span>
              <span className="block text-[9px] text-[#00D4E8] font-bold tracking-[0.18em] uppercase mt-0.5">
                ADAPTIVE LEARNING
              </span>
            </div>
          </Link>
          <span className="hidden sm:inline-block text-[11px] font-semibold text-[#A5B4CC]">
            Better Learning ✦ Brighter Future
          </span>
        </header>

        {/* Mobile Main Content */}
        <main className="relative z-20 flex-1 px-4 py-4 flex flex-col items-center justify-center space-y-6">
          <div className="text-center space-y-1.5 max-w-sm">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Learn Smarter.{' '}
              <span className="bg-gradient-to-r from-[#00D4E8] to-[#2563EB] bg-clip-text text-transparent">
                Build Better.
              </span>
            </h1>
            <p className="text-xs text-[#A5B4CC]">
              AI-powered adaptive learning for programmers. Personalized paths, hands-on practice, and real-world skills.
            </p>
          </div>

          <div className="w-full max-w-md">
            {user ? (
              <AlreadySignedInCard
                user={user}
                navigate={navigate}
                logout={logout}
                setSuccessMsg={setSuccessMsg}
                isExactRatioContainer={false}
              />
            ) : (
              <AuthenticationCard
                isRegister={isRegister}
                onToggleMode={handleToggleMode}
                onSubmit={handleAuthSubmit}
                onOAuthLogin={handleOAuthLogin}
                onForgotPassword={handleOpenForgotPassword}
                onQuickDemoLogin={() => handleDemoLogin('learner')}
                loading={loading}
                oauthLoading={oauthLoading}
                error={error}
                successMsg={successMsg}
                initialEmail={localStorage.getItem('cognitive_saved_email') || ''}
                isExactRatioContainer={false}
              />
            )}
          </div>

          <div className="w-full max-w-md">
            <FeatureHighlights />
          </div>
        </main>

        {/* Mobile Footer */}
        <footer className="relative z-20 w-full py-3 px-4 text-center text-[10px] text-[#A5B4CC]/60 border-t border-slate-900 bg-[#020B1F]/80">
          <p>CognitiveLoad Adaptive Learning Engine</p>
        </footer>
      </div>

      {/* ========================================================================= */}
      {/* 4. FORGOT PASSWORD RECOVERY MODAL                                          */}
      {/* ========================================================================= */}
      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        initialEmail={forgotPasswordEmail}
        onUseDemoLearner={() => handleDemoLogin('learner')}
      />
    </div>
  );
};

export default LoginPage;
