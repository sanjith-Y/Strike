import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, ShieldCheck, Zap, AlertCircle, ArrowRight } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, signInAsGuest, isSupabaseConfigured } from '../services/supabase';
import { UserProfile } from '../types';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onAuthSuccess: (user: UserProfile) => void;
  onBack: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onAuthSuccess,
  onBack,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [guestUsername, setGuestUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (mode === 'register') {
      if (!username || username.trim().length < 3) {
        return setError('Username must be at least 3 characters.');
      }
      if (password !== confirmPassword) {
        return setError('Passwords do not match.');
      }
      if (password.length < 6) {
        return setError('Password must be at least 6 characters.');
      }
      if (!acceptTerms) {
        return setError('Please accept the Terms of Service to continue.');
      }
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        await signUpWithEmail(email, password, username);
        setSuccessMessage('Registration successful! Please check your email to confirm your account, or sign in.');
        setMode('login');
      } else {
        const { user } = await signInWithEmail(email, password);
        if (user) {
          onAuthSuccess({
            id: user.id,
            email: user.email,
            username: user.user_metadata?.username || username || email.split('@')[0],
            isGuest: false,
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestPlay = () => {
    const user = signInAsGuest(guestUsername);
    onAuthSuccess(user);
  };

  return (
    <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-4">
      {/* Background radial glow */}
      <div className="absolute w-[400px] h-[400px] bg-arena-neon/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="glass-panel-neon p-6 md:p-8 rounded-3xl max-w-md w-full border border-arena-neon/40 relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-neon">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-orbitron font-extrabold text-white">
            {mode === 'login' ? 'PILOT SIGN IN' : 'NEW PILOT REGISTRATION'}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            {mode === 'login' ? 'Access your stats and join the frontline' : 'Create your callsign and enter the arena'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-orbitron font-bold rounded-lg transition-all ${
              mode === 'login' ? 'bg-arena-neon/20 text-arena-neon border border-arena-neon/40 shadow-neon' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-orbitron font-bold rounded-lg transition-all ${
              mode === 'register' ? 'bg-arena-neon/20 text-arena-neon border border-arena-neon/40 shadow-neon' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs">
            {successMessage}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-orbitron text-slate-300 mb-1">Callsign / Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ApexPredator"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-arena-neon focus:ring-1 focus:ring-arena-neon transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-orbitron text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pilot@arenastrike.io"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-arena-neon focus:ring-1 focus:ring-arena-neon transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-orbitron text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-arena-neon focus:ring-1 focus:ring-arena-neon transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-orbitron text-slate-300 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-arena-neon focus:ring-1 focus:ring-arena-neon transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-arena-neon focus:ring-arena-neon"
                />
                <label htmlFor="terms" className="text-xs text-slate-400">
                  I agree to the <span className="text-arena-neon cursor-pointer">Combat Rules</span> & Terms
                </label>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-arena-accent to-arena-neon hover:opacity-95 text-black font-orbitron font-bold text-sm shadow-neon active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
            ) : (
              <>
                <span>{mode === 'login' ? 'DEPLOY TO LOBBY' : 'CREATE ACCOUNT'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Guest / Dev Quick Play Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
          <span className="relative bg-[#0f141f] px-3 text-[11px] text-slate-500 font-mono uppercase tracking-wider">
            OR INSTANT PILOT PLAY
          </span>
        </div>

        {/* Quick Play as Guest */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={guestUsername}
              onChange={(e) => setGuestUsername(e.target.value)}
              placeholder="Guest Callsign (optional)"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-slate-600"
            />
            <button
              type="button"
              onClick={handleGuestPlay}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-orbitron font-semibold text-xs border border-slate-700 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-arena-neon" />
              <span>Quick Play</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 text-center">
            Zero setup required. Perfect for testing multiplayer across multiple browser windows.
          </p>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            &larr; Return to main page
          </button>
        </div>
      </div>
    </div>
  );
};
