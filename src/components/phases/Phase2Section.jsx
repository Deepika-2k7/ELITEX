import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ArrowLeft, 
  Terminal, 
  CheckCircle2, 
  Calendar, 
  Zap, 
  Trophy, 
  FileCode, 
  ExternalLink,
  Hourglass,
  Layers,
  Sparkles,
  Users
} from 'lucide-react';
import { EVENT_INFO } from '../../data/hackathonData';
import { calculateTimeRemaining } from '../../utils/time';
import { soundFx } from '../../utils/audio';

export default function Phase2Section({ onBack, onToast }) {
  // Phase 2 Schedule: Wednesday, 4 November 2026, 9:30 AM IST (Asia/Kolkata)
  const targetStart = EVENT_INFO.phase2.targetStartISO;
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeRemaining(targetStart));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(targetStart));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetStart]);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <button
          onClick={() => {
            soundFx.playClick();
            onBack();
          }}
          className="inline-flex items-center space-x-2 text-xs font-tech font-bold text-blue-600 hover:text-blue-700 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>RETURN TO HOME OVERVIEW</span>
        </button>

        <div className="flex items-center space-x-2 text-xs font-mono text-blue-800 bg-blue-100/70 border border-blue-300 px-3.5 py-1.5 rounded-lg shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>WEDNESDAY, 4 NOV 2026 · 9:30 AM – 4:00 PM IST</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-800 text-xs font-mono uppercase tracking-widest mb-3">
          <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
          <span>FINAL ARENA · 7 HOURS SPRINT</span>
        </div>

        <h1 className="font-display font-black text-3xl sm:text-5xl text-navy-900 tracking-wide mb-3">
          PHASE 2 — <span className="text-blue-600">FINAL HACKATHON</span>
        </h1>

        <p className="font-sans text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
          The continuous 7-hour sprint where finalist squads develop, test, and demonstrate their working software solutions to the official jury panel.
        </p>
      </div>

      {/* Dynamic Countdown Section (Target Start: 4 Nov 2026, 9:30 AM IST) */}
      <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-glass-clean">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>PHASE 2 FINAL HACKATHON COUNTDOWN</span>
            </div>
            <div className="font-tech font-black text-2xl sm:text-3xl text-navy-900">
              Wednesday, 4 November 2026, 9:30 AM IST
            </div>
            <div className="text-xs font-mono text-slate-500 mt-1">
              Duration: 7 Hours Sprint (9:30 AM – 4:00 PM IST) · Venue: FXEC Campus Arena
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-mono text-blue-700 font-bold shrink-0">
            7 HOURS SPRINT
          </div>
        </div>

        {/* The Live Countdown Display */}
        <div className="pt-6">
          {timeLeft.isPassed ? (
            <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-300 text-center animate-in fade-in">
              <Zap className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-display font-black text-2xl text-emerald-900 tracking-wide">
                FINAL HACKATHON UNDERWAY OR CONCLUDED
              </h3>
              <p className="text-sm font-sans text-emerald-700 mt-1">
                Phase 2 Final Hackathon event timeline has commenced. Live prototype demonstrations and jury reviews take place at the campus arena.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 max-w-2xl mx-auto">
              {[
                { label: 'DAYS', value: String(timeLeft.days).padStart(2, '0'), color: 'text-navy-900' },
                { label: 'HOURS', value: String(timeLeft.hours).padStart(2, '0'), color: 'text-blue-600' },
                { label: 'MINUTES', value: String(timeLeft.minutes).padStart(2, '0'), color: 'text-emerald-600' },
                { label: 'SECONDS', value: String(timeLeft.seconds).padStart(2, '0'), color: 'text-blue-700 animate-pulse' },
              ].map((unit) => (
                <div key={unit.label} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center shadow-sm">
                  <div className={`font-display text-3xl sm:text-4xl font-black tracking-tight ${unit.color}`}>
                    {unit.value}
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-500 mt-1 tracking-widest">
                    {unit.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Information & Sprint Directives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-glass-clean">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-tech font-bold text-lg text-navy-900 mb-2">
            7 Hours Sprint
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Continuous development from 9:30 AM to 4:00 PM. Teams engineer working software prototypes from scratch, addressing real challenges.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-glass-clean">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-4">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-tech font-bold text-lg text-navy-900 mb-2">
            Exactly 4 Members
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Strict team size requirement. Only verified PBL and Elite students registered during the initial window compete in the arena.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-glass-clean">
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-4">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="font-tech font-bold text-lg text-navy-900 mb-2">
            100 Reward Points
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Top performing squads receive academic reward points, champion trophies, and direct incubation support by the Elite Batch 2025-29.
          </p>
        </div>
      </div>

    </div>
  );
}
