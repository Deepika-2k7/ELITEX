import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Check, 
  X, 
  RotateCcw, 
  Eye, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  Users,
  CheckCircle2
} from 'lucide-react';
import { soundFx } from '../../../utils/audio';

export default function AdminApprovalsView({ onToast }) {
  const [pendingTeams, setPendingTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inspectTeam, setInspectTeam] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('elitex_admin_token');
      const res = await fetch('/api/admin/teams?status=PENDING_APPROVAL', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch pending teams.');
      setPendingTeams(data.teams || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (teamId) => {
    try {
      setActionLoading(true);
      soundFx.playClick();
      const token = localStorage.getItem('elitex_admin_token');
      const res = await fetch(`/api/admin/teams/${teamId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      soundFx.playSuccess();
      if (onToast) onToast(`Team ${teamId} approved successfully.`);
      fetchPending();
    } catch (err) {
      soundFx.playError();
      if (onToast) onToast(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (teamId) => {
    const reason = window.prompt(`Enter reason for rejecting Team ${teamId}:`, 'Registration criteria incomplete');
    if (reason === null) return;

    try {
      setActionLoading(true);
      soundFx.playClick();
      const token = localStorage.getItem('elitex_admin_token');
      const res = await fetch(`/api/admin/teams/${teamId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      soundFx.playSuccess();
      if (onToast) onToast(`Team ${teamId} rejected.`);
      fetchPending();
    } catch (err) {
      soundFx.playError();
      if (onToast) onToast(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600">
            FIRST-TIME LOGIN GATEWAY
          </div>
          <h2 className="text-xl font-display font-black text-navy-900 tracking-tight flex items-center space-x-2">
            <span>Pending Team Approvals ({pendingTeams.length})</span>
          </h2>
          <p className="text-xs text-slate-500 font-tech">
            Teams cannot access protected Student Panel features until approved by the administrator.
          </p>
        </div>

        <button
          onClick={fetchPending}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold transition-all disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Pending Queue List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs bg-white rounded-2xl border border-slate-200">
          Checking registration queue...
        </div>
      ) : pendingTeams.length === 0 ? (
        <div className="p-12 text-center bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-display font-bold text-navy-900 mb-1">
            All Registrations Reviewed
          </h3>
          <p className="text-xs text-slate-500 font-tech max-w-md mx-auto">
            There are currently no team registrations waiting for first-login clearance. Approved teams can access their student panel immediately.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingTeams.map((t) => (
            <div key={t.teamId} className="p-5 rounded-2xl bg-white border border-amber-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-amber-600 text-xs">{t.teamId}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-mono font-bold animate-pulse">
                      PENDING
                    </span>
                  </div>
                  <h4 className="text-lg font-display font-bold text-navy-900 mt-0.5">
                    Team {t.teamName}
                  </h4>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400">
                  {new Date(t.registeredAt).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mb-4 font-tech">
                <div>Leader: <span className="font-bold text-navy-900 font-mono">{t.email}</span></div>
                <div>Members Added: <span className="font-bold text-navy-900">{t.membersCount || 0}/4</span></div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => setInspectTeam(t)}
                  className="text-xs font-mono font-bold text-slate-600 hover:text-navy-900 flex items-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Members</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleReject(t.teamId)}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-mono font-bold flex items-center space-x-1 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleApprove(t.teamId)}
                    disabled={actionLoading}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Team</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Modal */}
      {inspectTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-display font-black text-navy-900 mb-1">
              Team {inspectTeam.teamName} ({inspectTeam.teamId})
            </h3>
            <p className="text-xs text-slate-500 font-tech mb-4">
              Leader Contact: <span className="font-mono font-bold text-navy-900">{inspectTeam.email}</span>
            </p>

            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto mb-4">
              {(inspectTeam.members || []).length === 0 ? (
                <div className="p-4 text-center text-xs font-mono text-slate-400 bg-slate-50 rounded-xl">
                  Team has not yet completed their member profiles.
                </div>
              ) : (
                inspectTeam.members.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 text-xs">
                    <div className="flex justify-between font-bold text-navy-900 mb-1">
                      <span>{m.name}</span>
                      <span className="font-mono text-slate-500">{m.registerNumber}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">{m.department} · {m.phone}</div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => setInspectTeam(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs"
              >
                Close
              </button>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    handleReject(inspectTeam.teamId);
                    setInspectTeam(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-mono font-bold text-xs"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    handleApprove(inspectTeam.teamId);
                    setInspectTeam(null);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs shadow-md shadow-emerald-600/20"
                >
                  Approve Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
