import React, { useState } from 'react';
import { 
  Users, 
  X, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  UserPlus, 
  Building, 
  GraduationCap, 
  Phone, 
  Mail, 
  Hash, 
  Zap, 
  AlertTriangle 
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { parseResponseSafe } from '../../utils/api';
import { DEPARTMENTS } from './TeamDetailsModal';

export default function JoinTeamModal({ isOpen, onClose, onTeamJoined, existingTeam = null }) {
  const [code, setCode] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [teamPreview, setTeamPreview] = useState(null);
  const [previewError, setPreviewError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Student Details
  const [name, setName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0] || 'Computer Science & Engineering');
  const [year, setYear] = useState('3rd Year');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  // Handle 6-Digit Code Change and Auto-Preview
  const handleCodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(val);
    setError('');
    setPreviewError('');

    if (val.length === 6) {
      try {
        setPreviewLoading(true);
        const res = await fetch(`/api/teams/preview-code/${val}`);
        const data = await parseResponseSafe(res);

        if (!res.ok) {
          if (data.isFull || data.error === 'TEAM FULL') {
            setTeamPreview({ isFull: true, teamName: data.teamName, teamId: data.teamId, currentMembers: 4, maxMembers: 4 });
            setPreviewError('TEAM FULL: This squad already contains the maximum limit of 4 members.');
            return;
          }
          throw new Error(data.error || 'Team not found with this 6-digit code.');
        }

        setTeamPreview(data);
        soundFx.playClick();
      } catch (err) {
        setTeamPreview(null);
        setPreviewError(err.message);
      } finally {
        setPreviewLoading(false);
      }
    } else {
      setTeamPreview(null);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (code.length !== 6) {
      setError('Please enter a valid 6-digit numeric Team Code.');
      return;
    }

    if (teamPreview?.isFull) {
      setError('TEAM FULL: This squad has reached the maximum capacity of 4 members.');
      return;
    }

    const trimmedName = name.trim();
    const trimmedRegNo = registerNumber.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();
    const cleanedPhone = phone.trim().replace(/\D/g, '');

    if (!trimmedName || !trimmedRegNo || !normalizedEmail || !cleanedPhone) {
      setError('Please fill in all mandatory student operative fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setError('Please enter a valid College Email ID.');
      return;
    }

    if (cleanedPhone.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    try {
      setSubmitLoading(true);
      soundFx.playClick();

      const res = await fetch('/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamCode: code,
          name: trimmedName,
          registerNumber: trimmedRegNo,
          email: normalizedEmail,
          year,
          department,
          phone: cleanedPhone
        })
      });

      const data = await parseResponseSafe(res);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to join squad.');
      }

      soundFx.playSuccess();
      setSuccess(data.message || `Enlistment confirmed in Team ${data.team?.teamName}!`);

      if (data.team) {
        localStorage.setItem('elitex_team', JSON.stringify(data.team));
        if (onTeamJoined) onTeamJoined(data.team);
      }

      setTimeout(() => {
        onClose();
      }, 1400);

    } catch (err) {
      soundFx.playError();
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#0e1630] via-[#0a1024] to-[#060914] border border-blue-500/40 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.2)] text-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.25)]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white tracking-wide">
                JOIN EXISTING SQUAD
              </h2>
              <p className="text-xs font-mono text-blue-400">
                ENTER 6-DIGIT CODE PROVIDED BY YOUR TEAM LEADER
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Existing Team Notice (if already in team) */}
          {existingTeam && (
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs font-mono text-cyan-300 space-y-1">
              <div className="flex items-center space-x-2 font-bold text-cyan-200">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Current Active Squad: {existingTeam.teamName} ({existingTeam.teamId})</span>
              </div>
              <p className="text-slate-400">
                Students are strictly restricted to 1 squad. Joining another squad will transfer your operative profile if permitted.
              </p>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleJoinTeam} className="space-y-6">

            {/* STEP 1: 6-Digit Team Code Input */}
            <div className="space-y-2.5">
              <label className="text-xs font-mono font-bold text-blue-300 uppercase tracking-wider flex items-center justify-between">
                <span>1. Enter 6-Digit Team Code *</span>
                {code.length > 0 && (
                  <span className="text-[11px] font-mono text-slate-400">{code.length}/6 Digits</span>
                )}
              </label>

              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="e.g. 839210"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border-2 border-blue-500/50 text-white placeholder-slate-600 text-2xl font-mono font-bold tracking-widest text-center focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                />
                {previewLoading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-cyan-400 animate-pulse">
                    Scanning...
                  </div>
                )}
              </div>

              {previewError && (
                <p className="text-xs font-mono text-amber-400 flex items-center gap-1.5 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{previewError}</span>
                </p>
              )}

              {/* LIVE TEAM PREVIEW CARD */}
              {teamPreview && !previewError && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-400/40 text-xs font-mono space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest block">TARGET SQUAD</span>
                      <h4 className="text-sm font-bold text-white font-display">{teamPreview.teamName}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">SQUAD ID</span>
                      <span className="font-bold text-cyan-300">{teamPreview.teamId}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">Leader: <strong className="text-white">{teamPreview.leaderName}</strong></span>
                    <span className={`px-2 py-0.5 rounded font-bold ${teamPreview.isFull ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                      {teamPreview.isFull ? 'TEAM FULL (4/4)' : `${teamPreview.currentMembers}/4 MEMBERS (${teamPreview.remainingSlots} slot${teamPreview.remainingSlots === 1 ? '' : 's'} open)`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: Operative Profile (Student Details) */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                <Users className="w-4 h-4" />
                <span>2. Your Operative Credentials</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Connor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Register Number */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Register Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 950721104060"
                    value={registerNumber}
                    onChange={(e) => setRegisterNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">College Email ID *</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@francisxavier.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">10-Digit Phone *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Department *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Year *</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading || teamPreview?.isFull}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white text-xs font-tech font-bold uppercase tracking-wider flex items-center space-x-2 shadow-[0_0_20px_rgba(59,130,246,0.35)] active:scale-95 transition-all disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{submitLoading ? 'Enlisting in Squad...' : 'ENLIST IN SQUAD'}</span>
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}
