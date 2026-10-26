import React, { useState } from 'react';
import { 
  Users, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  UserCheck,
  LogIn,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Calendar,
  Clock
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export default function AuthPage({ onAuthSuccess, onToast, onOpenAdminLogin }) {
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
  const [muted, setMuted] = useState(soundFx.isMuted());

  const handleAudioToggle = () => {
    const isNowMuted = soundFx.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) soundFx.playBlip();
  };

  const handleSwitchMode = (newMode) => {
    soundFx.playClick();
    setMode(newMode);
    setError('');
    setSuccessMessage('');
  };

  /**
   * Handle Team Registration
   * 1. Team Name
   * 2. Team Leader's Email ID
   * 3. Password
   * 4. Confirm Password
   * 5. REGISTER TEAM button
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const trimmedTeamName = teamName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Validate required fields
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Team registration failed. Please try again.');
      }

      // If pending committee approval, show notice without session entry
      if (data.pendingApproval) {
        soundFx.playSuccess();
        setSuccessMessage(`Registration Submitted! Assigned Team ID: ${data.team.teamId}. Your registration is now pending review and approval by the ELITEX organizing committee before dashboard access is enabled.`);
        if (onToast) onToast(`Team ${data.team.teamId} registered. Pending approval.`);
        return;
      }

      // Success! Persist session and redirect to Student Dashboard
      soundFx.playSuccess();
      localStorage.setItem('elitex_token', data.token);
      localStorage.setItem('elitex_team', JSON.stringify(data.team));

      setSuccessMessage(data.message || `Registration Successful! Assigned Team ID: ${data.team.teamId}`);

      setTimeout(() => {
        onAuthSuccess(data.team);
      }, 600);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Returning User Login
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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid login credentials.');
      }

      soundFx.playSuccess();
      localStorage.setItem('elitex_token', data.token);
      localStorage.setItem('elitex_team', JSON.stringify(data.team));

      setSuccessMessage(data.message || `Welcome back, Team ${data.team.teamName}!`);

      setTimeout(() => {
        onAuthSuccess(data.team);
      }, 500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      
      {/* Clean Unauthenticated Header — NO Public Website Navigation Links */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Official Brand Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-blue-600 rounded-lg transform rotate-6 opacity-80 blur-xs"></div>
              <div className="relative w-9 h-9 bg-navy-900 border border-emerald-400 rounded-lg flex items-center justify-center shadow-md">
                <span className="font-display text-sm font-black text-emerald-400">E</span>
                <span className="font-display text-xs font-black text-blue-400">X</span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-1.5 font-display font-black text-xl tracking-wider text-navy-900">
                <span className="text-emerald-500">ELITE</span>
                <span className="text-blue-600">X</span>
                <span className="text-slate-800 text-lg font-tech">2026</span>
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-500 tracking-wider">
                FXEC × ELITE BATCH 2025-29
              </div>
            </div>
          </div>

          {/* Right Header Status & Audio Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-mono font-bold text-emerald-800">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>7 HOURS SPRINT</span>
            </span>

            <button
              onClick={handleAudioToggle}
              title={muted ? 'Enable SFX' : 'Mute SFX'}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Login / Registration Centerpiece */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-14">
        <div className="w-full max-w-lg">
          
          {/* Top Event Branding Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>OFFICIAL REGISTRATION PORTAL</span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl text-navy-950 tracking-wide">
              ELITEX HACKATHON <span className="text-emerald-500">2026</span>
            </h1>

            <p className="text-xs sm:text-sm font-tech font-bold text-slate-600 mt-1 uppercase tracking-wider">
              “THINK / CODE / INNOVATE” · “IDEAS TODAY. IMPACT TOMORROW.”
            </p>
          </div>

          {/* Card Container */}
          <div className="relative bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 overflow-hidden">
            {/* Top Color Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-600"></div>

            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 mb-5">
              <button
                type="button"
                onClick={() => handleSwitchMode('register')}
                className={`flex-1 py-2.5 text-xs font-tech font-bold uppercase tracking-wider rounded-lg transition-all ${
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
                className={`flex-1 py-2.5 text-xs font-tech font-bold uppercase tracking-wider rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white text-navy-900 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Registered Team Login
              </button>
            </div>

            {/* Strict Eligibility Banner */}
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-950 space-y-1">
              <div className="flex items-center justify-between font-bold text-emerald-800">
                <span>TEAM SIZE: EXACTLY 4 MEMBERS</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px]">MAX 50 TEAMS</span>
              </div>
              <div className="text-emerald-700">
                ELIGIBILITY: ONLY PBL AND ELITE STUDENTS · Only Team Leader registers
              </div>
            </div>

            {/* Error Feedback */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-sans leading-relaxed">{error}</span>
              </div>
            )}

            {/* Success Feedback */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-start space-x-2 animate-in fade-in">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-sans font-medium leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* ---------------- 1. REGISTRATION FORM ---------------- */}
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
                      placeholder="leader@college.edu or gmail.com"
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
                        <span>REGISTERING SQUAD...</span>
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

            {/* ---------------- 2. LOGIN FORM ---------------- */}
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

            {/* Sub-footer note */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Automatic Team ID Allocation</span>
              <span className="text-emerald-700 font-bold">ELITEFX001 – ELITEFX050</span>
            </div>

          </div>

          {/* Quick Schedule Preview Footer */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-mono text-slate-500 text-center">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Phase 1 Prelims: 2 Nov 2026</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Phase 2 Final: 4 Nov 2026 (7h Sprint)</span>
            </div>
          </div>

        </div>
      </main>

      {/* Clean Bottom Footer */}
      <footer className="w-full py-4 border-t border-slate-200/80 bg-white/60 text-center text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between px-6 gap-2">
        <span>ELITEX HACKATHON 2026 · Francis Xavier Engineering College · Organised by Elite Batch 2025-29</span>
        {onOpenAdminLogin && (
          <button 
            onClick={onOpenAdminLogin}
            className="text-slate-400 hover:text-navy-900 transition-colors flex items-center space-x-1 underline underline-offset-4"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Admin Portal</span>
          </button>
        )}
      </footer>

    </div>
  );
}
