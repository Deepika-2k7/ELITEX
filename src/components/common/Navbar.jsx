import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Menu, 
  X, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  Key,
  LogOut
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  onOpenAuth, 
  team,
  onLogout 
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [muted, setMuted] = useState(soundFx.isMuted());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAudioToggle = () => {
    const isNowMuted = soundFx.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      soundFx.playBlip();
    }
  };

  const navItems = [
    { label: 'Home', view: 'landing', targetId: 'hero' },
    { label: 'About', view: 'landing', targetId: 'about' },
    { label: 'Phase 1 — PRELIMS', view: 'phase1', targetId: 'phase1' },
    { label: 'Phase 2 — FINAL HACKATHON', view: 'phase2', targetId: 'phase2' },
    { label: 'Rewards', view: 'landing', targetId: 'rewards' },
    { label: 'FAQ', view: 'landing', targetId: 'faq' },
    { label: 'Contact', view: 'landing', targetId: 'contact' },
  ];

  const handleNavigation = (item) => {
    soundFx.playClick();
    setMobileMenuOpen(false);

    if (item.view === 'landing') {
      if (currentView !== 'landing') {
        setCurrentView('landing');
        setTimeout(() => {
          const el = document.getElementById(item.targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.getElementById(item.targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setCurrentView(item.view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-md py-2.5' 
        : 'bg-white/80 backdrop-blur-sm border-b border-slate-200/50 py-3.5'
    }`}>
      {/* Top Micro Organizer Ticker Banner */}
      <div className="hidden lg:block border-b border-slate-200/60 pb-1.5 mb-2 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-600">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-navy-900">FXEC × ELITE BATCH 2025-29</span>
            <span className="text-slate-300">•</span>
            <span>ORGANISED BY ELITE BATCH 2025-29</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-500">
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              7 HOURS SPRINT
            </span>
            <span>•</span>
            <span className="text-blue-600 font-semibold">MAX 50 TEAMS</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Official Brand Logo */}
          <button 
            onClick={() => {
              soundFx.playClick();
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center space-x-3 text-left group focus:outline-none"
          >
            {/* Hexagon Emblem */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-blue-600 rounded-lg transform rotate-6 group-hover:rotate-12 transition-transform duration-300 opacity-80 blur-xs"></div>
              <div className="relative w-10 h-10 bg-navy-900 border border-emerald-400 rounded-lg flex items-center justify-center shadow-md">
                <span className="font-display text-sm font-black text-emerald-400">E</span>
                <span className="font-display text-xs font-black text-blue-400">X</span>
              </div>
            </div>

            <div>
              <div className="flex items-baseline space-x-1">
                <span className="font-display font-black text-xl tracking-wider text-emerald-600">
                  ELITE
                </span>
                <span className="font-display font-black text-xl tracking-wider text-blue-600">
                  X
                </span>
                <span className="font-tech font-bold text-lg text-navy-900 ml-1">
                  2026
                </span>
              </div>
              <div className="text-[9px] tracking-widest text-slate-500 font-mono hidden sm:block">
                FXEC × ELITE BATCH 2025-29
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 backdrop-blur-md">
            {navItems.map((item) => {
              const isActive = (item.view === currentView && (currentView !== 'landing' || item.targetId === 'hero'));
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item)}
                  className={`px-3 py-1.5 text-xs font-tech font-bold tracking-wider transition-all duration-200 rounded-lg ${
                    isActive
                      ? 'text-white bg-navy-900 shadow-sm'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            {/* SFX Toggle */}
            <button
              onClick={handleAudioToggle}
              title={muted ? 'Unmute Cyber SFX' : 'Mute Cyber SFX'}
              className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />}
            </button>

            {/* Authenticated Team or Registration Trigger */}
            {team ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setCurrentView('dashboard');
                  }}
                  className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs font-mono text-emerald-900 font-bold hover:bg-emerald-100 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>{team.teamId}</span>
                  <span className="text-slate-400">·</span>
                  <span className="truncate max-w-[120px]">{team.teamName}</span>
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onLogout();
                  }}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenAuth();
                }}
                className="px-4 py-2 text-xs font-tech font-bold tracking-wider text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm transition-all"
              >
                TEAM REGISTRATION
              </button>
            )}

            {/* Dashboard / HQ Access Button */}
            <button
              onClick={() => {
                soundFx.playSuccess();
                if (team) {
                  setCurrentView('dashboard');
                } else {
                  onOpenAuth();
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-tech font-bold text-xs tracking-wider rounded-lg shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>DASHBOARD</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={handleAudioToggle}
              className="p-1.5 rounded bg-slate-100 border border-slate-200 text-slate-600"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-navy-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-5 pt-4 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="text-[11px] font-mono font-bold text-slate-500 border-b border-slate-100 pb-2 flex justify-between">
            <span>FXEC × ELITE BATCH 2025-29</span>
            <span className="text-emerald-600">7 HOURS SPRINT</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item)}
                className="text-left px-3.5 py-2.5 text-xs font-tech font-bold text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-lg border border-slate-100"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-2 flex flex-col space-y-2 border-t border-slate-100">
            {team ? (
              <button
                onClick={() => {
                  soundFx.playClick();
                  setMobileMenuOpen(false);
                  setCurrentView('dashboard');
                }}
                className="w-full py-2.5 text-center text-xs font-tech font-bold text-white bg-emerald-600 rounded-lg flex items-center justify-center space-x-2"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>OPEN DASHBOARD ({team.teamId})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  soundFx.playClick();
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2.5 text-center text-xs font-tech font-bold text-white bg-navy-900 rounded-lg"
              >
                TEAM REGISTRATION / LOGIN
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
