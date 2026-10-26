import React from 'react';
import { 
  Users, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  UserCheck,
  FileText
} from 'lucide-react';

export default function AdminOverviewView({ stats, onNavigate, onRefresh, loading }) {
  const slotList = stats?.slots || [];

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Quick Stats & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 mb-0.5">
            REAL-TIME TELEMETRY & OPERATIONS
          </div>
          <h2 className="text-xl font-display font-black text-navy-900 tracking-tight">
            ELITEX 2026 Command Center
          </h2>
          <p className="text-xs text-slate-500 font-tech">
            Monitored sequentially from Neon PostgreSQL with live concurrency control.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold transition-all disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>

          <button
            onClick={() => onNavigate('approvals')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-mono font-bold shadow-md shadow-emerald-500/20 transition-all"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Review Approvals ({stats?.pendingApprovals || 0})</span>
          </button>
        </div>
      </div>

      {/* 4 Main Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Teams */}
        <div 
          onClick={() => onNavigate('teams')}
          className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-500">Registered Teams</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-display font-black text-navy-900">{stats?.totalTeams || 0}</span>
            <span className="text-xs font-mono text-slate-400">/ 50 Teams Max</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-tech text-slate-500">
            <span>Approved: {stats?.approvedTeams || 0}</span>
            <span className="text-emerald-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              View <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Total Participants */}
        <div 
          onClick={() => onNavigate('participants')}
          className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-500">Total Participants</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-display font-black text-navy-900">{stats?.totalParticipants || 0}</span>
            <span className="text-xs font-mono text-slate-400">Across Teams</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-tech text-slate-500">
            <span>4 members/team</span>
            <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              Manage <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div 
          onClick={() => onNavigate('approvals')}
          className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-500">Pending Approvals</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-display font-black text-navy-900">{stats?.pendingApprovals || 0}</span>
            <span className="text-xs font-mono text-amber-600 font-bold">Needs Review</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-tech text-slate-500">
            <span>Rejected: {stats?.rejectedTeams || 0}</span>
            <span className="text-amber-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              Inspect <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Malpractice Flags */}
        <div 
          onClick={() => onNavigate('malpractice')}
          className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-500">Malpractice Flags</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-display font-black text-rose-600">{stats?.flaggedMalpractice || 0}</span>
            <span className="text-xs font-mono text-slate-400">Incidents</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-tech text-slate-500">
            <span>Requires Review</span>
            <span className="text-rose-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              View Log <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

      </div>

      {/* Phase 1 Prelims Slot Occupancy Overview */}
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-5">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              PHASE 1 SCREENING TRACKS · 2 NOVEMBER 2026 (IST)
            </div>
            <h3 className="text-base font-display font-bold text-navy-900">
              Prelims Slot Capacity & Seat Occupancy
            </h3>
          </div>
          <button
            onClick={() => onNavigate('slots')}
            className="text-xs font-mono font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>Full Booking Management</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {slotList.map((slot) => {
            const booked = slot.bookedCount || 0;
            const capacity = slot.totalCapacity || 50;
            const pct = Math.round((booked / capacity) * 100);
            const remaining = Math.max(0, capacity - booked);

            return (
              <div key={slot.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="font-bold text-navy-900">Slot {slot.slotNumber}</span>
                  <span className="text-slate-500">{slot.time}</span>
                </div>
                
                <div className="flex items-baseline justify-between mt-2 mb-1.5">
                  <span className="text-2xl font-display font-black text-navy-900">{booked}</span>
                  <span className="text-xs font-mono text-slate-500">{remaining} seats free</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 90 ? 'bg-rose-500' : pct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="mt-2 text-[10px] font-mono text-slate-400 flex justify-between">
                  <span>Capacity: {capacity}</span>
                  <span>{pct}% Booked</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assessment Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-display font-black text-navy-900">{stats?.completedAssessments || 0}</div>
            <div className="text-xs font-tech font-bold text-slate-500">Assessments Completed</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-display font-black text-navy-900">{stats?.awaitingAssessments || 0}</div>
            <div className="text-xs font-tech font-bold text-slate-500">Awaiting Submission</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-display font-black text-navy-900">{stats?.availableResults || 0}</div>
            <div className="text-xs font-tech font-bold text-slate-500">Graded Records Available</div>
          </div>
        </div>

      </div>

    </div>
  );
}
