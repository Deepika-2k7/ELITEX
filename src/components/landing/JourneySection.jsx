import React from 'react';
import { 
  Compass, 
  Clock, 
  Calendar, 
  ArrowRight, 
  ChevronRight, 
  FileText, 
  Zap, 
  CheckCircle2,
  Users
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export default function JourneySection({ onNavigateStage }) {
  const stages = [
    {
      id: 'phase1',
      stageNumber: 'STAGE 01',
      title: 'PHASE 1 — PRELIMS',
      schedule: 'Monday, 2 November 2026',
      timeWindow: '9:30 AM – 10:00 AM IST',
      badge: 'SCREENING EVALUATION',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: FileText,
      iconBg: 'bg-emerald-500 text-white',
      border: 'border-emerald-300 hover:border-emerald-500',
      description: 'Domain and algorithmic screening assessment. The 50 registered squads prove their foundational acumen, problem diagnostic speed, and solution vision.',
      highlights: [
        'Domain screening tracks',
        'Strict 10:00 AM IST submission deadline',
        'Finalist qualification selection'
      ]
    },
    {
      id: 'phase2',
      stageNumber: 'STAGE 02',
      title: 'PHASE 2 — FINAL HACKATHON',
      schedule: 'Wednesday, 4 November 2026',
      timeWindow: '9:30 AM – 4:00 PM IST (7 Hours)',
      badge: '7 HOURS SPRINT ARENA',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: Zap,
      iconBg: 'bg-blue-600 text-white',
      border: 'border-blue-300 hover:border-blue-500',
      description: 'The intense 7-hour continuous software engineering sprint. Finalist squads turn conceptual blueprints into working, testable software prototypes.',
      highlights: [
        '7 Hours continuous sprint',
        'Live prototype demo & jury defense',
        '100 Reward Points & Champion trophies'
      ]
    }
  ];

  return (
    <section id="journey" className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 bg-slate-50/50">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-200/80 border border-slate-300 text-slate-700 text-xs font-mono uppercase tracking-widest mb-3">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>EVENT PROGRESSION TIMELINE</span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-5xl text-navy-900 tracking-wide mb-4">
            TWO-PHASE <span className="text-blue-600">STRUCTURE</span>
          </h2>

          <p className="font-sans text-base sm:text-lg text-slate-600">
            From the preliminary screening on 2 November to the final 7 Hours Sprint on 4 November 2026.
          </p>
        </div>

        {/* 2-Stage Grid with Connecting Arrow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                className={`group p-7 rounded-2xl bg-white border transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md flex flex-col justify-between ${stage.border}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {stage.stageNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded border ${stage.badgeBg}`}>
                      {stage.badge}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${stage.iconBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-tech font-bold text-xl text-navy-900">
                        {stage.title}
                      </h3>
                      <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{stage.schedule}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-mono font-bold text-emerald-700 bg-slate-50 p-2 rounded-lg border border-slate-200 mb-4">
                    Timing: {stage.timeWindow}
                  </div>

                  <p className="font-sans text-xs text-slate-600 leading-relaxed mb-6">
                    {stage.description}
                  </p>

                  <div className="space-y-2 mb-6 border-t border-slate-100 pt-4">
                    {stage.highlights.map((h, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-slate-700 font-sans">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onNavigateStage(stage.id);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-tech font-bold tracking-wider text-white flex items-center justify-center space-x-2 transition-all shadow-sm group-hover:bg-emerald-600"
                  >
                    <span>EXPLORE {stage.stageNumber} DETAILS</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
