import React, { useState } from 'react';
import { 
  Gamepad2, 
  LayoutDashboard, 
  Users, 
  Target, 
  Calendar, 
  Zap, 
  Trophy, 
  Award, 
  Bell, 
  LogOut, 
  Home, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Radio,
  FileText,
  X
} from 'lucide-react';
import { EVENT_INFO, INITIAL_ANNOUNCEMENTS, INITIAL_ACHIEVEMENTS } from '../../data/hackathonData';
import { soundFx } from '../../utils/audio';

export default function PlayerHQ({ team, onLogout, onReturnToHome, onToast }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-center">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-md max-w-md">
          <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="font-tech font-bold text-xl text-navy-900 mb-2">Authenticated Session Required</h2>
          <p className="text-xs text-slate-600 mb-6">
            Please register your squad or log in with your registered email and password to access the dashboard.
          </p>
          <button
            onClick={onReturnToHome}
            className="w-full py-2.5 rounded-xl bg-navy-900 text-white font-tech font-bold text-xs uppercase"
          >
            RETURN TO REGISTRATION
          </button>
        </div>
      </div>
    );
  }

  const handleCopyTeamId = () => {
    navigator.clipboard.writeText(team.teamId);
    setCopied(true);
    soundFx.playSuccess();
    if (onToast) onToast(`Team ID ${team.teamId} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  };

  const markNotificationRead = (id) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, unread: false } : a));
  };

  const sidebarLinks = [
    { id: 'overview', label: 'Command Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'Team Profile', icon: Users },
    { id: 'schedule', label: 'Event Schedule', icon: Calendar },
    { id: 'rewards', label: 'Reward Points', icon: Trophy },
    { id: 'announcements', label: 'Announcements', icon: Radio, count: announcements.filter(a => a.unread).length },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Gamer Command Bar Header */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200 backdrop-blur-md px-4 sm:px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Brand + HQ Indicator */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                soundFx.playClick();
                onReturnToHome();
              }}
              className="flex items-center space-x-1.5 text-slate-500 hover:text-navy-900 font-mono text-xs transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">RETURN TO WEBSITE</span>
            </button>

            <div className="h-5 w-[1px] bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center space-x-2">
              <span className="font-display font-black text-lg text-emerald-600">
                ELITE<span className="text-blue-600">X</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                DASHBOARD
              </span>
            </div>
          </div>

          {/* Right: Team Profile & Notification controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Prominent Team ID Header Pill */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-mono text-xs font-black text-navy-900 tracking-wider">
                {team.teamId}
              </span>
              <button
                onClick={handleCopyTeamId}
                title="Copy Team ID"
                className="p-1 hover:text-emerald-600 text-slate-400 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setShowNotifications(!showNotifications);
                }}
                className="relative p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-navy-900 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {announcements.filter(a => a.unread).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {announcements.filter(a => a.unread).length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl p-4 shadow-xl z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="font-tech font-bold text-xs text-navy-900 uppercase">Event Bulletins</span>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {announcements.map((ann) => (
                      <div 
                        key={ann.id}
                        onClick={() => markNotificationRead(ann.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          ann.unread ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                          <span className="text-emerald-700 font-bold">{ann.category}</span>
                          <span className="text-slate-400">{ann.time}</span>
                        </div>
                        <div className="font-tech font-bold text-navy-900">{ann.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                onLogout();
              }}
              title="Logout from session"
              className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 space-y-3">
          
          {/* Team Quick Badge Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider mb-1">
              ASSIGNED TEAM ID
            </div>
            
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-3">
              <span className="font-display font-black text-xl text-navy-900 tracking-wider">
                {team.teamId}
              </span>
              <button
                onClick={handleCopyTeamId}
                className="px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm hover:bg-emerald-700 transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>

            <div className="font-tech font-bold text-base text-navy-900 truncate">
              {team.teamName}
            </div>
            <div className="text-xs font-mono text-slate-500 truncate mt-0.5">
              {team.email}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500">Squad Size:</span>
              <span className="text-emerald-700 font-bold">4 Members</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundFx.playClick();
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-tech font-bold tracking-wider transition-all ${
                    isActive
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.count > 0 && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white text-[10px] font-mono font-bold">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Dynamic Center Operation Panel */}
        <main className="flex-1 min-w-0">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Top Banner: Verification Confirmation Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 text-white shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                      OFFICIAL SQUAD REGISTRATION CONFIRMED
                    </span>
                    <h2 className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
                      TEAM {team.teamName.toUpperCase()}
                    </h2>
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-[10px] font-mono text-emerald-300 font-bold uppercase">STATUS</div>
                      <div className="font-tech font-bold text-xs text-white">Verified & Allocated</div>
                    </div>
                  </div>
                </div>

                {/* Team ID Highlight Bar */}
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">OFFICIAL SEQUENTIAL TEAM ID</div>
                    <div className="font-display font-black text-2xl text-emerald-400 tracking-wider">
                      {team.teamId}
                    </div>
                  </div>

                  <button
                    onClick={handleCopyTeamId}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-navy-950 font-tech font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY TEAM ID'}</span>
                  </button>
                </div>
              </div>

              {/* Event Overview: 2-Phase Telemetry Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Phase 1 Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-emerald-700">PHASE 1</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200">
                      PRELIMS
                    </span>
                  </div>
                  <h3 className="font-tech font-bold text-lg text-navy-900 mb-1">
                    Monday, 2 November 2026
                  </h3>
                  <div className="text-xs font-mono text-slate-500 mb-3">
                    Timing: 9:30 AM – 10:00 AM IST (Deadline)
                  </div>
                  <div className="text-xs font-mono text-emerald-600 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Eligible for Screening Assessment</span>
                  </div>
                </div>

                {/* Phase 2 Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-blue-700">PHASE 2</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-mono font-bold border border-blue-200">
                      7 HOURS SPRINT
                    </span>
                  </div>
                  <h3 className="font-tech font-bold text-lg text-navy-900 mb-1">
                    Wednesday, 4 November 2026
                  </h3>
                  <div className="text-xs font-mono text-slate-500 mb-3">
                    Timing: 9:30 AM – 4:00 PM IST (Campus Arena)
                  </div>
                  <div className="text-xs font-mono text-blue-600 flex items-center gap-1.5 font-bold">
                    <Zap className="w-4 h-4" />
                    <span>Software Development & Prototype Build</span>
                  </div>
                </div>

              </div>

              {/* Progress, Announcements & Rewards Points Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Reward Points Card */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-tech font-bold text-lg text-navy-900 flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-emerald-600" />
                      <span>REWARD POINTS TELEMETRY</span>
                    </h3>
                    <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ACADEMIC MERIT
                    </span>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center mb-4">
                    <div className="font-display font-black text-4xl text-navy-900">
                      100
                    </div>
                    <div className="font-mono text-xs font-bold text-emerald-700 uppercase tracking-widest mt-1">
                      REWARD POINTS ALLOCATION
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Academic reward points awarded to verified participating and winning teams. Distinct from any monetary prize pool.
                    </p>
                  </div>
                </div>

                {/* Achievements Preview */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-tech font-bold text-lg text-navy-900 flex items-center space-x-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span>ACHIEVEMENT BADGES</span>
                    </h3>
                    <span className="text-xs font-mono text-slate-500">2 of 4 Unlocked</span>
                  </div>

                  <div className="space-y-3">
                    {INITIAL_ACHIEVEMENTS.map((ach) => (
                      <div key={ach.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ach.unlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-tech font-bold text-xs text-navy-900">{ach.title}</div>
                            <div className="text-[11px] text-slate-500">{ach.desc}</div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${ach.unlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                          {ach.unlocked ? 'UNLOCKED' : 'LOCKED'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: TEAM PROFILE */}
          {activeTab === 'profile' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <span className="text-xs font-mono text-slate-500 uppercase font-bold">VERIFIED REGISTRATION PROFILE</span>
                  <h2 className="font-tech font-bold text-2xl text-navy-900 mt-0.5">
                    TEAM PROFILE: {team.teamName}
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold border border-emerald-200">
                  VERIFIED SQUAD
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-mono text-slate-500 uppercase">OFFICIAL TEAM ID</div>
                  <div className="font-display font-black text-2xl text-emerald-600 mt-1 flex items-center gap-2">
                    <span>{team.teamId}</span>
                    <button onClick={handleCopyTeamId} className="text-slate-400 hover:text-navy-900">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-mono text-slate-500 uppercase">TEAM LEADER EMAIL</div>
                  <div className="font-mono font-bold text-sm text-navy-900 mt-1 truncate">
                    {team.email}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-mono text-slate-500 uppercase">SQUAD SIZE REQUIREMENT</div>
                  <div className="font-tech font-bold text-base text-navy-900 mt-1">
                    Exactly 4 Members (Mandatory)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-mono text-slate-500 uppercase">ELIGIBILITY TRACK</div>
                  <div className="font-tech font-bold text-base text-navy-900 mt-1">
                    Only PBL and Elite Students (FXEC)
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-sans text-emerald-900 leading-relaxed">
                <strong>Leader Registration Rule:</strong> Only the team leader needs to register through the portal. Your squad members must all be verified PBL and Elite students from Francis Xavier Engineering College.
              </div>
            </div>
          )}

          {/* TAB 3: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-slate-200">
                <span className="text-xs font-mono text-slate-500 uppercase font-bold">OFFICIAL TOURNAMENT ITINERARY</span>
                <h2 className="font-tech font-bold text-2xl text-navy-900 mt-0.5">
                  EVENT SCHEDULE & PHASES
                </h2>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-emerald-700 font-bold">PHASE 1: PRELIMS</span>
                    <span className="text-slate-500">Asia/Kolkata</span>
                  </div>
                  <h4 className="font-tech font-bold text-lg text-navy-900">
                    Monday, 2 November 2026
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Start Time: 9:30 AM IST · Submission Deadline: 10:00 AM IST. Online preliminary problem-solving and screening assessment.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-blue-700 font-bold">PHASE 2: FINAL HACKATHON</span>
                    <span className="text-slate-500">7 Hours Sprint</span>
                  </div>
                  <h4 className="font-tech font-bold text-lg text-navy-900">
                    Wednesday, 4 November 2026
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    9:30 AM – 4:00 PM IST at Francis Xavier Engineering College Campus Arena. Working prototype development, jury evaluation, and awards ceremony.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REWARDS */}
          {activeTab === 'rewards' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-slate-200">
                <span className="text-xs font-mono text-slate-500 uppercase font-bold">ACADEMIC & DISTINCTION INCENTIVES</span>
                <h2 className="font-tech font-bold text-2xl text-navy-900 mt-0.5">
                  100 REWARD POINTS & PRIZES FOR WINNERS
                </h2>
              </div>

              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-4">
                <Trophy className="w-10 h-10 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-tech font-bold text-base text-navy-900">Official Institutional Honors</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Winners receive gold, silver, and bronze trophies from the Elite Batch 2025-29, 100 Reward Points, and project incubation mentorship. There are no monetary prize amounts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
              <div className="pb-4 border-b border-slate-200">
                <span className="text-xs font-mono text-slate-500 uppercase font-bold">OFFICIAL DISPATCHES</span>
                <h2 className="font-tech font-bold text-2xl text-navy-900 mt-0.5">
                  ANNOUNCEMENTS & BULLETINS
                </h2>
              </div>

              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                        {ann.category}
                      </span>
                      <span className="text-slate-400">{ann.time}</span>
                    </div>
                    <h4 className="font-tech font-bold text-base text-navy-900">{ann.title}</h4>
                    <p className="text-xs font-sans text-slate-600 leading-relaxed">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

      </div>

    </div>
  );
}
