import React, { useState } from 'react';
import { 
  Mic, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  KeyRound,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../services/supabase';

interface AuthPageProps {
  onSuccess: () => void;
}

type AuthTab = 'signin' | 'signup' | 'demo';

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { 
    login, 
    signUp, 
    resetPassword, 
    updatePassword, 
    isPasswordRecovery, 
    setIsPasswordRecovery, 
    loginDemo, 
    logout, 
    isLoading 
  } = useAuth();
  
  // Primary 3-Option Navigation Tab
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  
  // Sub-views
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [verificationPendingEmail, setVerificationPendingEmail] = useState<string | null>(null);

  // Form Fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Recovery Fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  
  // Visibility Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback Messages
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const switchTab = (tab: AuthTab) => {
    setActiveTab(tab);
    setError(null);
    setSuccessMessage(null);
    setIsForgotPassword(false);
    setVerificationPendingEmail(null);
  };

  // 1. SIGN IN SUBMIT
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    try {
      await login(cleanEmail, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  // 2. SIGN UP SUBMIT
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanName = displayName.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError('Please enter your full name or nickname.');
      return;
    }

    if (!cleanEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    try {
      const result = await signUp(cleanEmail, password, cleanName);
      if (result.needsEmailVerification) {
        setVerificationPendingEmail(cleanEmail);
        setSuccessMessage(`Account registered successfully! A confirmation link has been sent to ${cleanEmail}.`);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Account registration failed. Please try again.');
    }
  };

  // 3. FORGOT PASSWORD SUBMIT
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    try {
      await resetPassword(cleanEmail);
      setSuccessMessage(`Password recovery link dispatched to ${cleanEmail}. Please check your inbox.`);
    } catch (err: any) {
      setError(err.message || 'Unable to send reset email. Please verify the address.');
    }
  };

  // 4. GUEST DEMO ACCESS
  const handleGuestLaunch = () => {
    setError(null);
    setSuccessMessage(null);
    loginDemo('Candidate Priya');
    onSuccess();
  };

  // 5. UPDATE PASSWORD (PASSWORD_RECOVERY EVENT)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    try {
      await updatePassword(newPassword);
      setPasswordResetSuccess(true);
      setSuccessMessage('Your password has been reset successfully! You can now sign in with your new password.');
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again or request a new reset link.');
    }
  };

  const handleReturnToSignInFromRecovery = async () => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
    await logout();
    setIsPasswordRecovery(false);
    setPasswordResetSuccess(false);
    setNewPassword('');
    setConfirmNewPassword('');
    setError(null);
    setSuccessMessage(null);
    setActiveTab('signin');
  };

  // Dedicated Reset New Password Screen when PASSWORD_RECOVERY event is active
  if (isPasswordRecovery) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-lg bg-navy-950/95 rounded-3xl border border-navy-800 p-6 sm:p-9 shadow-2xl space-y-6 relative overflow-hidden">
          
          {/* Glow accent */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-violet/10 rounded-full blur-3xl pointer-events-none" />

          {/* Recovery Header */}
          <div className="text-center space-y-2 relative z-10">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-violet items-center justify-center shadow-lg shadow-accent-blue/25 mb-1">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Set New Password
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
              Please enter your new password to regain access to your GD Arena account.
            </p>
          </div>

          {/* Dynamic Alerts */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {passwordResetSuccess ? (
            /* Successful Password Update Confirmation */
            <div className="p-6 rounded-2xl bg-navy-900 border border-emerald-500/30 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white">Password Updated Successfully!</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Your account password has been updated. You can now return to the login screen and sign in with your new password.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReturnToSignInFromRecovery}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet hover:opacity-95 text-white font-semibold text-sm shadow-lg shadow-accent-blue/20 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>Return to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* New Password Input Form */
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">New Password (Min. 6 Characters)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-navy-900 border border-navy-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-navy-900 border border-navy-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
                    title={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmNewPassword && newPassword !== confirmNewPassword && (
                  <p className="text-[11px] text-rose-400 font-medium">Passwords do not match yet.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet hover:opacity-95 text-white font-semibold text-sm shadow-lg shadow-accent-blue/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Updating Password...' : 'Save New Password'}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleReturnToSignInFromRecovery}
                  className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Cancel and return to Sign In
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 sm:py-14">
      <div className="w-full max-w-lg bg-navy-950/95 rounded-3xl border border-navy-800 p-6 sm:p-9 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-violet/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-violet items-center justify-center shadow-lg shadow-accent-blue/25 mb-1">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome to GD Arena
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            AI-Powered Voice Group Discussion Practice for Campus Recruitment & Placement Rounds
          </p>
        </div>

        {/* 3 Primary Navigation Tabs */}
        <div className="grid grid-cols-3 p-1 rounded-2xl bg-navy-900 border border-navy-800 text-xs font-semibold relative z-10">
          <button
            type="button"
            onClick={() => switchTab('signin')}
            className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'signin'
                ? 'bg-gradient-to-r from-accent-blue to-accent-violet text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('signup')}
            className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'signup'
                ? 'bg-gradient-to-r from-accent-blue to-accent-violet text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Sign Up</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('demo')}
            className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'demo'
                ? 'bg-gradient-to-r from-accent-blue to-accent-violet text-white shadow-md'
                : 'text-amber-400/90 hover:text-amber-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">1-Click Demo</span>
          </button>
        </div>

        {/* Dynamic Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ------------------- OPTION 1: SIGN IN ------------------- */}
        {activeTab === 'signin' && (
          <div className="space-y-5">
            {!isForgotPassword ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Registered Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@college.edu"
                      required
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-navy-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(true); setError(null); setSuccessMessage(null); }}
                      className="text-xs text-accent-blue hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-navy-900 border border-navy-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet hover:opacity-95 text-white font-semibold text-sm shadow-lg shadow-accent-blue/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Signing In...' : 'Sign In to Dashboard'}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            ) : (
              /* Forgot Password Sub-View */
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-white">Reset Account Password</h3>
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(false); setError(null); setSuccessMessage(null); }}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    Enter your account's email address and we'll dispatch a secure recovery link.
                  </p>
                  <div className="relative pt-1">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-4" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@college.edu"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-navy-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet hover:opacity-95 text-white font-semibold text-sm shadow-lg shadow-accent-blue/20 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Password Reset Link'}
                </button>
              </form>
            )}

            <div className="text-center text-xs text-slate-400 pt-1">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => switchTab('signup')}
                className="text-accent-blue font-semibold hover:underline"
              >
                Sign up free
              </button>
            </div>
          </div>
        )}

        {/* ------------------- OPTION 2: SIGN UP ------------------- */}
        {activeTab === 'signup' && (
          <div className="space-y-5">
            {verificationPendingEmail ? (
              /* Email Verification Required Guidance Screen */
              <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Verify Your Email Address</h3>
                  <p className="text-xs text-slate-400">
                    A confirmation link has been dispatched to:
                  </p>
                  <p className="text-xs font-mono font-semibold text-accent-blue">
                    {verificationPendingEmail}
                  </p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Please click the confirmation link in the email to activate your GD Arena account, then return to sign in.
                </p>
                <button
                  type="button"
                  onClick={() => switchTab('signin')}
                  className="w-full py-2.5 rounded-xl bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" /> Proceed to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      required
                      autoComplete="name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-navy-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@college.edu"
                      required
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-navy-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Password (Min. 6 Characters)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-navy-900 border border-navy-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-navy-900 border border-navy-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[11px] text-rose-400 font-medium">Passwords do not match yet.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet hover:opacity-95 text-white font-semibold text-sm shadow-lg shadow-accent-blue/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 pt-1"
                >
                  {isLoading ? 'Registering...' : 'Create Free Account'}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}

            <div className="text-center text-xs text-slate-400 pt-1">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchTab('signin')}
                className="text-accent-blue font-semibold hover:underline"
              >
                Sign in here
              </button>
            </div>
          </div>
        )}

        {/* ------------------- OPTION 3: CONTINUE AS GUEST / DEMO ------------------- */}
        {activeTab === 'demo' && (
          <div className="space-y-5">
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-850 border border-amber-500/30 text-left space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Instant Evaluation Demo</h3>
                  <p className="text-[11px] text-amber-400 font-medium">No account or database setup required</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Experience full voice discussion practice with pre-configured candidate profiles and instant AI evaluators:
              </p>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>AI Co-participants: <strong>Dr. Aarav Mehta</strong> &amp; <strong>Rohan Verma</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Real-time speech-to-text, visualizer, and turn-taking orchestration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Complete 8-dimension campus placement rubric &amp; radar chart</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGuestLaunch}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Launch 1-Click Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center text-xs text-slate-400">
              Want persistent progress tracking across devices?{' '}
              <button
                type="button"
                onClick={() => switchTab('signup')}
                className="text-accent-blue font-semibold hover:underline"
              >
                Create an account
              </button>
            </div>
          </div>
        )}

        {/* Local mode indicator */}
        {!isSupabaseConfigured && (
          <p className="text-[11px] text-center text-slate-500 pt-1">
            (Running in local mode. 1-Click Demo and local test accounts are active.)
          </p>
        )}

      </div>
    </div>
  );
};
