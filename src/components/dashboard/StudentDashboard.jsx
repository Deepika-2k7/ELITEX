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
  GraduationCap
} from 'lucide-react';
import { EVENT_INFO, INITIAL_ANNOUNCEMENTS } from '../../data/hackathonData';
import { soundFx } from '../../utils/audio';
import TeamDetailsModal from './TeamDetailsModal';

export default function StudentDashboard({ 
  team, 
  onNavigate, 
  onToast, 
  onTeamUpdate 
}) {
  const [copied, setCopied] = useState(false);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS || []);
  const [isTeamDetailsModalOpen, setIsTeamDetailsModalOpen] = useState(false);

  const members = team?.members || [];
  const membersCount = members.length;

  const handleCopyTeamId = () => {
    if (!team?.teamId) return;
    navigator.clipboard.writeText(team.teamId);
    setCopied(true);
    soundFx.playSuccess();
    if (onToast) onToast(`Team ID ${team.teamId} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* ---------------- 1. PERSONALIZED WELCOME & TEAM PROFILE SECTION ---------------- */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        
        {/* Decorative Circuit Lines and Glow Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10">
          
          {/* Micro Tag */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>OFFICIAL STUDENT DASHBOARD · FXEC × ELITE BATCH 2025-29</span>
          </div>

          {/* Welcome Heading */}
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-wide">
            Welcome, <span className="text-emerald-400">{team.teamName}</span>!
          </h1>
          <p className="font-tech text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
            Your squad is officially registered and verified for <strong className="text-white">ELITEX Hackathon 2026</strong>. Review your team profile, squad members, and sprint telemetry below.
          </p>

          {/* Team Profile Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            
            {/* 1. Team ID Card */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:border-emerald-400/40 transition-colors">
              <div className="text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-wider mb-1">
                ASSIGNED TEAM ID
              </div>
              <div className="flex items-center justify-between">
                <span className="font-display font-black text-2xl sm:text-3xl text-emerald-400 tracking-wider">
                  {team.teamId}
                </span>
                <button
                  onClick={handleCopyTeamId}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-navy-950 font-mono text-xs font-bold flex items-center space-x-1 transition-all"
                  title="Copy Team ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-2">
                Automatic Sequential ID
              </div>
            </div>

            {/* 2. Team Name Card */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:border-emerald-400/40 transition-colors">
              <div className="text-[10px] font-mono text-slate-300 font-bold uppercase tracking-wider mb-1">
                REGISTERED SQUAD
              </div>
              <div className="font-tech font-black text-xl text-white truncate" title={team.teamName}>
                {team.teamName}
              </div>
              <div className="text-[11px] font-mono text-slate-300 truncate mt-2">
                Leader: {team.email}
              </div>
            </div>

            {/* 3. Registration Status Card */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:border-emerald-400/40 transition-colors">
              <div className="text-[10px] font-mono text-slate-300 font-bold uppercase tracking-wider mb-1">
                REGISTRATION STATUS
              </div>
              <div className="flex items-center space-x-2 text-emerald-400 font-tech font-bold text-lg">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{team.status || 'Verified & Confirmed'}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-300 mt-2">
                Squad Size: Strictly 4 Members
              </div>
            </div>

            {/* 4. Reward Points Card */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:border-emerald-400/40 transition-colors">
              <div className="text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-wider mb-1">
                REWARD POINTS
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-yellow-400 shrink-0" />
                <span className="font-display font-black text-2xl sm:text-3xl text-white">
                  {team.rewardPoints || 100}
                </span>
                <span className="text-xs font-mono text-emerald-300 font-bold uppercase">PTS</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-2">
                Academic Merit Distinction
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ---------------- 2. TEAM DETAILS SECTION (NEW & PROMINENT) ---------------- */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-tech font-bold text-xl text-navy-950 uppercase tracking-wide">
                  Team Details — Squad Roster
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${
                  membersCount === 4
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}>
                  {membersCount}/4 Members Added
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                Managed by Team Leader · Maximum 4 members total including leader
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenTeamDetails}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-tech font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer self-start sm:self-center"
          >
            <UserPlus className="w-4 h-4" />
            <span>MANAGE TEAM DETAILS</span>
          </button>
        </div>

        {/* 4 Member Slots Visual Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((slotIdx) => {
            const member = members[slotIdx];
            const isLeader = slotIdx === 0;

            if (member) {
              return (
                <div 
                  key={slotIdx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isLeader 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isLeader ? 'MEMBER 1 (LEADER)' : `MEMBER #${slotIdx + 1}`}
                      </span>

                      {member.slotTime && (
                        <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Slot Booked
                        </span>
                      )}
                    </div>

                    <h4 className="font-tech font-bold text-base text-navy-950 truncate" title={member.name}>
                      {member.name || '(Name Pending)'}
                    </h4>

                    <div className="text-xs font-mono text-slate-600 mt-1 space-y-0.5">
                      <div className="truncate">Reg: <strong className="text-navy-900">{member.registerNumber}</strong></div>
                      <div className="truncate text-slate-500">{member.department}</div>
                      <div className="truncate text-[11px] text-slate-400">{member.email}</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Ph: {member.phone}</span>
                    <button
                      onClick={handleOpenTeamDetails}
                      className="text-emerald-600 hover:text-emerald-700 font-bold"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            }

            // Empty Slot Card
            return (
              <div 
                key={slotIdx}
                onClick={handleOpenTeamDetails}
                className="p-5 rounded-2xl bg-white border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[140px] group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-600 flex items-center justify-center font-mono font-bold text-xs mb-2 transition-colors">
                  +{slotIdx + 1}
                </div>
                <div className="font-tech font-bold text-xs text-slate-700 group-hover:text-emerald-700 uppercase">
                  Slot #{slotIdx + 1} Empty
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Click to add squad member
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* ---------------- 3. EVENT OVERVIEW & PHASE PROGRESS (GRID) ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* EVENT OVERVIEW CARD */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-tech font-bold text-lg text-navy-950 uppercase tracking-wide">
                  Event Overview
                </h2>
                <div className="text-xs font-mono text-slate-500">
                  Official Hackathon Specifications
                </div>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold">
              7 HOURS SPRINT
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="font-display font-black text-xl text-navy-900">
                ELITEX HACKATHON 2026
              </div>
              <div className="font-mono text-xs font-bold text-emerald-700 mt-0.5">
                ORGANISED BY FXEC × ELITE BATCH 2025-29
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                A premier 7-hour continuous software engineering sprint where teams ideate, code, and deploy functional prototypes addressing real institutional and technical friction points.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase">Sprint Format</span>
                <span className="font-bold text-navy-900">7 Hours Sprint</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase">Team Quota</span>
                <span className="font-bold text-navy-900">Exactly 50 Teams</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase">Squad Size</span>
                <span className="font-bold text-navy-900">Strictly 4 Members</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase">Eligibility</span>
                <span className="font-bold text-emerald-700">PBL & Elite Only</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs font-tech text-blue-900 flex items-center justify-between">
              <span>“THINK / CODE / INNOVATE” · “IDEAS TODAY. IMPACT TOMORROW.”</span>
            </div>
          </div>
        </section>

        {/* PHASE PROGRESS CARD */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-tech font-bold text-lg text-navy-950 uppercase tracking-wide">
                  Phase Progress
                </h2>
                <div className="text-xs font-mono text-slate-500">
                  Key Milestones & Schedule
                </div>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-bold">
              2 PHASES
            </span>
          </div>

          <div className="space-y-4">
            
            {/* Phase 1 Item */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                    STAGE 1
                  </span>
                  <span className="font-tech font-bold text-base text-navy-900">
                    Phase 1 — PRELIMS
                  </span>
                </div>
                <button
                  onClick={() => handleQuickNav('phase1')}
                  className="text-xs font-tech font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                >
                  <span>Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-xs font-mono text-slate-600">
                Monday, 2 November 2026 · 4 Slots (9:30 AM – 3:45 PM IST)
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Individual slot booking active. Screening problem assessment.</span>
              </div>
            </div>

            {/* Phase 2 Item */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                    STAGE 2
                  </span>
                  <span className="font-tech font-bold text-base text-navy-900">
                    Phase 2 — FINAL HACKATHON
                  </span>
                </div>
                <button
                  onClick={() => handleQuickNav('phase2')}
                  className="text-xs font-tech font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <span>Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-xs font-mono text-slate-600">
                Wednesday, 4 November 2026 · 9:30 AM – 4:00 PM IST (7 Hours Sprint)
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                <span>On-campus software prototyping, jury evaluation, and awards.</span>
              </div>
            </div>

            {/* Event Dates Summary */}
            <div className="p-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono flex items-center justify-between">
              <span>Timezone: Asia/Kolkata (IST)</span>
              <span className="font-bold text-navy-900">Francis Xavier Eng. College</span>
            </div>

          </div>
        </section>

      </div>

      {/* ---------------- 4. REWARDS & ANNOUNCEMENTS (GRID) ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* REWARDS CARD */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-tech font-bold text-lg text-navy-950 uppercase tracking-wide">
                    Rewards & Recognition
                  </h2>
                  <div className="text-xs font-mono text-slate-500">
                    Academic Merit Distinction
                  </div>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold">
                100 REWARD POINTS
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200">
                <div className="flex items-center space-x-3 mb-2">
                  <Award className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-display font-black text-2xl text-navy-900">
                      100 REWARD POINTS
                    </div>
                    <div className="text-xs font-mono text-emerald-700 font-bold">
                      PRIZES FOR WINNERS
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  There is no monetary cash prize pool. Participating and winning teams earn 100 official Reward Points, prestigious winner trophies, distinction certificates, and project incubation support with the Elite Batch.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-lg font-black text-amber-500">1st</div>
                  <div className="text-[10px] font-mono text-slate-600 font-bold uppercase">Champion Trophy</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-lg font-black text-slate-400">2nd</div>
                  <div className="text-[10px] font-mono text-slate-600 font-bold uppercase">Runner-Up Trophy</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-lg font-black text-amber-700">3rd</div>
                  <div className="text-[10px] font-mono text-slate-600 font-bold uppercase">Bronze Memento</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => handleQuickNav('rewards')}
              className="text-xs font-tech font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              <span>View Full Rewards Dossier</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ANNOUNCEMENTS CARD */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-tech font-bold text-lg text-navy-950 uppercase tracking-wide">
                    Event Announcements
                  </h2>
                  <div className="text-xs font-mono text-slate-500">
                    Live Organizer Bulletins
                  </div>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-mono font-bold">
                {announcements.length} Available
              </span>
            </div>

            {announcements && announcements.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        {ann.category}
                      </span>
                      <span className="text-slate-400">{ann.time}</span>
                    </div>
                    <h3 className="font-tech font-bold text-sm text-navy-900">
                      {ann.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {ann.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Radio className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                <h3 className="font-tech font-bold text-sm text-navy-900">
                  No Active Announcements
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  All squad communications are synchronized. Important briefings and room allocations will appear here.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-xs font-mono text-slate-500">
            System synchronized with ELITEX Official Broadcast Dispatch
          </div>
        </section>

      </div>

      {/* ---------------- 5. QUICK NAVIGATION SECTION ---------------- */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="mb-6 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-tech font-bold text-xl text-navy-950 uppercase tracking-wide">
              Quick Navigation
            </h2>
            <div className="text-xs font-mono text-slate-500">
              One-click access to all authenticated hackathon modules
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Current Session: <strong className="text-emerald-700">{team.teamId}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* 1. Team Details */}
          <button
            onClick={handleOpenTeamDetails}
            className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 text-left transition-all duration-200 group flex flex-col justify-between"
          >
            <div>
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 w-fit mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-tech font-bold text-base text-navy-900 group-hover:text-emerald-700 transition-colors">
                Team Details
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Manage 4-member squad details & roster.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-mono font-bold text-emerald-600">
              <span>{membersCount}/4 Added</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 2. Phase 1 — Prelims */}
          <button
            onClick={() => handleQuickNav('phase1')}
            className="p-5 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 text-left transition-all duration-200 group flex flex-col justify-between"
          >
            <div>
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 w-fit mb-3 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-tech font-bold text-base text-navy-900 group-hover:text-blue-700 transition-colors">
                Phase 1 — Slot Booking
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Book prelims slots & launch assessment.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-mono font-bold text-blue-600">
              <span>Enter Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 3. Phase 2 — Final Hackathon */}
          <button
            onClick={() => handleQuickNav('phase2')}
            className="p-5 rounded-2xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 text-left transition-all duration-200 group flex flex-col justify-between"
          >
            <div>
              <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700 w-fit mb-3 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-tech font-bold text-base text-navy-900 group-hover:text-teal-700 transition-colors">
                Phase 2 — Final
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                7 Hours Sprint live schedule & guidelines.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-mono font-bold text-teal-600">
              <span>Enter Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 4. Rewards */}
          <button
            onClick={() => handleQuickNav('rewards')}
            className="p-5 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-300 text-left transition-all duration-200 group flex flex-col justify-between"
          >
            <div>
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 w-fit mb-3 group-hover:scale-105 transition-transform">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="font-tech font-bold text-base text-navy-900 group-hover:text-amber-700 transition-colors">
                Rewards & Merit
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                100 Reward Points & winner trophies.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-mono font-bold text-amber-600">
              <span>View Rewards</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 5. Rules & FAQ */}
          <button
            onClick={() => handleQuickNav('faq')}
            className="p-5 rounded-2xl bg-slate-50 hover:bg-purple-50/70 border border-slate-200 hover:border-purple-300 text-left transition-all duration-200 group flex flex-col justify-between"
          >
            <div>
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 w-fit mb-3 group-hover:scale-105 transition-transform">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="font-tech font-bold text-base text-navy-900 group-hover:text-purple-700 transition-colors">
                Rules & FAQ
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Strict 4-member squad rules & eligibility.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-mono font-bold text-purple-600">
              <span>Read FAQ</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>
      </section>

      {/* Team Details Modal */}
      <TeamDetailsModal 
        isOpen={isTeamDetailsModalOpen}
        onClose={() => setIsTeamDetailsModalOpen(false)}
        team={team}
        onTeamUpdate={onTeamUpdate}
        onToast={onToast}
      />

    </div>
  );
}
