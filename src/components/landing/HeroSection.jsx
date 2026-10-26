import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowDown, 
  Terminal, 
  Zap, 
  ShieldCheck, 
  Trophy, 
  Cpu, 
  Users,
  Compass,
  ArrowRight,
  Code2,
  CheckCircle2,
  Award
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { EVENT_INFO } from '../../data/hackathonData';

export default function HeroSection({ onOpenAuth, onExplore, onOpenDashboard, team }) {
  const [typedMotto, setTypedMotto] = useState('');
  const fullMotto = "IDEAS TODAY. IMPACT TOMORROW.";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedMotto(fullMotto.slice(0, index + 1));
      index++;
      if (index > fullMotto.length) {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero" className="relative min-h-[90vh] flex flex-col items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Decorative High-Tech Background Circuit & Gradient Layers */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[380px] bg-gradient-to-r from-emerald-400/10 via-teal-300/15 to-blue-500/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-100/80 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">

        {/* Organizer Credentials Badge */}
        <div className="inline-flex flex-col items-center mb-5 px-5 py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm backdrop-blur-md animate-in fade-in zoom-in duration-300">
          <div className="text-xs sm:text-sm font-mono font-black tracking-widest text-navy-900 uppercase flex items-center gap-1.5">
            <span className="text-emerald-600">FXEC</span> 
            <span className="text-slate-300">×</span> 
            <span className="text-blue-600">ELITE BATCH 2025-29</span>
          </div>
          <div className="text-[10px] sm:text-[11px] font-mono tracking-widest text-slate-500 uppercase mt-0.5">
            ORGANISED BY ELITE BATCH 2025-29 · FRANCIS XAVIER ENGINEERING COLLEGE
          </div>
        </div>

        {/* 7 Hours Sprint Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/80 text-emerald-800 text-xs sm:text-sm font-tech font-bold tracking-widest mb-4 shadow-sm">
          <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
          <span>7 HOURS SPRINT</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
        </div>

        {/* Main ELITEX 2026 Title */}
        <div className="relative mb-2">
          <h1 className="font-display font-black text-6xl sm:text-8xl md:text-9xl tracking-tight select-none">
            <span className="text-emerald-500 drop-shadow-[0_4px_16px_rgba(16,185,129,0.3)]">ELITE</span>
            <span className="text-blue-600 drop-shadow-[0_4px_16px_rgba(37,99,235,0.3)]">X</span>
          </h1>

          <div className="mt-1">
            <span className="font-tech font-black text-3xl sm:text-5xl md:text-6xl tracking-widest text-navy-900">
              HACKATHON — 2026
            </span>
          </div>
        </div>

        {/* Three Pillars: THINK / CODE / INNOVATE */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm sm:text-lg font-tech font-black tracking-widest text-slate-800 my-4 uppercase">
          <span className="text-emerald-600">THINK</span>
          <span className="text-slate-300">/</span>
          <span className="text-blue-600">CODE</span>
          <span className="text-slate-300">/</span>
          <span className="text-teal-600">INNOVATE</span>
        </div>

        {/* Typewriter Motto */}
        <div className="h-9 flex items-center justify-center mb-6">
          <p className="font-mono text-base sm:text-xl text-slate-700 font-bold tracking-wider">
            “{typedMotto}”
            <span className="inline-block w-2 h-5 bg-emerald-500 ml-1 animate-pulse align-middle"></span>
          </p>
        </div>

        {/* Strict Eligibility & Team Size Notice Bar */}
        <div className="w-full max-w-3xl mb-8 p-3.5 rounded-xl bg-white border border-emerald-200/90 shadow-glass-clean flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold">
            <Users className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>TEAM SIZE: EXACTLY 4 MEMBERS</span>
          </div>
          <div className="hidden sm:block w-[1px] h-4 bg-slate-200"></div>
          <div className="text-blue-900 font-bold">
            LIMITED PARTICIPATION: ONLY 50 TEAMS
          </div>
          <div className="hidden sm:block w-[1px] h-4 bg-slate-200"></div>
          <div className="text-slate-700 font-bold">
            ELIGIBILITY: ONLY PBL AND ELITE STUDENTS
          </div>
        </div>

        {/* Action Buttons: TEAM LOGIN / REGISTRATION and EXPLORE */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none mb-12">
          
          {/* TEAM LOGIN / REGISTER BUTTON */}
          <button
            onClick={() => {
              soundFx.playClick();
              if (team) {
                onOpenDashboard();
              } else {
                onOpenAuth();
              }
            }}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-tech font-bold text-sm tracking-widest uppercase rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <Terminal className="w-4 h-4" />
            <span>{team ? `ENTER DASHBOARD (${team.teamId})` : 'TEAM LOGIN / REGISTER'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* EXPLORE BUTTON */}
          <button
            onClick={() => {
              soundFx.playClick();
              onExplore();
            }}
            className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-navy-900 font-tech font-bold text-sm tracking-widest uppercase rounded-xl border border-slate-300 shadow-sm active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <Compass className="w-4 h-4 text-slate-600" />
            <span>EXPLORE ELITEX</span>
          </button>
        </div>

        {/* Rebalanced High-Tech Stats Grid (No empty space where old countdown was) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-left">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-1">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>SPRINT TIME</span>
            </div>
            <div className="font-tech font-bold text-lg text-navy-900">7 Hours Sprint</div>
            <div className="text-[11px] font-mono text-emerald-700">Non-Stop Build</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-left">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span>MAX CAPACITY</span>
            </div>
            <div className="font-tech font-bold text-lg text-navy-900">Only 50 Teams</div>
            <div className="text-[11px] font-mono text-blue-700">Strictly Capped</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-left">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-1">
              <Award className="w-4 h-4 text-purple-600" />
              <span>REWARDS</span>
            </div>
            <div className="font-tech font-bold text-lg text-navy-900">100 Reward Points</div>
            <div className="text-[11px] font-mono text-purple-700">Prizes for Winners</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-left">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-1">
              <Cpu className="w-4 h-4 text-teal-600" />
              <span>STRUCTURE</span>
            </div>
            <div className="font-tech font-bold text-lg text-navy-900">Phase 1 & Phase 2</div>
            <div className="text-[11px] font-mono text-teal-700">Prelims ➔ Final</div>
          </div>
        </div>

      </div>

      {/* Scroll Down Indicator */}
      <button 
        onClick={() => {
          soundFx.playClick();
          onExplore();
        }}
        className="mt-10 text-slate-400 hover:text-emerald-600 transition-colors animate-bounce flex flex-col items-center gap-1 group"
      >
        <span className="font-mono text-[10px] tracking-widest uppercase group-hover:text-emerald-700">
          EXPLORE DETAILS
        </span>
        <ArrowDown className="w-4 h-4" />
      </button>

    </section>
  );
}
