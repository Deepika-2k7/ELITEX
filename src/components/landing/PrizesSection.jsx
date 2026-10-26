import React, { useState } from 'react';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Sparkles, 
  Award, 
  CheckCircle, 
  Zap, 
  ShieldCheck, 
  Star 
} from 'lucide-react';
import { REWARDS_DATA } from '../../data/hackathonData';
import { soundFx } from '../../utils/audio';

export default function PrizesSection() {
  return (
    <section id="rewards" className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 bg-white">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-mono uppercase tracking-widest mb-3">
            <Trophy className="w-3.5 h-3.5 text-emerald-600" />
            <span>HONOR & RECOGNITION</span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-5xl text-navy-900 tracking-wide mb-3">
            {REWARDS_DATA.title}
          </h2>

          <div className="font-tech font-bold text-xl sm:text-2xl text-emerald-600 tracking-wide mb-3">
            {REWARDS_DATA.badge} · {REWARDS_DATA.subtitle}
          </div>

          <p className="font-sans text-base text-slate-600 leading-relaxed">
            {REWARDS_DATA.overview} There is no monetary cash prize pool; distinction is measured in academic reward points, official trophies, and incubator pathways.
          </p>
        </div>

        {/* 3-Tier Winner's Recognition Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-end mb-16 max-w-5xl mx-auto">
          
          {/* 2nd Place - Silver Podium */}
          <div className="order-2 md:order-1 relative p-6 sm:p-7 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 mb-3 shadow-sm">
                <Medal className="w-8 h-8" />
              </div>
              <span className="block font-mono text-xs font-bold text-blue-700 tracking-widest uppercase">
                {REWARDS_DATA.tiers[1].place}
              </span>
              <h3 className="font-display font-bold text-2xl text-navy-900 mt-1">
                {REWARDS_DATA.tiers[1].title}
              </h3>
              <div className="font-tech font-bold text-lg text-emerald-600 mt-2">
                {REWARDS_DATA.tiers[1].reward}
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-4 mb-4">
              {REWARDS_DATA.tiers[1].perks.map((perk, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-slate-600">
                  <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            <div className="text-center py-2 rounded-xl bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200">
              100 REWARD POINTS
            </div>
          </div>

          {/* 1st Place - Gold Champion Podium (Elevated in Center) */}
          <div className="order-1 md:order-2 relative p-7 sm:p-8 rounded-2xl bg-gradient-to-b from-emerald-50 via-white to-slate-50 border-2 border-emerald-500 shadow-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 md:-translate-y-3">
            
            {/* Top Crown Accent */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-600 text-white font-tech font-bold text-xs tracking-widest uppercase shadow-md flex items-center space-x-1.5">
              <Crown className="w-3.5 h-3.5 fill-white" />
              <span>GRAND CHAMPION</span>
            </div>

            <div className="text-center mb-6 pt-2">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-600 mb-3 shadow-md">
                <Trophy className="w-10 h-10 animate-pulse" />
              </div>
              <span className="block font-mono text-xs font-bold text-emerald-700 tracking-widest uppercase">
                {REWARDS_DATA.tiers[0].place}
              </span>
              <h3 className="font-display font-black text-3xl text-navy-900 mt-1">
                {REWARDS_DATA.tiers[0].title}
              </h3>
              <div className="font-tech font-black text-xl text-emerald-600 mt-2">
                {REWARDS_DATA.tiers[0].reward}
              </div>
            </div>

            <div className="space-y-2.5 border-t border-emerald-200 pt-4 mb-4">
              {REWARDS_DATA.tiers[0].perks.map((perk, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs sm:text-sm text-slate-700 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            <div className="text-center py-2.5 rounded-xl bg-emerald-600 text-white font-mono text-xs font-bold shadow-md">
              100 REWARD POINTS + INCUBATION
            </div>
          </div>

          {/* 3rd Place - Bronze Podium */}
          <div className="order-3 relative p-6 sm:p-7 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-200 text-slate-700 mb-3 shadow-sm">
                <Award className="w-8 h-8" />
              </div>
              <span className="block font-mono text-xs font-bold text-slate-600 tracking-widest uppercase">
                {REWARDS_DATA.tiers[2].place}
              </span>
              <h3 className="font-display font-bold text-2xl text-navy-900 mt-1">
                {REWARDS_DATA.tiers[2].title}
              </h3>
              <div className="font-tech font-bold text-lg text-emerald-600 mt-2">
                {REWARDS_DATA.tiers[2].reward}
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-4 mb-4">
              {REWARDS_DATA.tiers[2].perks.map((perk, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-slate-600">
                  <CheckCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            <div className="text-center py-2 rounded-xl bg-slate-200 text-slate-700 font-mono text-xs font-bold border border-slate-300">
              100 REWARD POINTS
            </div>
          </div>

        </div>

        {/* Special Distinction Badges */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest">
              ACADEMIC MERIT & SPECIAL CITATIONS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REWARDS_DATA.specialBadges.map((badge, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="font-tech font-bold text-sm text-navy-900">{badge.title}</div>
                <div className="text-xs font-mono font-bold text-emerald-600 mt-1">{badge.reward}</div>
                <div className="text-[11px] text-slate-500 mt-1">{badge.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
