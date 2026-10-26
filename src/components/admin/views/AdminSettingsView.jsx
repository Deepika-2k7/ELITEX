import React, { useState } from 'react';
import { 
  Settings, 
  Lock, 
  Mail, 
  ShieldCheck, 
  KeyRound, 
  Server, 
  CheckCircle2, 
  AlertCircle,
  LogOut,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../../../utils/audio';

export default function AdminSettingsView({ admin, onLogout, onToast, onPasswordChanged }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters in length.');
      return;
    }

    try {
      setLoading(true);
      soundFx.playClick();
      const token = localStorage.getItem('elitex_admin_token');

      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update administrator password.');

      soundFx.playSuccess();
      setSuccess('Administrator password successfully rotated and updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      if (data.token) {
        localStorage.setItem('elitex_admin_token', data.token);
      }
      if (data.admin) {
        localStorage.setItem('elitex_admin_profile', JSON.stringify(data.admin));
        if (onPasswordChanged) onPasswordChanged(data.admin);
      }

      if (onToast) onToast('Administrator password updated successfully.');

    } catch (err) {
      soundFx.playError();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <h2 className="text-xl font-display font-black text-navy-900 tracking-tight flex items-center space-x-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          <span>Security & Administrator Settings</span>
        </h2>
        <p className="text-xs text-slate-500 font-tech">
          Manage administrator account credentials, authentication sessions, and system security parameters.
        </p>
      </div>

      {/* Admin Profile Overview Card */}
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-mono font-bold uppercase text-slate-400 tracking-wider mb-4">
          Active Administrator Identity
        </h3>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-navy-900 text-emerald-400 flex items-center justify-center font-bold text-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-navy-900 font-mono">
                {admin?.email || 'eliteadmin@francisxavier.ac.in'}
              </div>
              <div className="text-[11px] text-slate-500 font-tech flex items-center space-x-2">
                <span>Role: <strong className="text-emerald-600 uppercase font-mono">{admin?.role || 'Super Admin'}</strong></span>
                <span>·</span>
                <span>Francis Xavier Engineering College</span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-mono font-bold flex items-center space-x-1.5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span>Terminate Admin Session</span>
          </button>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-mono font-bold uppercase text-slate-400 tracking-wider mb-2">
          Rotate Administrator Password
        </h3>
        <p className="text-xs text-slate-500 font-tech mb-4">
          Once updated, your custom credentials will be permanently preserved and never reset on subsequent application deployments.
        </p>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-tech font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-tech font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-xs font-tech">
          <div>
            <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
              Current Password *
            </label>
            <input 
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="Enter current password"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div>
            <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
              New Password * (Min 8 Characters)
            </label>
            <input 
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter secure new password"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div>
            <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
              Confirm New Password *
            </label>
            <input 
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-slate-900 text-white font-mono font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-navy-900/20 disabled:opacity-50"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>{loading ? 'Rotating Password...' : 'Save & Rotate Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* System Telemetry Specs */}
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-sm text-xs font-tech">
        <h3 className="text-sm font-mono font-bold uppercase text-slate-400 tracking-wider mb-3">
          Architecture & Concurrency Telemetry
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="font-mono text-[10px] uppercase text-slate-400 block mb-0.5">Database Driver</span>
            <span className="font-bold text-navy-900">node-postgres (pg.Pool) with Neon SSL / Local Dual Fallback</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="font-mono text-[10px] uppercase text-slate-400 block mb-0.5">Concurrency Controls</span>
            <span className="font-bold text-navy-900">Row-level locks (FOR UPDATE) & pg_advisory_xact_lock(2026)</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="font-mono text-[10px] uppercase text-slate-400 block mb-0.5">Maximum Team Limit</span>
            <span className="font-bold text-navy-900">50 Teams strictly (ELITEFX001 – ELITEFX050)</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="font-mono text-[10px] uppercase text-slate-400 block mb-0.5">Max Slot Bookings</span>
            <span className="font-bold text-navy-900">50 Participants per slot across 4 screening windows</span>
          </div>
        </div>
      </div>

    </div>
  );
}
