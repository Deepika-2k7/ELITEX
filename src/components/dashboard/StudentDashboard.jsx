import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  Zap, 
  Trophy, 
  Award, 
  Radio, 
  ArrowRight, 
  HelpCircle, 
  Mail, 
  Sparkles, 
  Bell, 
  CheckCircle2,
  ExternalLink,
  Target,
  FileText,
  UserPlus,
  Edit3,
  Phone,
  GraduationCap,
  Lock,
  KeyRound,
  Layers,
  Activity,
  AlertCircle
} from 'lucide-react';
import { EVENT_INFO, INITIAL_ANNOUNCEMENTS } from '../../data/hackathonData';
import { soundFx } from '../../utils/audio';
import TeamDetailsModal from './TeamDetailsModal';
import CreateTeamModal from './CreateTeamModal';
import JoinTeamModal from './JoinTeamModal';

export default function StudentDashboard({ 
  team, 
  onNavigate, 
  onToast, 
  onTeamUpdate 
}) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS || []);
  const [isTeamDetailsModalOpen, setIsTeamDetailsModalOpen] = useState(false);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isJoinTeamModalOpen, setIsJoinTeamModalOpen] = useState(false);

  const members = team?.members || [];
  const membersCount = members.length;
  const maxSquad = 4;
  const remainingSlots = Math.max(0, maxSquad - membersCount);

  // Gamified metrics (calculated strictly from real database records)
  const teamCode = team?.teamCode || '------';
  const hasConfirmedSlot = members.some(m => m.slotId);
  const allSlotsBooked = membersCount > 0 && members.every(m => m.slotId);
  const rewardPoints = team?.rewardPoints || 100;
  const squadLevel = membersCount === 4 ? 'LEVEL 2 VANGUARD' : 'LEVEL 1 SCOUT';

  const handleCopyTeamId = () => {
    if (!team?.teamId) return;
    navigator.clipboard.writeText(team.teamId);
    setCopiedId(true);
    soundFx.playSuccess();
    if (onToast) onToast(`Team ID ${team.teamId} copied to clipboard!`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyTeamCode = () => {
    if (!team?.teamCode) return;
    navigator.clipboard.writeText(team.teamCode);
    setCopiedCode(true);
    soundFx.playSuccess();
    if (onToast) onToast(`6-Digit Team Code [${team.teamCode}] copied! Share with teammates.`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleQuickNav = (viewId) => {
    soundFx.playClick();
    onNavigate(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTeamDetails = () => {
    soundFx.playClick();
    setIsTeamDetailsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 animate-in fade-in duration-300">
      
      {/* ---------------- 1. PRIMARY DUAL SQUAD ACTIONS: CREATE TEAM & JOIN TEAM ---------------- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ACTION CARD A: CREATE TEAM */}
        <div 
          onClick={() => { soundFx.playClick(); setIsCreateTeamModalOpen(true); }}
          className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1836] via-[#091126] to-[#050814] border border-cyan-500/30 hover:border-cyan-400 p-6 sm:p-8 shadow-[0_0_30px_rgba(6,182,212,0.12)] hover:shadow-[0_0_40px_rgba(6,182,212,0.28)] transition-all duration-300 active:scale-[0.99]"
        >
          {/* Subtle Cyber Glow Accents */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-300"></div>
          
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 uppercase tracking-widest">
                LEADER REGISTRATION
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-display font-black text-white group-hover:text-cyan-300 transition-colors tracking-wide">
                CREATE SQUAD
              </h3>
              <p className="text-xs sm:text-sm font-sans text-slate-300 leading-relaxed">
                Form a new 4-operative squad. You automatically become the <strong className="text-white">Team Leader</strong> and receive a unique 6-digit numeric team code to share.
              </p>
            </div>

            <div className="pt-2 flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>LAUNCH SQUAD FORMATION</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* ACTION CARD B: JOIN TEAM */}
        <div 
          onClick={() => { soundFx.playClick(); setIsJoinTeamModalOpen(true); }}
          className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-[#121132] via-[#0c0d24] to-[#050814] border border-blue-500/30 hover:border-purple-400 p-6 sm:p-8 shadow-[0_0_30px_rgba(59,130,246,0.12)] hover:shadow-[0_0_40px_rgba(168,85,247,0.25)] transition-all duration-300 active:scale-[0.99]"
        >
          {/* Subtle Cyber Glow Accents */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-300"></div>

          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-400/40 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:scale-110 transition-transform">
                <UserPlus className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 uppercase tracking-widest">
                OPERATIVE ENLISTMENT
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-display font-black text-white group-hover:text-purple-300 transition-colors tracking-wide">
                JOIN SQUAD
              </h3>
              <p className="text-xs sm:text-sm font-sans text-slate-300 leading-relaxed">
                Have a 6-digit code from your Team Leader? Enter the code to enlist directly into your squad's roster. Strictly up to 4 members.
              </p>
            </div>

            <div className="pt-2 flex items-center space-x-2 text-xs font-mono font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>ENTER 6-DIGIT CODE</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

      </section>

      {/* ---------------- 2. DEDICATED TEAM DASHBOARD HERO ---------------- */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1226] via-[#070d1e] to-[#040711] border border-cyan-500/30 p-6 sm:p-10 shadow-[0_0_50px_rgba(6,182,212,0.15)] text-white">
        
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 space-y-8">
          
          {/* Top Micro Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>ELITEX 2026 // SQUAD COMMAND CENTER</span>
            </span>

            <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-mono font-bold tracking-wider">
              {squadLevel}
            </span>

            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold tracking-wider">
              {team.status === 'APPROVED' ? 'STATUS: VERIFIED & CONFIRMED' : 'STATUS: PENDING APPROVAL'}
            </span>
          </div>

          {/* Main Title & Description */}
          <div className="space-y-2 max-w-3xl">
            <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-wide">
              Squad: <span className="text-cyan-400">{team.teamName}</span>
            </h1>
            <p className="font-sans text-slate-300 text-sm sm:text-base leading-relaxed">
              Assigned to Department of Information Technology & Computer Science arenas. Your team roster, 6-digit access code, and Phase 1 prelims telemetry are synchronized live below.
            </p>
          </div>

          {/* 4 Gamified Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            
            {/* Card 1: Team ID */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400/50 transition-colors">
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>ASSIGNED TEAM ID</span>
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-display font-black text-2xl text-cyan-400 tracking-wider">
                  {team.teamId}
                </span>
                <button
                  onClick={handleCopyTeamId}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Copy Team ID"
                >
                  {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Card 2: 6-Digit Team Code */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/70 via-slate-900/90 to-slate-950 border-2 border-cyan-500/50 hover:border-cyan-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <div className="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>6-DIGIT SQUAD CODE</span>
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-2xl sm:text-3xl text-white tracking-widest">
                  {teamCode}
                </span>
                <button
                  onClick={handleCopyTeamCode}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 hover:text-white font-mono text-xs flex items-center space-x-1 border border-cyan-400/40 transition-all active:scale-95"
                  title="Copy 6-Digit Code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            </div>

            {/* Card 3: Squad Capacity Meter */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 hover:border-emerald-400/50 transition-colors">
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>SQUAD ROSTER</span>
                <Users className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="font-display font-black text-2xl text-emerald-400">
                  {membersCount} / 4
                </span>
                <span className="text-xs font-mono text-slate-400">OPERATIVES</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[0, 1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className={`h-2 rounded-full transition-all ${i < membersCount ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-800 border border-slate-700'}`}
                  />
                ))}
              </div>
            </div>

            {/* Card 4: Reward Points */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 hover:border-amber-400/50 transition-colors">
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>REWARD CREDITS</span>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="font-display font-black text-2xl text-amber-400">
                  {rewardPoints}
                </span>
                <span className="text-xs font-mono text-slate-400">EXP PTS</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-2">
                Prelims Entry Level Verified
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ---------------- 3. SQUAD ROSTER (EXACTLY 4 SLOTS) ---------------- */}
      <section className="space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              <Users className="w-4 h-4" />
              <span>SQUAD OPERATIVES ROSTER</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white mt-1">
              Active Team Members ({membersCount}/4)
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenTeamDetails}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-xs font-tech font-bold text-slate-200 hover:text-white uppercase tracking-wider flex items-center space-x-2 transition-all shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>EDIT SQUAD DETAILS</span>
            </button>
          </div>
        </div>

        {/* 4 Member Slot Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((slotIndex) => {
            const member = members[slotIndex];

            if (member) {
              return (
                <div 
                  key={member.id || slotIndex}
                  className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1328] via-[#090f20] to-[#060914] border border-cyan-500/25 hover:border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.08)] space-y-3 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      OPERATIVE #{slotIndex + 1}
                    </span>
                    {member.isLeader ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 font-mono text-[11px] font-bold tracking-wider">
                        ★ TEAM LEADER
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-mono text-[11px] font-bold tracking-wider">
                        SQUAD MEMBER
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-display font-bold text-white">{member.name}</h4>
                    <p className="text-xs font-mono text-cyan-400">Reg No: {member.registerNumber}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-sans text-slate-300 pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block">DEPARTMENT</span>
                      <span className="truncate block font-medium">{member.department}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block">YEAR</span>
                      <span className="font-medium">{member.year}</span>
                    </div>
                    <div className="col-span-2 pt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>{member.email}</span>
                      <span>{member.phone}</span>
                    </div>
                  </div>

                  {/* Individual Phase 1 Slot Assignment */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">PHASE 1 PRELIMS SLOT:</span>
                    {member.slotId ? (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-bold">
                        <Lock className="w-3 h-3 text-cyan-400" />
                        <span>{member.slotTime || member.slotId.toUpperCase()}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        SLOT NOT BOOKED
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            // Unoccupied Slot
            return (
              <div 
                key={`empty-${slotIndex}`}
                className="p-5 rounded-2xl border-2 border-dashed border-slate-800 bg-[#060914]/40 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>SQUAD SLOT #{slotIndex + 1} OF 4</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 text-[10px]">VACANT</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-display font-bold text-slate-400">OPEN OPERATIVE POSITION</h4>
                  <p className="text-xs font-sans text-slate-500 leading-relaxed">
                    Share your 6-digit squad code <strong className="text-cyan-400 font-mono font-bold">[{teamCode}]</strong> with a student to enlist them directly into this slot.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span className="text-[11px] font-mono text-slate-500">Awaiting Join...</span>
                  <button
                    onClick={handleCopyTeamCode}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-bold flex items-center space-x-1 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>COPY CODE</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* ---------------- 4. PHASE 1 PRELIMS TELEMETRY & LOCKED NOTICE ---------------- */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#091126] via-[#0b1736] to-[#070d1e] border border-cyan-500/30 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>PHASE 1 SCREENING ARENA // 2 NOVEMBER 2026</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-white">
              Prelims Slot Booking Status
            </h3>
          </div>

          <button
            onClick={() => handleQuickNav('phase1')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-tech font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-95 shrink-0"
          >
            <span>ENTER PRELIMS ARENA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Locked Notice Banner */}
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-3 text-cyan-200">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-white block">SLOT BOOKING POLICY: LOCKED UPON CONFIRMATION</strong>
              <span className="text-slate-300">YOUR PHASE 1 SLOT IS CONFIRMED. SLOT CHANGES ARE NOT PERMITTED.</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold tracking-wider shrink-0">
            PERMANENT LOCK
          </span>
        </div>

      </section>

      {/* ---------------- 5. OFFICIAL ANNOUNCEMENTS FEED ---------------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            <Bell className="w-4 h-4" />
            <span>COMMISSION DISPATCHES // LIVE ANNOUNCEMENTS</span>
          </div>
        </div>

        <div className="space-y-3">
          {announcements.map((ann, idx) => (
            <div 
              key={ann.id || idx}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 space-y-1.5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-display font-bold text-white">{ann.title}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  {ann.priority || 'NORMAL'}
                </span>
              </div>
              <p className="text-xs font-sans text-slate-300 leading-relaxed">{ann.message}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MODALS */}
      <TeamDetailsModal 
        isOpen={isTeamDetailsModalOpen}
        onClose={() => setIsTeamDetailsModalOpen(false)}
        team={team}
        onTeamUpdate={onTeamUpdate}
        onToast={onToast}
      />

      <CreateTeamModal 
        isOpen={isCreateTeamModalOpen}
        onClose={() => setIsCreateTeamModalOpen(false)}
        onTeamCreated={(updatedTeam) => {
          if (onTeamUpdate) onTeamUpdate(updatedTeam);
          if (onToast) onToast(`Squad ${updatedTeam.teamName} initialized!`);
        }}
        currentEmail={team.email}
      />

      <JoinTeamModal 
        isOpen={isJoinTeamModalOpen}
        onClose={() => setIsJoinTeamModalOpen(false)}
        existingTeam={team}
        onTeamJoined={(updatedTeam) => {
          if (onTeamUpdate) onTeamUpdate(updatedTeam);
          if (onToast) onToast(`Enlisted in squad ${updatedTeam.teamName}!`);
        }}
      />

    </div>
  );
}
