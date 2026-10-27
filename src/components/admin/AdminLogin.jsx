import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Cpu, 
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { parseResponseSafe } from '../../utils/api';

export default function AdminLogin({ onAdminLoginSuccess, onSwitchToStudent, onToast }) {
  const [email, setEmail] = useState('eliteadmin@francisxavier.ac.in');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Administrator email and password are required.');
      return;
    }

    try {
      setLoading(true);
      soundFx.playClick();

      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password
        })
      });

      const data = await parseResponseSafe(res);

      if (!res.ok) {
        throw new Error(data.error || 'Administrator authentication failed.');
      }

      soundFx.playSuccess();
      localStorage.setItem('elitex_admin_token', data.token);
      localStorage.setItem('elitex_admin_profile', JSON.stringify(data.admin));

      if (onToast) {
        onToast(`Admin authenticated: ${data.admin.email}`);
      }

      onAdminLoginSuccess(data.admin, data.token);

    } catch (err) {
      soundFx.playError();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col justify-between items-center px-4 py-8">
      
      {/* Top Bar Switcher */}
      <div className="w-full max-w-md flex justify-between items-center mb-4">
        <button
          onClick={onSwitchToStudent}
          className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-slate-500 hover:text-navy-900 bg-white/80 hover:bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Student Portal</span>
        </button>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-navy-900 text-emerald-400 text-[10px] font-mono tracking-wider border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>ADMIN GATEWAY ACTIVE</span>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-2xl p-6 sm:p-8 animate-in fade-in duration-300">
        
        {/* Emblem & Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-navy-900 to-slate-800 text-emerald-400 shadow-lg border border-emerald-400/30 mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500 mb-1">
            FXEC × ELITE BATCH 2025-29
          </div>
          <h1 className="text-2xl font-display font-black text-navy-900 tracking-tight">
            ELITEX <span className="text-emerald-500">ADMIN</span> COMMAND
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-tech">
            Restricted access portal for authorized hackathon coordinators and faculty evaluators.
          </p>
        </div>

        {/* Security Notice Pill */}
        <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-mono text-slate-600 flex items-start space-x-2.5">
          <KeyRound className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-navy-900">Authorized Root:</span> eliteadmin@francisxavier.ac.in
            <div className="text-[10px] text-slate-400 mt-0.5">
              Requires immediate mandatory password rotation on first authentication session.
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="font-tech font-bold leading-relaxed">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Admin Identity Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="eliteadmin@francisxavier.ac.in"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm font-tech text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Administrator Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm font-tech text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-navy-900 via-slate-900 to-navy-900 hover:from-slate-900 hover:to-black text-white font-display font-bold text-sm tracking-wide shadow-lg shadow-navy-900/20 hover:shadow-xl hover:shadow-navy-900/30 flex items-center justify-center space-x-2 border border-emerald-500/30 transition-all duration-200 disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>Verifying Credentials...</span>
              </span>
            ) : (
              <>
                <span>ACCESS ADMIN CONSOLE</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </>
            )}
          </button>

        </form>

      </div>

      {/* Footer */}
      <div className="text-center text-xs font-mono text-slate-400 mt-6">
        ELITEX HACKATHON 2026 · Francis Xavier Engineering College
      </div>

    </div>
  );
}
