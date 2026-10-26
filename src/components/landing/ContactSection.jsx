import React, { useState } from 'react';
import { 
  Mail, 
  MapPin, 
  Globe, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  ArrowUp,
  ShieldCheck,
  Building
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export default function ContactSection({ onToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      if (onToast) onToast('Please fill out all contact fields.');
      return;
    }

    setSubmitted(true);
    soundFx.playSuccess();
    if (onToast) onToast('Inquiry logged successfully.');
  };

  const scrollToTop = () => {
    soundFx.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-3">
            <Mail className="w-3.5 h-3.5" />
            <span>ORGANIZING COMMITTEE DESK</span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-wide mb-3">
            COMMUNICATIONS & <span className="text-emerald-400">CONTACT</span>
          </h2>

          <p className="font-sans text-base text-slate-300">
            For registration inquiries, squad verification, or track clarifications, reach out to the Elite Batch 2025-29 coordinating team.
          </p>
        </div>

        {/* Contact Grid: Details + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Organizer Coordinates (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
              <h3 className="font-tech font-bold text-lg text-white mb-4 flex items-center space-x-2">
                <Building className="w-5 h-5 text-emerald-400" />
                <span>ORGANIZER DOSSIER</span>
              </h3>

              <div className="space-y-4 text-xs font-sans text-slate-300">
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700">
                  <div className="text-[11px] font-mono text-emerald-400 uppercase font-bold">ORGANISING BODY</div>
                  <div className="text-sm font-bold text-white mt-0.5">Elite Batch 2025-29</div>
                  <div className="text-slate-400 text-[11px] mt-1">Francis Xavier Engineering College (Autonomous)</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700">
                  <div className="text-[11px] font-mono text-blue-400 uppercase font-bold">HOST INSTITUTION & CAMPUS ARENA</div>
                  <div className="text-sm font-bold text-white mt-0.5">Francis Xavier Engineering College</div>
                  <div className="text-slate-400 text-[11px] mt-1">103/G2, Bypass Road, Vannarpettai, Tirunelveli, Tamil Nadu 627003</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700">
                  <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">ELIGIBILITY & PARTICIPATION</div>
                  <div className="text-xs font-bold text-emerald-300 mt-0.5">ONLY PBL AND ELITE STUDENTS · 50 TEAMS MAX</div>
                  <div className="text-slate-400 text-[11px] mt-1">Strict Squad Size: Exactly 4 Members</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-800/80 border border-slate-700">
              <h3 className="font-tech font-bold text-xl text-white mb-2 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span>TRANSMIT INQUIRY</span>
              </h3>
              <p className="font-sans text-xs text-slate-400 mb-6">
                Send a message to the organizing committee desk.
              </p>

              {submitted ? (
                <div className="p-8 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-3 animate-in fade-in">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="font-tech font-bold text-xl text-white">Inquiry Received</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Thank you, <span className="text-emerald-400 font-bold">{name}</span>. Your message has been captured. The Elite Batch coordinating desk will review your inquiry.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setSubject('');
                      setMessage('');
                    }}
                    className="px-5 py-2 text-xs font-mono text-emerald-400 hover:underline pt-2"
                  >
                    SEND ANOTHER INQUIRY
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                        Team Leader Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Alex Vance"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                        Official Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="leader@college.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Query regarding Phase 1 Prelims schedule"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                      Message *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Type your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 font-sans"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-tech font-bold text-xs tracking-wider uppercase flex items-center space-x-2 shadow-md transition-all active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>DISPATCH INQUIRY</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div>
            <span className="text-emerald-400 font-bold">ELITE</span>
            <span className="text-blue-400 font-bold">X </span>
            <span className="text-white font-bold">HACKATHON — 2026</span>
            <span className="ml-2">· FXEC × ELITE BATCH 2025-29</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-slate-500">Francis Xavier Engineering College</span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Return to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
