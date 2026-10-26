import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Info, 
  Clock, 
  Zap, 
  Trophy, 
  HelpCircle, 
  Mail, 
  LogOut, 
  Menu, 
  X, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export default function StudentNavbar({ 
  currentView, 
  onNavigate, 
  team, 
  onLogout, 
  onToast 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [muted, setMuted] = useState(soundFx.isMuted());

  const handleAudioToggle = () => {
    const isNowMuted = soundFx.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) soundFx.playBlip();
  };

  const handleCopyTeamId = () => {
    if (!team?.teamId) return;
    navigator.clipboard.writeText(team.teamId);
    setCopied(true);
    soundFx.playSuccess();
    if (onToast) onToast(`Team ID ${team.teamId} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'about', label: 'About', icon: Info },
    { id: 'phase1', label: 'Phase 1 – Prelims', icon: Clock },
    { id: 'phase2', label: 'Phase 2 – Final Hackathon', icon: Zap },
    { id: 'rewards', label: 'Rewards', icon: Trophy },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  const handleLinkClick = (viewId) => {
    soundFx.playClick();
    onNavigate(viewId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-all">
      
      {/* Top Micro Telemetry Strip */}
      <div className="hidden lg:block border-b border-slate-100 bg-slate-50/80 px-6 py-1">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-mono text-slate-600">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1.5 font-bold text-navy-900">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>AUTHENTICATED STUDENT PANEL</span>
            </span>
            <span className="text-slate-300">•</span>
            <span>FXEC × ELITE BATCH 2025-29</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-emerald-700 font-bold">7 HOURS SPRINT</span>
            <span className="text-slate-300">•</span>
            <span>Squad: Exactly 4 Members</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-600 font-bold">100 Reward Points</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          
          {/* Left: Brand Logo & Panel Indicator */}
          <button 
            onClick={() => handleLinkClick('dashboard')}
            className="flex items-center space-x-3 group focus:outline-none shrink-0"
          >
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-blue-600 rounded-lg transform rotate-6 group-hover:rotate-12 transition-transform duration-300 opacity-80 blur-xs"></div>
              <div className="relative w-9 h-9 bg-navy-900 border border-emerald-400 rounded-lg flex items-center justify-center shadow-md">
                <span className="font-display text-sm font-black text-emerald-400">E</span>
                <span className="font-display text-xs font-black text-blue-400">X</span>
              </div>
            </div>

            <div className="text-left">
              <div className="flex items-center space-x-1 font-display font-black text-lg tracking-wider text-navy-900">
                <span className="text-emerald-500">ELITE</span>
                <span className="text-blue-600">X</span>
                <span className="text-slate-800 text-sm font-tech ml-1">2026</span>
              </div>
              <div className="text-[10px] font-mono font-bold text-emerald-700 tracking-wider">
                STUDENT PANEL
              </div>
            </div>
          </button>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentView === link.id;

              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-tech font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Team Profile Badge & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Authenticated Team Pill */}
            {team && (
              <div className="flex items-center space-x-2 px-2.5 sm:px-3 py-1 rounded-xl bg-slate-100 border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
                <div className="text-left max-w-[100px] sm:max-w-[130px] truncate">
                  <div className="font-mono text-[11px] font-black text-navy-900 tracking-wider leading-none">
                    {team.teamId}
                  </div>
                  <div className="text-[10px] font-tech text-slate-500 truncate leading-none mt-0.5">
                    {team.teamName}
                  </div>
                </div>
                <button
                  onClick={handleCopyTeamId}
                  title="Copy Team ID"
                  className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* Audio Toggle */}
            <button
              onClick={handleAudioToggle}
              title={muted ? 'Enable SFX' : 'Mute SFX'}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors hidden sm:block"
            >
              {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            </button>

            {/* Logout Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                onLogout();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-tech font-bold uppercase tracking-wider transition-colors"
              title="Logout from session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="xl:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-200 shadow-lg">
          
          {/* Team Info in Mobile Drawer */}
          {team && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3 flex items-center justify-between">
              <div>
                <div className="font-mono text-xs font-black text-navy-900">
                  {team.teamId} · {team.teamName}
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  {team.email}
                </div>
              </div>
              <button
                onClick={handleCopyTeamId}
                className="px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-mono font-bold flex items-center space-x-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          )}

          {/* Nav Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentView === link.id;

              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-tech font-bold uppercase tracking-wider text-left transition-colors ${
                    isActive
                      ? 'bg-navy-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          {/* Logout in Drawer */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-tech font-bold uppercase tracking-wider"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout of Session</span>
            </button>
          </div>

        </div>
      )}

    </header>
  );
}
