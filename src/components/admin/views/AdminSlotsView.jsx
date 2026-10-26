import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  ArrowRightLeft, 
  X,
  XCircle,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../../../utils/audio';

export default function AdminSlotsView({ onToast }) {
  const [slots, setSlots] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [activeSlotFilter, setActiveSlotFilter] = useState('');

  // Modals
  const [reassignTarget, setReassignTarget] = useState(null);
  const [newSlotId, setNewSlotId] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSlotData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('elitex_admin_token');
      const res = await fetch('/api/admin/slots', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch slot bookings.');

      setSlots(data.slots || []);
      setParticipants(data.participants || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlotData();
  }, []);

  const handleReassign = async (e) => {
    e.preventDefault();
    if (!reassignTarget || !newSlotId) return;

    try {
      setActionLoading(true);
      soundFx.playClick();
      const token = localStorage.getItem('elitex_admin_token');
      const res = await fetch('/api/admin/slots/reassign', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          registerNumber: reassignTarget.registerNumber,
          newSlotId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      soundFx.playSuccess();
      if (onToast) onToast(`Slot reassigned to ${newSlotId} for ${reassignTarget.name}.`);
      setReassignTarget(null);
      fetchSlotData();
    } catch (err) {
      soundFx.playError();
      alert(`Reassign Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelTarget) return;

    try {
      setActionLoading(true);
      soundFx.playClick();
      const token = localStorage.getItem('elitex_admin_token');
      const res = await fetch('/api/admin/slots/cancel', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          registerNumber: cancelTarget.registerNumber
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      soundFx.playSuccess();
      if (onToast) onToast(`Slot booking cancelled for ${cancelTarget.name}.`);
      setCancelTarget(null);
      fetchSlotData();
    } catch (err) {
      soundFx.playError();
      alert(`Cancellation Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter participants
  const filteredParticipants = participants.filter((p) => {
    if (activeSlotFilter === 'unbooked') {
      if (p.slotId) return false;
    } else if (activeSlotFilter) {
      if (p.slotId !== activeSlotFilter) return false;
    }

    if (search) {
      const s = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(s) ||
        p.registerNumber.toLowerCase().includes(s) ||
        p.teamId.toLowerCase().includes(s) ||
        p.teamName.toLowerCase().includes(s)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600">
            EVENT DATE: MONDAY, 2 NOVEMBER 2026 (IST)
          </div>
          <h2 className="text-xl font-display font-black text-navy-900 tracking-tight">
            Phase 1 Prelims Slot Booking Management
          </h2>
          <p className="text-xs text-slate-500 font-tech">
            Review slot distributions, track capacities (50 seats/slot), reassign members, or cancel bookings.
          </p>
        </div>

        <button
          onClick={fetchSlotData}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold transition-all disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Capacities</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          {error}
        </div>
      )}

      {/* 4 Official Slot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {slots.map((slot) => {
          const booked = slot.bookedCount || 0;
          const capacity = slot.totalCapacity || 50;
          const remaining = Math.max(0, capacity - booked);
          const pct = Math.round((booked / capacity) * 100);
          const isSelected = activeSlotFilter === slot.id;

          return (
            <div 
              key={slot.id}
              onClick={() => setActiveSlotFilter(isSelected ? '' : slot.id)}
              className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-sm ${
                isSelected 
                  ? 'border-emerald-500 ring-2 ring-emerald-400/20 shadow-md' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="font-bold text-navy-900">Slot {slot.slotNumber}</span>
                <span className="text-slate-500">{slot.time}</span>
              </div>

              <div className="flex items-baseline justify-between mt-3 mb-1">
                <span className="text-3xl font-display font-black text-navy-900">{booked}</span>
                <span className="text-xs font-mono font-bold text-slate-500">{remaining} available</span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mt-2 mb-2">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    pct >= 90 ? 'bg-rose-500' : pct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>Cap: {capacity}</span>
                <span className="font-bold text-slate-600">{pct}% filled</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white/80 p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono font-bold text-slate-700">Filter View:</span>
          
          <button
            onClick={() => setActiveSlotFilter('')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              !activeSlotFilter ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Bookings ({participants.length})
          </button>

          <button
            onClick={() => setActiveSlotFilter('unbooked')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              activeSlotFilter === 'unbooked' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Unbooked ({participants.filter(p => !p.slotId).length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search participant, team, reg no..."
            className="w-full pl-9 pr-3 py-1.5 text-xs font-tech bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
      </div>

      {/* Slot Participant Table */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Participant Name</th>
                <th className="py-3.5 px-4">Register No</th>
                <th className="py-3.5 px-4">Team</th>
                <th className="py-3.5 px-4">Assigned Slot</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-tech">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-mono">
                    Loading slot bookings telemetry...
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-mono">
                    No participants found matching the active slot filter.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p) => {
                  return (
                    <tr key={p.registerNumber} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-navy-900">{p.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{p.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {p.registerNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-navy-900">{p.teamId}</span> · {p.teamName}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {p.slotId ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>{p.slotTime}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[11px]">
                            <span>Unassigned</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                        {p.department}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            setReassignTarget(p);
                            setNewSlotId(p.slotId || 'slot-1');
                          }}
                          title="Reassign Slot"
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-[11px] inline-flex items-center space-x-1"
                        >
                          <ArrowRightLeft className="w-3 h-3 text-purple-600" />
                          <span>Reassign</span>
                        </button>

                        {p.slotId && (
                          <button
                            onClick={() => setCancelTarget(p)}
                            title="Cancel Booking"
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-mono font-bold text-[11px] inline-flex items-center space-x-1"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------- REASSIGN SLOT MODAL ----------------- */}
      {reassignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-display font-black text-navy-900 mb-1">
              Reassign Phase 1 Slot
            </h3>
            <p className="text-xs text-slate-500 font-tech mb-4">
              Reassigning <span className="font-bold text-navy-900">{reassignTarget.name}</span> ({reassignTarget.registerNumber}).
            </p>

            <form onSubmit={handleReassign} className="space-y-4 text-xs font-tech">
              <div>
                <label className="block font-mono font-bold text-slate-700 uppercase mb-2">
                  Select New Slot
                </label>
                <div className="space-y-2">
                  {slots.map((s) => {
                    const booked = s.bookedCount || 0;
                    const cap = s.totalCapacity || 50;
                    const remaining = Math.max(0, cap - booked);
                    const isFull = remaining <= 0 && s.id !== reassignTarget.slotId;

                    return (
                      <label 
                        key={s.id}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          newSlotId === s.id 
                            ? 'border-emerald-500 bg-emerald-50/50' 
                            : 'border-slate-200 hover:border-slate-300'
                        } ${isFull ? 'opacity-40 pointer-events-none' : ''}`}
                      >
                        <div className="flex items-center space-x-2">
                          <input 
                            type="radio" 
                            name="slotOption"
                            value={s.id}
                            checked={newSlotId === s.id}
                            onChange={(e) => setNewSlotId(e.target.value)}
                            disabled={isFull}
                          />
                          <div>
                            <span className="font-bold font-mono text-navy-900">Slot {s.slotNumber}:</span> {s.time}
                          </div>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">
                          {remaining} seats left
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReassignTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !newSlotId}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold disabled:opacity-50"
                >
                  {actionLoading ? 'Updating...' : 'Confirm Reassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- CANCEL BOOKING MODAL ----------------- */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rose-200 p-6">
            <h3 className="text-lg font-display font-black text-navy-900 mb-1">
              Cancel Slot Booking?
            </h3>
            <p className="text-xs text-slate-600 font-tech mb-4 leading-relaxed">
              Are you sure you want to cancel the Phase 1 slot booking for <span className="font-bold text-navy-900">{cancelTarget.name}</span> ({cancelTarget.slotTime})?
              This will immediately free up one seat in the slot.
            </p>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs shadow-md shadow-rose-600/20"
              >
                {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
