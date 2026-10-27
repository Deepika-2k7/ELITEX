import React, { useState } from 'react';
import { 
  Users, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  Check, 
  Lock, 
  Mail, 
  Phone, 
  GraduationCap, 
  Building, 
  Hash, 
  ArrowRight,
  AlertCircle,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { parseResponseSafe } from '../../utils/api';
import { DEPARTMENTS } from './TeamDetailsModal';

export default function CreateTeamModal({ isOpen, onClose, onTeamCreated, currentEmail = '' }) {
  const [step, setStep] = useState('form'); // 'form' or 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [createdTeamData, setCreatedTeamData] = useState(null);

  // Form Fields
  const [teamName, setTeamName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState(currentEmail || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Leader Member Details
  const [leaderName, setLeaderName] = useState('');
  const [leaderRegisterNumber, setLeaderRegisterNumber] = useState('');
  const [leaderDepartment, setLeaderDepartment] = useState(DEPARTMENTS[0] || 'Computer Science & Engineering');
  const [leaderYear, setLeaderYear] = useState('3rd Year');
  const [leaderPhone, setLeaderPhone] = useState('');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (!createdTeamData?.teamCode) return;
    navigator.clipboard.writeText(createdTeamData.teamCode);
    setCopied(true);
    soundFx.playSuccess();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedTeamName = teamName.trim();
    const normalizedEmail = leaderEmail.trim().toLowerCase();
    const trimmedLeaderName = leaderName.trim();
    const trimmedRegNo = leaderRegisterNumber.trim().toUpperCase();
    const cleanedPhone = leaderPhone.trim().replace(/\D/g, '');

    // Validation
    if (!trimmedTeamName) {
      setError('Please provide a Team Name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setError('Please provide a valid College Email ID.');
      return;
    }

    if (password && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password && confirmPassword && password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    if (!trimmedLeaderName || !trimmedRegNo || !cleanedPhone) {
      setError('Please fill in Team Leader details (Full Name, Register Number, Phone).');
      return;
    }

    if (cleanedPhone.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    try {
      setLoading(true);
      soundFx.playClick();

      const res = await fetch('/api/teams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: trimmedTeamName,
          email: normalizedEmail,
          password: password || 'elitex2026',
          confirmPassword: confirmPassword || password || 'elitex2026',
          leaderDetails: {
            name: trimmedLeaderName,
            registerNumber: trimmedRegNo,
            email: normalizedEmail,
            year: leaderYear,
            department: leaderDepartment,
            phone: cleanedPhone
          }
        })
      });

      const data = await parseResponseSafe(res);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create team. Please try again.');
      }

      soundFx.playSuccess();
      setCreatedTeamData(data.team);
      setStep('success');

      if (data.token) {
        localStorage.setItem('elitex_token', data.token);
      }
      if (data.team) {
        localStorage.setItem('elitex_team', JSON.stringify(data.team));
        if (onTeamCreated) onTeamCreated(data.team);
      }

    } catch (err) {
      soundFx.playError();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0c1328] via-[#090f20] to-[#060914] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.18)] text-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white tracking-wide">
                {step === 'form' ? 'CREATE NEW SQUAD' : 'SQUAD CREATED SUCCESSFULLY'}
              </h2>
              <p className="text-xs font-mono text-cyan-400">
                {step === 'form' ? 'ELITEX 2026 // 4-OPERATIVE SQUAD FORMATION' : 'YOUR 6-DIGIT TEAM CODE IS READY'}
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
          
          {step === 'form' ? (
            <form onSubmit={handleCreateTeam} className="space-y-6">
              
              {/* Error Alert */}
              {error && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* SECTION 1: Squad Identity */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>1. Squad Credentials</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Team Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Team Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CYBER_VIPERS"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>

                  {/* Leader Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Team Leader Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="leader@francisxavier.ac.in"
                      value={leaderEmail}
                      onChange={(e) => setLeaderEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Squad Password *</label>
                    <input
                      type="password"
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Confirm Password *</label>
                    <input
                      type="password"
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Team Leader Details (Included as Member #1) */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    <Users className="w-4 h-4" />
                    <span>2. Team Leader Profile (Member #1 of 4)</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    Leader Counted in Squad (1/4)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Leader Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Leader Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Mercer"
                      value={leaderName}
                      onChange={(e) => setLeaderName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm font-sans focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* Register Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Register Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 950721104050"
                      value={leaderRegisterNumber}
                      onChange={(e) => setLeaderRegisterNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* Department */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Department *</label>
                    <select
                      value={leaderDepartment}
                      onChange={(e) => setLeaderDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs font-sans focus:outline-none focus:border-emerald-400"
                    >
                      {DEPARTMENTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Year of Study */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Year of Study *</label>
                    <select
                      value={leaderYear}
                      onChange={(e) => setLeaderYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-mono text-slate-300">10-Digit Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      value={leaderPhone}
                      onChange={(e) => setLeaderPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-mono transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-tech font-bold uppercase tracking-wider flex items-center space-x-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] active:scale-95 transition-all disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  <span>{loading ? 'Generating Squad & Code...' : 'CREATE SQUAD NOW'}</span>
                </button>
              </div>

            </form>
          ) : (
            /* SUCCESS VIEW WITH 6-DIGIT CODE & COPY BUTTON */
            <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-300">
              
              <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/10 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
                  SQUAD INITIALIZATION COMPLETE
                </span>
                <h3 className="text-2xl font-display font-extrabold text-white">
                  {createdTeamData?.teamName}
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Assigned Team ID: <strong className="text-cyan-400">{createdTeamData?.teamId}</strong> • Initial Squad Size: <strong className="text-emerald-400">1/4 Members</strong>
                </p>
              </div>

              {/* Highlighted 6-Digit Team Code Box */}
              <div className="max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-[#0a1226] to-slate-950 border-2 border-cyan-400/60 shadow-[0_0_35px_rgba(6,182,212,0.25)] space-y-3">
                <span className="text-[11px] font-mono text-cyan-300 uppercase tracking-widest block">
                  OFFICIAL 6-DIGIT SQUAD JOIN CODE
                </span>
                
                <div className="flex items-center justify-center space-x-3 text-4xl sm:text-5xl font-mono font-black text-white tracking-widest selection:bg-cyan-500 selection:text-black py-2">
                  <span className="px-3 py-1 bg-cyan-950/80 border border-cyan-500/40 rounded-xl text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    {createdTeamData?.teamCode || '------'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Share this 6-digit code with your 3 teammates. They can enter this code in the <strong>JOIN TEAM</strong> modal to enlist in your squad.
                </p>

                <button
                  onClick={handleCopyCode}
                  className="w-full py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 hover:text-white font-tech font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">CODE COPIED TO CLIPBOARD!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-cyan-400" />
                      <span>COPY 6-DIGIT CODE</span>
                    </>
                  )}
                </button>
              </div>

              {/* Squad Limits Warning */}
              <div className="text-xs font-mono text-slate-400 max-w-md mx-auto space-y-1">
                <p>• Maximum Squad Capacity: Exactly 4 Operatives (including Leader).</p>
                <p>• Students cannot belong to multiple teams.</p>
              </div>

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-tech font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:brightness-110 active:scale-95 transition-all"
                >
                  ENTER SQUAD COMMAND CENTER
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
