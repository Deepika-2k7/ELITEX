import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit3, 
  Eye, 
  AlertCircle, 
  Users, 
  Calendar, 
  Check, 
  X,
  Clock,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../../../utils/audio';

export default function AdminTeamsView({ onToast }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [inspectTeam, setInspectTeam] = useState(null);
  const [editTeam, setEditTeam] = useState(null);
  const [deleteConfirmTeam, setDeleteConfirmTeam] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState('');

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('elitex_admin_token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/admin/teams?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load teams.');
      setTeams(data.teams || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTeams();
  };

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
      if (onToast) onToast(`Team ${teamId} has been approved.`);
      fetchTeams();
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
      if (onToast) onToast(`Team ${teamId} marked as rejected.`);
      fetchTeams();
    } catch (err) {
      soundFx.playError();
      if (onToast) onToast(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (t) => {
    setEditTeam(t);
    setEditName(t.teamName);
    setEditEmail(t.email);
    setEditStatus(t.status || 'PENDING_APPROVAL');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      soundFx.playClick();
      const token = localStorage.getItem('elitex_admin_token');
      const res = await fetch(`/api/admin/teams/${editTeam.teamId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          teamName: editName,
          email: editEmail,
          status: editStatus
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      soundFx.playSuccess();
      if (onToast) onToast(`Team ${editTeam.teamId} updated successfully.`);
      setEditTeam(null);
      fetchTeams();
    } catch (err) {
      soundFx.playError();
      alert(`Update Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmTeam) return;
    try {
      setActionLoading(true);
      soundFx.playClick();
      const token = localStorage.getItem('elitex_admin_token');
      const res = await fetch(`/api/admin/teams/${deleteConfirmTeam.teamId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      soundFx.playSuccess();
      if (onToast) onToast(`Team ${deleteConfirmTeam.teamId} and member records removed.`);
      setDeleteConfirmTeam(null);
      fetchTeams();
    } catch (err) {
      soundFx.playError();
      alert(`Delete Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-xl font-display font-black text-navy-900 tracking-tight">
            Team Roster Management
          </h2>
          <p className="text-xs text-slate-500 font-tech">
            Review sequential team IDs (ELITEFX001–050), squad rosters, and participation status.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, name, email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs font-tech bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </form>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="APPROVED">Approved / Confirmed</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Teams Table */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Team ID</th>
                <th className="py-3.5 px-4">Team Name</th>
                <th className="py-3.5 px-4">Leader Email</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Squad</th>
                <th className="py-3.5 px-4 text-center">Slot Bookings</th>
                <th className="py-3.5 px-4 text-center">Assessments</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-tech">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 font-mono">
                    Loading team telemetry...
                  </td>
                </tr>
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 font-mono">
                    No teams found matching the search criteria.
                  </td>
                </tr>
              ) : (
                teams.map((t) => {
                  const isApp = ['APPROVED', 'Verified & Confirmed'].includes(t.status);
                  const isPend = !t.status || t.status === 'PENDING_APPROVAL';
                  const isRej = t.status === 'REJECTED';

                  return (
                    <tr key={t.teamId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-navy-900">
                        {t.teamId}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {t.teamName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {t.email}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isApp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          isPend ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isApp ? 'APPROVED' : isPend ? 'PENDING' : 'REJECTED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className={`font-bold ${t.membersCount === 4 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {t.membersCount || 0}
                        </span>
                        <span className="text-slate-400">/4</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="font-bold text-slate-700">{t.slotsBookedCount || 0}</span>
                        <span className="text-slate-400">/4</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="font-bold text-slate-700">{t.assessmentCompletedCount || 0}</span>
                        <span className="text-slate-400">/4</span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => setInspectTeam(t)}
                          title="Inspect Team Members"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={() => openEditModal(t)}
                          title="Edit Team"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {isPend && (
                          <>
                            <button
                              onClick={() => handleApprove(t.teamId)}
                              disabled={actionLoading}
                              title="Approve Team"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleReject(t.teamId)}
                              disabled={actionLoading}
                              title="Reject Team"
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => setDeleteConfirmTeam(t)}
                          title="Delete Team"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* ----------------- INSPECT TEAM MODAL ----------------- */}
      {inspectTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-600">
                  {inspectTeam.teamId}
                </span>
                <h3 className="text-lg font-display font-black text-navy-900">
                  Team {inspectTeam.teamName} Roster
                </h3>
              </div>
              <button 
                onClick={() => setInspectTeam(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 font-mono text-[10px]">Leader Email:</span>
                  <div className="font-bold text-navy-900">{inspectTeam.email}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-mono text-[10px]">Status:</span>
                  <div className="font-bold text-emerald-600">{inspectTeam.status}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-mono text-[10px]">Registered:</span>
                  <div className="font-bold text-slate-700">
                    {new Date(inspectTeam.registeredAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
                Members ({(inspectTeam.members || []).length}/4)
              </div>

              {(inspectTeam.members || []).length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs font-mono bg-slate-50 rounded-xl">
                  No member profiles added yet by the team leader.
                </div>
              ) : (
                <div className="space-y-3">
                  {inspectTeam.members.map((m, idx) => (
                    <div key={m.id || idx} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all text-xs">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-bold text-navy-900 text-sm">{m.name}</span>
                          {m.isLeader && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                              Leader
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-slate-500 font-bold">{m.registerNumber}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600 text-[11px]">
                        <div>Dept: <span className="font-bold text-slate-800">{m.department} ({m.year})</span></div>
                        <div>Email: <span className="font-mono text-slate-700">{m.email}</span></div>
                        <div>Phone: <span className="font-mono text-slate-700">{m.phone}</span></div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="font-mono text-slate-400">Phase 1 Slot:</span>
                        <span className={`font-mono font-bold ${m.slotId ? 'text-emerald-600' : 'text-amber-500'}`}>
                          {m.slotTime || 'No slot booked'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setInspectTeam(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-mono font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- EDIT TEAM MODAL ----------------- */}
      {editTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-display font-black text-navy-900 mb-1">
              Edit Team {editTeam.teamId}
            </h3>
            <p className="text-xs text-slate-500 font-tech mb-4">
              Update official name, leader email, or approval status.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-tech">
              <div>
                <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
                  Team Name
                </label>
                <input 
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
                  Team Leader Email
                </label>
                <input 
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
                  Approval Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono font-bold"
                >
                  <option value="APPROVED">APPROVED (Full Student Access)</option>
                  <option value="PENDING_APPROVAL">PENDING_APPROVAL (Restricted)</option>
                  <option value="REJECTED">REJECTED (Access Denied)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTeam(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-slate-900 text-white font-mono font-bold"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- DELETE CONFIRMATION MODAL ----------------- */}
      {deleteConfirmTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rose-200 p-6">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-display font-black text-navy-900 mb-1">
              Delete Team {deleteConfirmTeam.teamId}?
            </h3>
            <p className="text-xs text-slate-600 font-tech mb-4 leading-relaxed">
              Are you sure you want to permanently delete Team <span className="font-bold text-navy-900">{deleteConfirmTeam.teamName}</span>?
              This will also remove all 4 member records, booked prelims slots, and assessment scores.
            </p>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTeam(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs shadow-md shadow-rose-600/20"
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
