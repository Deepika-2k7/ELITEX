import React, { useState } from 'react';
import { 
  Users, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  X, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Sparkles,
  UserCheck,
  LogIn
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { parseResponseSafe } from '../../utils/api';

export default function TeamAuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('register'); // 'register' or 'login'

  // Registration Form State (Exact order: 1. Team Name, 2. Email, 3. Password, 4. Confirm Password)
  const [teamName, setTeamName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  // Reset form when switching tabs
  const handleSwitchMode = (newMode) => {
    soundFx.playClick();
    setMode(newMode);
    setError('');
    setSuccessMessage('');
  };

  /**
   * Handle Team Registration
   * Form fields in exact order:
   * 1. Team Name
   * 2. Team Leader's Email ID
   * 3. Password
   * 4. Confirm Password
   * 5. Register button
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const trimmedTeamName = teamName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Validate all required fields
    if (!trimmedTeamName || !normalizedEmail || !password || !confirmPassword) {
      setError('Please fill in all mandatory registration fields.');
      return;
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    // 3. Ensure both passwords match
    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    // 4. Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      soundFx.playClick();

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: trimmedTeamName,
          email: normalizedEmail,
          password,
          confirmPassword
        })
      });

      const data = await parseResponseSafe(res);

      if (!res.ok) {
        throw new Error(data.error || 'Team registration failed. Please try again.');
      }

      // Registration successful! Store session and navigate to Dashboard
      soundFx.playSuccess();
      localStorage.setItem('elitex_token', data.token);
      localStorage.setItem('elitex_team', JSON.stringify(data.team));

      setSuccessMessage(data.message || `Registration Successful! Assigned Team ID: ${data.team.teamId}`);

      setTimeout(() => {
        onAuthSuccess(data.team);
        onClose();
      }, 700);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Login for returning users
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!loginIdentifier.trim() || !loginPassword) {
      setError('Please enter your Team ID / Email and Password.');
      return;
    }

    try {
      setLoading(true);
      soundFx.playClick();

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password: loginPassword
        })
      });

      const data = await parseResponseSafe(res);
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials.');
      }

      soundFx.playSuccess();
      localStorage.setItem('elitex_token', data.token);
      localStorage.setItem('elitex_team', JSON.stringify(data.team));

      setSuccessMessage(data.message || `Welcome back, Team ${data.team.teamName}!`);

      setTimeout(() => {
        onAuthSuccess(data.team);
        onClose();
      }, 600);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Top Decorative Color Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-600"></div>

        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5 pt-1">
          <div className="inline-flex items-center space-x-1 font-display font-black text-2xl tracking-wider text-navy-900">
            <span className="text-emerald-500">ELITE</span>
            <span className="text-blue-600">X</span>
            <span className="text-slate-800 text-xl font-tech ml-1">2026</span>
          </div>

          <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mt-1">
            FXEC × ELITE BATCH 2025-29
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mt-4 flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`flex-1 py-2 text-xs font-tech font-bold uppercase tracking-wider rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-navy-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Team Registration
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`flex-1 py-2 text-xs font-tech font-bold uppercase tracking-wider rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-navy-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Registered Team Login
            </button>
          </div>
        </div>

        {/* Strict Eligibility & Team Size Rules Banner */}
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-950 space-y-1">
          <div className="flex items-center justify-between font-bold text-emerald-800">
            <span>TEAM SIZE: EXACTLY 4 MEMBERS</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px]">MAX 50 TEAMS</span>
          </div>
          <div className="text-emerald-700">
            ELIGIBILITY: ONLY PBL AND ELITE STUDENTS · Only Team Leader registers
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-sans leading-relaxed">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-start space-x-2 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-sans font-medium leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* ---------------- REGISTRATION FORM ---------------- */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            {/* 1. Team Name */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                1. Team Name *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. CyberVanguard"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* 2. Team Leader's Email ID */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                2. Team Leader's Email ID *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="leader@college.edu or personal email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* 3. Password */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                3. Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 4. Confirm Password */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                4. Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 5. Register Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-tech font-bold text-sm tracking-wider uppercase flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>REGISTERING TEAM...</span>
                  </div>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>REGISTER TEAM</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ---------------- LOGIN FORM ---------------- */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Team ID or Leader Email ID *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. ELITEFX001 or leader@college.edu"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-tech font-bold text-sm tracking-wider uppercase flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>AUTHENTICATING...</span>
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>AUTHENTICATE & ENTER DASHBOARD</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Modal Footer Note */}
        <div className="mt-6 pt-4 border-t border-slate-200 text-center">
          <p className="text-[11px] font-mono text-slate-500">
            ELITEX HACKATHON 2026 · Francis Xavier Engineering College
          </p>
        </div>

      </div>
    </div>
  );
}
