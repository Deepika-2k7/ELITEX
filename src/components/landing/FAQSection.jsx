import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { FAQS } from '../../data/hackathonData';
import { soundFx } from '../../utils/audio';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (idx) => {
    soundFx.playClick();
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section id="faq" className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 bg-slate-50/60">
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-200/80 border border-slate-300 text-slate-700 text-xs font-mono uppercase tracking-widest mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>KNOWLEDGE BASE & GUIDELINES</span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-5xl text-navy-900 tracking-wide mb-3">
            FREQUENTLY ASKED <span className="text-emerald-600">QUESTIONS</span>
          </h2>

          <p className="font-sans text-base text-slate-600">
            Rules, eligibility criteria, team constraints, and evaluation details for ELITEX Hackathon 2026.
          </p>
        </div>

        {/* Expandable Accordion List */}
        <div className="space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-emerald-400 shadow-md ring-1 ring-emerald-400'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-5 text-left flex items-center justify-between focus:outline-none"
                >
                  <span className="font-tech font-bold text-base sm:text-lg text-navy-900 pr-4">
                    {faq.question}
                  </span>
                  <div className={`p-1.5 rounded-lg shrink-0 ${isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-100 text-slate-600 font-sans text-sm leading-relaxed animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
