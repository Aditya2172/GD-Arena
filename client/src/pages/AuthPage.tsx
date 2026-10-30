import React, { useState } from 'react';
import { Mic, Lock, Mail, User as UserIcon, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../services/supabase';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, signUp, loginDemo, isLoading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (!isLoginMode && !displayName) {
      setError('Please provide your name or display nickname.');
      return;
    }

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await signUp(email, password, displayName);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleDemoLogin = () => {
    loginDemo('Candidate Priya');
    onSuccess();
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-navy-950/90 rounded-3xl border border-navy-800 p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-blue/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-violet items-center justify-center shadow-lg shadow-accent-blue/20 mb-2">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isLoginMode ? 'Welcome Back to GD Arena' : 'Create Your Student Account'}
          </h2>
          <p className="text-xs text-slate-400">
            {isLoginMode 
              ? 'Sign in to access your practice sessions and progress reports' 
              : 'Join thousands of students mastering group discussion skills'}
          </p>
        </div>

        {/* Demo Mode Instant Banner */}
        <div className="p-3.5 rounded-2xl bg-navy-900 border border-navy-750 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Instant Evaluation Mode:</span>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <span>1-Click Demo</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLoginMode && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Your Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-navy-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-navy-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-navy-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet hover:opacity-95 text-white font-semibold text-sm shadow-lg shadow-accent-blue/20 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : isLoginMode ? 'Sign In to Dashboard' : 'Create Free Account'}
          </button>
        </form>

        {/* Toggle Login / Register */}
        <div className="text-center text-xs text-slate-400">
          {isLoginMode ? (
            <p>
              Don't have an account yet?{' '}
              <button
                onClick={() => { setIsLoginMode(false); setError(null); }}
                className="text-accent-blue font-semibold hover:underline"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => { setIsLoginMode(true); setError(null); }}
                className="text-accent-blue font-semibold hover:underline"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>

        {!isSupabaseConfigured && (
          <p className="text-[11px] text-center text-slate-500 pt-2">
            (Running in local mode. Demo login is active and ready to test.)
          </p>
        )}

      </div>
    </div>
  );
};
