import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Clock, 
  RotateCcw, 
  ShieldAlert, 
  Eye, 
  FileText,
  UserX,
  X
} from 'lucide-react';
import { soundFx } from '../../../utils/audio';

export default function AdminMalpracticeView({ onToast }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [newIncidentModal, setNewIncidentModal] = useState(false);
  const [reviewModalIncident, setReviewModalIncident] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // New Incident Form State
  const [newRegNo, setNewRegNo] = useState('');
  const [newTeamId, setNewTeamId] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('FULLSCREEN_EXIT');
  const [newDesc, setNewDesc] = useState('');
  const [newEvidence, setNewEvidence] = useState('');

  // Review Form State
  const [reviewStatus, setReviewStatus] = useState('UNDER_REVIEW');
  const [reviewAction, setReviewAction] = useState('None');
  const [reviewNotes, setReviewNotes] = useState('');

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('elitex_admin_token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/admin/malpractice?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to retrieve malpractice records.');
      setRecords(data.records || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecords();
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      soundFx.playClick();
      const token = localStorage.getItem('elitex_admin_token');
      const res = await fetch('/api/admin/malpractice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          teamId: newTeamId,
          registerNumber: newRegNo,
          participantName: newName,
          incidentType: newType,
          description: newDesc,
          evidence: newEvidence
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      soundFx.playSuccess();
      if (onToast) onToast(`Incident recorded for Register No ${newRegNo}.`);
      setNewIncidentModal(false);
      // Reset form
      setNewRegNo('');
      setNewTeamId('');
      setNewName('');
      setNewDesc('');
      setNewEvidence('');
      fetchRecords();
    } catch (err) {
      soundFx.playError();
      alert(`Error creating incident: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const openReviewModal = (inc) => {
    setReviewModalIncident(inc);
    setReviewStatus(inc.status || 'UNDER_REVIEW');
    setReviewAction(inc.actionTaken || 'None');
    setReviewNotes(inc.adminNotes || '');
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!reviewModalIncident) return;

    try {
      setActionLoading(true);
      soundFx.playClick();
      const token = localStorage.getItem('elitex_admin_token');
      const res = await fetch(`/api/admin/malpractice/${reviewModalIncident.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: reviewStatus,
          actionTaken: reviewAction,
          adminNotes: reviewNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      soundFx.playSuccess();
      if (onToast) onToast(`Incident #${reviewModalIncident.id} updated to ${reviewStatus}.`);
      setReviewModalIncident(null);
      fetchRecords();
    } catch (err) {
      soundFx.playError();
      alert(`Review Save Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-xl font-display font-black text-navy-900 tracking-tight flex items-center space-x-2">
            <span>Integrity & Malpractice Audit Log</span>
          </h2>
          <p className="text-xs text-slate-500 font-tech">
            Objective event tracking. Technical events (e.g. fullscreen exit) require committee review before sanctions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchRecords}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold transition-all disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setNewIncidentModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-bold shadow-md shadow-rose-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Incident</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white/80 p-4 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reg no, participant, category..."
            className="w-full pl-9 pr-3 py-1.5 text-xs font-tech bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-700"
        >
          <option value="">All Review Statuses</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="CONFIRMED">Confirmed Violation</option>
          <option value="DISMISSED">Dismissed / Exonerated</option>
        </select>
      </div>

      {/* Incidents Table */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Participant</th>
                <th className="py-3.5 px-4">Register No</th>
                <th className="py-3.5 px-4">Incident Category</th>
                <th className="py-3.5 px-4">Recorded By / Time</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Action Taken</th>
                <th className="py-3.5 px-4 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-tech">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-mono">
                    Loading malpractice records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-mono">
                    No malpractice incidents recorded. System telemetry reports 100% clean participation.
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const isConf = r.status === 'CONFIRMED';
                  const isUnder = r.status === 'UNDER_REVIEW';
                  const isDism = r.status === 'DISMISSED';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-navy-900">{r.participantName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">Team {r.teamId}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {r.registerNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-navy-900 flex items-center space-x-1.5">
                          <AlertTriangle className={`w-3.5 h-3.5 ${isConf ? 'text-rose-500' : isUnder ? 'text-amber-500' : 'text-slate-400'}`} />
                          <span>{r.incidentType}</span>
                        </div>
                        {r.description && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">{r.description}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        <div>{new Date(r.createdAt).toLocaleTimeString()}</div>
                        <div className="text-[10px] text-slate-400">By: {r.recordedBy}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isConf ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          isUnder ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {r.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-tech">
                        {r.actionTaken || 'None'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openReviewModal(r)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-navy-900 font-mono font-bold text-[11px] inline-flex items-center space-x-1"
                        >
                          <Edit3 className="w-3 h-3 text-emerald-600" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------- RECORD NEW INCIDENT MODAL ----------------- */}
      {newIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-display font-black text-navy-900 mb-1">
              Record Malpractice Incident
            </h3>
            <p className="text-xs text-slate-500 font-tech mb-4">
              Enter objective observation details for administrative committee audit.
            </p>

            <form onSubmit={handleCreateIncident} className="space-y-3.5 text-xs font-tech">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono font-bold text-slate-700 uppercase mb-1">Register No *</label>
                  <input 
                    type="text"
                    value={newRegNo}
                    onChange={(e) => setNewRegNo(e.target.value)}
                    required
                    placeholder="950721104..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold text-slate-700 uppercase mb-1">Team ID</label>
                  <input 
                    type="text"
                    value={newTeamId}
                    onChange={(e) => setNewTeamId(e.target.value)}
                    placeholder="ELITEFX001"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono font-bold text-slate-700 uppercase mb-1">Participant Name</label>
                <input 
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Candidate full name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block font-mono font-bold text-slate-700 uppercase mb-1">Incident Category *</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono font-bold text-slate-800"
                >
                  <option value="FULLSCREEN_EXIT">Browser Fullscreen Exit</option>
                  <option value="UNAUTHORIZED_TAB_SWITCH">Unauthorized Tab / Window Switch</option>
                  <option value="EXTERNAL_COMMUNICATION">External Device / Material Use</option>
                  <option value="IMPERSONATION">Identity Mismatch / Impersonation</option>
                  <option value="SUSPICIOUS_ACTIVITY">General Suspicious Activity</option>
                </select>
              </div>

              <div>
                <label className="block font-mono font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows="2"
                  placeholder="Observed events or proctor notes..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block font-mono font-bold text-slate-700 uppercase mb-1">Evidence Reference</label>
                <input 
                  type="text"
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  placeholder="Log reference, terminal timestamp, or snapshot ID..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewIncidentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !newRegNo}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold"
                >
                  {actionLoading ? 'Recording...' : 'Record Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- REVIEW INCIDENT MODAL ----------------- */}
      {reviewModalIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-display font-black text-navy-900 mb-1">
              Review Incident #{reviewModalIncident.id}
            </h3>
            <p className="text-xs text-slate-500 font-tech mb-4">
              Candidate: <span className="font-bold text-navy-900">{reviewModalIncident.participantName}</span> ({reviewModalIncident.registerNumber})
            </p>

            <form onSubmit={handleSaveReview} className="space-y-3.5 text-xs font-tech">
              <div>
                <label className="block font-mono font-bold text-slate-700 uppercase mb-1">Review Determination</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono font-bold"
                >
                  <option value="UNDER_REVIEW">UNDER_REVIEW (Pending Further Inspection)</option>
                  <option value="CONFIRMED">CONFIRMED (Violation Established)</option>
                  <option value="DISMISSED">DISMISSED (False Positive / Exonerated)</option>
                </select>
              </div>

              <div>
                <label className="block font-mono font-bold text-slate-700 uppercase mb-1">Action Imposed</label>
                <select
                  value={reviewAction}
                  onChange={(e) => setReviewAction(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 font-tech font-bold"
                >
                  <option value="None">None</option>
                  <option value="Formal Warning Issued">Formal Warning Issued</option>
                  <option value="Prelims Score Disqualified">Prelims Score Disqualified</option>
                  <option value="Team Disqualified from Hackathon">Team Disqualified from Hackathon</option>
                  <option value="Retest Permitted">Retest Permitted</option>
                </select>
              </div>

              <div>
                <label className="block font-mono font-bold text-slate-700 uppercase mb-1">Administrator Rationale & Notes</label>
                <textarea 
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows="3"
                  placeholder="Record formal reasons for decision and committee members consulted..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalIncident(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-slate-900 text-white font-mono font-bold"
                >
                  {actionLoading ? 'Saving...' : 'Commit Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
