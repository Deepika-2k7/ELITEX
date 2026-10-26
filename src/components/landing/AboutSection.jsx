import React from 'react';
import { 
  Lightbulb, 
  Target, 
  Code, 
  Globe2, 
  ShieldCheck, 
  Zap, 
  Users, 
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export default function AboutSection({ onSelectPhase }) {
  const pillars = [
    {
      id: "think",
      title: "Think & Ideate",
      subtitle: "Problem Conceptualization",
      icon: Lightbulb,
      iconBg: "bg-emerald-100 text-emerald-600",
      border: "border-emerald-200 hover:border-emerald-400",
      description: "Deconstruct real institutional and societal friction points. Conceptualize novel algorithmic and software-based solutions."
    },
    {
      id: "code",
      title: "Code & Engineer",
      subtitle: "7 Hours Sprint Execution",
      icon: Code,
      iconBg: "bg-blue-100 text-blue-600",
      border: "border-blue-200 hover:border-blue-400",
      description: "Write clean, scalable, and modular software during the intense 7-hour continuous sprint. 100% software-focused — zero hardware."
    },
    {
      id: "innovate",
      title: "Innovate & Evolve",
      subtitle: "Production-Grade Prototypes",
      icon: Zap,
      iconBg: "bg-teal-100 text-teal-600",
      border: "border-teal-200 hover:border-teal-400",
      description: "Push technical boundaries with modern AI, web architectures, and cloud services. Build functioning software prototypes ready for jury demonstration."
    },
    {
      id: "impact",
      title: "Real Impact",
      subtitle: "100 Reward Points & Recognition",
      icon: Globe2,
      iconBg: "bg-purple-100 text-purple-600",
      border: "border-purple-200 hover:border-purple-400",
      description: "Turn ideas today into impact tomorrow. Earn verified institutional reward points, excellence trophies, and incubation support."
    }
  ];

  return (
    <section id="about" className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 bg-white/70">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-mono uppercase tracking-widest mb-3">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>EVENT DIRECTIVE & ARCHITECTURE</span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-5xl text-navy-900 tracking-wide mb-4">
            ABOUT <span className="text-emerald-600">ELITEX</span> HACKATHON 2026
          </h2>

          <p className="font-sans text-base sm:text-lg text-slate-600 leading-relaxed">
            Organised by <strong className="text-navy-900 font-bold">Elite Batch 2025-29</strong> at <strong className="text-navy-900 font-bold">Francis Xavier Engineering College (Autonomous)</strong>. ELITEX Hackathon 2026 brings together the brightest minds across a high-speed <strong className="text-emerald-700 font-bold">7 Hours Sprint</strong> to transform innovative concepts into working software prototypes.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                onMouseEnter={() => soundFx.playBlip()}
                className={`group p-6 rounded-2xl bg-white border transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-md ${pillar.border}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${pillar.iconBg}`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">
                  {pillar.subtitle}
                </div>

                <h3 className="font-tech font-bold text-xl text-navy-900 mb-2">
                  {pillar.title}
                </h3>

                <p className="font-sans text-xs text-slate-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Strict Registration Rules Bar */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">
                MANDATORY REGISTRATION SPECIFICATIONS
              </div>
              <div className="font-tech font-bold text-lg text-navy-900 mt-0.5">
                TEAM SIZE: EXACTLY 4 MEMBERS · MAX 50 SQUADS
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                ELIGIBILITY: ONLY PBL AND ELITE STUDENTS · Automated Team IDs (ELITEFX001 - ELITEFX050)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => onSelectPhase('phase1')}
              className="flex-1 lg:flex-none px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-tech font-bold text-slate-800 hover:text-emerald-600 hover:border-emerald-400 transition-all text-center shadow-sm"
            >
              PHASE 1 PRELIMS (2 NOV)
            </button>
            <button
              onClick={() => onSelectPhase('phase2')}
              className="flex-1 lg:flex-none px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-xs font-tech font-bold text-white transition-all text-center shadow-md flex items-center justify-center space-x-1"
            >
              <span>PHASE 2 FINAL (4 NOV)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
